import { BaseSideService, settingsLib } from "@zeppos/zml/base-side";
import { DEMO_DASHBOARD, normalizeDashboard } from "../utils/kpi";

function nowLabel() {
  const d = new Date();
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
}

async function getDashboard() {
  const url = (settingsLib.getItem("kpiUrl") || "").trim();
  if (!url) {
    return { ...normalizeDashboard(DEMO_DASHBOARD), demo: true };
  }

  const headers = { Accept: "application/json" };
  const token = (settingsLib.getItem("apiToken") || "").trim();
  if (token) headers.Authorization = "Bearer " + token;

  const response = await fetch({ url, method: "GET", headers });
  if (response.status && response.status >= 400) {
    throw new Error("HTTP " + response.status);
  }
  const body =
    typeof response.body === "string" ? JSON.parse(response.body) : response.body;

  const dashboard = normalizeDashboard(body);
  if (!dashboard.updatedAt) dashboard.updatedAt = "Mis à jour " + nowLabel();
  return dashboard;
}

AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res) {
      if (req.method !== "GET_KPIS") return;
      getDashboard()
        .then((result) => res(null, { result }))
        .catch((e) => {
          console.log("KPI fetch error", e);
          res(null, { error: String((e && e.message) || e).slice(0, 60) });
        });
    },

    onSettingsChange() {
      // Pousse les nouvelles données vers la montre si la page est ouverte
      getDashboard()
        .then((result) => this.call({ result }))
        .catch(() => {});
    },

    onRun() {},
    onDestroy() {},
  })
);
