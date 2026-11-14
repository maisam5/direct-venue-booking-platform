"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* modal */}
      <div
        className={`relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] shadow-2xl transform transition-all duration-300 ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-8 opacity-0 scale-95"
        }`}
      >
        {/* header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--bg)]">
          <h2 className="text-xl font-semibold text-[var(--ink)]">{title}</h2>

          <button
            type="button"
            aria-label="Close Modal"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--soft)] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
