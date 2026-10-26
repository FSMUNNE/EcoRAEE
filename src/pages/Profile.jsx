import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User as UserIcon, Shield, Trash2, Moon, Sun, LogOut, AlertTriangle, Loader2, ShieldCheck, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const roleLabels = {
  ciudadano: "Ciudadano",
  empresa: "Empresa",
  municipio: "Municipio",
  operador: "Operador",
  administrador: "Administrador",
  user: "Ciudadano",
  admin: "Administrador",
};

const roleStyles = {
  ciudadano: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  empresa: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  municipio: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  operador: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  administrador: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  user: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  admin: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then((u) => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("ecoraee-theme", next ? "dark" : "light");
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const handleDelete = async () => {
    if (confirmText !== "ELIMINAR") {
      toast({ title: "Debes escribir ELIMINAR para confirmar", variant: "destructive" });
      return;
    }
    setDeleting(true);
    try {
      await base44.entities.UserDeletionRequest.create({
        reason: deleteReason || "Solicitud del usuario",
        user_email: user?.email || "",
        user_name: user?.full_name || "",
        status: "Pendiente",
      });
      toast({ title: "Solicitud registrada", description: "Tu cuenta será dada de baja. Cerrando sesión..." });
      setTimeout(() => base44.auth.logout(), 1500);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const role = user?.role || "ciudadano";
  const isAdmin = ["administrador", "admin"].includes(role);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <UserIcon className="h-6 w-6 text-emerald-500" /> Mi Perfil
        </h1>
        <p className="mt-1 text-muted-foreground">Gestiona tu cuenta, preferencias y privacidad.</p>
      </div>

      {/* User info */}
      <Card className="border-border/60 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 text-2xl font-bold text-white shadow-lg shadow-emerald-500/20">
            {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-foreground">{user?.full_name || "Usuario"}</h2>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${roleStyles[role] || roleStyles.ciudadano}`}>
              {roleLabels[role] || "Ciudadano"}
            </span>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="border-border/60 p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <Shield className="h-5 w-5 text-sky-500" /> Preferencias
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-accent/40 px-4 py-3">
            <div className="flex items-center gap-3">
              {dark ? <Moon className="h-5 w-5 text-indigo-500" /> : <Sun className="h-5 w-5 text-amber-500" />}
              <div>
                <p className="text-sm font-medium text-foreground">Modo oscuro</p>
                <p className="text-xs text-muted-foreground">Cambia la apariencia de la interfaz</p>
              </div>
            </div>
            <button
              onClick={toggleDark}
              className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-emerald-500" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${dark ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {isAdmin && (
            <Link to="/admin" className="flex items-center justify-between rounded-xl bg-accent/40 px-4 py-3 transition hover:bg-accent/70">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Panel administrativo</p>
                  <p className="text-xs text-muted-foreground">Gestionar puntos, reportes y solicitudes</p>
                </div>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>
          )}

          <button onClick={handleLogout} className="flex w-full items-center justify-between rounded-xl bg-accent/40 px-4 py-3 transition hover:bg-accent/70">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Cerrar sesión</p>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>
        </div>
      </Card>

      {/* Account deletion - Ley 25.326 compliance */}
      <Card className="border-red-200/60 p-6 dark:border-red-900/40">
        <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
          <AlertTriangle className="h-5 w-5 text-red-500" /> Eliminar mi cuenta
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Ejerce tu derecho al olvido conforme a la Ley 25.326 de Protección de Datos Personales (Argentina).
          Al confirmar, tu cuenta y datos asociados serán marcados para baja y procesados por el administrador.
          Esta acción no se puede deshacer.
        </p>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
              <Trash2 className="mr-2 h-4 w-4" /> Solicitar baja de cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> Confirmar eliminación
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                Estás por solicitar la baja definitiva de tu cuenta. Se eliminarán tus reportes, datos personales
                y historial. <strong>Esta acción es irreversible.</strong>
              </div>
              <div>
                <Label className="mb-1.5 block">Motivo (opcional)</Label>
                <Textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} rows={2} placeholder="Contanos por qué das de baja tu cuenta..." />
              </div>
              <div>
                <Label className="mb-1.5 block">Para confirmar, escribí <strong className="text-red-600">ELIMINAR</strong></Label>
                <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="ELIMINAR" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : <><Trash2 className="mr-2 h-4 w-4" /> Eliminar cuenta</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        <span>Datos protegidos · Ley 25.326 · Política de Play Store / App Store</span>
      </div>
    </div>
  );
}