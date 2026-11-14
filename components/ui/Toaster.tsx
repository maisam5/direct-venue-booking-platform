"use client";

import React, { useEffect, useState } from "react";
import { subscribeToasts, ToastMessage } from "@/lib/toast";

export function Toaster() {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToasts(setItems);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            background: item.options?.style?.background || "var(--ink)",
            color: item.options?.style?.color || "var(--bg)",
          }}
          className="pointer-events-auto px-4 py-3 rounded-lg shadow-xl border border-black/10 text-sm font-medium flex items-center justify-between gap-3 transition-all duration-300"
        >
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  );
}
