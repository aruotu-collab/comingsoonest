"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const DRAG_THRESHOLD = 8;

export function HorizontalScroll({
  children,
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number | null;
    startX: number;
    startScroll: number;
    dragging: boolean;
    suppressClick: boolean;
  }>({
    pointerId: null,
    startX: 0,
    startScroll: 0,
    dragging: false,
    suppressClick: false,
  });
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    const onScroll = () => updateEdges();
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY + e.deltaX;
      updateEdges();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    const ro = new ResizeObserver(() => updateEdges());
    ro.observe(el);
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      ro.disconnect();
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  function scrollBy(dx: number) {
    scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  }

  function endDrag(el: HTMLDivElement, pointerId: number) {
    if (drag.current.pointerId !== pointerId) return;
    if (drag.current.dragging) {
      drag.current.suppressClick = true;
      // Clear after the click event that follows pointerup
      window.setTimeout(() => {
        drag.current.suppressClick = false;
      }, 0);
    }
    if (el.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId);
    }
    drag.current.pointerId = null;
    drag.current.dragging = false;
    el.classList.remove("cursor-grabbing");
  }

  return (
    <div className="relative mx-auto max-w-7xl">
      {canLeft && (
        <button
          type="button"
          aria-label="Scroll categories left"
          onClick={() => scrollBy(-220)}
          className="absolute left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg-panel)] text-[var(--text)] shadow-lg md:flex"
        >
          ‹
        </button>
      )}
      {canRight && (
        <button
          type="button"
          aria-label="Scroll categories right"
          onClick={() => scrollBy(220)}
          className="absolute right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg-panel)] text-[var(--text)] shadow-lg md:flex"
        >
          ›
        </button>
      )}

      <div
        ref={scrollerRef}
        role="navigation"
        aria-label={ariaLabel}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          const el = scrollerRef.current;
          if (!el || el.scrollWidth <= el.clientWidth) return;
          // Record intent only — do not capture yet so link clicks still work
          drag.current = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startScroll: el.scrollLeft,
            dragging: false,
            suppressClick: false,
          };
        }}
        onPointerMove={(e) => {
          const el = scrollerRef.current;
          if (!el || drag.current.pointerId !== e.pointerId) return;
          const dx = e.clientX - drag.current.startX;
          if (!drag.current.dragging) {
            if (Math.abs(dx) < DRAG_THRESHOLD) return;
            drag.current.dragging = true;
            el.setPointerCapture(e.pointerId);
            el.classList.add("cursor-grabbing");
          }
          el.scrollLeft = drag.current.startScroll - dx;
          updateEdges();
        }}
        onPointerUp={(e) => {
          const el = scrollerRef.current;
          if (!el) return;
          endDrag(el, e.pointerId);
        }}
        onPointerCancel={(e) => {
          const el = scrollerRef.current;
          if (!el) return;
          endDrag(el, e.pointerId);
        }}
        onClickCapture={(e) => {
          if (!drag.current.suppressClick) return;
          e.preventDefault();
          e.stopPropagation();
          drag.current.suppressClick = false;
        }}
        className={`flex cursor-grab gap-1.5 overflow-x-auto px-4 py-2.5 md:px-6 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
