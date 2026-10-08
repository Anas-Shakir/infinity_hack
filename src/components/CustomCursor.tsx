"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CursorMode = "default" | "pointer" | "pressed" | "grab" | "grabbing" | "text" | "disabled";

export function CustomCursor() {
  const cursorRef = useRef<SVGSVGElement>(null);
  const modeRef = useRef<CursorMode>("default");
  const pressedRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");

  const updateMode = useCallback((nextMode: CursorMode) => {
    if (modeRef.current === nextMode) return;
    modeRef.current = nextMode;
    setMode(nextMode);
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    document.body.classList.add("has-custom-cursor");

    const getMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) return "default";
      if (target.closest(":disabled,[aria-disabled='true']")) return "disabled";
      if (target.closest("[draggable='true'],[data-cursor='grab']")) return "grab";
      if (target.closest("a,button,[role='button'],input[type='checkbox'],input[type='radio'],select,summary,[data-cursor='pointer']")) return "pointer";
      if (target.closest("textarea,[contenteditable='true'],input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']):not([type='range'])")) return "text";
      return "default";
    };

    const moveCursor = (event: PointerEvent) => {
      const cursor = cursorRef.current;
      if (!cursor) return;
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
      setVisible(true);
      const nextMode = getMode(event.target);
      updateMode(pressedRef.current && nextMode === "grab" ? "grabbing" : nextMode);
    };

    const pressCursor = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pressedRef.current = true;
      const nextMode = getMode(event.target);
      updateMode(nextMode === "grab" ? "grabbing" : nextMode === "pointer" ? "pressed" : nextMode);
    };

    const releaseCursor = (event: PointerEvent) => {
      pressedRef.current = false;
      updateMode(getMode(event.target));
    };

    const leaveWindow = (event: PointerEvent) => {
      if (!event.relatedTarget) setVisible(false);
    };

    window.addEventListener("pointermove", moveCursor);
    window.addEventListener("pointerdown", pressCursor);
    window.addEventListener("pointerup", releaseCursor);
    window.addEventListener("pointercancel", releaseCursor);
    document.addEventListener("pointerout", leaveWindow);
    return () => {
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("pointerdown", pressCursor);
      window.removeEventListener("pointerup", releaseCursor);
      window.removeEventListener("pointercancel", releaseCursor);
      document.removeEventListener("pointerout", leaveWindow);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [updateMode]);

  return (
    <svg
      ref={cursorRef}
      className={`custom-cursor cursor-${mode}${visible ? " is-visible" : ""}`}
      width="29"
      height="35"
      viewBox="0 0 29 35"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cursor-outline" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7346D8" />
          <stop offset="100%" stopColor="#FF7A35" />
        </linearGradient>
        <linearGradient id="cursor-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor="#E9E5DC" />
        </linearGradient>
        <filter id="cursor-shadow" x="-40%" y="-30%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
          <feOffset dy="1" />
          <feComponentTransfer><feFuncA type="linear" slope=".24" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path
        className="cursor-arrow"
        d="M3 2.5v25l6.5-6.4 5.1 10.4 4.5-2.3-5.2-10.2h10.2L3 2.5Z"
        fill="url(#cursor-fill)"
        stroke="url(#cursor-outline)"
        strokeWidth=".75"
        strokeLinejoin="round"
        filter="url(#cursor-shadow)"
      />
      <path className="cursor-arrow-bevel" d="M5 6.2v16.5l4.9-4.8 5.1 10.1" fill="none" stroke="rgba(255,255,255,.84)" strokeWidth=".7" strokeLinecap="round" strokeLinejoin="round" />
      <path
        className="cursor-hand"
        d="M9.1 15.8V8.2a2.05 2.05 0 0 1 4.1 0v5.1-7.2a2.05 2.05 0 0 1 4.1 0v7.2-5.1a2.05 2.05 0 0 1 4.1 0v6.3-3.1a2.05 2.05 0 0 1 4.1 0v7.1c0 6.1-3.6 10-9 10h-1.2c-2.1 0-3.5-.8-4.8-2.5l-4.8-6.1a2.15 2.15 0 0 1 3.4-2.6l2.1 2.4v-3.8Z"
        fill="url(#cursor-fill)"
        stroke="url(#cursor-outline)"
        strokeWidth=".75"
        strokeLinejoin="round"
        filter="url(#cursor-shadow)"
      />
      <path className="cursor-hand-bevel" d="M11.2 16V8.3m4.1 4.6V6.2m4.1 6.8V8.2m4.1 6V12" fill="none" stroke="rgba(255,255,255,.84)" strokeWidth=".7" strokeLinecap="round" />
      <path className="cursor-text-mark" d="M14.5 4v27m-3-24h6m-6 21h6" fill="none" stroke="url(#cursor-outline)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
