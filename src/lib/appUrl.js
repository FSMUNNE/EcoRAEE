const PUBLISHED_APP_URL = "https://ecoraee.base44.app";

// URL pública donde el QR debe abrir la app al escanearse con un celular.
export const appPublicUrl = () => {
  const { protocol, hostname, origin } = window.location;
  const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(hostname) || hostname.endsWith(".local");
  if (protocol !== "https:" || isLocal) return PUBLISHED_APP_URL;
  return origin;
};

export const reportScanUrl = (point) =>
  `${appPublicUrl()}/reportes?cp=${point.id}&cpn=${encodeURIComponent(point.name || "")}`;