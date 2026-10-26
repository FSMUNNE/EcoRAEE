import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppShare({ message, label = "Compartir", size = "sm" }) {
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 ${
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm"
      }`}
    >
      <MessageCircle className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}