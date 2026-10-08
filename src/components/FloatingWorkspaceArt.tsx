"use client";

import { useRef } from "react";
import type { PointerEvent } from "react";

const calendarDays = Array.from({ length: 35 }, (_, index) => index < 3 || index > 33 ? null : index - 2);

export function FloatingWorkspaceArt() {
  const sceneRef = useRef<HTMLDivElement>(null);

  const moveWithPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || !sceneRef.current) return;
    const bounds = sceneRef.current.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    sceneRef.current.style.setProperty("--tilt-x", `${vertical * -13}deg`);
    sceneRef.current.style.setProperty("--tilt-y", `${horizontal * 16}deg`);
  };

  const resetTilt = () => {
    sceneRef.current?.style.setProperty("--tilt-x", "0deg");
    sceneRef.current?.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div
      ref={sceneRef}
      className="floating-workspace-art"
      aria-hidden="true"
      onPointerMove={moveWithPointer}
      onPointerLeave={resetTilt}
    >
      <div className="floating-art-document">
        <div className="document-fold" />
        <span className="document-rule document-rule-long" />
        <span className="document-rule" />
        <span className="document-rule document-rule-short" />
        <span className="document-rule document-rule-long" />
      </div>
      <div className="floating-art-calendar">
        <div className="calendar-binding"><span /><span /></div>
        <div className="calendar-face">
          <div className="calendar-topline"><span>GENESIS</span><strong>OCT 2026</strong></div>
          <div className="calendar-weekdays">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
          <div className="calendar-days">{calendarDays.map((day, index) => <span className={day === null ? "calendar-day-empty" : day === 7 || day === 14 || day === 21 ? "calendar-day-highlight" : ""} key={index}>{day}</span>)}</div>
        </div>
      </div>
    </div>
  );
}
