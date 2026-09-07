import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  bieteAenderungsvermerkeSchalter, zaehleAenderungsvermerke,
} from '../pages/gesetz-leser/berechnungen';
import type { StrukturMap } from '../lib/normtext/browse';

// S1-NACHZUG B3 (Bug-Check 17.8.2026, §8) — «Änderungsvermerke» wird nur
// angeboten, wenn der Erlass Vermerke TRÄGT.
//
// BEFUND: Auf Kantonserlassen und Staatsverträgen ohne klassifizierte Historie
// blieb dem Schalter nur eine Layout-Raffung von 40 px je Artikel; die
// faktischen Änderungs-Fussnoten OHNE Klasse bleiben dort sichtbar (H0-Auflage 1
// — eine fehlende Klasse blendet nie etwas aus, `bibliothek/normen/
// hist-ansicht-h0-trennbarkeit.md`). Die Beschriftung versprach mehr, als sie hielt.
//
// Zwei Blöcke: die REGEL (rein, synthetisch — sie muss auch dann gelten, wenn
// sich der Korpus ändert) und die DATENLAGE (gegen die echten Sidecars — sie
// belegt, dass die Regel im Bestand genau die gemeldeten Erlasse trifft).

const S = (...fussnoten: Array<{ kl?: 'A' | 'V' | 'G' | 'Z' | 'U' }>): StrukturMap => ({
  '1': {
    gliederung: [],
    marginalie: [],
    fussnoten: fussnoten.map((f, i) => ({ nr: String(i + 1), text: 'x', links: [], ...f })),
  },
});

describe('zaehleAenderungsvermerke', () => {
  it('zählt AUSSCHLIESSLICH die Klasse A', () => {
    expect(zaehleAenderungsvermerke(S({ kl: 'A' }, { kl: 'A' }, { kl: 'V' }))).toBe(2);
    expect(zaehleAenderungsvermerke(S({ kl: 'V' }, { kl: 'G' }, { kl: 'Z' }, { kl: 'U' }))).toBe(0);
  });

  it('Fussnoten OHNE Klasse zählen NICHT (alle Kanton-Sidecars, H0-Auflage 1)', () => {
    // Genau der gemeldete Fall: BS-640.100 trägt 16 Fussnoten, keine davon
    // klassifiziert. Sie bleiben in jeder Schalterstellung sichtbar — also darf
    // ihre Zahl den Schalter nicht rechtfertigen.
    expect(zaehleAenderungsvermerke(S({}, {}, {}))).toBe(0);
  });

  it('null (Sidecar fehlt) ist von 0 (gibt es nicht) UNTERSCHIEDEN', () => {
    expect(zaehleAenderungsvermerke(null)).toBeNull();
    expect(zaehleAenderungsvermerke(undefined)).toBeNull();
    expect(zaehleAenderungsvermerke({})).toBe(0);
  });
});

describe('bieteAenderungsvermerkeSchalter', () => {
  const GELADEN = true;
  const LAEDT = false;

  it('kl:A vorhanden ⇒ anbieten', () => {
    expect(bieteAenderungsvermerkeSchalter(22, false, GELADEN)).toBe(true);
  });

  it('keine kl:A, aber eine «Fassung»-Zeile ⇒ TROTZDEM anbieten', () => {
    // Der Schalter blendet auch `[data-hist-slot]` aus (index.css). Gemessen gibt
    // es im Bestand zwei solche Erlasse (MONTREAL, PVUE) — dort wäre er WIRKSAM.
    // Nur `kl:'A'` zu prüfen hätte ein wirksames Steuerelement entfernt (§1).
    expect(bieteAenderungsvermerkeSchalter(0, true, GELADEN)).toBe(true);
  });

  it('weder kl:A noch Fassung ⇒ NICHT anbieten (der gemeldete Fall)', () => {
    expect(bieteAenderungsvermerkeSchalter(0, false, GELADEN)).toBe(false);
  });

  it('GAR KEIN Sidecar bei geladenem Erlass ⇒ NICHT anbieten (ZH-211.11)', () => {
    // `ladeStruktur` löst 404 und «lädt noch» beide auf `null` auf (browse.ts).
    // Ohne die dritte Eingabe behielte ZH-211.11 — der Erlass hatte am 17.8.2026
    // überhaupt kein Struktur-Sidecar — den Schalter, obwohl er einer der drei
    // gemeldeten Fälle ist. Kein Sidecar bei geladenem Erlass heisst: keine
    // Fussnoten, keine Vermerke. (Anlass-Beleg von damals; ZH-211.11 hat seit
    // den ZH-Randtitel-Sidecars vom 2.9.2026 eines — die REGEL hier ist rein
    // und erlass-neutral, ihr Bestands-Beleg steht unten in der Datenlage.)
    expect(bieteAenderungsvermerkeSchalter(null, false, GELADEN)).toBe(false);
  });

  it('noch am Laden ⇒ anbieten (konservativ, §8)', () => {
    // Ein Steuerelement zu verschweigen, dessen Wirkung man noch nicht kennt,
    // wäre die falsche Richtung. Der umgekehrte Fehler ist harmlos: das Panel ist
    // im Grundzustand geschlossen.
    expect(bieteAenderungsvermerkeSchalter(null, false, LAEDT)).toBe(true);
    expect(bieteAenderungsvermerkeSchalter(null, true, LAEDT)).toBe(true);
  });
});

// ── Datenlage im Bestand ─────────────────────────────────────────────────────
// Diese Zusicherungen sind ABSICHTLICH an den echten Sidecars gehängt: die Regel
// oben ist erlass-neutral, aber ihr WERT hängt daran, dass sie im Bestand die
// richtigen Erlasse trifft. Bewusst als Eigenschaften formuliert (nicht als
// eingefrorene Zahlen), damit ein wachsender Korpus den Test nicht rot färbt,
// ohne dass sich etwas Falsches geändert hätte.
const STRUKTUR = 'public/normtext/struktur';
const HISTORIE = 'public/normtext/historie';

/** `null` = kein Sidecar im Korpus — genau, was `ladeStruktur` (browse.ts) bei
 *  404 an den Reader gibt (bis 2.9.2026 der Fall an ZH-211.11; heute an den
 *  Kantons-Erlassen, die die Sonde unten aufsammelt). */
function ladeStruktur(ebene: 'bund' | 'kanton', key: string): StrukturMap | null {
  try {
    const j = JSON.parse(readFileSync(join(STRUKTUR, ebene, `${key}.json`), 'utf8')) as
      { artikel?: StrukturMap } & StrukturMap;
    return (j.artikel ?? j) as StrukturMap;
  } catch {
    return null;
  }
}
/** Trägt der Historie-Shard des Erlasses mindestens einen Artikel-Eintrag? */
function hatFassungsZeile(key: string): boolean {
  const dateien = readdirSync(HISTORIE);
  if (!dateien.includes(`${key}.json`)) return false;
  const j = JSON.parse(readFileSync(join(HISTORIE, `${key}.json`), 'utf8')) as
    { artikel?: Record<string, unknown> };
  return Object.keys(j.artikel ?? {}).length > 0;
}
/** Wie der Reader es rechnet, mit fertig geladenem Erlass. */
const bietet = (ebene: 'bund' | 'kanton', key: string): boolean =>
  bieteAenderungsvermerkeSchalter(
    zaehleAenderungsvermerke(ladeStruktur(ebene, key)), hatFassungsZeile(key), true,
  );

describe('B3 an den echten Sidecars', () => {
  it('Bundes-Kodifikationen mit Historie bekommen den Schalter', () => {
    // StPO: 187 von 283 Fussnoten sind kl:'A' (Messung 17.8.2026).
    expect(bietet('bund', 'STPO')).toBe(true);
    expect(bietet('bund', 'OR')).toBe(true);
    expect(bietet('bund', 'BV')).toBe(true);
    expect(bietet('bund', 'BGBM')).toBe(true);
  });

  it('die drei gemeldeten Erlasse bekommen ihn NICHT', () => {
    // Bug-Check-Messung: `[data-historie-zeile]` = 0 auf allen drei.
    expect(bietet('kanton', 'BS-640.100')).toBe(false); // 16 Fussnoten, keine klassifiziert
    // ZH-211.11 hatte am 17.8.2026 GAR KEIN Struktur-Sidecar — es war der
    // Datenlage-Beleg für den `null`-Zweig oben. ERGÄNZT (nicht nachgeführt,
    // §0-2b), Messung 2.9.2026: seit den ZH-Gliederungs-/Randtitel-Sidecars
    // (R1) trägt der Erlass ein Sidecar mit 23 Artikeln und NULL Fussnoten. Er
    // wechselt damit vom `null`- in den `0`-Zweig; das Ergebnis ist dasselbe,
    // und genau das wird hier weiter gemessen. Den `null`-Zweig im Bestand
    // belegt jetzt die Sonde «Erlasse ganz OHNE Sidecar» unten — welcher Erlass
    // gerade keines hat, ist Korpus-Zufall und darf kein Fixture-Anker sein.
    expect(zaehleAenderungsvermerke(ladeStruktur('kanton', 'ZH-211.11'))).toBe(0);
    expect(bietet('kanton', 'ZH-211.11')).toBe(false);
    expect(bietet('bund', 'LUGUE')).toBe(false);        // Staatsvertrag, 2 Fussnoten
  });

  it('Erlasse ganz OHNE Sidecar bekommen ihn nicht (der `null`-Zweig im Bestand)', () => {
    // Nachfolger des früheren Einzelbelegs an ZH-211.11 (s. o.), als
    // EIGENSCHAFT formuliert wie der Rest dieses Blocks: dass irgendein
    // Kantons-Erlass noch kein Struktur-Sidecar hat, ist ein wandernder
    // Korpus-Zustand; dass keiner von ihnen den Schalter bekommt, ist die Regel.
    const ohneSidecar: string[] = [];
    for (const datei of readdirSync('public/normtext/kanton')) {
      if (!datei.endsWith('.json') || datei === 'index.json') continue;
      const key = datei.replace(/\.json$/, '');
      if (ladeStruktur('kanton', key) === null) ohneSidecar.push(key);
    }
    // POSITIV-Vorbedingung (§6.7): ohne sie wäre die Schleife auch dann erfüllt,
    // wenn sie gar nichts sieht. Wird sie eines Tages rot, weil JEDER
    // Kantons-Erlass ein Sidecar hat, ist der `null`-Zweig im Bestand nicht mehr
    // belegbar — dann trägt ihn nur noch der synthetische Test oben und dieser
    // Fall darf entfallen (er behauptet dann nichts Falsches, nur nichts mehr).
    expect(ohneSidecar.length, 'kein sidecar-loser Kantons-Erlass mehr im Korpus')
      .toBeGreaterThan(0);
    for (const key of ohneSidecar) expect(bietet('kanton', key), key).toBe(false);
  });

  it('Staatsverträge MIT Fassungszeile behalten ihn (Gegenprobe zur Herkunfts-Weiche)', () => {
    // MONTREAL und PVUE tragen NULL kl:'A'-Fussnoten, aber Historie-Einträge.
    // Ein `if (kanton)`-Fix oder eine reine kl:'A'-Prüfung hätte hier einen
    // wirksamen Schalter entfernt — genau darum die zweite Bedingung.
    expect(zaehleAenderungsvermerke(ladeStruktur('bund', 'MONTREAL'))).toBe(0);
    expect(hatFassungsZeile('MONTREAL')).toBe(true);
    expect(bietet('bund', 'MONTREAL')).toBe(true);
    expect(bietet('bund', 'PVUE')).toBe(true);
  });

  it('ein Historie-Shard OHNE Artikel-Einträge rechtfertigt ihn nicht', () => {
    // EAUE/HEUE/HKSUE96/UNO_BRK haben einen Shard, aber `artikel: {}` — es gibt
    // also keine «Fassung»-Zeile zum Ausblenden. Die Existenz der Datei allein
    // darf den Schalter nicht tragen (sonst wäre die Prüfung wieder kosmetisch).
    for (const key of ['EAUE', 'HEUE', 'HKSUE96', 'UNO_BRK']) {
      expect(hatFassungsZeile(key), key).toBe(false);
      expect(bietet('bund', key), key).toBe(false);
    }
  });

  // ── Ä68-WÄCHTER (Entscheid David 17.8.2026 abends) ────────────────────────
  // Seit der Entkopplung blendet der Schalter NUR noch die Fassungs-Zeile aus
  // (`[data-hist-slot]`, index.css). Die `kl:'A'`-Bedingung in
  // `bieteAenderungsvermerkeSchalter` beschreibt damit keine Wirkung mehr — sie
  // kann nur noch ÜBERANBIETEN, also einen Schalter zeigen, der nichts tut (§8).
  //
  // Heute tut sie das an keinem einzigen Erlass, und GENAU DAS wird hier gemessen
  // statt behauptet. Der Tag, an dem der Korpus einen Erlass mit `kl:'A'`, aber
  // ohne Historie-Einträge aufnimmt, ist der Tag, an dem die Bedingung fallen
  // muss — dann wird dieser Test rot und sagt, welcher Erlass es ist. Ohne ihn
  // bliebe die Redundanz stumm stehen und der Nutzer bekäme ein totes
  // Steuerelement (Fehlerklasse F4).
  it('Ä68: kein Erlass trägt kl:A ohne Fassungszeile — die Redundanz ist gedeckt', () => {
    const ohneWirkung: string[] = [];
    let mitBeidem = 0;
    for (const ebene of ['bund', 'kanton'] as const) {
      let dateien: string[];
      try {
        dateien = readdirSync(join(STRUKTUR, ebene)).filter((f) => f.endsWith('.json'));
      } catch {
        continue;
      }
      for (const datei of dateien) {
        const key = datei.replace(/\.json$/, '');
        const a = zaehleAenderungsvermerke(ladeStruktur(ebene, key)) ?? 0;
        if (a === 0) continue;
        if (hatFassungsZeile(key)) mitBeidem += 1;
        else ohneWirkung.push(`${ebene}/${key} (kl:A = ${a})`);
      }
    }
    // POSITIV-Vorbedingung: die Schleife hat wirklich Erlasse gesehen. Ohne sie
    // wäre die leere Liste unten auch bei kaputtem Pfad erfüllt (§6.7).
    expect(mitBeidem, 'keine Erlasse mit kl:A gefunden — die Sonde greift ins Leere')
      .toBeGreaterThan(100);
    expect(
      ohneWirkung,
      'diese Erlasse bekämen nach Ä68 einen wirkungslosen Schalter — '
      + 'die kl:A-Bedingung in bieteAenderungsvermerkeSchalter muss dann fallen',
    ).toEqual([]);
  });
});
