import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Plus, Loader2, Trash2, Package, MapPin, Calendar, QrCode, CheckCircle2 } from "lucide-react";
import WhatsAppShare from "@/components/WhatsAppShare";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PullToRefresh from "@/components/PullToRefresh";
import { useToast } from "@/components/ui/use-toast";

const categories = ["Pequeño Hogar", "Grande Hogar", "IT/Telecom", "Iluminación", "Herramientas", "Juguetes", "Médico", "Otros"];
const risks = ["Bajo", "Medio", "Alto", "Crítico"];
const statusStyles = {
  Pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "En revisión": "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Asignado: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Recolectado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Reciclado: "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ waste_type: "", category: "IT/Telecom", risk_level: "Medio", description: "", quantity: 1, address: "", request_pickup: false });
  const [scannedPoint, setScannedPoint] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cpId = urlParams.get("cp");
    const cpName = urlParams.get("cpn");
    if (cpId) {
      setScannedPoint({ id: cpId, name: cpName ? decodeURIComponent(cpName) : "Punto limpio" });
      setForm((f) => ({ ...f, clean_point_id: cpId, status: "Asignado" }));
      toast({ title: "Punto limpio detectado", description: "Tu disposición se registrará en este punto." });
    }
  }, []);

  const load = () => {
    setLoading(true);
    return base44.entities.RAEEReport.list("-created_date", 50).then((data) => {
      setReports(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.waste_type.trim()) {
      toast({ title: "Indica el tipo de residuo", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.RAEEReport.create(form);
      toast({ title: "Reporte creado", description: "Tu residuo fue registrado correctamente." });
      setOpen(false);
      setForm({ waste_type: "", category: "IT/Telecom", risk_level: "Medio", description: "", quantity: 1, address: "", request_pickup: false });
      load();
    } catch (err) {
      toast({ title: "Error al crear reporte", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const previous = reports;
    setReports((list) => list.filter((r) => r.id !== id));
    try {
      await base44.entities.RAEEReport.delete(id);
      toast({ title: "Reporte eliminado" });
    } catch (err) {
      setReports(previous);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <FileText className="h-6 w-6 text-amber-500" /> Mis Reportes
          </h1>
          <p className="mt-1 text-muted-foreground">Registra residuos electrónicos para recolección y seguimiento.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white">
              <Plus className="mr-2 h-4 w-4" /> Nuevo reporte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Reportar residuo RAEE</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Tipo de residuo *</Label>
                <Input value={form.waste_type} onChange={(e) => setForm({ ...form, waste_type: e.target.value })} placeholder="Ej: Notebook Dell, Heladera, etc." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block">Categoría</Label>
                  <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block">Nivel de riesgo</Label>
                  <Select value={form.risk_level} onValueChange={(value) => setForm({ ...form, risk_level: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {risks.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block">Cantidad</Label>
                  <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Dirección (opcional)</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Retiro a domicilio" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Descripción</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Detalles del estado del equipo..." />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.request_pickup} onChange={(e) => setForm({ ...form, request_pickup: e.target.checked })} className="rounded" />
                Solicitar retiro a domicilio
              </label>
              <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : "Crear reporte"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {scannedPoint && (
        <Card className="flex items-center gap-3 border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
            <QrCode className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Punto escaneado: {scannedPoint.name}
            </p>
            <p className="text-xs text-muted-foreground">Tu reporte se asignará automáticamente a este punto limpio.</p>
          </div>
        </Card>
      )}

      <PullToRefresh onRefresh={load}>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : reports.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">Aún no tienes reportes. Crea el primero con el botón de arriba.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((r) => (
            <Card key={r.id} className="border-border/60 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{r.waste_type}</h3>
                  <p className="text-xs text-muted-foreground">{r.category}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[r.status] || statusStyles.Pendiente}`}>{r.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {r.quantity} unidad(es)</span>
                <span className="flex items-center gap-1">Riesgo: {r.risk_level}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(r.created_date).toLocaleDateString("es-AR")}</span>
              </div>
              {r.description && <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>}
              {r.request_pickup && <p className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-600"><MapPin className="h-3.5 w-3.5" /> Retiro solicitado: {r.address}</p>}
              <div className="mt-4 flex items-center justify-between">
                <WhatsAppShare message={`Hola, registro mi residuo RAEE: ${r.waste_type} (${r.category}), cantidad: ${r.quantity}, estado: ${r.status}. Coordinemos la entrega.`} />
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      </PullToRefresh>
    </div>
  );
}