import React, { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export default function PullToRefresh({ onRefresh, children, className = "" }) {
  const startY = useRef(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = (e) => {
    if (refreshing || window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setPull(Math.min(72, delta * 0.5));
  };

  const handleTouchEnd = async () => {
    if (startY.current === null) return;
    startY.current = null;
    const shouldRefresh = pull >= 48;
    setPull(0);
    if (!shouldRefresh) return;
    setRefreshing(true);
    await Promise.resolve(onRefresh?.()).catch(() => {});
    setRefreshing(false);
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex items-center justify-center overflow-hidden text-xs text-muted-foreground"
        style={{ height: refreshing ? 36 : pull }}
      >
        {refreshing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : pull > 0 ? (
          <span>{pull >= 48 ? "Suelta para actualizar" : "Desliza para actualizar"}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}