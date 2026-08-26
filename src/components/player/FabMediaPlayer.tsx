"use client";

/**
 * Cryptic Signal floating player.
 *
 * Collapsed it is an always-accessible orb pinned to the viewport, with an
 * magenta arc tracking progress on a dark ring. Expanded it becomes the HUD
 * chassis: corner brackets, notched panel, artwork, track identity, spectrum,
 * full transport and a queue.
 *
 * Mounted once in the root layout so playback survives route changes.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatTime } from "@/lib/player";
import { usePlayer } from "./PlayerProvider";
import {
  CollapseIcon,
  MuteIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  QueueIcon,
  RepeatIcon,
  ShuffleIcon,
  VolumeIcon,
} from "./PlayerIcons";

interface Bar {
  height: number;
  delay: number;
  duration: number;
}

/**
 * Deterministic spectrum profile — decorative, not a real frequency analysis.
 * A plateau envelope keeps the middle tall and tapers both ends, which is how
 * the equaliser reads in the design.
 */
function buildBars(count: number): Bar[] {
  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 0;
    const envelope = Math.min(1, t / 0.16, (1 - t) / 0.1);
    const detail = 0.42 + 0.58 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.53) + 0.35 * Math.sin(i * 0.9));
    return {
      height: Math.max(6, Math.min(100, Math.round(envelope * detail * 100))),
      delay: ((i * 97) % 900) / 1000,
      duration: 0.75 + ((i * 53) % 70) / 100,
    };
  });
}

const PANEL_BARS = buildBars(40);
const PANEL_ID = "cryptic-signal-player-panel";

/** The orb gets a hand-tuned symmetric profile so it reads as a mark, not noise. */
const ORB_BARS: Bar[] = [12, 48, 72, 100, 68, 44, 14].map((height, i) => ({
  height,
  delay: (i % 4) * 0.14,
  duration: 0.85 + (i % 3) * 0.16,
}));

function cssVars(vars: Record<string, string | number>): React.CSSProperties {
  return vars as React.CSSProperties;
}

function Waveform({ bars }: { bars: Bar[] }) {
  return (
    <span className="cs-wave" aria-hidden="true">
      {bars.map((bar, i) => (
        <i
          key={i}
          style={cssVars({
            "--cs-bar-h": `${bar.height}%`,
            "--cs-bar-delay": `${bar.delay}s`,
            "--cs-bar-dur": `${bar.duration}s`,
          })}
        />
      ))}
    </span>
  );
}

/**
 * The HUD chassis. Real vector geometry — stepped edges, corner brackets,
 * rungs and magenta service marks — authored at 560x336 and stretched to the
 * panel box. Strokes stay constant via non-scaling-stroke.
 */
const HUD_SILHOUETTE =
  "M30 4 H196 L210 15 H350 L364 4 H530 L556 30 V138 L548 148 L556 158 V306 " +
  "L530 332 H364 L350 321 H210 L196 332 H30 L4 306 V158 L12 148 L4 138 V30 Z";
const HUD_INNER =
  "M38 16 H206 L220 27 H340 L354 16 H522 L544 38 V298 L522 320 H354 L340 309 " +
  "H220 L206 320 H38 L16 298 V38 Z";
const HUD_BRACKETS = [
  "M4 60 V30 L30 4 H86",
  "M474 4 H530 L556 30 V60",
  "M556 276 V306 L530 332 H474",
  "M86 332 H30 L4 306 V276",
];
const HUD_RUNGS = ["M4 176 H16", "M4 190 H16", "M4 204 H16", "M544 176 H556", "M544 190 H556", "M544 204 H556"];
const HUD_MIDBARS = ["M4 150 V132", "M556 150 V132"];
const HUD_MAGENTA = ["M108 332 H150", "M4 236 V262"];
const HUD_VENTS = ["M243 4 V15", "M252 4 V15", "M261 4 V15"];

function ChassisFrame() {
  return (
    <svg className="cs-hud" viewBox="0 0 560 336" preserveAspectRatio="none" aria-hidden="true">
      <path className="cs-hud__fill" d={HUD_SILHOUETTE} />
      <path className="cs-hud__outer" d={HUD_SILHOUETTE} />
      <path className="cs-hud__inner" d={HUD_INNER} />
      {HUD_BRACKETS.map((d) => <path key={d} className="cs-hud__bracket" d={d} />)}
      {HUD_RUNGS.map((d) => <path key={d} className="cs-hud__rung" d={d} />)}
      {HUD_MIDBARS.map((d) => <path key={d} className="cs-hud__midbar" d={d} />)}
      {HUD_MAGENTA.map((d) => <path key={d} className="cs-hud__magenta" d={d} />)}
      {HUD_VENTS.map((d) => <path key={d} className="cs-hud__vent" d={d} />)}
    </svg>
  );
}

export default function FabMediaPlayer() {
  const {
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
    silentPreview,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setExpanded,
    toggleQueue,
    playTrackAt,
  } = usePlayer();

  const panelId = PANEL_ID;
  const orbRef = useRef<HTMLButtonElement | null>(null);
  const playRef = useRef<HTMLButtonElement | null>(null);
  const interacted = useRef(false);

  // Move focus with the disclosure, but never steal it on first paint.
  useEffect(() => {
    if (!interacted.current) return;
    const target = expanded ? playRef.current : orbRef.current;
    target?.focus();
  }, [expanded]);

  if (!track) return null;

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const repeatLabel =
    repeat === "one" ? "Repeat one, on" : repeat === "all" ? "Repeat all, on" : "Repeat, off";

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape") return;
    interacted.current = true;
    setExpanded(false);
  }

  return (
    <div className="cs-root" data-playing={playing} data-expanded={expanded}>
      <div className="cs-mobile-label" hidden={expanded} aria-hidden="true"><strong>Cryptic Signal</strong><span>{track.title} · {track.artist}</span></div>
      <button
        ref={orbRef}
        type="button"
        className="cs-orb"
        hidden={expanded}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => {
          interacted.current = true;
          setExpanded(true);
        }}
      >
        <span className="cs-orb__edge" aria-hidden="true" />
        <span className="cs-orb__track" aria-hidden="true" />
        <svg className="cs-orb__ring" viewBox="0 0 112 112" aria-hidden="true">
          <circle cx="56" cy="56" r="42.5" pathLength={100} strokeDasharray={`${progress * 100} 100`} />
        </svg>
        <Waveform bars={ORB_BARS} />
        <span className="sr-only">
          Open the Cryptic Signal player — {playing ? "playing" : "paused"}: {track.title} by{" "}
          {track.artist}
        </span>
      </button>

    {expanded && queueOpen ? (
      <ol className="cs-panel__queue" aria-label="Playback queue">
        {queue.map((item, position) => (
          <li key={item.id} aria-current={position === index ? "true" : undefined}>
            <button type="button" onClick={() => playTrackAt(position)}>
              <span className="cs-queue__index">
                {String(position + 1).padStart(2, "0")}
              </span>
              <span className="cs-queue__title">{item.title}</span>
              <span className="cs-queue__time">{formatTime(item.duration)}</span>
            </button>
          </li>
        ))}
      </ol>
    ) : null}

      <div className="cs-chassis" hidden={!expanded}>
      <ChassisFrame />
          <section
            id={panelId}
            className="cs-panel"
            role="region"
            aria-label="Cryptic Signal player"
            onKeyDown={handleKeyDown}
          >
            <header className="cs-panel__bar">
              <span className="cs-panel__eyebrow">Now playing</span>
              <div className="cs-panel__tools">
                <button
                  type="button"
                  className="cs-icon-btn"
                  aria-expanded={queueOpen}
                  aria-label={queueOpen ? "Hide queue" : "Show queue"}
                  onClick={toggleQueue}
                >
                  <QueueIcon />
                </button>
                <span className="cs-vol">
                  <button
                    type="button"
                    className="cs-icon-btn"
                    aria-pressed={muted}
                    aria-label={muted ? "Unmute" : "Mute"}
                    onClick={toggleMute}
                  >
                    {muted ? <MuteIcon /> : <VolumeIcon />}
                  </button>
                  <span className="cs-vol__pop">
                    <input
                      type="range"
                      className="cs-range cs-range--volume"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((muted ? 0 : volume) * 100)}
                      aria-label="Volume"
                      style={cssVars({ "--cs-fill": muted ? 0 : volume })}
                      onChange={(event) => setVolume(Number(event.target.value) / 100)}
                    />
                  </span>
                </span>
                <button
                  type="button"
                  className="cs-icon-btn"
                  aria-label="Collapse player"
                  onClick={() => {
                    interacted.current = true;
                    setExpanded(false);
                  }}
                >
                  <CollapseIcon />
                </button>
              </div>
            </header>


            <div className="cs-panel__body">
              <div className="cs-panel__art">
                <Image
                  src={track.artwork}
                  alt=""
                  width={88}
                  height={88}
                  sizes="88px"
                  className="size-full object-cover"
                />
              </div>
              <div className="cs-panel__meta">
                <h2 className="cs-panel__title" title={track.title}>
                  {track.href ? <Link href={track.href}>{track.title}</Link> : track.title}
                </h2>
                <p className="cs-panel__artist">{track.artist}</p>
                <p className="cs-panel__badges">
                  <span>{track.format}</span>
                  <span>{track.bitrate}</span>
                </p>
              </div>
              <Waveform bars={PANEL_BARS} />
            </div>

            <div className="cs-panel__transport">
              <button
                type="button"
                className="cs-icon-btn"
                aria-pressed={shuffle}
                aria-label={shuffle ? "Shuffle, on" : "Shuffle, off"}
                onClick={toggleShuffle}
              >
                <ShuffleIcon />
              </button>
              <button
                type="button"
                className="cs-icon-btn"
                aria-label="Previous track"
                onClick={previous}
              >
                <PreviousIcon />
              </button>
              <button
                ref={playRef}
                type="button"
                className="cs-play"
                aria-label={playing ? "Pause" : "Play"}
                onClick={toggle}
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button type="button" className="cs-icon-btn" aria-label="Next track" onClick={next}>
                <NextIcon />
              </button>
              <button
                type="button"
                className="cs-icon-btn"
                aria-pressed={repeat !== "off"}
                aria-label={repeatLabel}
                onClick={cycleRepeat}
              >
                <RepeatIcon one={repeat === "one"} />
              </button>
            </div>

            <div className="cs-panel__timeline">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                className="cs-range"
                min={0}
                max={Math.max(duration, 1)}
                step={0.5}
                value={Math.min(currentTime, duration)}
                aria-label="Seek"
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                style={cssVars({ "--cs-fill": progress })}
                onChange={(event) => seek(Number(event.target.value))}
              />
              <span>{formatTime(duration)}</span>
            </div>

            {silentPreview ? (
              <p className="sr-only">
                Preview timeline. Audio streams here once Cryptic Signal releases publish.
              </p>
            ) : null}
          </section>
      </div>
    </div>
  );
}
