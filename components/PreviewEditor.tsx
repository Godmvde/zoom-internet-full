"use client";

import { useEffect } from "react";

// Runs ONLY inside the Retiar Studio preview. Makes elements tagged with
// data-rtr-field click-to-edit; posts changes up to the Studio, which saves
// them to the draft. The Studio tells us which fields are editable (perms) and
// can disable editing entirely (perms = []) for a clean "Preview" view.
//
// Uses event delegation on document so the active set can be toggled at any
// time — binding/unbinding is just flipping a data-attribute per element.
export default function PreviewEditor() {
  useEffect(() => {
    let parentOrigin = "*";
    try {
      if (document.referrer) parentOrigin = new URL(document.referrer).origin;
    } catch {}

    // Active = fields currently editable. A tagged element is "armed" (shows the
    // edit affordance + accepts clicks) only while its field is in this set.
    const active = new Set<string>();

    const style = document.createElement("style");
    style.setAttribute("data-rtr-style", "");
    style.textContent = `
      [data-rtr-field][data-rtr-on]{outline:1px dashed rgba(99,102,241,.7);outline-offset:2px;cursor:text;border-radius:2px;}
      [data-rtr-field][data-rtr-on]:hover{outline:2px solid rgba(99,102,241,.9);}
      [data-rtr-field][contenteditable="true"]{outline:2px solid rgba(99,102,241,.95);background:rgba(99,102,241,.06);}
    `;
    document.head.appendChild(style);

    function fieldOf(el: Element | null): string {
      return el?.getAttribute("data-rtr-field") || "";
    }

    function applyPerms(fields: string[]) {
      active.clear();
      fields.forEach((f) => active.add(f));
      document
        .querySelectorAll<HTMLElement>("[data-rtr-field]")
        .forEach((el) => {
          const on = active.has(fieldOf(el));
          if (on) {
            el.setAttribute("data-rtr-on", "");
            el.setAttribute("title", "Click to edit");
            el.spellcheck = false;
          } else {
            el.removeAttribute("data-rtr-on");
            el.removeAttribute("title");
            if (el.getAttribute("contenteditable") === "true") commit(el);
          }
        });
    }

    function commit(el: HTMLElement) {
      el.removeAttribute("contenteditable");
      const field = fieldOf(el);
      if (!field) return;
      // textContent (not innerText) so CSS text-transform (e.g. uppercase) on
      // the styled element doesn't corrupt the saved value.
      window.parent?.postMessage(
        { type: "rtr-edit", field, value: (el.textContent || "").trim() },
        parentOrigin,
      );
    }

    function onClick(ev: MouseEvent) {
      const el = (ev.target as Element | null)?.closest<HTMLElement>(
        "[data-rtr-field]",
      );
      if (!el || !active.has(fieldOf(el))) return;
      ev.preventDefault();
      ev.stopPropagation();
      if (el.getAttribute("contenteditable") === "true") return;
      el.setAttribute("contenteditable", "true");
      el.focus();
      const r = document.createRange();
      r.selectNodeContents(el);
      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(r);
    }

    function onFocusOut(ev: FocusEvent) {
      const el = (ev.target as Element | null)?.closest<HTMLElement>(
        "[data-rtr-field]",
      );
      if (el && el.getAttribute("contenteditable") === "true") commit(el);
    }

    function onKeyDown(ev: KeyboardEvent) {
      const el = (ev.target as Element | null)?.closest<HTMLElement>(
        "[data-rtr-field]",
      );
      if (!el || el.getAttribute("contenteditable") !== "true") return;
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        el.blur();
      } else if (ev.key === "Escape") {
        el.blur();
      }
    }

    function onMsg(e: MessageEvent) {
      if (e.data?.type === "rtr-perms" && Array.isArray(e.data.fields))
        applyPerms(e.data.fields as string[]);
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("message", onMsg);
    try {
      window.parent?.postMessage({ type: "rtr-ready" }, parentOrigin);
    } catch {}

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("message", onMsg);
      style.remove();
    };
  }, []);

  return null;
}
