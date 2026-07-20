// scripts/plan/inventar.ts
// Kanonische ID-Liste der etikettierbaren Einheiten (Geltungsbereich, FAHRPLAN-PLAN-STEUERUNG.md).
export const INVENTAR: readonly string[] = [
  'S0',
  'W1·1', 'W1·2', 'W1·3', 'W1·4',
  'W2·5', 'W2·5b', 'W2·5c', 'W2·5d', 'W2·6', 'W2·7', 'W2·8', 'W2·9',
  'W3·10', 'W3·11', 'W3·12', 'W3·13', 'W3·14',
  'LERNPHASE-AB', 'QS-GP', 'QS-PH', 'SEO-A11Y', 'QS-PERF', 'QS-DATA', 'QS-CURRENCY', 'QS-TOK',
  'W2·6-B', 'W2·6-DATA', 'W2·6a-MAT', 'W2·7-VZUI', 'W2·10-UI-NAV', 'W2·11-DESIGN',
  'W3·14-Responsive-Audit', 'W3·14-Responsive-Defekte', 'W3·14-S', 'W3·14-a11y', 'QS-WISSEN',
  'W2·12-HYGIENE', 'QS-OPT', 'QS-BASIS',

  'W2·12-HYGIENE', 'W2·13-KANTONE',

  // Ideen-Intake 20.7.2026 (§14): 8 Alleinstellungs-Ideen verortet.
  'W1·5-PRAXIS', 'W2·5g-ZEIT', 'W2·5h-GESETZ-UI', 'W2·6-ZNETZ', 'W2·14-SIGNAL', 'W3·15-RICHTER', 'QS-UI',

  // §14-Intake 20.7.2026 (2. Welle, Befunde des Tages). Label-Vergabe bewusst geprüft:
  // W2·5e/5f sind VERBRANNT (am 20.7. doppelt vergeben, danach auf 5g/5h umbenannt) —
  // die Reihe wird darum bei 5i fortgesetzt, nicht mit den freigewordenen Buchstaben.
  'W2·5i-HIST-ANSICHT', 'W2·5j-TABELLEN', 'W2·6-FILTER', 'W2·6-RNAME',
  'W2·15-CLS', 'W2·16-INVENTAR', 'W2·16-ANLEITUNG', 'QS-AUTOMATIK',
];
