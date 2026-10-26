import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Newspaper, Loader2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PullToRefresh from "@/components/PullToRefresh";

const typeStyles = {
  Noticia: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Campaña: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Educativo: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const types = ["Todos", "Noticia", "Campaña", "Educativo"];

export default function News() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    return base44.entities.NewsCampaign.filter({ is_published: true }, "-created_date")
      .then((data) => setAll(data || []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "Todos" ? all : all.filter((n) => n.type === filter);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Newspaper className="h-6 w-6 text-emerald-500" /> Noticias y campañas
        </h1>
        <p className="mt-1 text-muted-foreground">
          Mantente al día con iniciativas de reciclaje electrónico, campañas y contenido educativo.
        </p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex w-full flex-wrap gap-1">
          {types.map((t) => (
            <TabsTrigger key={t} value={t} className="flex-1">{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <PullToRefresh onRefresh={load}>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/60 p-12 text-center">
          <Newspaper className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">No hay publicaciones en esta categoría.</p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <Card
              key={n.id}
              className="group flex cursor-pointer flex-col overflow-hidden border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => setSelected(n)}
            >
              {n.image_url ? (
                <Image src={n.image_url} alt={n.title} className="h-40 w-full" fittingType="fill" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-950/40 dark:to-sky-950/40">
                  <Newspaper className="h-10 w-10 text-emerald-500/60" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <span className={`inline-block self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeStyles[n.type] || typeStyles.Noticia}`}>
                  {n.type}
                </span>
                <h3 className="mt-2 font-semibold text-foreground">{n.title}</h3>
                <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted-foreground">{n.body}</p>
                {n.municipality && (
                  <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {n.municipality}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      </PullToRefresh>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 pr-6">
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeStyles[selected.type] || typeStyles.Noticia}`}>
                    {selected.type}
                  </span>
                  <span className="text-left">{selected.title}</span>
                </DialogTitle>
              </DialogHeader>
              {selected.image_url && (
                <Image src={selected.image_url} alt={selected.title} className="h-48 w-full rounded-lg" fittingType="fill" />
              )}
              {selected.municipality && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {selected.municipality}
                </p>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{selected.body}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}