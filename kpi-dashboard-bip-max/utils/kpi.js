// Normalisation des KPI côté téléphone : on envoie à la montre un JSON compact et déjà formaté.

export const MAX_KPIS = 8;

export const DEMO_DASHBOARD = {
  title: "Digital 84",
  updatedAt: "Démo",
  kpis: [
    { label: "CA du mois", value: 48250, unit: "€", target: 60000, trend: 12 },
    { label: "Leads", value: 184, target: 200, trend: 8 },
    { label: "Taux de conversion", value: 3.4, unit: "%", target: 4, trend: -0.3, trendUnit: " pts" },
    { label: "Visites site", value: 12430, target: 15000, trend: 21 },
    { label: "Tickets ouverts", value: 7, trend: -2, trendUnit: "" },
  ],
};

function groupThousands(intPart) {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatNumber(n) {
  if (typeof n !== "number" || !isFinite(n)) return String(n);
  const abs = Math.abs(n);
  const decimals = abs !== 0 && abs < 100 && !Number.isInteger(n) ? 1 : 0;
  const [intPart, decPart] = abs.toFixed(decimals).split(".");
  const sign = n < 0 ? "-" : "";
  return sign + groupThousands(intPart) + (decPart ? "," + decPart : "");
}

function withUnit(n, unit) {
  if (n === undefined || n === null || n === "") return "";
  const txt = typeof n === "number" ? formatNumber(n) : String(n);
  if (!unit) return txt;
  return unit === "%" ? txt + " %" : txt + " " + unit;
}

function toNumber(v) {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return NaN;
  return parseFloat(v.replace(/\s/g, "").replace(",", "."));
}

function formatTrend(trend, trendUnit) {
  if (trend === undefined || trend === null || trend === "") return "";
  if (typeof trend === "string") return trend.slice(0, 10);
  const sign = trend > 0 ? "+" : "";
  return sign + formatNumber(trend) + (trendUnit === undefined ? "%" : trendUnit);
}

function normalizeKpi(raw) {
  const label = String(raw.label || raw.name || "KPI").slice(0, 28);
  const value = withUnit(raw.value, raw.unit);
  const target = withUnit(raw.target, raw.unit);

  let progress = toNumber(raw.progress);
  if (isNaN(progress)) {
    const v = toNumber(raw.value);
    const t = toNumber(raw.target);
    progress = !isNaN(v) && !isNaN(t) && t !== 0 ? v / t : NaN;
  } else if (progress > 1.5) {
    // Accepte aussi un pourcentage (ex : 80 au lieu de 0.8)
    progress = progress / 100;
  }

  const trendNum = toNumber(raw.trend);
  return {
    label,
    value: value.slice(0, 16),
    target: target.slice(0, 16),
    progress: isNaN(progress) ? -1 : Math.round(Math.max(0, Math.min(progress, 1)) * 1000) / 1000,
    progressPct: isNaN(progress) ? "" : Math.round(progress * 100) + " %",
    trend: formatTrend(raw.trend, raw.trendUnit),
    trendDir: isNaN(trendNum) ? 0 : Math.sign(trendNum),
  };
}

// Accepte { title, updatedAt, kpis: [...] } ou directement un tableau de KPI.
export function normalizeDashboard(data) {
  const src = Array.isArray(data) ? { kpis: data } : data || {};
  const kpis = Array.isArray(src.kpis) ? src.kpis : [];
  return {
    title: String(src.title || "Mes KPI").slice(0, 24),
    updatedAt: String(src.updatedAt || "").slice(0, 24),
    kpis: kpis.slice(0, MAX_KPIS).map(normalizeKpi),
  };
}
