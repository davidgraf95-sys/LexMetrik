import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToString } from 'react-dom/server';
import { EntscheidBody } from '../components/rechtsprechung/EntscheidBody';
import { kopfModell } from '../lib/rechtsprechung/kopf';
import type { EntscheidSnapshot, EntscheidSprache } from '../lib/rechtsprechung/typen';
import type { RubrumFeld } from '../lib/rechtsprechung/rubrum';

// ─── B2 — Konsistenz-Golden-Tor je (Gericht × Sprache) ──────────────────────
//
// ZWECK (JETZT-MACHEN §4.1): die heute GUTE deutsche BGE-Darstellung als
// Baseline EINFRIEREN, BEVOR in der Folge-Session A2 die mehrsprachige
// Extraktion anfasst. Jede Regression an den 272 deutschen BGE (verlorener
// Kopf-Block, zerbrochene Sachverhalts-Gliederung, wieder eingestreute
// Seitenmarker) bricht dann SOFORT hier — nicht erst stumm in der UI (§8).
//
// MECHANIK (bewusst zur bestehenden Infrastruktur passend, nicht neu erfunden):
// explizite vitest-Assertions auf einem ECHTEN Korpus-Entscheid je Zelle
// (Muster: ArtikelBody.test.tsx, normtext-register.test.ts). KEINE vitest-
// `toMatchSnapshot`-Dateien (im Repo nirgends genutzt) und KEINE Aufnahme in
// golden-outputs.ts (das friert reine Engine-/Vorlagen-Funktionen ein, keine
// React-Render). Der Render läuft über react-dom/server wie ArtikelBody.test.
//
// Eingefroren wird je Zelle:
//   1. sha          — Inhalts-/Drift-Anker des Snapshots (Extraktions-Regen ⇒ Bruch).
//   2. rubrumLabels — der Kopf-Block (Rubrum) aus dem reinen kopfModell (§3-Vertrag).
//   3. sachverhaltMarken — die Buchstaben-Gliederung (A./B./C.).
//   4. sprache      — das Sprach-Label (deckt den Mislabel-Bug auf, s. fr-Zelle).
//   5. VOLL-Body rendert OHNE Inline-Seitenmarker (`BGE … S. ###`).
//
// ERWEITERN (Folge-Session, Batch 3 / A2): eine weitere (Gericht×Sprache)-Zelle
// ist EIN Eintrag im REFERENZEN-Array — Snapshot-key + die 4 eingefrorenen
// Werte. Für ein neues Gericht (BVGer/BStGer/BPatGer) bzw. eine echte fr/it-
// Zelle nach A2: Werte aus dem dann geltenden Snapshot übernehmen und den
// `hinweis` der entsprechenden Zelle entfernen/aktualisieren. Eine bewusste
// Aktualisierung dieser eingefrorenen Werte ist eine DEKLARIERTE fachliche
// Änderung (§6.3), kein stiller Test-Fix.

const KORPUS = 'public/rechtsprechung';
// Identisch zur Strip-Regel in sachverhalt.ts (entrausche) — Inline-Kolumnentitel.
const SEITENMARKER = /\bBGE\s+\d+\s+[IVXLCDM]+\s+\d+\s+S\.\s*\d+/;

interface Referenzzelle {
  /** Anzeigename der (Gericht × Sprache)-Zelle. */
  zelle: string;
  /** Snapshot-key (== Pfad unter public/rechtsprechung ohne .json). */
  key: string;
  /** Eingefrorenes Sprach-Label (kann den bekannten Mislabel-Bug abbilden). */
  sprache: EntscheidSprache;
  /** Eingefrorene Rubrum-Zeilen-Labels (== Kopf-Block); [] ⇒ kein Kopf-Block. */
  rubrumLabels: RubrumFeld[];
  /** Eingefrorene Sachverhalts-Marken (Buchstaben-Gliederung); [null] ⇒ ungegliedert. */
  sachverhaltMarken: (string | null)[];
  /** Inhalts-Drift-Anker (sha256 über abschnitte). */
  sha: string;
  /** Gesetzt bei einer bewusst noch DEGRADIERTEN Zelle (Vor-A2-Baseline). */
  hinweis?: string;
}

const REFERENZEN: Referenzzelle[] = [
  // ── bge × de: die heute gute, vollständige Darstellung (die A2 schützen soll).
  //    Kopf-Block mit allen vier Rubrum-Zeilen, Sachverhalt A./B./C. gegliedert,
  //    keine Seitenmarker im VOLL-Body.
  {
    zelle: 'bge×de',
    key: 'bund/bge/150_III_137',
    sprache: 'de',
    rubrumLabels: ['gegenstand', 'parteien', 'vorinstanz', 'besetzung'],
    sachverhaltMarken: ['A.', 'B.', 'C.'],
    sha: '2ff9af1de1005f656c197b7d806fe88aab7ef3ab639f80a4f664778da4bb4635',
  },
  // ── bge × fr: der erste mehrsprachig korrekt extrahierte Leitentscheid.
  //    A2 hat diese Zelle DEKLARIERT gehoben (§6.3): das Sprach-Label folgt dem
  //    Body (fr statt des 'bge'-Record-Mislabels 'de'), der Kopf-Block ist über
  //    die mehrsprachige Rubrum-Extraktion vollständig gefüllt (Objet/Parties/
  //    Autorité précédente/Composition) und der Sachverhalt ist A./B./C.-
  //    gegliedert. Damit schützt diese Zelle die fr-Darstellung gegen Regression,
  //    so wie die de-Zelle die 272 DE-BGE schützt.
  //    Hinweis B1: es gibt vier solcher FR-Bodies (152_I_105, 152_II_75,
  //    152_II_98, 151_IV_357), alle mit A2 regeneriert; hier als Referenzzelle einer.
  {
    zelle: 'bge×fr',
    key: 'bund/bge/152_I_105',
    sprache: 'fr',
    rubrumLabels: ['gegenstand', 'parteien', 'vorinstanz', 'besetzung'],
    sachverhaltMarken: ['A.', 'B.', 'C.'],
    sha: '277dc6ef8e60bc949c82ed3b0cad80b816742e238f2c4282ee3bb0f6f489e9bf',
  },

  // ── Batch 3 (Lane R): die drei weiteren eidg. Gerichte je (Gericht × Sprache).
  //    Diese Urteile sind nicht amtlich publiziert → leitcharakter 'routine', keine
  //    amtliche Regeste (regesteAmtlich:false, im Reader als «Zusammenfassung»). Die
  //    Zellen frieren die mehrsprachige Voll-Urteil-Darstellung (A2-Extraktion: Kopf-
  //    Block, Sachverhalts-Gliederung, Sprach-Label aus dem Body) gegen Regression
  //    ein — analog zu bge×de/fr. Werte aus dem generierten Snapshot (27.6.2026,
  //    maschinell, verifiziert:false). Eine bewusste Aktualisierung ist eine
  //    DEKLARIERTE fachliche Änderung (§6.3), kein stiller Test-Fix.
  {
    zelle: 'bvger×de', key: 'bund/bvger/F_3740_2026', sprache: 'de',
    rubrumLabels: ['gegenstand', 'parteien', 'besetzung'],
    sachverhaltMarken: ['A.', 'B.', 'C.'],
    sha: '2c9447814d0d6b0b1f88ba4eef78b44b593bb573b6c2a55cdaf112987c399a5e',
  },
  {
    zelle: 'bvger×fr', key: 'bund/bvger/E_165_2026', sprache: 'fr',
    rubrumLabels: ['parteien', 'besetzung'],
    sachverhaltMarken: [],
    sha: 'c5f5a9e46097ac762dbbbd30afe7c99f0f68d8fa5d8792b79a3dfb35e854a3ca',
  },
  {
    zelle: 'bvger×it', key: 'bund/bvger/F_4218_2026', sprache: 'it',
    rubrumLabels: ['gegenstand', 'parteien', 'besetzung'],
    sachverhaltMarken: ['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'I.'],
    sha: '1f1b344a9338618e537d3ce2e4a58bee8b94fa4b6baf1532de335350f3932a28',
  },
  {
    zelle: 'bstger×de', key: 'bund/bstger/SK_2025_57', sprache: 'de',
    rubrumLabels: ['parteien', 'besetzung'],
    sachverhaltMarken: [],
    sha: 'cc56b4aa928cec468f7b8c9ced8b90ebc0c68520d8416b75d65f77ab71abf410',
  },
  {
    zelle: 'bstger×it', key: 'bund/bstger/RR_2026_46', sprache: 'it',
    rubrumLabels: ['parteien', 'besetzung'],
    sachverhaltMarken: ['A.', 'B.', 'C.', 'D.', 'E.', 'F.'],
    sha: '54cf3cd6a0d8eebae1e988806df4379548fb76d7d410b4e536e26219581ab6c8',
  },
  {
    zelle: 'bstger×fr', key: 'bund/bstger/BB_2026_50', sprache: 'fr',
    rubrumLabels: ['besetzung'],
    sachverhaltMarken: [],
    sha: 'b53a7923889e07532f12a297f07eb3441d557c6b59c8147ed4e5c7d4d5e6b891',
  },
  {
    zelle: 'bpatger×de', key: 'bund/bpatger/O2025_005', sprache: 'de',
    rubrumLabels: ['gegenstand', 'besetzung'],
    sachverhaltMarken: [],
    sha: '512ad97f1275ed6ed7c758051e62d0ad3b8fe218d08c0da63072570566a7d30c',
  },
  {
    zelle: 'bpatger×fr', key: 'bund/bpatger/O2024_007', sprache: 'fr',
    rubrumLabels: [],
    sachverhaltMarken: [],
    sha: '3e2f3674ad36ba00ccedfab6d9d2b96f2a38c539bf20b546c49154fd214cd547',
  },
];

function ladeSnapshot(key: string): EntscheidSnapshot {
  const roh = readFileSync(join(KORPUS, `${key}.json`), 'utf8');
  return JSON.parse(roh).eintraege[0] as EntscheidSnapshot;
}

function renderVollBody(s: EntscheidSnapshot): string {
  return renderToString(
    <EntscheidBody abschnitte={s.abschnitte} zitierung={s.zitierung} bgeReferenz={s.bgeReferenz} />,
  );
}

describe('B2 — Konsistenz-Golden-Tor je (Gericht × Sprache)', () => {
  for (const ref of REFERENZEN) {
    describe(`${ref.zelle} — ${ref.key}`, () => {
      const s = ladeSnapshot(ref.key);

      it('Snapshot-Inhalt unverändert (sha-Drift-Anker)', () => {
        expect(s.sha, ref.hinweis).toBe(ref.sha);
      });

      it('Kopf-Block (Rubrum) wie eingefroren', () => {
        const labels = kopfModell(s).rubrumZeilen.map((z) => z.label);
        expect(labels, ref.hinweis).toEqual(ref.rubrumLabels);
      });

      it('Sachverhalt-Gliederung (Buchstaben-Marken) wie eingefroren', () => {
        const sv = s.abschnitte.find((a) => a.typ === 'sachverhalt');
        expect(sv?.bloecke.map((b) => b.marke) ?? [], ref.hinweis).toEqual(ref.sachverhaltMarken);
      });

      it('Sprach-Label wie eingefroren', () => {
        expect(s.sprache, ref.hinweis).toBe(ref.sprache);
      });

      it('VOLL-Body rendert OHNE Inline-Seitenmarker (BGE … S. ###)', () => {
        const html = renderVollBody(s);
        expect(html.length).toBeGreaterThan(0);
        const text = html.replace(/<[^>]+>/g, ' ');
        expect(SEITENMARKER.test(text), `Seitenmarker im Render von ${ref.key}`).toBe(false);
      });

      // Positive Darstellungs-Garantie nur für nicht-degradierte Zellen: der
      // Kopf-Block existiert und die Buchstaben-Marken erscheinen tatsächlich im
      // gerenderten Body (nicht nur in den Daten). Genau das darf A2 nicht
      // regressieren.
      if (ref.rubrumLabels.length > 0) {
        it('Baseline: Kopf-Block vorhanden und Sachverhalt-Marken im Render sichtbar', () => {
          expect(kopfModell(s).rubrumZeilen.length).toBeGreaterThan(0);
          const html = renderVollBody(s);
          for (const marke of ref.sachverhaltMarken.filter((m): m is string => !!m)) {
            // Marke steht im num-span des Sachverhalts: <span …>A.</span>
            expect(html, `Marke ${marke} fehlt im Render`).toContain(`>${marke}<`);
          }
        });
      }
    });
  }
});
