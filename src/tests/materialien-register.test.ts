import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import {
  MATERIAL_REGISTER, BEHOERDEN, DOKTYPEN, DOKTYP_LABEL, behoerdeVon,
} from '../lib/materialien/register';
import { BOTSCHAFTEN } from '../lib/materialien/botschaften.generated';
import { VERNEHMLASSUNGEN } from '../lib/materialien/vernehmlassungen.generated';
import { baueMaterialManifest } from '../../scripts/materialien/material-manifest';
import { projiziereRegister, dbDokAusZustand } from '../../scripts/materialien/soft-law-projektion';
import { ladeZustand } from '../../scripts/materialien/soft-law-zustand';
import { BEHOERDE_RECHTSGEBIET } from '../../scripts/materialien/adapter-typen';
import { ERLASS_REGISTER, GEBIETE } from '../lib/normtext/register';
import { NAVIGATION } from '../lib/navigation';
import { materialienFuerNorm } from '../lib/normtext/werkzeuge';
import type { MaterialManifest } from '../lib/materialien/typen';

// Konsistenz-Tore Material-Register ↔ Manifest ↔ Navigation (offline, im gate).
// Pendant zu normtext-register.test.ts; eigener Namespace. Jede Diskrepanz bricht
// hier, nie als stille Lücke/toter Link in der UI (§5/§8).

const REGISTER_PFAD = 'public/materialien/register.json';
const KEY_UNSICHER = /[\\/#?\s]/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const behoerdeIds = new Set(BEHOERDEN.map((b) => b.id));
const doktypIds = new Set(DOKTYPEN.map((d) => d.id));
const erlassKeys = new Set(ERLASS_REGISTER.map((e) => e.key));

describe('Tor 1 — Register-Integrität', () => {
  it('Schlüssel sind eindeutig und URL-sicher', () => {
    const keys = MATERIAL_REGISTER.map((m) => m.key);
    expect(new Set(keys).size, 'doppelte keys').toBe(keys.length);
    const unsicher = keys.filter((k) => KEY_UNSICHER.test(k));
    expect(unsicher, `pfad-/URL-unsichere keys: ${unsicher.join(', ')}`).toEqual([]);
  });

  it('Behörde + Doktyp sind deklariert (kein Phantom)', () => {
    for (const m of MATERIAL_REGISTER) {
      expect(behoerdeIds.has(m.behoerde), `${m.key}: Behörde ${m.behoerde}`).toBe(true);
      expect(doktypIds.has(m.doktyp), `${m.key}: Doktyp ${m.doktyp}`).toBe(true);
      expect(m.titel.trim().length, m.key).toBeGreaterThan(0);
    }
  });

  it('jeder Eintrag trägt einen amtlichen Live-Link + ISO-Stand (§7c)', () => {
    for (const m of MATERIAL_REGISTER) {
      expect(/^https?:\/\//.test(m.quelleUrl), `${m.key}: quelleUrl ${m.quelleUrl}`).toBe(true);
      expect(ISO.test(m.stand), `${m.key}: stand ${m.stand}`).toBe(true);
    }
  });

  it('normKeys verweisen nur auf existierende Erlasse (kein toter Cross-Link)', () => {
    for (const m of MATERIAL_REGISTER) {
      for (const nk of m.normKeys ?? []) {
        expect(erlassKeys.has(nk), `${m.key}: normKeys → unbekannter Erlass ${nk}`).toBe(true);
      }
    }
  });

  it('P0-Invariante: alle Materialien sind nur-live-link (Abnahme-Zeitsperre)', () => {
    const andere = MATERIAL_REGISTER.filter((m) => m.status !== 'nur-live-link');
    expect(andere.map((m) => m.key), 'pdf-embed/volltext brauchen gehosteten Inhalt + Drift-Tor').toEqual([]);
  });
});

describe('Tor 2 — committetes Manifest == frischer Build (Merge-Modell §2.7, Determinismus §2)', () => {
  it('register.json existiert und entspricht der Projektion (kuratiert + DB aus Zustands-Manifest)', () => {
    expect(existsSync(REGISTER_PFAD), `${REGISTER_PFAD} fehlt`).toBe(true);
    const committet = JSON.parse(readFileSync(REGISTER_PFAD, 'utf8')) as MaterialManifest;
    // Merge-Modell (M2): register.json = kuratiertes MATERIAL_REGISTER + gelistete DB-Dokumente
    // aus dem committeten Zustands-Manifest, deterministisch sortiert (byte-Beweis: check:materialien).
    const dbDocs = dbDokAusZustand(ladeZustand());
    const frisch = projiziereRegister(committet.erzeugt, dbDocs);
    expect(committet.materialien).toEqual(frisch.materialien);
    // register.json ist Superset des kuratierten Registers (kein kuratierter Eintrag geht verloren).
    const kuratiertKeys = new Set(MATERIAL_REGISTER.map((m) => m.key));
    const registerKeys = new Set(committet.materialien.map((m) => m.key));
    for (const k of kuratiertKeys) expect(registerKeys.has(k)).toBe(true);
    // Paket 2 (W2·6) + Paket 3 (W3·11): + generierte Botschaften/Vernehmlassungen (nicht im
    // in-Bundle MATERIAL_REGISTER, §15; gemerged via ALLE_MATERIALIEN). Länge = kuratiert +
    // Botschaften + Vernehmlassungen + DB.
    expect(committet.materialien.length).toBe(MATERIAL_REGISTER.length + BOTSCHAFTEN.length + VERNEHMLASSUNGEN.length + dbDocs.length);
    const botschaften = committet.materialien.filter((m) => m.behoerde === 'BR');
    expect(botschaften.length).toBe(BOTSCHAFTEN.length);
    const vernehmlassungen = committet.materialien.filter((m) => m.behoerde === 'BUND');
    expect(vernehmlassungen.length).toBe(VERNEHMLASSUNGEN.length);
  });

  it('jeder Manifest-Eintrag löst Behörde-/Doktyp-Labels auf', () => {
    const m = baueMaterialManifest('2026-06-27');
    for (const x of m.materialien) {
      expect(x.behoerdeName).toBe(behoerdeVon(x.behoerde).name);
      expect(x.doktypLabel).toBe(DOKTYP_LABEL[x.doktyp]);
      expect(x.sha).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});

describe('Tor 3 — Navigation verlinkt nur existierende Behörden (kein toter Link)', () => {
  it('«Materialien › Nach Behörde» trifft genau die BEHOERDEN-Anker', () => {
    // ── D26 (David 6.9.2026), DEKLARIERTE FACHLICHE ÄNDERUNG (§6.3) ──────────
    // Die Behörden hängen nicht mehr unter einer Klapp-Zeile «Nach Behörde»,
    // sondern stehen direkt in der Leiste, gefolgt von «Alle Materialien».
    // Zusätzlich zeigt die Leiste seit D26 nur Behörden MIT Einträgen (Zahl aus
    // dem Zähler-Generat) — eine Behörde ohne Materialie ist kein toter Link
    // mehr, sondern gar keine Zeile (§8). Der Massstab wird darum von «alle
    // BEHOERDEN» auf «alle BEHOERDEN mit Bestand» präzisiert; was der Test
    // schützt, bleibt: jeder Behörden-Link trifft einen echten Anker, und keine
    // erfundene Behörde erscheint.
    const materialien = NAVIGATION.find((a) => a.titel === 'Materialien');
    expect(materialien, 'Navigations-Abschnitt «Materialien» fehlt').toBeTruthy();
    const links = materialien!.kinder.filter((k) => k.art === 'link');
    expect(links.at(-1)!.ziel, '«Alle Materialien» fehlt am Listenende').toBe('/materialien');
    const ziele = links.slice(0, -1).map((k) => k.ziel);
    const manifest = JSON.parse(readFileSync(REGISTER_PFAD, 'utf8')) as MaterialManifest;
    const mitBestand = new Set(manifest.materialien.map((x) => x.behoerde));
    expect(ziele).toEqual(
      BEHOERDEN.filter((b) => mitBestand.has(b.id)).map((b) => `/materialien#b-${b.id}`),
    );
    // Nulltest-Schutz (§6.7): es gibt überhaupt Behörden-Zeilen.
    expect(ziele.length).toBeGreaterThan(0);
  });
});

describe('Tor 4 — Norm↔Material-Brücke (additiv, kein toter Bezug)', () => {
  it('materialienFuerNorm liefert nur Materialien, die den Erlass führen', () => {
    // Mindestens eine bekannte Verzahnung existiert (DSG → EDÖB-Leitfäden).
    const dsg = materialienFuerNorm('DSG');
    expect(dsg.length).toBeGreaterThan(0);
    for (const ref of dsg) {
      const reg = MATERIAL_REGISTER.find((m) => m.key === ref.key)!;
      expect((reg.normKeys ?? []).includes('DSG')).toBe(true);
    }
    // Ein Erlass ohne Material-Verzahnung liefert leer (kein erfundener Bezug).
    expect(materialienFuerNorm('NICHT_EXISTENT')).toEqual([]);
  });
});

// ─── Wurzel-Fix zur W2-TRENNUNG (§17, 29.8.2026) ────────────────────────────
//
// ANLASS: Bei der Trennung des Doppel-Topfs blieben 138 Materialien-Einträge
// still auf dem abgelösten Wert `'sozial-abgaben'` stehen — sie stammen aus der
// persistierten Zustandsdatei `bibliothek/register/soft-law-zustand.jsonl`, die
// niemand mitgezogen hatte. KEIN bestehendes Tor schlug an: `check:materialien`
// prüft die Projektion nur gegen sich selbst, und der TypeScript-Compiler sieht
// eine JSONL-Datei nicht. Der Fehler wäre in die Auslieferung gelaufen und
// hätte 138 Dokumente in eine Rubrik gehängt, die es nicht mehr gibt.
//
// Diese Tore schliessen die Lücke an der Wurzel: Jedes Material — kuratiert,
// generiert ODER aus dem Zustand geerntet — muss ein DEKLARIERTES Rechtsgebiet
// tragen. Das gilt nicht nur für den einen abgelösten Wert, sondern für jeden
// künftigen Tippfehler und jede künftige Taxonomie-Änderung.
describe('Materialien tragen ausschliesslich deklarierte Rechtsgebiete (§17-Wurzelfix)', () => {
  const GEBIET_IDS = new Set<string>(GEBIETE.map((g) => g.id));

  it('die geerntete Zustandsdatei trägt kein undeklariertes Gebiet', () => {
    // Der eigentliche Fundort des Fehlers: eine JSONL-Datei ausserhalb jeder
    // Typprüfung, aus der 298 der 1557 Register-Einträge stammen.
    const fremd = [...ladeZustand().letzterZustand.values()]
      .filter((d) => !GEBIET_IDS.has(d.rechtsgebiet as string))
      .map((d) => `${d.behoerde ?? '?'} ${d.nummer ?? d.titel ?? '?'} → ${d.rechtsgebiet}`);
    expect(fremd).toEqual([]);
  });

  it('die ausgelieferte Projektion trägt kein undeklariertes Gebiet', () => {
    const roh = JSON.parse(readFileSync('public/materialien/register.json', 'utf8')) as {
      materialien: Array<{ key: string; rechtsgebiet: string }>;
    };
    const fremd = roh.materialien
      .filter((m) => !GEBIET_IDS.has(m.rechtsgebiet))
      .map((m) => `${m.key} → ${m.rechtsgebiet}`);
    expect(fremd).toEqual([]);
  });
});

// ─── F5 (Gegenprüfung 29.8.2026): der persistierte Zustand gegen die REGEL ────
//
// Die beiden Tore oben prüfen den WERTEBEREICH — dass das Rechtsgebiet
// überhaupt existiert. Das hätte die 138 gefangen, weil 'sozial-abgaben'
// wegfiel. Es fängt aber NICHT den allgemeinen Fall: eine Regel-Änderung, die
// bestehende Werte in ANDERE gültige Werte überführt (ESTV künftig nicht mehr
// 'steuern'), liefe wieder still am persistierten Bestand vorbei.
//
// WARUM NICHT DIE ZWEI NAHELIEGENDEN WEGE — beide geprüft, beide verworfen:
//
//   (a) «Rechtsgebiet in den Zustands-sha aufnehmen.» Verworfen aus zwei
//       Gründen. Erstens semantisch: der sha ist der Drift-Anker gegen die
//       AMTLICHE QUELLE (§7 Bst. d). Nimmt er ein lokal ABGELEITETES Feld auf,
//       sieht künftig jede interne Taxonomie-Änderung wie eine Änderung beim
//       Absender aus — der Drift-Alarm verlöre seine Aussage. Zweitens
//       wirkungslos für genau diesen Fall: ein sha ändert sich erst beim
//       nächsten Ernte-Lauf; der stehen gebliebene Bestand wäre bis dahin
//       unverändert falsch geblieben, also exakt wie geschehen.
//
//   (b) «Tor: Projektion-rechtsgebiet == Zustands-rechtsgebiet je Eintrag.»
//       Verworfen — und zwar doppelt belegt. Erstens kann es die Sorge nicht
//       tragen: `dokZeileNachBrowse` in soft-law-projektion.ts übernimmt das
//       Feld wörtlich aus der Zustandszeile
//       (`rechtsgebiet: z.rechtsgebiet as Rechtsgebiet`), die beiden Seiten
//       sind per Konstruktion gleich. Zweitens GIBT ES DIESES TOR BEREITS: Tor
//       2 weiter oben vergleicht das committete register.json gegen die frisch
//       aus dem Zustand gebaute Projektion und meldet jede Abweichung — es war
//       am 29.8.2026 GRÜN, während alle 138 Einträge falsch waren, weil
//       Zustand und Projektion einträchtig denselben falschen Wert trugen.
//       Ein zweites Tor derselben Bauart hätte daran nichts geändert.
//
// GEBAUT ist darum der dritte Weg: den persistierten Wert gegen die REGEL
// prüfen, aus der er stammt (Absender → Rechtsgebiet, BEHOERDE_RECHTSGEBIET in
// adapter-typen.ts). Dieses Tor WÄRE am 29.8.2026 rot gewesen: die Adapter
// sagten bereits 'steuern', die Zustandsdatei noch 'sozial-abgaben'. Es ist
// zugleich der §5-Fix — die Regel stand vorher dreimal als Literal in den
// Adaptern und ein viertes Mal im Nachzieh-Skript, an keiner Stelle prüfbar.
describe('F5 — persistierter Zustand stimmt mit der Absender-Regel überein', () => {
  it('jede Zustandszeile trägt das Rechtsgebiet ihres Absenders', () => {
    const abweichungen = [...ladeZustand().letzterZustand.values()]
      .map((d) => {
        const soll = BEHOERDE_RECHTSGEBIET[String(d.behoerde)];
        if (soll === undefined) {
          // Unbekannte Behörde ⇒ Fehler, nicht Durchlass: wer eine neue
          // Soft-Law-Quelle anschliesst, trägt sie in die Regel ein (§8).
          return `${d.behoerde}: Absender in BEHOERDE_RECHTSGEBIET nicht deklariert`;
        }
        return d.rechtsgebiet === soll
          ? null
          : `${d.behoerde} ${d.nummer ?? d.titel ?? d.id}: ist '${d.rechtsgebiet}', Regel sagt '${soll}'`;
      })
      .filter((x): x is string => x !== null);
    expect(abweichungen).toEqual([]);
  });

  it('das Tor misst wirklich am Bestand und deckt alle Absender ab', () => {
    // Gegenprobe gegen die leere Menge (§6.7).
    const zeilen = [...ladeZustand().letzterZustand.values()];
    expect(zeilen.length).toBeGreaterThan(100);
    const absender = new Set(zeilen.map((d) => String(d.behoerde)));
    expect([...absender].sort()).toEqual(['EDOEB', 'ESTV', 'SECO']);
  });
});
