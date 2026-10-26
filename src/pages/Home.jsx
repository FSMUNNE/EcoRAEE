import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Camera, MapPin, FileText, ArrowRight, Leaf, AlertTriangle, TrendingUp, Recycle, Newspaper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PullToRefresh from "@/components/PullToRefresh";

export default function Home() {
  const [stats, setStats] = useState({ reports: 0, points: 0 });
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    return Promise.all([
      base44.entities.RAEEReport.list().catch(() => []),
      base44.entities.CleanPoint.list().catch(() => []),
      base44.entities.NewsCampaign.filter({ is_published: true }, "-created_date", 3).catch(() => []),
    ]).then(([reports, points, n]) => {
      setStats({ reports: reports.length, points: points.length });
      setNews(n || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const quickActions = [
    { title: "Clasificar con IA", desc: "Identifica tu residuo por foto o descripción", icon: Camera, path: "/asistente", color: "from-emerald-500 to-teal-500" },
    { title: "Puntos Limpios", desc: "Encuentra el más cercano en el mapa", icon: MapPin, path: "/puntos", color: "from-sky-500 to-blue-500" },
    { title: "Reportar RAEE", desc: "Registra un residuo para recolección", icon: FileText, path: "/reportes", color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-sky-600 p-8 text-white shadow-xl shadow-emerald-500/20 lg:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-sky-300/20 blur-2xl" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Leaf className="h-3.5 w-3.5" /> Economía circular
          </div>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
            Recicla tus aparatos electrónicos de forma responsable
          </h1>
          <p className="mt-3 max-w-xl text-emerald-50/90 lg:text-lg">
            Clasifica tu RAEE con inteligencia artificial, encuentra el punto limpio más cercano y contribuye a un ambiente más limpio.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/asistente">
              <Button className="bg-white text-emerald-700 hover:bg-emerald-50">
                <Camera className="mr-2 h-4 w-4" /> Empezar a clasificar
              </Button>
            </Link>
            <Link to="/puntos">
              <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                <MapPin className="mr-2 h-4 w-4" /> Ver puntos limpios
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Reportes ciudadanos", value: stats.reports, icon: FileText, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
          { label: "Puntos limpios", value: stats.points, icon: MapPin, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/30" },
          { label: "Categorías RAEE", value: 8, icon: Recycle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Recuperado (kg)", value: "—", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border/60 p-5">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{loading ? "…" : s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Acciones rápidas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.path} to={a.path}>
                <Card className="group h-full cursor-pointer border-border/60 p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${a.color} shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-foreground">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Ir <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* News */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-foreground">Noticias y campañas</h2>
          </div>
          <Link to="/noticias" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <PullToRefresh onRefresh={load}>
        {news.length === 0 ? (
          <Card className="border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No hay noticias publicadas todavía.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {news.map((n) => (
              <Card key={n.id} className="overflow-hidden border-border/60">
                {n.image_url && <img src={n.image_url} alt={n.title} className="h-32 w-full object-cover" />}
                <div className="p-5">
                  <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {n.type}
                  </span>
                  <h3 className="mt-2 font-semibold text-foreground">{n.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
        </PullToRefresh>
      </div>

      {/* Safety banner */}
      <Card className="flex flex-col items-start gap-4 border-amber-200/60 bg-amber-50/50 p-6 dark:border-amber-900/40 dark:bg-amber-950/20 md:flex-row md:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">¿Sabías que las baterías de litio pueden incendiarse?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Nunca aplastes ni desarmes baterías o dispositivos con baterías internas. Usa el asistente IA para identificar riesgos antes de manipular.
          </p>
        </div>
        <Link to="/asistente">
          <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300">
            Verificar riesgo
          </Button>
        </Link>
      </Card>
    </div>
  );
}