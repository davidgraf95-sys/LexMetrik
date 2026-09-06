/**
 * W2·24-DESIGN-IDENTITAET — R9 «Einheitlichkeit», Fixer R9-1, Fund B-K1.
 *
 * BEFUND (r9-konsolidierung.md B-K1, 6.9.2026): «~220 rohe `<button>` app-weit
 * (grobe Zahl)». NACHGEZAEHLT mit dieser Sonde am gebauten Stand: 141 in 83
 * Dateien. Die Schaetzung war zu hoch — die genaue Zahl steht unten und wird
 * nicht nachgefuehrt, sondern gesenkt (§2b: die Schaetzung von damals bleibt
 * als Schaetzung richtig, ihr Gegenstand ist jetzt gemessen).
 *
 * WAS BEWACHT WIRD: ein `<button>` ohne Baustein-Klasse baut seine Optik
 * selbst — und genau daraus entstanden die Rezept-Familien, die R9 abraeumt
 * (§5/§10). Der Baustein ist eine dieser Marken am oeffnenden Tag:
 *   `lc-btn*` · `lc-chip*` · `fc-schalter` · `lc-tab*` · `ub-schalter` ·
 *   `lc-menu-zeile`/`-regler` · `role="tab"` (Reiter-Mechanik).
 *
 * DIE ALLOWLIST IST EINE RATSCHE, KEIN FREIBRIEF: sie haelt je Datei die
 * HOECHSTZAHL aus dem Ist-Stand. Ein neuer roher Knopf in einer gelisteten
 * Datei reisst die Zahl und faellt auf; wer aufraeumt, senkt sie. Eine Datei,
 * die gar nicht gelistet ist, darf keinen einzigen tragen.
 *
 * EINTRAEGE MIT 0 TREFFERN sind eine WARNUNG (`console.warn`), nicht rot:
 * eine geraeumte Datei soll den Bau des naechsten nicht blockieren — sie soll
 * auffallen, damit die Zeile hier verschwindet.
 *
 * GRUND JE GRUPPE (die Gruppen stehen als Kommentar in der Liste):
 *   · LESER — Sprung-, Klapp- und Gliederungs-Griffe des Gesetzeslesers.
 *     Eigene Bauhand in dieser Runde (Leser-Fixer, `.lr7-*`); die Knoepfe
 *     tragen dort die Leser-eigene Anatomie, nicht die App-Bausteine.
 *   · R9-2 — `pages/RechnerTagerechner.tsx` und die Entscheid-Leser-Knoepfe:
 *     ausdruecklich der Auftrag des parallelen Fixers R9-2 (Spec Ziff. 6).
 *     Die Zahlen hier sind der Stand VOR seiner Raeumung.
 *   · RAHMEN — Reiterleiste, Pane-Kopf, TabPanel, Sidebar, Kopfsuche: die
 *     Fenster-Mechanik der Arbeitsflaeche (R13 baut sie parallel um).
 *   · FORM — Formular-Mechanik: Datums-Stepper, Zeilen-Griffe («+ Zeile»,
 *     «entfernen»), Wizard-Navigation. Native, oft unsichtbare Controls.
 *   · UI — Bausteine, die SELBST ein Knopf sind (`SchliessKnopf`,
 *     `SchriftgroessenRegler`, `SelectionGrid`, `Leerzustand`-Aktion,
 *     `RubrikKachel`, `AdresseBundSuche`): sie definieren die Form, statt
 *     eine zu konsumieren.
 *   · REST — Einzelfaelle ueber die ganze App. Sie sind der eigentliche
 *     Abbau-Vorrat (Roadmap-Zeile, gruene Spur), NICHT diese Runde.
 *
 * Reine Darstellung (§3) — keine Rechtslogik berührt.
 */
import { describe, it, expect } from 'vitest';
import { alleTsx, liesRoh, ohneKommentare, rel } from './appDateien';

/** Eine dieser Marken am oeffnenden Tag macht den Knopf zum Baustein-Konsum. */
const BAUSTEIN = /\b(?:lc-btn|lc-chip|fc-schalter|lc-tab|ub-schalter|lc-menu-zeile|lc-menu-regler)\b|role=(?:"tab"|\{[^}]*['"]tab['"][^}]*\})/;

/**
 * Zaehlt die `<button>` einer Quelle, deren OEFFNENDES TAG keine Baustein-Marke
 * traegt. Das Tag endet beim ersten `>` ausserhalb geschweifter Klammern —
 * ein `>` in einem Ausdruck (`{a > b ? …}`) beendet es also nicht.
 */
export function roheKnoepfe(quelle: string): number {
  const q = ohneKommentare(quelle);
  let i = 0;
  let n = 0;
  while ((i = q.indexOf('<button', i)) !== -1) {
    let tiefe = 0;
    let ende = q.length;
    for (let j = i; j < q.length; j++) {
      const c = q[j];
      if (c === '{') tiefe++;
      else if (c === '}') tiefe--;
      else if (c === '>' && tiefe === 0) { ende = j; break; }
    }
    if (!BAUSTEIN.test(q.slice(i, ende))) n++;
    i = ende;
  }
  return n;
}

/** Ist-Stand 6.9.2026, gemessen mit `roheKnoepfe`. Zahlen sinken, nie steigen. */
const HOECHSTZAHL: Readonly<Record<string, number>> = {

  // LESER (20 Dateien, 34 Knoepfe)
  'pages/gesetz-leser/parts/ArtikelIndex.tsx': 1,
  'pages/gesetz-leser/parts/ArtikelLeser.tsx': 2,
  'pages/gesetz-leser/parts/ArtikelSprungFeld.tsx': 1,
  'pages/gesetz-leser/parts/BezuegeZeile.tsx': 1,
  'pages/gesetz-leser/parts/SektionBaumTOC.tsx': 2,
  'pages/gesetz-leser/parts/SektionKopf.tsx': 2,
  'pages/gesetz-leser/parts/TrefferListe.tsx': 4,
  'pages/gesetz-leser/v3/LeserAnsichtV3.tsx': 1,
  'pages/gesetz-leser/v3/LeserGliederungSchiene.tsx': 1,
  'pages/gesetz-leser/v3/LeserLeseZeile.tsx': 1,
  'pages/gesetz-leser/v3/LeserPanelOeffner.tsx': 1,
  'pages/gesetz-leser/v3/LeserRahmenV3.tsx': 1,
  'pages/gesetz-leser/v3/LeserSeitenleiste.tsx': 2,
  'pages/gesetz-leser/v3/LeserTrefferBlatt.tsx': 1,
  'pages/gesetz-leser/v3/LeserTrefferListe.tsx': 3,
  'pages/gesetz-leser/v3/PanelFilterZeile.tsx': 1,
  'pages/gesetz-leser/v3/SuchBereichWahl.tsx': 1,
  'pages/gesetz-leser/v3/SuchSprungFeld.tsx': 2,
  'pages/gesetz-leser/v3/SuchZone.tsx': 3,
  'pages/gesetz-leser/v3/TrefferLeiste.tsx': 3,

  // R9-2 (2 Dateien, 7 Knoepfe)
  'pages/EntscheidLeser.tsx': 2,
  'pages/RechnerTagerechner.tsx': 5,

  // RAHMEN (8 Dateien, 20 Knoepfe)
  'components/layout/HeaderSuche.tsx': 1,
  'components/layout/OrtsAngabe.tsx': 1,
  'components/layout/PaneKopf.tsx': 4,
  'components/layout/Reiterleiste.tsx': 4,
  'components/layout/Shell.tsx': 1,
  'components/layout/Sidebar.tsx': 3,
  'components/layout/TabPanel.tsx': 5,
  'components/layout/ThemaUmschalter.tsx': 1,

  // FORM (15 Dateien, 28 Knoepfe)
  'components/DatumsFeld.tsx': 7,
  'components/forms/BeurkundungForm.tsx': 1,
  'components/forms/ErbteilungForm.tsx': 1,
  'components/forms/GrundbuchEintragForm.tsx': 1,
  'components/forms/LohnfortzahlungForm.tsx': 1,
  'components/forms/MietrechtForm.tsx': 1,
  'components/forms/NotariatGrundbuchForm.tsx': 1,
  'components/forms/ProzesskostenForm.tsx': 4,
  'components/forms/ZpoFristenForm.tsx': 2,
  'components/vorlagen/ZefixSuche.tsx': 1,
  'components/vorlagen/ui.tsx': 3,
  'components/vorlagen/wizard.tsx': 1,
  'pages/VorlageAgGruendung.tsx': 2,
  'pages/VorlageSchlichtungsgesuchBs.tsx': 1,
  'pages/VorlageVorsorgeauftrag.tsx': 1,

  // UI (6 Dateien, 7 Knoepfe)
  'components/ui/AdresseBundSuche.tsx': 1,
  'components/ui/Leerzustand.tsx': 1,
  'components/ui/RubrikKachel.tsx': 1,
  'components/ui/SchliessKnopf.tsx': 1,
  'components/ui/SchriftgroessenRegler.tsx': 2,
  'components/ui/SelectionGrid.tsx': 1,

  // REST (32 Dateien, 45 Knoepfe)
  'components/EntwurfLegende.tsx': 1,
  'components/ErgebnisAnzeige.tsx': 3,
  'components/IcsExportButton.tsx': 1,
  'components/Katalog.tsx': 1,
  'components/NormPopover.tsx': 1,
  'components/SprachUmschalter.tsx': 1,
  'components/kontext/ArtikelKontextGruppe.tsx': 1,
  'components/kontext/KontextPanel.tsx': 1,
  'components/normtext/ArtikelBody.tsx': 1,
  'components/normtext/ArtikelBody.zitier.tsx': 1,
  'components/normtext/GesetzeGliederung.tsx': 1,
  'components/rechtsprechung/EntscheidVerzahnung.tsx': 3,
  'components/rechtsprechung/LesemodusOverlay.tsx': 2,
  'components/rechtsprechung/LiveSuche.tsx': 3,
  'components/rechtsprechung/SachgebietKacheln.tsx': 1,
  'components/start/PultAbschluss.tsx': 4,
  'components/start/PultModul.tsx': 1,
  'components/start/Zeiterfassung.tsx': 1,
  'components/suche/SuchResultate.tsx': 1,
  'components/verzahnung/Begriff.tsx': 1,
  'components/verzahnung/BezugZeitWahl.tsx': 1,
  'components/verzahnung/KanteMitVorschau.tsx': 1,
  'components/verzahnung/RegestePopover.tsx': 1,
  'components/verzahnung/ZeichenLegende.tsx': 1,
  'pages/Einstellungen.tsx': 1,
  'pages/Gesetze.tsx': 2,
  'pages/Rechtsprechung.tsx': 1,
  'pages/Suche.tsx': 1,
  'pages/gesetze-teile/AzRegister.tsx': 2,
  'pages/gesetze-teile/BundSystematik.tsx': 1,
  'pages/gesetze-teile/KantonAuswahl.tsx': 2,
  'pages/gesetze-teile/KantonSystematik.tsx': 1,
};

const SUMME_IST = Object.values(HOECHSTZAHL).reduce((a, b) => a + b, 0);

describe('B-K1 · jeder Knopf traegt einen Baustein — oder steht mit Zahl in der Ratsche', () => {
  it('keine ungelistete Datei baut einen rohen `<button>`, keine gelistete mehr als erlaubt', () => {
    const risse: string[] = [];
    const geraeumt: string[] = [];
    for (const p of alleTsx()) {
      const n = roheKnoepfe(liesRoh(p));
      const max = HOECHSTZAHL[rel(p)] ?? 0;
      if (n > max) risse.push(`${rel(p)}: ${n} roh, erlaubt ${max}`);
      if (max > 0 && n === 0) geraeumt.push(rel(p));
    }
    // 0-Treffer sind eine Warnung, kein Riss (Spec B-K1): die geraeumte Datei
    // soll auffallen, damit ihre Zeile verschwindet — nicht den Bau blockieren.
    if (geraeumt.length) {
      console.warn(`B-K1: ${geraeumt.length} Datei(en) sind geraeumt und koennen aus der Ratsche fallen:\n  ${geraeumt.join('\n  ')}`);
    }
    expect(
      risse,
      'B-K1/§5/§10: ein `<button>` ohne Baustein-Klasse baut seine Optik selbst — genau daraus '
      + 'entstanden die Rezept-Familien, die R9 abraeumt. Entweder der Knopf bekommt `lc-btn-*`/'
      + '`lc-chip`/`fc-schalter`/`lc-tab`, oder seine Datei steht mit Grund und Hoechstzahl in '
      + 'der Ratsche oben.',
    ).toEqual([]);
  });

  it('die Ratsche kennt ihren eigenen Stand (Messwert 6.9.2026: 141 in 83 Dateien)', () => {
    expect(Object.keys(HOECHSTZAHL).length, 'Dateien in der Ratsche').toBe(83);
    expect(SUMME_IST, 'Summe der Hoechstzahlen — sie darf nur sinken').toBeLessThanOrEqual(141);
  });

  it('ROT-BEWEIS: der Zaehler erkennt den rohen Knopf und uebersieht den Baustein nicht', () => {
    expect(roheKnoepfe('<button type="button" className="text-xs underline">x</button>'), 'roh').toBe(1);
    expect(roheKnoepfe('<button type="button" className="lc-btn-mini">x</button>'), 'Baustein').toBe(0);
    expect(roheKnoepfe('<button className="lc-tab shrink-0">x</button>'), 'Reiter-Baustein').toBe(0);
    expect(roheKnoepfe('<button role="tab" className="px-2">x</button>'), 'Reiter-Mechanik').toBe(0);
    expect(roheKnoepfe('<button className="fc-schalter">x</button>'), 'Facetten-Schalter').toBe(0);
    // Das `>` im Ausdruck beendet das Tag nicht — sonst zaehlte die Sonde falsch.
    expect(roheKnoepfe('<button className={n > 3 ? "lc-btn-mini" : "lc-btn-ghost"}>x</button>'), 'Ausdruck mit >').toBe(0);
    // Kommentare zaehlen nie mit (sonst zitiert sich jede Begruendung zum Riss).
    expect(roheKnoepfe('// <button className="roh">x</button>\nconst a = 1;'), 'Kommentar').toBe(0);
  });
});
