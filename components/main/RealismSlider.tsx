"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface RealismSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function RealismSlider({
  beforeImage = "/images/landing/realism/before.webp",
  afterImage = "/images/landing/realism/after.webp",
  beforeLabel = "До",
  afterLabel = "После",
}: RealismSliderProps): React.JSX.Element {
  const [sliderPos, setSliderPos] = useState(30);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPos = useCallback((clientX: number): void => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setSliderPos(
      Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 100),
    );
  }, []);

  const onMouseDown = useCallback(
    (event: React.MouseEvent): void => {
      isDragging.current = true;
      getPos(event.clientX);
    },
    [getPos],
  );
  const onMouseMove = useCallback(
    (event: MouseEvent): void => {
      if (isDragging.current) getPos(event.clientX);
    },
    [getPos],
  );
  const onMouseUp = useCallback((): void => {
    isDragging.current = false;
  }, []);
  const onTouchStart = useCallback(
    (event: React.TouchEvent): void => {
      isDragging.current = true;
      const clientX = event.touches[0]?.clientX;
      if (clientX !== undefined) getPos(clientX);
    },
    [getPos],
  );
  const onTouchMove = useCallback(
    (event: TouchEvent): void => {
      if (!isDragging.current) return;
      event.preventDefault();
      const clientX = event.touches[0]?.clientX;
      if (clientX !== undefined) getPos(clientX);
    },
    [getPos],
  );
  const onTouchEnd = useCallback((): void => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchend", onTouchEnd);
    const container = containerRef.current;
    container?.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onTouchEnd);
      container?.removeEventListener("touchmove", onTouchMove);
    };
  }, [onMouseMove, onMouseUp, onTouchEnd, onTouchMove]);

  return (
    <div
      ref={containerRef}
      className="relative z-10 h-[560px] w-full max-w-[1792px] cursor-col-resize select-none overflow-hidden rounded-[24px] border border-white/[0.08] md:h-[1000px] md:rounded-[60px]"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute left-6 top-6 rounded-[67.2px] px-[16.8px] py-[8.4px] text-[16.8px] leading-[25px] text-white backdrop-blur-[8.4px]"
          style={{
            background:
              "radial-gradient(184.81% 312.33% at 0% 0%, #5BCFFF 0%, rgba(11, 127, 210, 0.8) 100%)",
          }}
        >
          {beforeLabel}
        </div>
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
        <img
          src={afterImage}
          alt={afterLabel}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute right-6 top-6 rounded-[67.2px] px-[16.8px] py-[8.4px] text-[16.8px] leading-[25px] text-white backdrop-blur-[8.4px] md:right-[32.4px]"
          style={{
            background:
              "radial-gradient(184.81% 312.33% at 0% 0%, #5BCFFF 0%, rgba(11, 127, 210, 0.8) 100%)",
          }}
        >
          {afterLabel}
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-0 top-0 z-20 flex flex-col items-center"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
      >
        <div className="h-full w-[4px] rounded-[64px] bg-white" />
        <div className="pointer-events-auto absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 cursor-col-resize">
          <span className="flex h-9 w-9 items-center justify-center text-xl leading-none text-white">
            ‹
          </span>
          <span className="flex h-9 w-9 items-center justify-center text-xl leading-none text-white">
            ›
          </span>
        </div>
      </div>
    </div>
  );
}
