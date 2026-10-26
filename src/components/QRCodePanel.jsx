import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function QRCodePanel({ url, fileName = "qr" }) {
  const canvasRef = useRef(null);
  const { toast } = useToast();

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast({ title: "QR descargado", description: "Listo para imprimir y pegar en el punto limpio." });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={canvasRef} className="rounded-2xl border-2 border-emerald-100 bg-white p-4 dark:border-emerald-900/40">
        <QRCodeCanvas value={url} size={220} level="M" marginSize={2} fgColor="#0f5132" bgColor="#ffffff" />
      </div>
      <p className="break-all text-center text-[11px] leading-relaxed text-muted-foreground">{url}</p>
      <Button onClick={handleDownload} className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white">
        <Download className="mr-2 h-4 w-4" /> Descargar QR (PNG)
      </Button>
    </div>
  );
}