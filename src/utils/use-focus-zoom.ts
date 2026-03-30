import { useState, useCallback, useRef, useEffect } from "react";

const DEFAULT_ZOOM = 1;
const FOCUS_ZOOM = 4;
const MIN = 0.25;
const MAX = 8;
const STEP = 0.5;
const SCROLL_SENSITIVITY = 0.002;

export interface FocusZoomState {
  zoom: number;
  translate: { x: number; y: number };
  isPanning: boolean;
  focusChunk: (chunkPixelX: number, chunkPixelZ: number) => void;
  manualZoomIn: () => void;
  manualZoomOut: () => void;
  resetView: () => void;
  attachWheel: (el: HTMLElement | null) => void;
}

export function useFocusZoom(): FocusZoomState {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastFocusZoomRef = useRef<number>(FOCUS_ZOOM);
  const wheelTargetRef = useRef<HTMLElement | null>(null);
  const isPanningRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));

  function handleWheel(e: WheelEvent): void {
    e.preventDefault();
    setZoom((z) => {
      const next = clamp(parseFloat((z - e.deltaY * SCROLL_SENSITIVITY).toFixed(3)));
      lastFocusZoomRef.current = next;
      return next;
    });
  }

  function handleMouseDown(e: MouseEvent): void {
    if (e.button !== 1) return;
    e.preventDefault();
    isPanningRef.current = true;
    setIsPanning(true);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: MouseEvent): void {
    if (!isPanningRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
  }

  function stopPan(e: MouseEvent): void {
    if (e.button !== 1 && e.type !== "mouseleave") return;
    isPanningRef.current = false;
    setIsPanning(false);
  }

  const attachWheel = useCallback((el: HTMLElement | null) => {
    const prev = wheelTargetRef.current;
    if (prev) {
      prev.removeEventListener("wheel", handleWheel);
      prev.removeEventListener("mousedown", handleMouseDown);
      prev.removeEventListener("mousemove", handleMouseMove);
      prev.removeEventListener("mouseup", stopPan);
      prev.removeEventListener("mouseleave", stopPan);
    }
    wheelTargetRef.current = el;
    if (el) {
      el.addEventListener("wheel", handleWheel, { passive: false });
      el.addEventListener("mousedown", handleMouseDown);
      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseup", stopPan);
      el.addEventListener("mouseleave", stopPan);
    }
  }, []);

  useEffect(() => {
    return () => {
      const el = wheelTargetRef.current;
      if (!el) return;
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseup", stopPan);
      el.removeEventListener("mouseleave", stopPan);
    };
  }, []);

  const focusChunk = useCallback((chunkPixelX: number, chunkPixelZ: number) => {
    const targetZoom = clamp(lastFocusZoomRef.current);
    setTranslate({ x: -chunkPixelX * targetZoom, y: -chunkPixelZ * targetZoom });
    setZoom(targetZoom);
  }, []);

  const manualZoomIn = useCallback(() => {
    setZoom((z) => {
      const next = clamp(parseFloat((z + STEP).toFixed(2)));
      lastFocusZoomRef.current = next;
      return next;
    });
  }, []);

  const manualZoomOut = useCallback(() => {
    setZoom((z) => {
      const next = clamp(parseFloat((z - STEP).toFixed(2)));
      lastFocusZoomRef.current = next;
      return next;
    });
  }, []);

  const resetView = useCallback(() => {
    lastFocusZoomRef.current = FOCUS_ZOOM;
    setZoom(DEFAULT_ZOOM);
    setTranslate({ x: 0, y: 0 });
  }, []);

  return {
    zoom,
    translate,
    isPanning,
    focusChunk,
    manualZoomIn,
    manualZoomOut,
    resetView,
    attachWheel,
  };
}
