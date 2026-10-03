/**
 * Publie un onglet Google Sheets comme flux JSON pour la montre.
 *
 * 1. Créez un onglet "KPI" avec en ligne 1 : label | value | unit | target | trend
 * 2. Extensions > Apps Script, collez ce code.
 * 3. Déployer > Nouveau déploiement > Application Web
 *    (Exécuter en tant que : moi · Accès : toute personne disposant du lien).
 * 4. Copiez l'URL /exec dans les réglages de l'app (app Zepp > Profil > Bip Max > Apps).
 */
function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("KPI");
  const [header, ...rows] = sheet.getDataRange().getValues();
  const kpis = rows
    .filter((r) => r[0] !== "")
    .map((r) => {
      const kpi = {};
      header.forEach((key, i) => {
        if (r[i] !== "") kpi[key] = r[i];
      });
      return kpi;
    });

  const payload = {
    title: "Digital 84",
    updatedAt: Utilities.formatDate(new Date(), "Europe/Paris", "dd/MM · HH:mm"),
    kpis: kpis,
  };
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
