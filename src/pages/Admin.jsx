import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { LayoutDashboard, MapPin, Users, FileText, TrendingUp, Plus, Trash2, Loader2, Building2, Newspaper, Save, UserX, Package, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const categories = ["Pequeño Hogar", "Grande Hogar", "IT/Telecom", "Iluminación", "Herramientas", "Juguetes", "Médico", "Otros"];
const statuses = ["Pendiente", "En revisión", "Asignado", "Recolectado", "Reciclado"];

export default function Admin() {
  const [stats, setStats] = useState({ reports: 0, points: 0, sponsors: 0, news: 0, deletions: 0, byCategory: {}, byRisk: {}, inventory: {} });
  const [points, setPoints] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [news, setNews] = useState([]);
  const [reports, setReports] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pointOpen, setPointOpen] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const [pointForm, setPointForm] = useState({ name: "", address: "", lat: -27.4673, lng: -58.8355, municipality: "", province: "Corrientes", capacity: 1000, current_load: 0, hours: "L-V 8-18h", phone: "", accepted_categories: [] });
  const [sponsorForm, setSponsorForm] = useState({ name: "", logo_url: "", website: "", municipality: "", description: "" });
  const [newsForm, setNewsForm] = useState({ title: "", body: "", type: "Noticia", image_url: "", municipality: "" });
  const { toast } = useToast();

  const loadAll = async () => {
    setLoading(true);
    try {
      const [r, p, s, n, d] = await Promise.all([
        base44.entities.RAEEReport.list().catch(() => []),
        base44.entities.CleanPoint.list().catch(() => []),
        base44.entities.Sponsor.list().catch(() => []),
        base44.entities.NewsCampaign.list().catch(() => []),
        base44.entities.UserDeletionRequest.list().catch(() => []),
      ]);
      const byCategory = {};
      const byRisk = {};
      const inventory = {};
      (r || []).forEach((rep) => {
        byCategory[rep.category] = (byCategory[rep.category] || 0) + 1;
        byRisk[rep.risk_level] = (byRisk[rep.risk_level] || 0) + 1;
        inventory[rep.status] = (inventory[rep.status] || 0) + (rep.quantity || 1);
      });
      setStats({ reports: (r || []).length, points: (p || []).length, sponsors: (s || []).length, news: (n || []).length, deletions: (d || []).filter((x) => x.status === "Pendiente").length, byCategory, byRisk, inventory });
      setPoints(p || []);
      setSponsors(s || []);
      setNews(n || []);
      setReports(r || []);
      setDeletionRequests(d || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const toggleCat = (cat) => {
    setPointForm((f) => {
      const arr = f.accepted_categories.includes(cat) ? f.accepted_categories.filter((c) => c !== cat) : [...f.accepted_categories, cat];
      return { ...f, accepted_categories: arr };
    });
  };

  const createPoint = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.CleanPoint.create(pointForm);
      toast({ title: "Punto limpio creado" });
      setPointOpen(false);
      setPointForm({ name: "", address: "", lat: -27.4673, lng: -58.8355, municipality: "", province: "Corrientes", capacity: 1000, current_load: 0, hours: "L-V 8-18h", phone: "", accepted_categories: [] });
      loadAll();
    } catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const deletePoint = async (id) => {
    const previous = points;
    setPoints((list) => list.filter((p) => p.id !== id));
    try { await base44.entities.CleanPoint.delete(id); toast({ title: "Punto eliminado" }); }
    catch (err) { setPoints(previous); toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const createSponsor = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Sponsor.create(sponsorForm);
      toast({ title: "Patrocinador creado" });
      setSponsorOpen(false);
      setSponsorForm({ name: "", logo_url: "", website: "", municipality: "", description: "" });
      loadAll();
    } catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const deleteSponsor = async (id) => {
    const previous = sponsors;
    setSponsors((list) => list.filter((s) => s.id !== id));
    try { await base44.entities.Sponsor.delete(id); toast({ title: "Patrocinador eliminado" }); }
    catch (err) { setSponsors(previous); toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const createNews = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.NewsCampaign.create(newsForm);
      toast({ title: "Noticia creada" });
      setNewsOpen(false);
      setNewsForm({ title: "", body: "", type: "Noticia", image_url: "", municipality: "" });
      loadAll();
    } catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const deleteNews = async (id) => {
    const previous = news;
    setNews((list) => list.filter((n) => n.id !== id));
    try { await base44.entities.NewsCampaign.delete(id); toast({ title: "Noticia eliminada" }); }
    catch (err) { setNews(previous); toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const processDeletion = async (id, newStatus) => {
    try { await base44.entities.UserDeletionRequest.update(id, { status: newStatus }); toast({ title: `Solicitud ${newStatus === "Procesado" ? "procesada" : "rechazada"}` }); loadAll(); }
    catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const statCards = [
    { label: "Reportes totales", value: stats.reports, icon: FileText, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { label: "Puntos limpios", value: stats.points, icon: MapPin, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/30" },
    { label: "Patrocinadores", value: stats.sponsors, icon: Building2, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
    { label: "Bajas pendientes", value: stats.deletions, icon: UserX, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <LayoutDashboard className="h-6 w-6 text-emerald-500" /> Panel Administrativo
        </h1>
        <p className="mt-1 text-muted-foreground">Gestión de puntos limpios, inventario, solicitudes de baja, patrocinadores y métricas.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border/60 p-5">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="points">
        <TabsList className="flex w-full justify-start gap-1 overflow-x-auto">
          <TabsTrigger value="points">Puntos</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="deletions">Bajas</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          <TabsTrigger value="news">Noticias</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        {/* Points */}
        <TabsContent value="points" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={pointOpen} onOpenChange={setPointOpen}>
              <DialogTrigger asChild><Button className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white"><Plus className="mr-2 h-4 w-4" /> Nuevo punto</Button></DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
                <DialogHeader><DialogTitle>Crear punto limpio</DialogTitle></DialogHeader>
                <form onSubmit={createPoint} className="space-y-3">
                  <div><Label className="mb-1.5 block">Nombre *</Label><Input value={pointForm.name} onChange={(e) => setPointForm({ ...pointForm, name: e.target.value })} required /></div>
                  <div><Label className="mb-1.5 block">Dirección *</Label><Input value={pointForm.address} onChange={(e) => setPointForm({ ...pointForm, address: e.target.value })} required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="mb-1.5 block">Latitud</Label><Input type="number" step="any" value={pointForm.lat} onChange={(e) => setPointForm({ ...pointForm, lat: parseFloat(e.target.value) })} /></div>
                    <div><Label className="mb-1.5 block">Longitud</Label><Input type="number" step="any" value={pointForm.lng} onChange={(e) => setPointForm({ ...pointForm, lng: parseFloat(e.target.value) })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="mb-1.5 block">Municipio *</Label><Input value={pointForm.municipality} onChange={(e) => setPointForm({ ...pointForm, municipality: e.target.value })} required /></div>
                    <div><Label className="mb-1.5 block">Provincia</Label><Input value={pointForm.province} onChange={(e) => setPointForm({ ...pointForm, province: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="mb-1.5 block">Capacidad (kg)</Label><Input type="number" value={pointForm.capacity} onChange={(e) => setPointForm({ ...pointForm, capacity: parseInt(e.target.value) || 0 })} /></div>
                    <div><Label className="mb-1.5 block">Carga actual (kg)</Label><Input type="number" value={pointForm.current_load} onChange={(e) => setPointForm({ ...pointForm, current_load: parseInt(e.target.value) || 0 })} /></div>
                  </div>
                  <div><Label className="mb-1.5 block">Horarios</Label><Input value={pointForm.hours} onChange={(e) => setPointForm({ ...pointForm, hours: e.target.value })} /></div>
                  <div><Label className="mb-1.5 block">Teléfono</Label><Input value={pointForm.phone} onChange={(e) => setPointForm({ ...pointForm, phone: e.target.value })} /></div>
                  <div>
                    <Label className="mb-1.5 block">Categorías aceptadas</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <button type="button" key={c} onClick={() => toggleCat(c)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${pointForm.accepted_categories.includes(c) ? "bg-emerald-500 text-white" : "bg-accent text-muted-foreground"}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white"><Save className="mr-2 h-4 w-4" /> Guardar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {points.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">No hay puntos limpios registrados.</Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {points.map((p) => (
                <Card key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.address}, {p.municipility}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.current_load || 0}/{p.capacity || 0} kg</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => deletePoint(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground"><Package className="h-5 w-5 text-emerald-500" /> Inventario de residuos por estado</h3>
            {Object.keys(stats.inventory).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin residuos registrados.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {statuses.map((st) => {
                  const qty = stats.inventory[st] || 0;
                  const max = Math.max(...Object.values(stats.inventory));
                  return (
                    <div key={st} className="rounded-xl border border-border/60 bg-accent/30 p-4">
                      <p className="text-sm font-medium text-muted-foreground">{st}</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{qty}</p>
                      <p className="text-xs text-muted-foreground">unidades</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500" style={{ width: max ? (qty / max * 100) + "%" : "0%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground"><FileText className="h-5 w-5 text-amber-500" /> Residuos por categoría</h3>
            {Object.keys(stats.byCategory).length === 0 ? <p className="text-sm text-muted-foreground">Sin datos.</p> : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byCategory).map(([cat, count]) => (
                  <span key={cat} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{cat}: {count}</span>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Deletion requests */}
        <TabsContent value="deletions" className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground"><UserX className="h-5 w-5 text-red-500" /> Solicitudes de baja de usuario</h3>
            <p className="mb-4 text-xs text-muted-foreground">Cumple con Ley 25.326 y políticas de Play Store / App Store.</p>
            {deletionRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay solicitudes de baja.</p>
            ) : (
              <div className="space-y-3">
                {deletionRequests.map((d) => (
                  <div key={d.id} className="flex flex-col gap-2 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{d.user_name || d.user_email || "Usuario"}</p>
                      <p className="text-xs text-muted-foreground">{d.user_email}</p>
                      {d.reason && <p className="mt-1 text-xs text-muted-foreground">Motivo: {d.reason}</p>}
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${d.status === "Pendiente" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : d.status === "Procesado" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>{d.status}</span>
                    </div>
                    {d.status === "Pendiente" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => processDeletion(d.id, "Procesado")}><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Procesar</Button>
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => processDeletion(d.id, "Rechazado")}><XCircle className="mr-1 h-3.5 w-3.5" /> Rechazar</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Sponsors */}
        <TabsContent value="sponsors" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={sponsorOpen} onOpenChange={setSponsorOpen}>
              <DialogTrigger asChild><Button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"><Plus className="mr-2 h-4 w-4" /> Nuevo patrocinador</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Crear patrocinador</DialogTitle></DialogHeader>
                <form onSubmit={createSponsor} className="space-y-3">
                  <div><Label className="mb-1.5 block">Nombre *</Label><Input value={sponsorForm.name} onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })} required /></div>
                  <div><Label className="mb-1.5 block">Logo (URL)</Label><Input value={sponsorForm.logo_url} onChange={(e) => setSponsorForm({ ...sponsorForm, logo_url: e.target.value })} placeholder="https://..." /></div>
                  <div><Label className="mb-1.5 block">Sitio web</Label><Input value={sponsorForm.website} onChange={(e) => setSponsorForm({ ...sponsorForm, website: e.target.value })} /></div>
                  <div><Label className="mb-1.5 block">Municipio</Label><Input value={sponsorForm.municipality} onChange={(e) => setSponsorForm({ ...sponsorForm, municipality: e.target.value })} /></div>
                  <div><Label className="mb-1.5 block">Descripción</Label><Textarea value={sponsorForm.description} onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })} rows={2} /></div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"><Save className="mr-2 h-4 w-4" /> Guardar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {sponsors.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">No hay patrocinadores registrados.</Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {sponsors.map((s) => (
                <Card key={s.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {s.logo_url ? <img src={s.logo_url} alt={s.name} className="h-10 w-10 rounded-lg object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent"><Building2 className="h-5 w-5 text-muted-foreground" /></div>}
                    <div><h3 className="font-semibold text-foreground">{s.name}</h3><p className="text-xs text-muted-foreground">{s.municipality || "—"}</p></div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => deleteSponsor(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* News */}
        <TabsContent value="news" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={newsOpen} onOpenChange={setNewsOpen}>
              <DialogTrigger asChild><Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"><Plus className="mr-2 h-4 w-4" /> Nueva noticia</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Crear noticia / campaña</DialogTitle></DialogHeader>
                <form onSubmit={createNews} className="space-y-3">
                  <div><Label className="mb-1.5 block">Título *</Label><Input value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} required /></div>
                  <div><Label className="mb-1.5 block">Tipo</Label>
                    <Select value={newsForm.type} onValueChange={(value) => setNewsForm({ ...newsForm, type: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Noticia">Noticia</SelectItem>
                        <SelectItem value="Campaña">Campaña</SelectItem>
                        <SelectItem value="Educativo">Educativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="mb-1.5 block">Imagen (URL)</Label><Input value={newsForm.image_url} onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })} /></div>
                  <div><Label className="mb-1.5 block">Municipio</Label><Input value={newsForm.municipality} onChange={(e) => setNewsForm({ ...newsForm, municipality: e.target.value })} /></div>
                  <div><Label className="mb-1.5 block">Contenido *</Label><Textarea value={newsForm.body} onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })} rows={4} required /></div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"><Save className="mr-2 h-4 w-4" /> Publicar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {news.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">No hay noticias publicadas.</Card>
          ) : (
            <div className="space-y-3">
              {news.map((n) => (
                <Card key={n.id} className="flex items-center justify-between p-4">
                  <div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{n.type}</span>
                    <h3 className="mt-1 font-semibold text-foreground">{n.title}</h3>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{n.body}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => deleteNews(n.id)}><Trash2 className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Metrics */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground"><TrendingUp className="h-5 w-5 text-emerald-500" /> Reportes por categoría</h3>
              {Object.keys(stats.byCategory).length === 0 ? <p className="text-sm text-muted-foreground">Sin datos.</p> : (
                <div className="space-y-2">
                  {Object.entries(stats.byCategory).map(([cat, count]) => {
                    const max = Math.max(...Object.values(stats.byCategory));
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">{cat}</span><span className="font-medium text-foreground">{count}</span></div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500" style={{ width: (count / max * 100) + "%" }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
            <Card className="p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground"><TrendingUp className="h-5 w-5 text-amber-500" /> Reportes por nivel de riesgo</h3>
              {Object.keys(stats.byRisk).length === 0 ? <p className="text-sm text-muted-foreground">Sin datos.</p> : (
                <div className="space-y-2">
                  {["Bajo", "Medio", "Alto", "Crítico"].filter((r) => stats.byRisk[r]).map((r) => {
                    const colors = { Bajo: "bg-emerald-500", Medio: "bg-amber-500", Alto: "bg-orange-500", Crítico: "bg-red-500" };
                    const max = Math.max(...Object.values(stats.byRisk));
                    return (
                      <div key={r}>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">{r}</span><span className="font-medium text-foreground">{stats.byRisk[r]}</span></div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${colors[r]}`} style={{ width: (stats.byRisk[r] / max * 100) + "%" }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}