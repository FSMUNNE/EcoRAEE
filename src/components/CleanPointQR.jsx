import React from "react";
import { QrCode, MapPin, Recycle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCodePanel from "@/components/QRCodePanel";
import { reportScanUrl } from "@/lib/appUrl";

export default function CleanPointQR({ point, children }) {
  const scanUrl = reportScanUrl(point);
  const fileSlug = (point.name || "punto").replace(/\s+/g, "-").toLowerCase();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <QrCode className="mr-2 h-4 w-4" /> Ver QR
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-500" /> Código QR del punto
          </DialogTitle>
          <DialogDescription>
            Imprime este código y colócalo en el punto limpio. Los ciudadanos lo escanean con el celular para registrar su disposición automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <QRCodePanel url={scanUrl} fileName={`qr-punto-${fileSlug}`} />

          <div className="w-full rounded-xl bg-accent/50 p-3 text-left">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Recycle className="h-4 w-4 text-emerald-500" /> {point.name}
            </p>
            <p className="mt-0.5 flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {point.address}, {point.municipality}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}