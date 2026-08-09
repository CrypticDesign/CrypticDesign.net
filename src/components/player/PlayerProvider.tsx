"use client";

/**
 * Shared playback state for the Cryptic Signal floating player.
 *
 * One provider is mounted in the root layout, so any surface can call
 * `usePlayer()` to start a track without owning its own <audio> element.
 * When the current track has no `src` (catalog audio is not published yet)
 * the provider runs a preview clock over the track's declared duration so
 * transport, seeking and queue behaviour stay honest and testable.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultQueue, type PlayerTrack } from "@/lib/player";

export type RepeatMode = "off" | "all" | "one";

interface PlayerValue {
  queue: PlayerTrack[];
  track: PlayerTrack | undefined;
  index: number;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  expanded: boolean;
  queueOpen: boolean;
  /** True while the active track has no published audio file to stream. */
  silentPreview: boolean;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setExpanded: (value: boolean) => void;
  toggleQueue: () => void;
  playTrackAt: (index: number) => void;
}

const PlayerContext = createContext<PlayerValue | null>(null);

const TICK_MS = 250;
const VOLUME_KEY = "crypticdesign.player.volume.v1";
const RESTART_THRESHOLD_SECONDS = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function PlayerProvider({
  children,
  queue: providedQueue,
}: {
  children: React.ReactNode;
  queue?: PlayerTrack[];
}) {
  const [queue] = useState<PlayerTrack[]>(() => providedQueue ?? defaultQueue());
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [expanded, setExpanded] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [metaDuration, setMetaDuration] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeRef = useRef(0);

  const track = queue[index];
  const declaredDuration = track?.duration ?? 0;
  const duration = metaDuration && metaDuration > 0 ? metaDuration : declaredDuration;
  const hasAudioSource = Boolean(track?.src);

  const setTime = useCallback((value: number) => {
    timeRef.current = value;
    setCurrentTime(value);
  }, []);

  /** Where playback goes after the current track, and whether it stops there. */
  const resolveNext = useCallback(
    (from: number): { index: number; stop: boolean } => {
      if (queue.length <= 1) return { index: from, stop: repeat === "off" };
      if (shuffle) {
        let candidate = from;
        while (candidate === from) candidate = Math.floor(Math.random() * queue.length);
        return { index: candidate, stop: false };
      }
      if (from + 1 < queue.length) return { index: from + 1, stop: false };
      return { index: 0, stop: repeat !== "all" };
    },
    [queue.length, repeat, shuffle],
  );

  const handleEnded = useCallback(() => {
    if (repeat === "one") {
      setTime(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    const target = resolveNext(index);
    setTime(0);
    setIndex(target.index);
    if (target.stop) setPlaying(false);
  }, [index, repeat, resolveNext, setTime]);

  /** Preview clock — only runs when there is no real audio file to drive time. */
  useEffect(() => {
    if (!playing || hasAudioSource || duration <= 0) return;
    const timer = window.setInterval(() => {
      const nextTime = timeRef.current + TICK_MS / 1000;
      if (nextTime >= duration) {
        setTime(duration);
        handleEnded();
        return;
      }
      setTime(nextTime);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [duration, handleEnded, hasAudioSource, playing, setTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = muted ? 0 : volume;
  }, [muted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudioSource) return;
    if (!playing) {
      audio.pause();
      return;
    }
    void audio.play().catch(() => setPlaying(false));
  }, [hasAudioSource, index, playing]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VOLUME_KEY);
      if (stored === null) return;
      const parsed = Number(stored);
      if (Number.isFinite(parsed)) setVolumeState(clamp(parsed, 0, 1));
    } catch {
      // Storage unavailable (private mode etc.) — keep the default volume.
    }
  }, []);

  const toggle = useCallback(() => setPlaying((value) => !value), []);

  const next = useCallback(() => {
    setIndex((from) => resolveNext(from).index);
    setMetaDuration(null);
    setTime(0);
  }, [resolveNext, setTime]);

  const previous = useCallback(() => {
    if (timeRef.current > RESTART_THRESHOLD_SECONDS) {
      setTime(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    setIndex((from) => (from - 1 + queue.length) % queue.length);
    setMetaDuration(null);
    setTime(0);
  }, [queue.length, setTime]);

  const seek = useCallback(
    (seconds: number) => {
      const target = clamp(seconds, 0, duration);
      setTime(target);
      if (audioRef.current) audioRef.current.currentTime = target;
    },
    [duration, setTime],
  );

  const setVolume = useCallback((value: number) => {
    const target = clamp(value, 0, 1);
    setVolumeState(target);
    setMuted(target === 0);
    try {
      window.localStorage.setItem(VOLUME_KEY, String(target));
    } catch {
      // Storage unavailable — volume simply does not persist.
    }
  }, []);

  const playTrackAt = useCallback(
    (target: number) => {
      if (target < 0 || target >= queue.length) return;
      setIndex(target);
      setMetaDuration(null);
      setTime(0);
      setPlaying(true);
      setExpanded(true);
    },
    [queue.length, setTime],
  );

  const value = useMemo<PlayerValue>(
    () => ({
      queue,
      track,
      index,
      playing,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      expanded,
      queueOpen,
      silentPreview: !hasAudioSource,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute: () => setMuted((value) => !value),
      toggleShuffle: () => setShuffle((value) => !value),
      cycleRepeat: () =>
        setRepeat((mode) => (mode === "off" ? "all" : mode === "all" ? "one" : "off")),
      setExpanded,
      toggleQueue: () => setQueueOpen((value) => !value),
      playTrackAt,
    }),
    [
      currentTime,
      duration,
      expanded,
      hasAudioSource,
      index,
      muted,
      next,
      playTrackAt,
      playing,
      previous,
      queue,
      queueOpen,
      repeat,
      seek,
      setVolume,
      shuffle,
      toggle,
      track,
      volume,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={track?.src}
        preload="metadata"
        onLoadedMetadata={(event) => setMetaDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onEnded={handleEnded}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerValue {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("usePlayer must be used inside <PlayerProvider>.");
  return value;
}
