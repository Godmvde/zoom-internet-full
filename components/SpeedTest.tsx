"use client";

import { useRef, useState } from "react";
import { Gauge } from "./Icons";
import { makeT, type Overrides } from "@/lib/t";

type Phase = "idle" | "ping" | "download" | "done" | "error";

// Cloudflare's speed endpoint sends arbitrary-size payloads with permissive
// CORS headers, so we can measure real download throughput from the browser.
const DOWN = (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`;

const MAX_GAUGE = 200; // Mbps shown at the top of the dial

export default function SpeedTest({ overrides }: { overrides?: Overrides }) {
  const t = makeT(overrides);
  const [phase, setPhase] = useState<Phase>("idle");
  const [mbps, setMbps] = useState(0);
  const [ping, setPing] = useState<number | null>(null);
  const running = useRef(false);

  const angleFor = (v: number) => {
    const clamped = Math.max(0, Math.min(v, MAX_GAUGE));
    // 270° sweep, starting at -135°
    return -135 + (clamped / MAX_GAUGE) * 270;
  };

  async function run() {
    if (running.current) return;
    running.current = true;
    setPhase("ping");
    setMbps(0);
    setPing(null);

    try {
      // --- Ping: time a tiny request ---
      const pStart = performance.now();
      await fetch(DOWN(1000), { cache: "no-store" });
      setPing(Math.max(1, Math.round(performance.now() - pStart)));

      // --- Download: pull a payload and measure throughput live ---
      setPhase("download");
      const sizes = [2_000_000, 5_000_000, 10_000_000];
      let bestMbps = 0;

      for (const size of sizes) {
        const start = performance.now();
        const res = await fetch(DOWN(size), { cache: "no-store" });
        const reader = res.body?.getReader();
        let received = 0;
        if (reader) {
          // stream so we can animate the gauge as data arrives
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            received += value?.length ?? 0;
            const elapsed = (performance.now() - start) / 1000;
            if (elapsed > 0.1) {
              const live = (received * 8) / elapsed / 1_000_000;
              setMbps(live);
            }
          }
        } else {
          await res.arrayBuffer();
          received = size;
        }
        const elapsed = (performance.now() - start) / 1000;
        const final = (received * 8) / elapsed / 1_000_000;
        bestMbps = Math.max(bestMbps, final);
      }

      setMbps(bestMbps);
      setPhase("done");
    } catch {
      setPhase("error");
    } finally {
      running.current = false;
    }
  }

  const angle = angleFor(mbps);
  const busy = phase === "ping" || phase === "download";

  return (
    <div className="card p-7 sm:p-9 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="chip"><Gauge className="w-3.5 h-3.5" /> <span data-rtr-field="ov:speedtest.chip">{t("speedtest.chip", "Speed Test")}</span></span>
      </div>
      <h3 className="display text-2xl sm:text-[1.7rem] text-[var(--color-heading)]" data-rtr-field="ov:speedtest.heading">
        {t("speedtest.heading", "Test your connection")}
      </h3>
      <p className="text-[var(--color-slate)] mt-2" data-rtr-field="ov:speedtest.sub">
        {t("speedtest.sub", "See how your current internet stacks up against Zoom.")}
      </p>

      {/* Gauge */}
      <div className="relative mx-auto mt-6 w-[230px] h-[230px]">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="speedArc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#19c2ff" />
              <stop offset="0.5" stopColor="#0a6cff" />
              <stop offset="1" stopColor="#0046b8" />
            </linearGradient>
          </defs>
          {/* track */}
          <path
            d="M 41 159 A 80 80 0 1 1 159 159"
            fill="none"
            stroke="var(--color-cloud)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* progress */}
          <path
            d="M 41 159 A 80 80 0 1 1 159 159"
            fill="none"
            stroke="url(#speedArc)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="377"
            strokeDashoffset={377 - (Math.min(mbps, MAX_GAUGE) / MAX_GAUGE) * 377}
            style={{ transition: "stroke-dashoffset 0.25s ease-out" }}
          />
          {/* needle */}
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 100px", transition: "transform 0.25s ease-out" }}>
            <line x1="100" y1="100" x2="100" y2="40" stroke="#14223d" strokeWidth="3.5" strokeLinecap="round" />
          </g>
          <circle cx="100" cy="100" r="7" fill="#14223d" />
        </svg>
      </div>

      {/* Result — shown under the clock */}
      <div className="-mt-3 mb-5 text-center">
        <div className="display text-5xl font-bold text-blue-grad tabular-nums leading-none">
          {mbps.toFixed(mbps >= 100 ? 0 : 1)}
          <span className="text-xl text-[var(--color-slate)] font-medium ml-2">Mbps</span>
        </div>
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)] mt-2">
          {phase === "done"
            ? t("speedtest.result_label", "Your download result")
            : busy
            ? t("speedtest.measuring", "Measuring…")
            : t("speedtest.speed_label", "Your download speed")}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 text-sm mb-6">
        <div>
          <div className="text-[var(--color-muted)] uppercase tracking-wider text-[0.7rem]" data-rtr-field="ov:speedtest.ping_label">{t("speedtest.ping_label", "Ping")}</div>
          <div className="font-semibold text-[var(--color-heading)]">{ping !== null ? `${ping} ms` : "—"}</div>
        </div>
        <div className="w-px h-8 bg-[var(--color-line)]" />
        <div>
          <div className="text-[var(--color-muted)] uppercase tracking-wider text-[0.7rem]" data-rtr-field="ov:speedtest.status_label">{t("speedtest.status_label", "Status")}</div>
          <div className="font-semibold text-[var(--color-heading)] capitalize">
            {phase === "idle" ? t("speedtest.status_ready", "Ready") : phase === "download" ? t("speedtest.status_testing", "Testing…") : phase}
          </div>
        </div>
      </div>

      <button onClick={run} disabled={busy} className="btn btn-primary w-full sm:w-auto">
        {busy ? t("speedtest.btn_running", "Running test…") : phase === "done" ? t("speedtest.btn_again", "Test again") : t("speedtest.btn_start", "Start speed test")}
      </button>

      {phase === "done" && (
        <p className="text-sm text-[var(--color-slate)] mt-4">
          {mbps < 100
            ? t("speedtest.result_slow", "Running slower than you'd like? Zoom's Work From Home plan delivers a full 100 Mbps, unlimited.")
            : t("speedtest.result_fast", "Nice speeds! Zoom keeps it fast and unlimited — with local support you can actually reach.")}
        </p>
      )}
      {phase === "error" && (
        <p className="text-sm text-red-500 mt-4" data-rtr-field="ov:speedtest.error">
          {t("speedtest.error", "Couldn't complete the test — please check your connection and try again.")}
        </p>
      )}
    </div>
  );
}
