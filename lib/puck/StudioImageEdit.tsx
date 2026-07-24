"use client";

import { useEffect, useRef, useState } from "react";
import { uploadSiteMedia } from "./uploadMedia";

// On-canvas image editing for the Studio. Hovering (or tapping) an image the
// components tag with data-rtr-type="image" reveals a "📷 Change photo" button
// over it, plus a highlight outline so it reads as editable. Clicking uploads to
// site-media (the button owns a hidden <input type=file>, so the OS dialog opens
// on the user's click with no lost activation), then writes the URL back through
// the panel ImageField's own "paste a URL" input — one write path, no per-site
// field→prop map. Edit mode only; the public site never sees this.

type Active = {
  img: HTMLElement;
  left: number;
  top: number;
  width: number;
  height: number;
  label: string;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Poll for a DOM node to appear (Puck re-renders the panel asynchronously).
async function waitFor<T>(fn: () => T | null, tries = 20, gap = 40): Promise<T | null> {
  for (let i = 0; i < tries; i++) {
    const v = fn();
    if (v) return v;
    await wait(gap);
  }
  return null;
}

// Set a React-controlled input's value so React's onChange fires.
function setNativeValue(input: HTMLInputElement, value: string) {
  const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
  desc?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export default function StudioImageEdit({ active }: { active: boolean }) {
  const [hot, setHot] = useState<Active | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const busyRef = useRef(false);
  const imgRef = useRef<HTMLElement | null>(null); // the image currently revealed
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reveal the button+outline over an image, and keep it positioned as the
  // canvas scrolls/re-renders. Only ONE image is shown at a time — the one the
  // pointer (or last tap) is on.
  useEffect(() => {
    if (!active) {
      imgRef.current = null;
      setHot(null);
      return;
    }
    let stop = false;
    let boundDoc: Document | null = null;

    function iframe(): HTMLIFrameElement | null {
      return document.querySelector<HTMLIFrameElement>('[class*="PuckCanvas"] iframe, iframe');
    }
    const cancelHide = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = null;
    };
    const scheduleHide = () => {
      cancelHide();
      hideTimer.current = setTimeout(() => {
        imgRef.current = null;
        setHot(null);
      }, 320);
    };
    function reveal(img: HTMLElement) {
      cancelHide();
      imgRef.current = img;
      place();
    }
    // Compute the active image's rect in page coords (iframe offset + rect).
    function place() {
      if (stop) return;
      const img = imgRef.current;
      const ifr = iframe();
      const doc = ifr?.contentDocument;
      if (!img || !ifr || !doc || !doc.contains(img)) {
        if (imgRef.current) {
          imgRef.current = null;
          setHot(null);
        }
        return;
      }
      const io = ifr.getBoundingClientRect();
      const r = img.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) return;
      // Account for canvas zoom (CSS scale to fit).
      const innerW = doc.documentElement?.clientWidth || io.width;
      const k = innerW ? io.width / innerW : 1;
      setHot({
        img,
        left: io.left + r.left * k,
        top: io.top + r.top * k,
        width: r.width * k,
        height: r.height * k,
        label: img.getAttribute("data-rtr-label") || "Change photo",
      });
    }

    function onOver(e: Event) {
      const t = e.target as HTMLElement | null;
      const img = t?.closest?.('[data-rtr-type="image"]') as HTMLElement | null;
      if (img) reveal(img);
    }
    function onOut(e: Event) {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.('[data-rtr-type="image"]')) scheduleHide();
    }

    // (Re)bind delegated listeners whenever the canvas iframe document changes,
    // and keep the active button positioned.
    function tick() {
      if (stop) return;
      const doc = iframe()?.contentDocument ?? null;
      if (doc && doc !== boundDoc) {
        boundDoc = doc;
        doc.addEventListener("pointerover", onOver, true);
        doc.addEventListener("pointerout", onOut, true);
        doc.addEventListener("touchstart", onOver, true);
      }
      if (imgRef.current) place();
    }
    tick();
    const id = window.setInterval(tick, 200);
    window.addEventListener("resize", tick);
    return () => {
      stop = true;
      cancelHide();
      window.clearInterval(id);
      window.removeEventListener("resize", tick);
      if (boundDoc) {
        boundDoc.removeEventListener("pointerover", onOver, true);
        boundDoc.removeEventListener("pointerout", onOut, true);
        boundDoc.removeEventListener("touchstart", onOver, true);
      }
    };
  }, [active]);

  function keepShown() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }
  function leaveButton() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      imgRef.current = null;
      setHot(null);
    }, 320);
  }

  async function onPick(img: HTMLElement, file: File | undefined) {
    if (!file || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setToast("Uploading photo…");
    try {
      const url = await uploadSiteMedia(file);
      const ok = await applyUrl(img, url);
      setToast(ok ? "Photo updated ✓" : "Uploaded, but couldn't place it — try the panel.");
    } catch (e) {
      setToast("Upload failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally {
      busyRef.current = false;
      setBusy(false);
      window.setTimeout(() => setToast(null), 2600);
    }
  }

  // Select the image's block, open the matching array item if needed, then write
  // the URL into that ImageField's "paste a URL" input.
  async function applyUrl(img: HTMLElement, url: string): Promise<boolean> {
    const block = img.closest<HTMLElement>("[data-puck-component]");
    if (!block) return false;
    const blockImgs = Array.from(block.querySelectorAll<HTMLElement>('[data-rtr-type="image"]'));
    const idx = Math.max(0, blockImgs.indexOf(img));
    block.click(); // select the block → its fields render in the panel

    const panel = await waitFor(() =>
      document.querySelector<HTMLElement>('[class*="PuckFields"]'),
    );
    if (!panel) return false;

    const urlInputSel = 'input[placeholder*="paste an image URL" i]';

    // Single-image block (hero background, logo): the field is right there.
    if (blockImgs.length <= 1) {
      const input = await waitFor(() => panel.querySelector<HTMLInputElement>(urlInputSel));
      if (!input) return false;
      setNativeValue(input, url);
      return true;
    }

    // Array block (tour cards, gallery photos): expand the matching item, then
    // write into that item's URL input.
    const summaries = await waitFor(() => {
      const list = panel.querySelectorAll<HTMLElement>('[class*="ArrayFieldItem-summary"]');
      return list.length ? list : null;
    });
    const summary = summaries?.[idx];
    if (summary) {
      summary.click(); // expand the matching card/photo so its fields render
      await wait(140);
    }
    // Resolve the item's own container by walking up from its summary — matching
    // "ArrayFieldItem" broadly would also hit the summary/body/rhs sub-parts and
    // pick the wrong element.
    const holder =
      (summary?.closest<HTMLElement>('[class*="ArrayFieldItem_"]')) || panel;
    const input = await waitFor(() => holder.querySelector<HTMLInputElement>(urlInputSel));
    if (!input) return false;
    setNativeValue(input, url);
    return true;
  }

  if (!active) return null;

  return (
    <>
      {hot && (
        <>
          {/* Highlight outline so the image reads as editable. */}
          <div
            style={{
              position: "fixed",
              left: hot.left,
              top: hot.top,
              width: hot.width,
              height: hot.height,
              zIndex: 44,
              pointerEvents: "none",
              border: "2px solid #c79a4b",
              borderRadius: 6,
              boxShadow: "inset 0 0 0 9999px rgba(20,33,28,0.18)",
            }}
          />
          {/* The "Change photo" button, centered on the image. */}
          <label
            title={hot.label}
            onMouseEnter={keepShown}
            onMouseLeave={leaveButton}
            style={{
              position: "fixed",
              left: hot.left + hot.width / 2,
              top: hot.top + hot.height / 2,
              transform: "translate(-50%, -50%)",
              zIndex: 46,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              maxWidth: Math.max(120, hot.width - 24),
              padding: "8px 13px",
              borderRadius: 9,
              background: busy ? "#25382e" : "rgba(20,33,28,0.94)",
              color: "#ece5d8",
              border: "1px solid #c79a4b",
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1,
              cursor: busy ? "default" : "pointer",
              boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
              fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {busy ? "Uploading…" : "⬆ Upload"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                onPick(hot.img, f);
              }}
            />
          </label>
        </>
      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 18,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 70,
            background: "#14211c",
            color: "#ece5d8",
            border: "1px solid #25382e",
            borderRadius: 10,
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
