import React, { useState } from "react";
import { Link, useLocation, useNavigate, useOutlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Leaf, MapPin, Camera, FileText, LayoutDashboard, Menu, X, LogOut, Sparkles, User, Newspaper, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import BottomNav from "@/components/BottomNav";

const roleLabels = {
  ciudadano: "Ciudadano",
  empresa: "Empresa",
  municipio: "Municipio",
  operador: "Operador",
  administrador: "Administrador",
  user: "Ciudadano",
  admin: "Administrador",
};

const allRoles = ["ciudadano", "empresa", "municipio", "operador", "administrador", "user", "admin"];
const adminRoles = ["administrador", "municipio", "operador", "admin"];

const navItems = [
  { label: "Inicio", path: "/", icon: Leaf, roles: allRoles },
  { label: "Asistente IA", path: "/asistente", icon: Camera, roles: allRoles },
  { label: "Puntos Limpios", path: "/puntos", icon: MapPin, roles: allRoles },
  { label: "Mis Reportes", path: "/reportes", icon: FileText, roles: allRoles },
  { label: "Noticias", path: "/noticias", icon: Newspaper, roles: allRoles },
  { label: "Panel Admin", path: "/admin", icon: LayoutDashboard, roles: adminRoles },
  { label: "Perfil", path: "/perfil", icon: User, roles: allRoles },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = (isDark) => document.documentElement.classList.toggle("dark", isDark);
    const savedTheme = localStorage.getItem("ecoraee-theme");
    applyTheme(savedTheme ? savedTheme === "dark" : media.matches);

    const handleSystemChange = (e) => {
      if (!localStorage.getItem("ecoraee-theme")) applyTheme(e.matches);
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  const role = user?.role || "ciudadano";
  const items = navItems.filter((i) => i.roles.includes(role));
  const pageTitle = navItems.find((i) => i.path === location.pathname)?.label || "EcoRAEE";

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-emerald-50/40 via-white to-sky-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 transform border-r border-border/60 bg-white/80 backdrop-blur-xl transition-transform duration-300 dark:bg-slate-900/80 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-6">
            <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 shadow-lg shadow-emerald-500/20">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight text-foreground">EcoRAEE</p>
                <p className="text-[11px] font-medium text-muted-foreground">Reciclaje electrónico</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="scroll-container flex-1 space-y-1 overflow-y-auto px-3">
            {items.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex select-none items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md shadow-emerald-500/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border/60 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-accent/50 px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 text-sm font-bold text-white">
                {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{user?.full_name || "Ciudadano"}</p>
                <p className="truncate text-xs text-muted-foreground">{roleLabels[role] || "Ciudadano"}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="lg:pl-72">
        <header
          className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-white/70 px-5 py-3.5 backdrop-blur-xl dark:bg-slate-900/70 lg:px-8"
          style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
        >
          <div className="flex min-w-0 items-center gap-1">
            {location.pathname !== "/" && (
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 shrink-0 lg:hidden"
                onClick={() => navigate(-1)}
                aria-label="Volver"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <span className="truncate text-sm font-semibold text-foreground lg:hidden">{pageTitle}</span>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="hidden sm:inline">Gestión responsable de residuos electrónicos</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 sm:inline">
              Ley 25.326 · Argentina
            </span>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menú">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="px-5 py-6 pb-safe lg:px-8 lg:py-8">
          {outlet}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}