import * as hmUI from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { LocalStorage } from "@zos/storage";
import { BasePage } from "@zeppos/zml/base-page";
import { COLOR } from "../utils/theme";

const { width: W } = getDeviceInfo();
const MARGIN = 20;
const CARD_W = W - 2 * MARGIN;
const CARD_GAP = 14;
const PAD = 20;
const CACHE_KEY = "dashboard";

const storage = new LocalStorage();
let widgets = [];

function add(type, props) {
  const w = hmUI.createWidget(type, props);
  widgets.push(w);
  return w;
}

function text(props) {
  return add(hmUI.widget.TEXT, {
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.ELLIPSIS,
    ...props,
  });
}

function clear() {
  widgets.forEach((w) => hmUI.deleteWidget(w));
  widgets = [];
}

function readCache() {
  try {
    const raw = storage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function drawHeader(y, dashboard, status) {
  text({
    x: MARGIN, y, w: CARD_W, h: 46,
    text: dashboard ? dashboard.title : "Mes KPI",
    text_size: 34,
    color: COLOR.YELLOW,
    align_h: hmUI.align.CENTER_H,
  });
  y += 46;

  let sub = status || (dashboard && dashboard.updatedAt) || "";
  if (!status && dashboard && dashboard.demo) {
    sub = "Démo · URL à régler dans Zepp";
  }
  text({
    x: MARGIN, y, w: CARD_W, h: 30,
    text: sub,
    text_size: 20,
    color: COLOR.GREY,
    align_h: hmUI.align.CENTER_H,
  });
  return y + 30 + 16;
}

function drawCard(y, kpi) {
  const hasTarget = kpi.progress >= 0;
  const h = hasTarget ? 160 : 118;
  const x = MARGIN;

  add(hmUI.widget.FILL_RECT, { x, y, w: CARD_W, h, radius: 22, color: COLOR.CARD });

  const badgeW = kpi.trend ? 112 : 0;
  text({
    x: x + PAD, y: y + 12, w: CARD_W - 2 * PAD - badgeW - 8, h: 32,
    text: kpi.label,
    text_size: 22,
    color: COLOR.GREY_LIGHT,
  });

  if (kpi.trend) {
    const bx = x + CARD_W - PAD - badgeW;
    add(hmUI.widget.FILL_RECT, {
      x: bx, y: y + 12, w: badgeW, h: 34, radius: 17, color: COLOR.BADGE,
    });
    // Contour jaune = tendance positive, gris = négative / stable
    add(hmUI.widget.STROKE_RECT, {
      x: bx, y: y + 12, w: badgeW, h: 34, radius: 17, line_width: 2,
      color: kpi.trendDir > 0 ? COLOR.YELLOW : COLOR.GREY,
    });
    text({
      x: bx, y: y + 12, w: badgeW, h: 34,
      text: kpi.trend,
      text_size: 20,
      color: COLOR.WHITE,
      align_h: hmUI.align.CENTER_H,
    });
  }

  text({
    x: x + PAD, y: y + 48, w: CARD_W - 2 * PAD, h: 58,
    text: kpi.value,
    text_size: 48,
    color: COLOR.WHITE,
  });

  if (hasTarget) {
    const barW = CARD_W - 2 * PAD;
    add(hmUI.widget.FILL_RECT, {
      x: x + PAD, y: y + 114, w: barW, h: 10, radius: 5, color: COLOR.TRACK,
    });
    const fillW = Math.round(barW * kpi.progress);
    if (fillW > 0) {
      add(hmUI.widget.FILL_RECT, {
        x: x + PAD, y: y + 114, w: Math.max(fillW, 10), h: 10, radius: 5,
        color: COLOR.YELLOW,
      });
    }
    text({
      x: x + PAD, y: y + 126, w: barW, h: 28,
      text: (kpi.target ? "Objectif " + kpi.target + " · " : "") + kpi.progressPct,
      text_size: 20,
      color: COLOR.GREY_LIGHT,
    });
  }
  return y + h + CARD_GAP;
}

Page(
  BasePage({
    state: { loading: false },

    build() {
      this.render(readCache(), "Chargement…");
      this.refresh();
    },

    onCall(data) {
      if (data && data.result) this.show(data.result);
    },

    refresh() {
      if (this.state.loading) return;
      this.state.loading = true;
      this.request({ method: "GET_KPIS" }, { timeout: 15000 })
        .then((data) => {
          this.state.loading = false;
          if (data && data.result) {
            this.show(data.result);
          } else {
            this.render(readCache(), "Erreur : " + ((data && data.error) || "inconnue"));
          }
        })
        .catch(() => {
          this.state.loading = false;
          this.render(readCache(), "Téléphone injoignable");
        });
    },

    show(dashboard) {
      try {
        storage.setItem(CACHE_KEY, JSON.stringify(dashboard));
      } catch (e) {}
      this.render(dashboard, "");
    },

    render(dashboard, status) {
      clear();
      let y = drawHeader(36, dashboard, status);

      const kpis = (dashboard && dashboard.kpis) || [];
      if (!kpis.length && !status) {
        text({
          x: MARGIN, y, w: CARD_W, h: 80,
          text: "Aucun KPI reçu",
          text_size: 26,
          color: COLOR.WHITE,
          align_h: hmUI.align.CENTER_H,
        });
        y += 90;
      }
      kpis.forEach((kpi) => {
        y = drawCard(y, kpi);
      });

      const btnW = 260;
      add(hmUI.widget.BUTTON, {
        x: (W - btnW) / 2, y: y + 6, w: btnW, h: 64, radius: 32,
        normal_color: COLOR.YELLOW,
        press_color: COLOR.YELLOW_PRESS,
        color: COLOR.BLACK,
        text_size: 26,
        text: "Actualiser",
        click_func: () => this.refresh(),
      });
      // Marge basse pour que le bouton ne soit pas rogné par les coins arrondis
      add(hmUI.widget.FILL_RECT, { x: 0, y: y + 70, w: W, h: 90, color: 0x000000 });
    },
  })
);
