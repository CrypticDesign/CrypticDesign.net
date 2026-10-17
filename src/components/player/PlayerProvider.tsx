"use client";

/**
 * Shared playback state for the Cryptic Signal floating player.
 *
 * One provider is mounted in the root layout, so any surface can call
 * `usePlayer()` to start a track without owning its own <audio> element.
 * Missing, restricted, offline and failed media remain explicit states; the
 * provider never simulates playback when no source is available.
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
import {
  defaultQueue,
  initialPlaybackStatus,
  playbackIsBlocked,
  playerStatusPresentation,
  type PlayerPlaybackStatus,
  type PlayerStatusPresentation,
  type PlayerTrack,
} from "@/lib/player";

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
  audioPriorityOwner: string | null;
  playbackStatus: PlayerPlaybackStatus;
  statusPresentation: PlayerStatusPresentation;
  playbackBlocked: boolean;
  toggle: () => void;
  retry: () => void;
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
  requestAudioPriority: (ownerId: string) => void;
  releaseAudioPriority: (ownerId: string) => void;
}

const PlayerContext = createContext<PlayerValue | null>(null);

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
  const [audioPriorityOwner, setAudioPriorityOwner] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [playbackStatus, setPlaybackStatus] = useState<PlayerPlaybackStatus>(() =>
    initialPlaybackStatus(queue[0]),
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeRef = useRef(0);
  const playingRef = useRef(false);
  const audioPriorityOwnerRef = useRef<string | null>(null);
  const resumeAfterExperienceRef = useRef(false);

  const track = queue[index];
  const declaredDuration = track?.duration ?? 0;
  const duration = metaDuration && metaDuration > 0 ? metaDuration : declaredDuration;
  const hasAudioSource = Boolean(track?.src && track.availability === "public");
  const playbackBlocked = playbackIsBlocked(playbackStatus);
  const statusPresentation = useMemo(
    () => playerStatusPresentation(playbackStatus),
    [playbackStatus],
  );
  playingRef.current = playing;

  const liveSourceStatus = useCallback((connectedStatus: PlayerPlaybackStatus) => {
    if (audioPriorityOwnerRef.current) return "interrupted";
    if (!window.navigator.onLine) return "offline";
    return connectedStatus;
  }, []);

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
    const nextStatus = audioPriorityOwnerRef.current
      ? "interrupted"
      : initialPlaybackStatus(queue[target.index], online);
    setTime(0);
    setIndex(target.index);
    if (target.stop) {
      setPlaying(false);
      setPlaybackStatus(nextStatus === "idle" ? "paused" : nextStatus);
    } else if (playbackIsBlocked(nextStatus)) {
      setPlaying(false);
      setPlaybackStatus(nextStatus);
    } else {
      setPlaybackStatus("loading");
    }
  }, [index, online, queue, repeat, resolveNext, setTime]);

  useEffect(() => {
    const updateConnection = () => {
      const isOnline = window.navigator.onLine;
      setOnline(isOnline);
      if (!isOnline) {
        setPlaying(false);
        setPlaybackStatus(initialPlaybackStatus(track, false));
        return;
      }
      setPlaybackStatus((current) =>
        current === "offline"
          ? audioPriorityOwnerRef.current
            ? "interrupted"
            : initialPlaybackStatus(track, true)
          : current,
      );
    };
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, [track]);

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
    setPlaybackStatus("loading");
    void audio.play().catch(() => {
      setPlaying(false);
      setPlaybackStatus(liveSourceStatus("error"));
    });
  }, [hasAudioSource, index, liveSourceStatus, playing]);

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

  const toggle = useCallback(() => {
    if (!track || playbackBlocked) return;
    setPlaying((value) => {
      const nextValue = !value;
      setPlaybackStatus(nextValue ? "loading" : "paused");
      return nextValue;
    });
  }, [playbackBlocked, track]);

  const retry = useCallback(() => {
    const audio = audioRef.current;
    const isOnline = window.navigator.onLine;
    setOnline(isOnline);
    if (!isOnline) {
      setPlaybackStatus("offline");
      return;
    }
    if (!audio || !hasAudioSource || audioPriorityOwnerRef.current) return;
    setPlaybackStatus("loading");
    audio.load();
    setPlaying(true);
  }, [hasAudioSource]);

  const next = useCallback(() => {
    setIndex((from) => {
      const target = resolveNext(from).index;
      const nextStatus = audioPriorityOwnerRef.current
        ? "interrupted"
        : initialPlaybackStatus(queue[target], online);
      setPlaybackStatus(nextStatus);
      if (playbackIsBlocked(nextStatus)) setPlaying(false);
      return target;
    });
    setMetaDuration(null);
    setTime(0);
  }, [online, queue, resolveNext, setTime]);

  const previous = useCallback(() => {
    if (timeRef.current > RESTART_THRESHOLD_SECONDS) {
      setTime(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    setIndex((from) => {
      const target = (from - 1 + queue.length) % queue.length;
      const nextStatus = audioPriorityOwnerRef.current
        ? "interrupted"
        : initialPlaybackStatus(queue[target], online);
      setPlaybackStatus(nextStatus);
      if (playbackIsBlocked(nextStatus)) setPlaying(false);
      return target;
    });
    setMetaDuration(null);
    setTime(0);
  }, [online, queue, setTime]);

  const seek = useCallback(
    (seconds: number) => {
      if (playbackBlocked) return;
      const target = clamp(seconds, 0, duration);
      setTime(target);
      if (audioRef.current) audioRef.current.currentTime = target;
    },
    [duration, playbackBlocked, setTime],
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
      const nextStatus = audioPriorityOwnerRef.current
        ? "interrupted"
        : initialPlaybackStatus(queue[target], online);
      setIndex(target);
      setMetaDuration(null);
      setTime(0);
      setPlaybackStatus(playbackIsBlocked(nextStatus) ? nextStatus : "loading");
      setPlaying(!playbackIsBlocked(nextStatus));
      setExpanded(true);
    },
    [online, queue, setTime],
  );

  const requestAudioPriority = useCallback((ownerId: string) => {
    if (audioPriorityOwnerRef.current === ownerId) return;
    if (audioPriorityOwnerRef.current === null) resumeAfterExperienceRef.current = playingRef.current;
    audioPriorityOwnerRef.current = ownerId;
    setAudioPriorityOwner(ownerId);
    setPlaying(false);
    setPlaybackStatus("interrupted");
  }, []);

  const releaseAudioPriority = useCallback((ownerId: string) => {
    if (audioPriorityOwnerRef.current !== ownerId) return;
    audioPriorityOwnerRef.current = null;
    setAudioPriorityOwner(null);
    if (resumeAfterExperienceRef.current) {
      setPlaybackStatus("loading");
      setPlaying(true);
    } else {
      const restoredStatus = initialPlaybackStatus(track, online);
      setPlaybackStatus(restoredStatus === "idle" ? "paused" : restoredStatus);
    }
    resumeAfterExperienceRef.current = false;
  }, [online, track]);

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
      audioPriorityOwner,
      playbackStatus,
      statusPresentation,
      playbackBlocked,
      toggle,
      retry,
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
      requestAudioPriority,
      releaseAudioPriority,
    }),
    [
      currentTime,
      audioPriorityOwner,
      duration,
      expanded,
      index,
      muted,
      next,
      playTrackAt,
      playing,
      playbackBlocked,
      playbackStatus,
      previous,
      queue,
      queueOpen,
      releaseAudioPriority,
      repeat,
      retry,
      seek,
      setVolume,
      shuffle,
      statusPresentation,
      toggle,
      track,
      volume,
      requestAudioPriority,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={hasAudioSource ? track?.src : undefined}
        preload="metadata"
        onLoadStart={() => setPlaybackStatus("loading")}
        onLoadedMetadata={(event) => {
          setMetaDuration(event.currentTarget.duration);
          if (!playingRef.current) setPlaybackStatus(liveSourceStatus("ready"));
        }}
        onCanPlay={() =>
          setPlaybackStatus(liveSourceStatus(playingRef.current ? "playing" : "ready"))
        }
        onPlaying={() => setPlaybackStatus(liveSourceStatus("playing"))}
        onPause={() => {
          if (audioPriorityOwnerRef.current) setPlaybackStatus("interrupted");
          else if (playingRef.current) setPlaybackStatus("buffering");
          else setPlaybackStatus((current) => playbackIsBlocked(current) || current === "error" ? current : "paused");
        }}
        onWaiting={() => setPlaybackStatus(liveSourceStatus("buffering"))}
        onStalled={() => setPlaybackStatus(liveSourceStatus("buffering"))}
        onError={() => {
          setPlaying(false);
          setPlaybackStatus(liveSourceStatus("error"));
        }}
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
