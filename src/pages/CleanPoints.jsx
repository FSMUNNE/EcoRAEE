import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Search, Navigation, Phone, Clock, Package, Loader2, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CleanPointQR from "@/components/CleanPointQR";
import PullToRefresh from "@/components/PullToRefresh";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "leaflet/dist/leaflet.css";

const categories = ["Pequeño Hogar", "Grande Hogar", "IT/Telecom", "Iluminación", "Herramientas", "Juguetes", "Médico", "Otros"];

function loadIcon(color) {
  return window.L.divIcon({
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);color:white;font-size:14px">♻</span></div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

export default function CleanPoints() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [center, setCenter] = useState([-34.6037, -58.3816]);

  const load = () => {
    setLoading(true);
    return base44.entities.CleanPoint.filter({ is_active: true }).then((data) => {
      setPoints(data || []);
      if (data && data.length > 0 && data[0].lat) {
        setCenter([data[0].lat, data[0].lng]);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return points.filter((p) => {
      const matchSearch = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.address?.toLowerCase().includes(search.toLowerCase()) ||
        p.municipality?.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCat || (p.accepted_categories || []).includes(filterCat);
      return matchSearch && matchCat;
    });
  }, [points, search, filterCat]);

  const loadPct = (p) => {
    if (!p.capacity || p.capacity === 0) return 0;
    return Math.min(100, Math.round(((p.current_load || 0) / p.capacity) * 100));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <MapPin className="h-6 w-6 text-sky-500" /> Puntos Limpios
        </h1>
        <p className="mt-1 text-muted-foreground">Encuentra el centro de acopio más cercano y verifica su capacidad.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* List */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o ciudad..."
                className="pl-9"
              />
            </div>
          </div>
          <Select value={filterCat || "all"} onValueChange={(value) => setFilterCat(value === "all" ? "" : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <PullToRefresh onRefresh={load}>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
              No se encontraron puntos limpios.
            </Card>
          ) : (
            <div className="scroll-container max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {filtered.map((p) => {
                const pct = loadPct(p);
                const color = pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500";
                return (
                  <Card key={p.id} className="cursor-pointer border-border/60 p-4 transition hover:shadow-md" onClick={() => p.lat && setCenter([p.lat, p.lng])}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${color}`}>{pct}%</span>
                    </div>
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {p.address}, {p.municipality}
                    </p>
                    {p.hours && <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {p.hours}</p>}
                    {p.phone && <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {p.phone}</p>}
                    <div className="mt-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full ${color}`} style={{ width: pct + "%" }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.current_load || 0} / {p.capacity || 0} kg</p>
                    </div>
                    {p.accepted_categories?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.accepted_categories.slice(0, 3).map((c) => (
                          <span key={c} className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">{c}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 border-t border-border/60 pt-3">
                      <CleanPointQR point={p}>
                        <Button variant="outline" size="sm" className="w-full">
                          <QrCode className="mr-2 h-4 w-4 text-emerald-600" /> Generar código QR
                        </Button>
                      </CleanPointQR>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          </PullToRefresh>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="relative z-0 isolate overflow-hidden border-border/60 p-0">
            <div className="h-[60vh] w-full">
              <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                {filtered.map((p) =>
                  p.lat && p.lng ? (
                    <Marker key={p.id} position={[p.lat, p.lng]} icon={loadIcon("#10b981")}>
                      <Popup>
                        <strong>{p.name}</strong><br />
                        {p.address}, {p.municipality}<br />
                        Capacidad: {p.current_load || 0}/{p.capacity || 0} kg
                      </Popup>
                    </Marker>
                  ) : null
                )}
              </MapContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}