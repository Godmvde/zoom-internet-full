"use client";

import { useState } from "react";
import { uploadSiteMedia } from "./uploadMedia";

// A Puck custom field for images. Shows the current image, lets you drop or pick
// a file (uploaded to the shared `site-media` bucket → public URL), or paste a
// URL as a fallback. Used in place of the old plain "Image URL" text field.
export function ImageField({
  value,
  onChange,
  readOnly,
}: {
  value?: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      onChange(await uploadSiteMedia(file));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          style={{
            width: "100%",
            maxHeight: 130,
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}
        />
      ) : (
        <div
          style={{
            padding: "18px 0",
            textAlign: "center",
            fontSize: 12,
            color: "#94a3b8",
            border: "1px dashed #cbd5e1",
            borderRadius: 8,
          }}
        >
          No image yet
        </div>
      )}

      {!readOnly && (
        <>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) upload(f);
            }}
            style={{
              display: "block",
              padding: "10px 12px",
              textAlign: "center",
              fontSize: 13,
              fontWeight: 500,
              color: busy ? "#94a3b8" : "#1e40af",
              background: "#f8fafc",
              border: "1px dashed " + (busy ? "#cbd5e1" : "#93c5fd"),
              borderRadius: 8,
              cursor: busy ? "default" : "pointer",
            }}
          >
            {busy ? "Uploading…" : "Drop an image here, or click to upload"}
            <input
              type="file"
              accept="image/*"
              disabled={busy}
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </label>
          <input
            type="text"
            value={value ?? ""}
            placeholder="…or paste an image URL"
            onChange={(e) => onChange(e.target.value)}
            style={{
              padding: "6px 8px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 12,
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </>
      )}
      {err && <span style={{ color: "#b91c1c", fontSize: 12 }}>{err}</span>}
    </div>
  );
}
