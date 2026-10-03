// Écran de réglages affiché dans l'app Zepp du téléphone.
const BLACK = "#333333";
const GREY = "#757575";

function field(title, hint, input) {
  return View({ style: { marginBottom: "18px" } }, [
    Text({ bold: true, paragraph: true, style: { color: BLACK, fontSize: "15px" } }, title),
    Text({ paragraph: true, style: { color: GREY, fontSize: "12px", marginBottom: "6px" } }, hint),
    View(
      {
        style: {
          border: "1px solid #E0E0E0",
          borderRadius: "8px",
          padding: "6px 10px",
          background: "#FFFFFF",
        },
      },
      [input]
    ),
  ]);
}

AppSettingsPage({
  build(props) {
    const storage = props.settingsStorage;
    const url = storage.getItem("kpiUrl") || "";
    const token = storage.getItem("apiToken") || "";

    return View({ style: { padding: "16px 20px", background: "#FFFFFF" } }, [
      View(
        {
          style: {
            background: "#FFD700",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "20px",
          },
        },
        [
          Text({ bold: true, paragraph: true, style: { color: BLACK, fontSize: "18px" } }, "KPI Digital 84"),
          Text({ paragraph: true, style: { color: BLACK, fontSize: "12px" } }, "Dashboard sur Amazfit Bip Max"),
        ]
      ),
      field(
        "URL des KPI (JSON)",
        "Laissez vide pour le mode démo.",
        TextInput({
          label: "",
          placeholder: "https://…/kpi.json",
          value: url,
          subStyle: { color: BLACK, fontSize: "14px" },
          maxLength: 500,
          onChange: (val) => storage.setItem("kpiUrl", (val || "").trim()),
        })
      ),
      field(
        "Jeton d'API (optionnel)",
        "Envoyé en en-tête « Authorization: Bearer … ».",
        TextInput({
          label: "",
          placeholder: "Aucun",
          value: token,
          subStyle: { color: BLACK, fontSize: "14px" },
          maxLength: 300,
          onChange: (val) => storage.setItem("apiToken", (val || "").trim()),
        })
      ),
      Text(
        { paragraph: true, style: { color: GREY, fontSize: "12px", marginTop: "8px" } },
        'Format attendu : { "title": "…", "kpis": [ { "label": "CA", "value": 48250, "unit": "€", "target": 60000, "trend": 12 } ] }'
      ),
    ]);
  },
});
