// ─── Wächter: Erlassnamen-Positivliste (V-7/V-8, W2·20-VERWEIS-SCHAERFE) ─────
//
// Jeder Eintrag in `src/lib/fedlex/positivliste.ts` ist ein kuratierter
// Identitäts-Treffer (§1) und muss BELEGT sein — nicht behauptet. Beleg-Quelle
// ist das Bund-Register (`public/normtext/register.json`, Titel aus der
// Fedlex-Extraktion mit `quelleUrl`/`stand`), ersatzweise die FEDLEX-URL des
// Ziels (dann steht der Eintrag in der Gegenprüfungs-Liste des PR).
//
// Scheiterns-Fähigkeit (§6.7, Rot-Beweis 1.9.2026): ein Titel-Fragment mit
// Tippfehler, ein Kurztitel ohne Register-Treffer und eine Schreibweise, die
// nicht in der Titel-Klammer steht, reissen je einen Fall.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FEDLEX, type FedlexGesetz } from '../lib/fedlex';
import {
  ERLASSDATUM, GENITIV_EINTRAEGE, KUERZEL_SCHREIBWEISEN, TITEL_EINTRAEGE,
  titelGeltung, zitiertesDatumIso,
} from '../lib/fedlex/positivliste';

interface RegisterErlass { key: string; ebene: string; titel?: string; quelleUrl?: string; stand?: string; datei?: string }
const register = JSON.parse(readFileSync(join(process.cwd(), 'public', 'normtext', 'register.json'), 'utf8')) as { erlasse: RegisterErlass[] };
// Register-Key ist der kanonisierte FEDLEX-Key (Umlaute → UE/OE/AE, «-»/« » entfernt).
const kanon = (s: string): string =>
  s.toUpperCase().replace(/Ä/g, 'AE').replace(/Ö/g, 'OE').replace(/Ü/g, 'UE').replace(/[^A-Z0-9]/g, '');
const bundTitel = new Map<string, string>();
for (const e of register.erlasse) if (e.ebene === 'bund' && e.titel) bundTitel.set(kanon(e.key), e.titel.replace(/­/g, ''));
const titelVon = (g: FedlexGesetz): string | undefined => bundTitel.get(kanon(g));
const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('Positivliste V-7a — Kurztitel-Genitive', () => {
  it('jeder Eintrag zeigt auf ein FEDLEX-Ziel, Name und Beleg hängen zusammen', () => {
    const namen = new Set<string>();
    for (const e of GENITIV_EINTRAEGE) {
      expect(FEDLEX[e.gesetz], `${e.name}: Ziel ${e.gesetz} fehlt in FEDLEX`).toBeTruthy();
      expect(namen.has(e.name), `${e.name}: doppelter Name`).toBe(false);
      namen.add(e.name);
      if (e.beleg.startsWith('https://')) {
        // Ersatz-Beleg: die FEDLEX-URL des Ziels (Gegenprüfungs-Liste im PR).
        expect(e.beleg).toBe(FEDLEX[e.gesetz]);
      } else {
        // Register-Beleg: der Kurztitel steht im Fedlex-Titel des Ziels UND im Namen.
        const titel = titelVon(e.gesetz);
        expect(titel, `${e.name}: Ziel ${e.gesetz} nicht im Bund-Register — Beleg per URL nötig`).toBeDefined();
        expect(titel!.includes(e.beleg), `${e.name}: Beleg «${e.beleg}» nicht im Register-Titel «${titel}»`).toBe(true);
        expect(e.name.includes(e.beleg), `${e.name}: Beleg «${e.beleg}» nicht Teil des Namens`).toBe(true);
      }
    }
  });

  it('Geltung «bund» für jeden Kurztitel, den ein kantonaler Register-Erlass ebenfalls trägt', () => {
    // Datensignal, kein Raten: existiert im Register ein kantonaler Erlass, dessen
    // Titel mit dem Kurztitel BEGINNT («Datenschutzgesetz (146.1)», «Kantonales
    // Waldgesetz»), darf der Name nicht ebenenübergreifend gelten. Einführungs-
    // gesetze («Einführungsgesetz zum Schweizerischen Zivilgesetzbuch») zählen
    // nicht — sie heissen nie «des Zivilgesetzbuches».
    for (const e of GENITIV_EINTRAEGE) {
      if (e.geltung === 'bund') continue;
      // Fix-Runde 1 (Gegenprüfungs-Nebenbefund 1.9.2026): URL-belegte Einträge
      // wurden hier übersprungen — genau sie tragen aber keinen Register-Titel
      // als Stamm. Der Stamm kommt dann aus dem Namen selbst (Genitiv-Endung
      // «-s»/«-es» abgeschnitten): «Versicherungsvertragsgesetzes» →
      // «Versicherungsvertragsgesetz».
      const stamm = e.beleg.startsWith('https://') ? e.name.replace(/e?s$/, '') : e.beleg;
      const kantonal = register.erlasse.filter((r) => r.ebene === 'kanton'
        && new RegExp(`^(?:Kantonales\\s+)?${esc(stamm)}\\b`).test((r.titel ?? '').replace(/­/g, '')));
      expect(kantonal.map((r) => r.key), `${e.name} (alle): gleichnamiger kantonaler Erlass — Geltung muss «bund» sein`).toEqual([]);
    }
  });
});

describe('Positivliste V-7b — amtliche Volltitel', () => {
  it('Kopf + Fragment ist wörtlich der Register-Titel des Ziels (ohne Klammer-Zusatz und Datum)', () => {
    const paare = new Set<string>();
    for (const e of TITEL_EINTRAEGE) {
      expect(FEDLEX[e.gesetz], `${e.fragment}: Ziel ${e.gesetz} fehlt in FEDLEX`).toBeTruthy();
      const schluessel = `${e.kopf}|${e.fragment}`;
      expect(paare.has(schluessel), `${schluessel}: doppelt`).toBe(false);
      paare.add(schluessel);
      const titel = titelVon(e.gesetz);
      expect(titel, `${e.gesetz}: nicht im Bund-Register`).toBeDefined();
      const kern = titel!.replace(/\s*\([^()]*\)\s*$/, '').replace(/\s+vom\s+\d{1,2}\.\s+\S+\s+\d{4}/, '').replace(/\s+/g, ' ').trim();
      const kopfNominativ = e.kopf === 'Bundesgesetzes' ? 'Bundesgesetz' : 'Verordnung';
      expect(kern, `${e.gesetz}: Fragment «${e.fragment}» ≠ Register-Titel`).toBe(`${kopfNominativ} ${e.fragment}`);
    }
  });

  it('Kopf «Verordnung» gilt nur im Bund, «Bundesgesetzes» überall', () => {
    expect(titelGeltung('Verordnung')).toBe('bund');
    expect(titelGeltung('Bundesgesetzes')).toBe('alle');
  });
});

describe('Positivliste V-8 — amtliche Kürzel-Schreibweisen', () => {
  it('jede Schreibweise steht in der Titel-Klammer ihres Ziels und kanonisiert auf den Key', () => {
    for (const [schreibweise, gesetz] of KUERZEL_SCHREIBWEISEN) {
      expect(FEDLEX[gesetz], `${schreibweise}: Ziel ${gesetz} fehlt in FEDLEX`).toBeTruthy();
      expect(kanon(schreibweise), `${schreibweise}: kanonisiert nicht auf ${gesetz}`).toBe(kanon(gesetz));
      expect(schreibweise).not.toBe(gesetz);
      const titel = titelVon(gesetz);
      expect(titel, `${schreibweise}: Ziel ${gesetz} nicht im Bund-Register`).toBeDefined();
      expect(new RegExp(`\\((?:[^()]*,\\s*)?${esc(schreibweise)}\\)`).test(titel!),
        `${schreibweise}: nicht in der Titel-Klammer «${titel}»`).toBe(true);
    }
  });
});

describe('Positivliste V-5 — Erlassdatum je Ziel (Zeit-Kante, Fix-Runde 1)', () => {
  // Die Tabelle ist eine PROJEKTION des Struktur-Sidecars (§5), keine zweite
  // Wahrheit: jeder Wert wird gegen `kopf.erlassdatum` aus der Fedlex-Extraktion
  // geprüft. Ein von Hand «korrigiertes» Datum reisst diesen Fall.
  const dateiVon = new Map<string, string>();
  for (const e of register.erlasse) if (e.ebene === 'bund' && e.datei) dateiVon.set(kanon(e.key), e.datei);
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
    'August', 'September', 'Oktober', 'November', 'Dezember'];

  it('jeder Wert ist das erlassdatum des Struktur-Sidecars', () => {
    for (const [gesetz, iso] of Object.entries(ERLASSDATUM)) {
      const datei = dateiVon.get(kanon(gesetz));
      expect(datei, `${gesetz}: nicht im Bund-Register`).toBeDefined();
      const sidecar = JSON.parse(readFileSync(join(process.cwd(), 'public', 'normtext', 'struktur', datei!), 'utf8')) as { kopf?: { erlassdatum?: string } };
      const roh = sidecar.kopf?.erlassdatum;
      expect(roh, `${gesetz}: Sidecar ohne kopf.erlassdatum`).toBeDefined();
      const m = /^vom\s+(\d{1,2})\.\s*([A-Za-zÄÖÜäöü]+)\s+(\d{4})/.exec(roh!);
      expect(m, `${gesetz}: erlassdatum «${roh}» nicht parsebar`).not.toBeNull();
      const mo = MONATE.findIndex((x) => x.toLowerCase() === m![2].toLowerCase());
      const soll = `${m![3]}-${String(mo + 1).padStart(2, '0')}-${m![1].padStart(2, '0')}`;
      expect(iso, `${gesetz}: Tabelle ${iso} ≠ Sidecar ${soll} («${roh}»)`).toBe(soll);
    }
  });

  it('jedes Ziel der Positivliste hat ein Erlassdatum — sonst wäre ein datiertes Zitat nie verlinkbar', () => {
    const ziele = new Set<FedlexGesetz>([...TITEL_EINTRAEGE.map((e) => e.gesetz), ...GENITIV_EINTRAEGE.map((e) => e.gesetz)]);
    expect([...ziele].filter((g) => !ERLASSDATUM[g]), 'Ziele ohne Erlassdatum').toEqual([]);
  });

  it('zitiertesDatumIso: Vollform und eindeutige Abkürzung lösen auf, Mehrdeutiges nicht', () => {
    expect(zitiertesDatumIso('20. Dezember 1946')).toBe('1946-12-20');
    expect(zitiertesDatumIso('18. Dez. 1987')).toBe('1987-12-18');
    expect(zitiertesDatumIso('6. Oktober 2000')).toBe('2000-10-06');
    expect(zitiertesDatumIso('19. Ju. 1992')).toBeNull(); // Juni/Juli mehrdeutig
    expect(zitiertesDatumIso('19. Foo 1992')).toBeNull();
  });
});
