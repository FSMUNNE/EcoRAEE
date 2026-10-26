import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Sparkles, AlertTriangle, ShieldCheck, MapPin, Loader2, Upload, RotateCcw, CheckCircle2, XCircle, Navigation, Gauge, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import WhatsAppShare from "@/components/WhatsAppShare";
import QRCodePanel from "@/components/QRCodePanel";
import { reportScanUrl } from "@/lib/appUrl";

const riskStyles = {
  Bajo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Medio: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Alto: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Crítico: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function AIAssistant() {
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [nearestPoint, setNearestPoint] = useState(null);
  const [locating, setLocating] = useState(false);
  const { toast } = useToast();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setImageUrl(file_url);
    } catch (err) {
      toast({ title: "Error al subir imagen", description: err.message, variant: "destructive" });
    }
  };

  const handleClassify = async () => {
    if (!description.trim() && !imageUrl) {
      toast({ title: "Agrega una descripción o foto", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    setNearestPoint(null);
    try {
      const res = await base44.functions.invoke("classifyRAEE", {
        description: description.trim(),
        image_url: imageUrl || undefined,
      });
      setResult(res.data.classification);
    } catch (err) {
      toast({ title: "Error en el análisis", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const findNearestPoint = useCallback(async () => {
    setLocating(true);
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      const points = await base44.entities.CleanPoint.filter({ is_active: true }).catch(() => []);
      if (!points || points.length === 0) {
        toast({ title: "No hay puntos limpios disponibles", variant: "destructive" });
        return;
      }
      const nearest = points
        .filter((p) => p.lat && p.lng)
        .map((p) => ({ ...p, distance: haversine(latitude, longitude, p.lat, p.lng) }))
        .sort((a, b) => a.distance - b.distance)[0];
      setNearestPoint(nearest || points[0]);
    } catch (err) {
      toast({ title: "No se pudo obtener tu ubicación", description: "Habilita el GPS para usar esta función", variant: "destructive" });
    } finally {
      setLocating(false);
    }
  }, [toast]);

  const reset = () => {
    setDescription("");
    setImageFile(null);
    setImageUrl("");
    setResult(null);
    setNearestPoint(null);
  };

  const capacityPct = (p) => (p.capacity ? Math.min(100, Math.round((p.current_load / p.capacity) * 100)) : 0);
  const capacityColor = (pct) => (pct < 60 ? "bg-emerald-500" : pct < 90 ? "bg-amber-500" : "bg-red-500");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Sparkles className="h-6 w-6 text-emerald-500" /> EcoBot · Asistente IA de RAEE
        </h1>
        <p className="mt-1 text-muted-foreground">Clasifica tu residuo, detecta riesgos, guía de borrado de datos y punto limpio más cercano.</p>
      </div>

      <Card className="border-border/60 p-6">
        <div className="space-y-5">
          <div>
            <Label className="mb-2 block">Describe tu residuo electrónico</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Un celular Samsung viejo con la batería hinchada, modelo Galaxy S8..."
              rows={3}
            />
          </div>

          <div>
            <Label className="mb-2 block">O sube una foto (opcional)</Label>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-accent/30 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent/60">
                <Upload className="h-4 w-4" />
                {imageFile ? imageFile.name : "Seleccionar imagen"}
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
              {imageUrl && (
                <Image src={imageUrl} alt="Residuo cargado" className="h-14 w-14 shrink-0 rounded-lg border border-border" />
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleClassify} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando...</> : <><Camera className="mr-2 h-4 w-4" /> Clasificar residuo</>}
            </Button>
            {(result || description || imageUrl) && (
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="mr-2 h-4 w-4" /> Limpiar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header card */}
          <Card className="overflow-hidden border-border/60">
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{result.waste_type}</h2>
                  {result.can_recycle ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Categoría: {result.category}</p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${riskStyles[result.risk_level] || riskStyles.Medio}`}>
                  Riesgo {result.risk_level}
                </span>
                <span className="text-xs text-muted-foreground">
                  {result.can_recycle ? "Reciclable" : "No reciclable directamente"}
                </span>
              </div>
            </div>
            <div className="border-t border-border/60 bg-accent/30 px-6 py-4">
              <p className="text-sm text-foreground"><strong>Motivo del riesgo:</strong> {result.risk_reason}</p>
            </div>
          </Card>

          {/* Safety warnings */}
          {result.safety_warnings?.length > 0 && (
            <Card className="border-orange-200/60 p-6 dark:border-orange-900/40">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <AlertTriangle className="h-5 w-5 text-orange-500" /> Advertencias de seguridad
              </h3>
              <ul className="space-y-2">
                {result.safety_warnings.map((w, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" /> {w}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Data sanitization */}
          {result.data_sanitization?.length > 0 && (
            <Card className="border-sky-200/60 p-6 dark:border-sky-900/40">
              <h3 className="mb-1 flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="h-5 w-5 text-sky-500" /> Borrado de datos (Ley 25.326)
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">Protege tu información personal antes de desechar el dispositivo.</p>
              <ol className="space-y-2">
                {result.data_sanitization.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {/* Disposal + Nearest point */}
          <Card className="border-emerald-200/60 p-6 dark:border-emerald-900/40">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <MapPin className="h-5 w-5 text-emerald-500" /> Disposición final
            </h3>
            <p className="text-sm text-muted-foreground">{result.disposal_recommendation}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={findNearestPoint} disabled={locating} className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white">
                {locating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ubicando...</> : <><Navigation className="mr-2 h-4 w-4" /> Punto limpio más cercano</>}
              </Button>
              <WhatsAppShare
                message={`Hola EcoBot, clasifiqué un residuo RAEE: ${result.waste_type} (categoría ${result.category}, riesgo ${result.risk_level}). ¿Me ayudás con la disposición final?`}
                label="Consultar por WhatsApp"
                size="default"
              />
            </div>

            {nearestPoint && (
              <div className="mt-4 rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 font-semibold text-foreground">
                      <MapPin className="h-4 w-4 text-emerald-600" /> {nearestPoint.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{nearestPoint.address}, {nearestPoint.municipality}</p>
                    {nearestPoint.distance != null && (
                      <p className="mt-1 text-xs font-medium text-emerald-600">📍 A {nearestPoint.distance.toFixed(1)} km de tu ubicación</p>
                    )}
                    {nearestPoint.hours && <p className="mt-1 text-xs text-muted-foreground">🕒 {nearestPoint.hours}</p>}
                  </div>
                </div>
                {/* Capacity bar */}
                {nearestPoint.capacity && (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground"><Gauge className="h-3.5 w-3.5" /> Capacidad</span>
                      <span className="font-medium text-foreground">{nearestPoint.current_load || 0}/{nearestPoint.capacity} kg</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full ${capacityColor(capacityPct(nearestPoint))}`} style={{ width: capacityPct(nearestPoint) + "%" }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {capacityPct(nearestPoint) < 60 ? "Disponible" : capacityPct(nearestPoint) < 90 ? "Casi lleno" : "Próximo a saturación"}
                    </p>
                  </div>
                )}

                <div className="mt-4 border-t border-emerald-200/60 pt-4 dark:border-emerald-900/40">
                  <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <QrCode className="h-4 w-4 text-emerald-600" /> Presentá este QR en el punto limpio
                  </p>
                  <QRCodePanel url={reportScanUrl(nearestPoint)} fileName={`qr-punto-${nearestPoint.id}`} />
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}