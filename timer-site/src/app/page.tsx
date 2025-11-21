"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlarmClock,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const PRESETS = [
  { label: "Quick Focus", seconds: 5 * 60 },
  { label: "Pomodoro", seconds: 25 * 60 },
  { label: "Deep Work", seconds: 45 * 60 },
];

const MOODS = [
  {
    label: "Morning Momentum",
    description:
      "Kick off the day with a 15 minute burst to set the tone for everything that follows.",
    duration: 15 * 60,
  },
  {
    label: "Afternoon Reset",
    description:
      "Shake off the post-lunch slump with a 10 minute timer and a walk around the room.",
    duration: 10 * 60,
  },
  {
    label: "Evening Wind Down",
    description:
      "Wrap the day with 5 quiet minutes to review wins and plan for tomorrow.",
    duration: 5 * 60,
  },
];

type TimerEvent = {
  id: string;
  label: string;
  elapsed: number;
  target: number;
  timestamp: Date;
  completed: boolean;
};

const formatTime = (totalSeconds: number) => {
  const clamped = Math.max(totalSeconds, 0);
  const minutes = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(clamped % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const formatTimestamp = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const circleCircumference = 2 * Math.PI * 110;

export default function Home() {
  const [duration, setDuration] = useState<number>(25 * 60);
  const [remaining, setRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [history, setHistory] = useState<TimerEvent[]>([]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setHistory((prevHistory) => [
            {
              id: crypto.randomUUID(),
              label: "Session completed",
              elapsed: duration,
              target: duration,
              timestamp: new Date(),
              completed: true,
            },
            ...prevHistory,
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [duration, isRunning]);

  const elapsed = duration - remaining;
  const progress = duration === 0 ? 0 : Math.min(elapsed / duration, 1);

  const timerStateLabel = useMemo(() => {
    if (isRunning) return "Timer is counting down";
    if (remaining === 0) return "Timer finished";
    if (remaining === duration) return "Timer ready";
    return "Timer paused";
  }, [duration, isRunning, remaining]);

  const handleStart = () => {
    if (remaining === 0) {
      setRemaining(duration);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    setHistory((prevHistory) => [
      {
        id: crypto.randomUUID(),
        label: "Session paused",
        elapsed,
        target: duration,
        timestamp: new Date(),
        completed: false,
      },
      ...prevHistory,
    ]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(duration);
  };

  const handlePreset = (seconds: number, label: string) => {
    setIsRunning(false);
    setDuration(seconds);
    setRemaining(seconds);
    setHistory((prevHistory) => [
      {
        id: crypto.randomUUID(),
        label: `${label} preset loaded`,
        elapsed: 0,
        target: seconds,
        timestamp: new Date(),
        completed: false,
      },
      ...prevHistory,
    ]);
  };

  const handleCustomMinutes = (minutes: number) => {
    const seconds = Math.max(0, Math.min(90, minutes)) * 60;
    const elapsedSeconds = duration - remaining;
    setDuration(seconds);
    if (isRunning) {
      setRemaining(Math.max(seconds - elapsedSeconds, 0));
    } else {
      setRemaining(seconds);
    }
  };

  const handleSlider = (value: number) => {
    const seconds = Math.round(value) * 60;
    const elapsedSeconds = duration - remaining;
    setDuration(seconds);
    if (isRunning) {
      setRemaining(Math.max(seconds - elapsedSeconds, 0));
    } else {
      setRemaining(seconds);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-20%] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-cyan-400/30 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[320px] w-[320px] translate-x-1/4 rounded-full bg-amber-300/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[140px]" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <AlarmClock className="h-5 w-5 text-cyan-300" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-100">
            ChronoCanvas
          </span>
        </div>
        <span className="rounded-full bg-white/10 px-4 py-1 text-sm text-slate-200/80 backdrop-blur-lg">
          Designed for mindful makers
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pb-24">
        <section className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <div className="absolute right-10 top-10 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-slate-200/80">
              <Sparkles className="h-3.5 w-3.5" />
              real-time sync
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/90">
                  Daily Rhythm
                </p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
                  Design-forward timer, crafted for flow.
                </h1>
                <p className="mt-6 max-w-xl text-base text-slate-200/80 md:text-lg">
                  Sculpt time with intention. Blend focused work, restorative
                  breaks, and personal rituals in a single, responsive canvas
                  built for the modern web.
                </p>
              </div>

              <div
                aria-label={timerStateLabel}
                className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-8 rounded-3xl border border-white/10 bg-slate-950/60 px-8 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
              >
                <div className="relative flex items-center justify-center">
                  <svg
                    viewBox="0 0 260 260"
                    className="h-60 w-60 text-slate-800"
                  >
                    <circle
                      cx="130"
                      cy="130"
                      r="110"
                      stroke="currentColor"
                      strokeWidth="22"
                      fill="none"
                      className="opacity-30"
                    />
                    <circle
                      cx="130"
                      cy="130"
                      r="110"
                      strokeLinecap="round"
                      strokeWidth="22"
                      fill="none"
                      stroke="url(#timer-gradient)"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={
                        circleCircumference * (1 - progress || 0)
                      }
                      transform="rotate(-90 130 130)"
                    />
                    <defs>
                      <linearGradient
                        id="timer-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Remaining
                    </span>
                    <span className="font-mono text-5xl tabular-nums text-slate-50 sm:text-6xl">
                      {formatTime(remaining)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {Math.round(progress * 100)}% of session
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                  {!isRunning ? (
                    <button
                      onClick={handleStart}
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-400/90 px-5 py-2.5 font-medium text-slate-950 shadow-[0_10px_25px_-15px_rgba(45,212,191,0.9)] transition hover:bg-cyan-300"
                    >
                      <Play className="h-4 w-4" />
                      Start session
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 font-medium text-slate-100 transition hover:bg-white/25"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>

                <div className="w-full border-t border-white/10 pt-6">
                  <label className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
                    Custom duration
                    <span className="font-medium text-slate-200">
                      {Math.round(duration / 60)} min
                    </span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={90}
                    value={Math.round(duration / 60)}
                    onChange={(event) =>
                      handleSlider(Number(event.currentTarget.value))
                    }
                    className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-400"
                  />
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-400">
                    <span>Minutes</span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={Math.round(duration / 60)}
                      onChange={(event) =>
                        handleCustomMinutes(Number(event.currentTarget.value))
                      }
                      className="w-20 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-center font-medium text-slate-100 outline-none transition focus:border-cyan-300/60 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-300/40"
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
              <p className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-200/80">
                <Clock className="h-4 w-4" />
                Quick presets
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset.seconds, preset.label)}
                    className="group rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-5 text-left transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                  >
                    <p className="text-sm font-semibold text-slate-100">
                      {preset.label}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                      {Math.round(preset.seconds / 60)} minutes
                    </p>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all group-hover:w-full"
                        style={{
                          width: `${Math.min(
                            (preset.seconds / (90 * 60)) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-200/80">
                Session log
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {history.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-slate-400">
                    Sessions you pause, reset, or complete will appear here.
                  </p>
                )}
                {history.slice(0, 6).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4"
                  >
                    <div>
                      <p className="text-slate-100">{event.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                        {formatTime(event.elapsed)} taken · target{" "}
                        {formatTime(event.target)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium uppercase tracking-wide ${
                        event.completed
                          ? "text-emerald-300"
                          : "text-slate-300/80"
                      }`}
                    >
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg md:grid-cols-3">
          {MOODS.map((mood) => (
            <article
              key={mood.label}
              className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-950/60 p-6 transition hover:border-cyan-200/40 hover:bg-slate-950/80"
            >
              <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                ritual
              </span>
              <h2 className="text-lg font-semibold text-slate-50">
                {mood.label}
              </h2>
              <p className="text-sm text-slate-300/90">{mood.description}</p>
              <div className="mt-auto">
                <button
                  onClick={() => handlePreset(mood.duration, mood.label)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.25em] text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                >
                  Load {Math.round(mood.duration / 60)} min
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 pb-10 text-sm text-slate-400/80 sm:flex-row sm:justify-between">
        <p>Built for humans who design their time.</p>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 px-3 py-1">
            <span className="font-medium text-slate-100">90</span> minute max
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1">
            No account required
          </span>
        </div>
      </footer>
    </div>
  );
}
