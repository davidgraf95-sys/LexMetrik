import type { Page } from '@playwright/test';

// ── D35-F3 (Entscheid David 7.9.2026) · DER VOLLE APPARAT FÜR EXTRAKTIONS-SONDEN
//
// Seit dem Entscheid trägt der Leser EINE dreiwertige Wahl «Änderungen anzeigen
// als: Fassung | Fussnoten | aus» (`v3/LeserAenderungsWahl.tsx`), und ihre
// VORGABE ist «Fassung» — dort sind die als `kl:'A'` klassifizierten
// Änderungs-Fussnoten samt ihren Markern gedämpft. Beim Bundesrecht ist `A` die
// Regel, nicht die Ausnahme (gemessen ZGB 719 von 809, StPO 187 von 283).
//
// EINE REIHE VON SONDEN PRÜFT ABER NICHT DIE ANSICHT, SONDERN DIE EXTRAKTION:
// «sitzt Fussnote 57 wirklich IM Rendite-Item des Formelbild-Blocks?» ist eine
// Frage an den Generator, nicht an ein Menü. Sie brauchen darum den vollständigen
// Apparat, und zwar unabhängig davon, welche Stellung gerade Vorgabe ist. Ihn
// über das MENÜ einzustellen hiesse, jede dieser Sonden an die Bedienung zu
// koppeln, die sie gar nicht prüft (und drei Klicks pro Fall zu bezahlen).
//
// EINE STELLE, nicht n Kopien (§5): ändert sich der Speicher-Schlüssel oder das
// Vokabular der Wahl, wird genau diese Datei nachgezogen — dieselbe Begründung
// wie bei `helpers/leserBeschriftung.ts`.
//
// VOR `page.goto(...)` aufrufen: `wendeLeserOptionenAn()` liest den Speicher vor
// dem ersten Paint (main.tsx), ein späteres Setzen käme zu spät.
export async function vollerApparat(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('lm.leser.optionen', JSON.stringify({
        vermerke: 'fussnoten', leitfaelle: 'an',
      }));
    } catch { /* privater Modus — dann gilt die Vorgabe, und die Sonde meldet es */ }
  });
}
