import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Leaf, MapPin, Camera, FileText, User } from "lucide-react";

const navItems = [
  { label: "Inicio", path: "/", icon: Leaf },
  { label: "Puntos", path: "/puntos", icon: MapPin },
  { label: "EcoBot", path: "/asistente", icon: Camera },
  { label: "Reportes", path: "/reportes", icon: FileText },
  { label: "Perfil", path: "/perfil", icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-white/95 backdrop-blur-xl dark:bg-slate-900/95 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-1.5 py-1.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-h-[44px] flex-1 select-none flex-col items-center justify-center gap-0.5 rounded-lg py-2.5 text-[10px] font-medium transition-colors ${
                active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}