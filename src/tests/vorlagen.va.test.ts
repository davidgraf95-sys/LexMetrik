import { describe, it, expect } from 'vitest';
import {
  VA_SCHEMA, vaZusammenstellen, pruefeVaGates,
  type VaAntworten,
} from '../lib/vorlagen/vorsorgeauftrag';
import { NOTARIATE, NOTARIAT_SYSTEM_LABEL } from '../lib/notariate';
import { berechneBeurkundung } from '../lib/beurkundung';
import { KANTONE } from '../lib/kantone';
import { va } from './vorlagen.helfer';

// ─── Vorsorgeauftrag ─────────────────────────────────────────────────────────

describe('Vorlage Vorsorgeauftrag', () => {
  it('Grundfall: Identifikation, Beauftragte, drei Bereichs-Module, eigenhändige Schlussformel', () => {
    const r = vaZusammenstellen(va({}));
    expect(r.aufgenommen).toEqual(expect.arrayContaining([
      'V01_identifikation', 'V02_beauftragte', 'V04_personensorge', 'V05_vermoegenssorge',
      'V06_rechtsverkehr', 'V13_ersetzt', 'V14_schluss_eigenhaendig',
    ]));
    expect(r.aufgenommen).not.toContain('V14_schluss_beurkundung');
    // Fachänderung B7: der Grundfall trägt keinen Ort – die Schlusszeile beginnt
    // deshalb direkt mit dem Datum (früher: «den 04.06.2026» mit hängendem «den»).
    expect(r.dokument.absaetze.at(-1)!.text.startsWith('04.06.2026')).toBe(true);
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'V02b_beauftragteliste')!.text)
      .toContain('Personensorge, Vermögenssorge, Vertretung im Rechtsverkehr');
  });

  it('formMode beurkundet: Beurkundungs-Schluss statt Unterschriftszeile', () => {
    const r = vaZusammenstellen(va({ formMode: 'oeffentlich_beurkundet', datum: '' }));
    expect(r.aufgenommen).toContain('V14_schluss_beurkundung');
    expect(r.aufgenommen).not.toContain('V14_schluss_eigenhaendig');
    expect(r.dokument.absaetze.at(-1)!.text).toContain('Urkundsperson');
  });

  it('Liegenschaften-Modul erzwingt die Grundstück-Sondervollmacht (Art. 396 Abs. 3 OR)', () => {
    const ohne = vaZusammenstellen(va({}));
    expect(ohne.aufgenommen).not.toContain('V07_grundstueck');
    const mit = vaZusammenstellen(va({ module: { personensorge: [], vermoegenssorge: ['liegenschaften'], rechtsverkehr: [] } }));
    expect(mit.aufgenommen).toContain('V07_grundstueck');
    // W2·8/B4 (Befund V-3): Der Hinweis benennt neu den Wortlaut-Befund —
    // Art. 396 Abs. 3 OR deckt veräussern/belasten, der Erwerb bedarf keiner
    // besonderen Ermächtigung; Brücke ist Art. 365 Abs. 1 ZGB.
    expect(mit.protokoll.find((p) => p.bausteinId === 'V07_grundstueck')!.hinweis)
      .toContain('Art. 365 Abs. 1 ZGB');
  });

  it('Bereichs-Module erscheinen nur, wenn der Bereich auch übertragen ist', () => {
    const r = vaZusammenstellen(va({
      beauftragte: [{ name: 'Ben', typ: 'natuerlich', angaben: 'x', bereiche: ['vermoegenssorge'] }],
      module: { personensorge: ['wohnsituation'], vermoegenssorge: ['verwaltung'], rechtsverkehr: [] },
    }));
    expect(r.aufgenommen).toContain('V05_vermoegenssorge');
    expect(r.aufgenommen).not.toContain('V04_personensorge'); // Module gewählt, Bereich aber nicht übertragen
  });

  it('Entschädigungs-Varianten erzeugen die passende Klausel', () => {
    const pausch = vaZusammenstellen(va({ entschaedigung: 'pauschale', entschaedigungBetrag: 5000 }));
    expect(pausch.dokument.absaetze.find((x) => x.bausteinId === 'V11_entschaedigung')!.text).toContain('CHF 5000 pro Jahr');
    const keine = vaZusammenstellen(va({ entschaedigung: 'keine_angabe' }));
    expect(keine.aufgenommen).not.toContain('V11_entschaedigung');
  });

  it('Eligibility-Gate blockiert ohne Handlungsfähigkeits-Bestätigung (Art. 13 ZGB)', () => {
    const g = pruefeVaGates(va({ urteilsfaehigBestaetigt: false }));
    expect(g.blocker.some((b) => b.includes('Handlungsfähigkeit'))).toBe(true);
  });

  // W2·8/B4 (Befunde V-1/V-2): Die juristische Person ist für die
  // Personensorge KEIN Blocker mehr – Art. 360 Abs. 1 ZGB erlaubt sie
  // ausdrücklich. Medizin-Fall = Warnung (Lehre + Validierungsrisiko),
  // sonst = Hinweis.
  const jpMedizin = (h: string) => h.includes('medizinischen Massnahmen') && h.includes('Art. 370 Abs. 2 ZGB');
  const jpPersonensorge = (h: string) => h.includes('auch für die Personensorge zulässig');

  it('medizinische Vertretung durch juristische Person: Warnung, kein Blocker (Art. 360 Abs. 1 ZGB)', () => {
    const g = pruefeVaGates(va({
      beauftragte: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['personensorge'] }],
      module: { personensorge: ['medizin'], vermoegenssorge: [], rechtsverkehr: [] },
    }));
    expect(g.warnungen.some(jpMedizin)).toBe(true);
    expect(g.hinweise.some(jpPersonensorge)).toBe(false);
    expect(g.blocker).toEqual([]);
  });

  it('juristische Person für die Personensorge ohne Medizin-Modul: Hinweis, kein Blocker', () => {
    const g = pruefeVaGates(va({
      beauftragte: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['personensorge'] }],
      module: { personensorge: ['wohnsituation'], vermoegenssorge: [], rechtsverkehr: [] },
    }));
    expect(g.hinweise.some(jpPersonensorge)).toBe(true);
    expect(g.warnungen.some(jpMedizin)).toBe(false);
    expect(g.blocker).toEqual([]);
  });

  it('natürliche Person: weder Warnung noch Hinweis zur juristischen Person', () => {
    const g = pruefeVaGates(va({ module: { personensorge: ['medizin'], vermoegenssorge: [], rechtsverkehr: [] } }));
    expect(g.warnungen.some(jpMedizin)).toBe(false);
    expect(g.hinweise.some(jpPersonensorge)).toBe(false);
  });

  it('eigenhändige Form ohne Datum warnt (Art. 361 Abs. 2 ZGB), mit Datum nicht', () => {
    const ohne = pruefeVaGates(va({ datum: '' }));
    expect(ohne.warnungen.some((w) => w.includes('Ohne Datum ist der eigenhändige Vorsorgeauftrag ungültig'))).toBe(true);
    const mit = pruefeVaGates(va({}));
    expect(mit.warnungen.some((w) => w.includes('Ohne Datum'))).toBe(false);
    // Beurkundete Form: Ort/Datum entstehen erst vor der Urkundsperson
    const notariell = pruefeVaGates(va({ formMode: 'oeffentlich_beurkundet', datum: '' }));
    expect(notariell.warnungen.some((w) => w.includes('Ohne Datum'))).toBe(false);
  });

  it('Interessenkollisions-Hinweis, sobald ein Bereich übertragen ist (Art. 365 Abs. 2/3 ZGB)', () => {
    const g = pruefeVaGates(va({}));
    expect(g.hinweise.some((h) => h.includes('Art. 365 Abs. 3 ZGB') && h.includes('Art. 365 Abs. 2 ZGB'))).toBe(true);
    // Er ersetzt keinen bestehenden Hinweis
    expect(g.hinweise.some((h) => h.includes('Validierung'))).toBe(true);
    const ohneBereich = pruefeVaGates(va({ beauftragte: [] }));
    expect(ohneBereich.hinweise.some((h) => h.includes('Art. 365 Abs. 3 ZGB'))).toBe(false);
  });

  it('ohne beauftragte Person blockiert; KESB-Validierungs-Hinweis immer', () => {
    const g = pruefeVaGates(va({ beauftragte: [] }));
    expect(g.blocker.some((b) => b.includes('360'))).toBe(true);
    expect(g.hinweise.some((h) => h.includes('363'))).toBe(true);
  });

  it('jeder Baustein trägt Begründung und Norm', () => {
    VA_SCHEMA.bausteine.forEach((b) => {
      expect(b.begruendung.length, b.id).toBeGreaterThan(5);
      expect(b.norm, b.id).toBeTruthy();
    });
  });

  // ── W2·8 / F2: Einzel- ↔ Kollektivvertretung ───────────────────────────────

  const zweiBeauftragte = [
    { name: 'Ben Muster', typ: 'natuerlich' as const, angaben: 'geb. 01.01.1985', bereiche: ['personensorge' as const] },
    { name: 'Cara Muster', typ: 'natuerlich' as const, angaben: 'geb. 02.02.1987', bereiche: ['vermoegenssorge' as const] },
  ];

  it('zwei Beauftragte + Kollektivvertretung: V02d aufgenommen, V02c nicht', () => {
    const r = vaZusammenstellen(va({ beauftragte: zweiBeauftragte, vertretung: 'gemeinsam' }));
    expect(r.aufgenommen).toContain('V02d_gemeinsam');
    expect(r.aufgenommen).not.toContain('V02c_einzeln');
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'V02d_gemeinsam')!.text).toContain('nur gemeinsam');
  });

  it('zwei Beauftragte + Einzelvertretung (Default): V02c aufgenommen, V02d nicht', () => {
    const r = vaZusammenstellen(va({ beauftragte: zweiBeauftragte }));
    expect(r.aufgenommen).toContain('V02c_einzeln');
    expect(r.aufgenommen).not.toContain('V02d_gemeinsam');
    expect(r.protokoll.find((p) => p.bausteinId === 'V02c_einzeln')!.hinweis).toContain('nicht ausdrücklich');
  });

  it('nur eine beauftragte Person: keine Vertretungsklausel – unabhängig von der Wahl', () => {
    const einzeln = vaZusammenstellen(va({}));
    expect(einzeln.aufgenommen).not.toContain('V02c_einzeln');
    expect(einzeln.aufgenommen).not.toContain('V02d_gemeinsam');
    const gemeinsam = vaZusammenstellen(va({ vertretung: 'gemeinsam' }));
    expect(gemeinsam.aufgenommen).not.toContain('V02c_einzeln');
    expect(gemeinsam.aufgenommen).not.toContain('V02d_gemeinsam');
  });

  // ── W2·8 / F1: Ersatzpersonen strukturell wie Hauptbeauftragte ─────────────

  it('juristische Ersatzperson für die Personensorge: Hinweis wie bei der Hauptbeauftragten, kein Blocker', () => {
    const g = pruefeVaGates(va({
      ersatzpersonen: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['personensorge'] }],
    }));
    expect(g.hinweise.some(jpPersonensorge)).toBe(true);
    expect(g.blocker).toEqual([]);
  });

  it('juristische Ersatzperson für die Personensorge + Medizin-Modul: Warnung (Ersatz ist mit erfasst)', () => {
    const g = pruefeVaGates(va({
      ersatzpersonen: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['personensorge'] }],
      module: { personensorge: ['medizin'], vermoegenssorge: [], rechtsverkehr: [] },
    }));
    expect(g.warnungen.some(jpMedizin)).toBe(true);
    expect(g.blocker).toEqual([]);
  });

  it('juristische Ersatzperson nur für die Vermögenssorge: keine Meldung zur juristischen Person', () => {
    const g = pruefeVaGates(va({
      ersatzpersonen: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['vermoegenssorge'] }],
    }));
    expect(g.hinweise.some(jpPersonensorge)).toBe(false);
    expect(g.warnungen.some(jpMedizin)).toBe(false);
  });

  it('juristische Ersatzperson ohne Bereichs-Wahl: Meldung, wenn Personensorge übertragen ist (implizit alle)', () => {
    const mitPersonensorge = pruefeVaGates(va({
      ersatzpersonen: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel' }],
    }));
    expect(mitPersonensorge.hinweise.some(jpPersonensorge)).toBe(true);
    // Gegenprobe: ohne übertragene Personensorge greift die Prüfung nicht
    const ohnePersonensorge = pruefeVaGates(va({
      beauftragte: [{ name: 'Ben', typ: 'natuerlich', angaben: 'x', bereiche: ['vermoegenssorge'] }],
      ersatzpersonen: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel' }],
    }));
    expect(ohnePersonensorge.hinweise.some(jpPersonensorge)).toBe(false);
  });

  it('fehlendes typ-Feld (Alt-Stand) wird wie «natuerlich» gelesen – keine Meldung aus dem Speicher', () => {
    const alt = { name: 'D', angaben: 'geb. 1992' } as unknown as VaAntworten['ersatzpersonen'][number];
    const g = pruefeVaGates(va({ ersatzpersonen: [alt] }));
    expect(g.hinweise.some(jpPersonensorge)).toBe(false);
    expect(g.warnungen.some(jpMedizin)).toBe(false);
  });

  it('ersatzText: explizite Bereiche erscheinen im Satz, ohne Bereiche bleibt er unverändert', () => {
    const mit = vaZusammenstellen(va({
      ersatzpersonen: [{ name: 'D', typ: 'natuerlich', angaben: 'geb. 1992', bereiche: ['personensorge', 'vermoegenssorge'] }],
    }));
    const textMit = mit.dokument.absaetze.find((x) => x.bausteinId === 'V03_ersatz')!.text;
    expect(textMit).toContain('1. D (geb. 1992) für die Personensorge, die Vermögenssorge');
    const ohne = vaZusammenstellen(va({
      ersatzpersonen: [{ name: 'D', typ: 'natuerlich', angaben: 'geb. 1992' }],
    }));
    expect(ohne.dokument.absaetze.find((x) => x.bausteinId === 'V03_ersatz')!.text).toContain('1. D (geb. 1992).');
  });

  // ── W2·8 / B5: Gate-Hinweise normtreu (Restbefund aus B3/B4) ───────────────

  it('Liegenschaften-Hinweis nennt die Auftragsrecht-Brücke statt «umstritten» (Befund V-3)', () => {
    const g = pruefeVaGates(va({ module: { personensorge: [], vermoegenssorge: ['liegenschaften'], rechtsverkehr: [] } }));
    const h = g.hinweise.find((x) => x.startsWith('Liegenschaften gewählt:'));
    expect(h).toBeDefined();
    expect(h).toContain('Art. 396 Abs. 3 OR i.V.m. Art. 365 Abs. 1 ZGB');
    expect(h).toContain('der Erwerb bedarf keiner solchen');
    // Die frühere, den Rechtsstand verzeichnende Formulierung ist weg.
    expect(h).not.toContain('umstritten');
    // Deckungsgleich mit dem Baustein-Hinweis der Urkunde (§5: eine Aussage).
    const r = vaZusammenstellen(va({ module: { personensorge: [], vermoegenssorge: ['liegenschaften'], rechtsverkehr: [] } }));
    expect(r.protokoll.find((p) => p.bausteinId === 'V07_grundstueck')!.hinweis).toContain('Art. 365 Abs. 1 ZGB');
  });

  // W2·8 / Gegenprüfung B5 (Fachänderung, deklariert): Der Hinweis behauptete
  // die KESB-Festsetzung UNBEDINGT. Art. 366 Abs. 1 ZGB knüpft sie an zwei
  // alternative Voraussetzungen (Umfang der Aufgaben ODER üblicherweise
  // entgeltliche Leistungen) — die frühere Assertion auf «Art. 366 Abs. 1 und 2
  // ZGB» hätte den zu kategorischen Satz durchgelassen und wird ersetzt.
  it('Entschädigungs-Hinweis nennt die beiden Voraussetzungen von Art. 366 Abs. 1 ZGB (Befund B5)', () => {
    const g = pruefeVaGates(va({ entschaedigung: 'keine_angabe' }));
    const h = g.hinweise.find((x) => x.startsWith('Ohne Entschädigungsregelung'));
    expect(h).toBeDefined();
    expect(h).toContain('wenn dies nach dem Umfang der Aufgaben gerechtfertigt erscheint');
    expect(h).toContain('die Leistungen üblicherweise entgeltlich sind');
    expect(h).toContain('(Art. 366 Abs. 1 ZGB)');
    // W2·8 / Gegenprüfung Runde 2, L1: Der Massstab «angemessen» ist Teil der
    // Rechtsfolge von Abs. 1 und darf nicht weggelassen werden.
    expect(h).toContain('legt die KESB eine angemessene Entschädigung fest');
    // L2: «bei der Validierung» steht nicht in Art. 366 ZGB — die Norm nennt
    // keinen Zeitpunkt; die Zuschreibung an die Validierung (Art. 363) wäre
    // eine zweite, unbelegte Aussage.
    expect(h).not.toContain('bei der Validierung');
    // L3: Abs. 2 belastet Entschädigung UND notwendige Spesen — beides gehört
    // in den Anker, sonst liest sich der Satz als blosse Kostentragungsregel
    // für die Entschädigung.
    expect(h).toContain('Entschädigung und notwendige Spesen werden der auftraggebenden Person belastet (Abs. 2)');
    // Bei getroffener Regelung entfällt der Hinweis (Art. 366 greift nur ohne Anordnung).
    const mit = pruefeVaGates(va({ entschaedigung: 'unentgeltlich' }));
    expect(mit.hinweise.some((x) => x.startsWith('Ohne Entschädigungsregelung'))).toBe(false);
  });

  // ── W2·8 / Gegenprüfung: Befunde B2, B6, B7 ────────────────────────────────

  // B2: Die JP-Prüfung wertete Beauftragte, die im Dokument gar nie erscheinen.
  // Dokumentliste (vaZusammenstellen) und Ersatzpersonen filtern seit je auf
  // `name.trim()`; die Gate-Prüfung der Hauptbeauftragten tat es nicht — eine
  // Zeile «+ Beauftragte Person hinzufügen» mit Typ «juristisch» erzeugte damit
  // eine Warnung über eine Person, die nirgends steht.
  it('B2: Beauftragte ohne Namen lösen keine Meldung zur juristischen Person aus', () => {
    const mitLeerzeile = {
      beauftragte: [
        { name: 'Ben Muster', typ: 'natuerlich' as const, angaben: 'geb. 01.01.1985', bereiche: ['personensorge' as const] },
        { name: '   ', typ: 'juristisch' as const, angaben: '', bereiche: ['personensorge' as const] },
      ],
      module: { personensorge: ['medizin'], vermoegenssorge: [], rechtsverkehr: [] },
    };
    const g = pruefeVaGates(va(mitLeerzeile));
    expect(g.warnungen.some(jpMedizin)).toBe(false);
    expect(g.hinweise.some(jpPersonensorge)).toBe(false);
    // Der Beleg der Asymmetrie: die namenlose Zeile steht in keinem Absatz.
    const r = vaZusammenstellen(va(mitLeerzeile));
    expect(r.dokument.absaetze.filter((x) => x.bausteinId === 'V02b_beauftragteliste')).toHaveLength(1);
    // Gegenprobe: mit Namen greift die Warnung weiterhin.
    const mitName = pruefeVaGates(va({
      ...mitLeerzeile,
      beauftragte: [mitLeerzeile.beauftragte[0], { ...mitLeerzeile.beauftragte[1], name: 'Treuhand AG' }],
    }));
    expect(mitName.warnungen.some(jpMedizin)).toBe(true);
  });

  // B6: Anker-Präzision. V02c/V02d regeln die ART der Aufgabenerfüllung
  // (Art. 360 Abs. 2 ZGB — Umschreibung der Aufgaben und Weisungen), nicht die
  // Übertragung selbst (Abs. 1); konsistent mit V04b/V05b/V06b. V13_ersetzt
  // trägt beide Absätze: Abs. 1 den Widerruf in Errichtungsform, Abs. 3 die
  // Rechtsfolge «tritt an die Stelle des früheren».
  it('B6: Norm-Anker von V02c/V02d (Art. 360 Abs. 2) und V13_ersetzt (Art. 362 Abs. 1 und 3)', () => {
    const norm = (id: string) => VA_SCHEMA.bausteine.find((b) => b.id === id)!.norm;
    expect(norm('V02c_einzeln')).toBe('Art. 360 Abs. 2 ZGB');
    expect(norm('V02d_gemeinsam')).toBe('Art. 360 Abs. 2 ZGB');
    expect(norm('V13_ersetzt')).toBe('Art. 362 Abs. 1 und 3 ZGB');
    // Gegenprobe: die Übertragungs-Bausteine bleiben bei Abs. 1.
    expect(norm('V02_beauftragte')).toBe('Art. 360 Abs. 1 ZGB');
    expect(norm('V04_personensorge')).toBe('Art. 360 Abs. 1 ZGB');
  });

  // B7: Ohne Ort rendert die Schlusszeile kein hängendes «den».
  it('B7: ortDatumZeile — ohne Ort nur das Datum, mit Ort «Ort, den Datum»', () => {
    const zeile = (over: Partial<VaAntworten>) =>
      vaZusammenstellen(va(over)).dokument.absaetze
        .find((x) => x.bausteinId === 'V14_schluss_eigenhaendig')!.text.split('\n')[0];
    expect(zeile({ ort: undefined })).toBe('04.06.2026');
    expect(zeile({ ort: '   ' })).toBe('04.06.2026');
    expect(zeile({ ort: 'Basel' })).toBe('Basel, den 04.06.2026');
    // Fehlt auch das Datum, bleibt der Ausfüll-Strich – ohne «den», aber
    // beschriftet: W2·8 / Gegenprüfung Runde 2, B8. Der nackte Strich stand
    // unmittelbar über der Unterschriftslinie und war von ihr nicht zu
    // unterscheiden — im Abschreibe-Muster hätte die abschreibende Person das
    // Datum weglassen können, das nach Art. 361 Abs. 2 ZGB Gültigkeits-
    // erfordernis ist.
    expect(zeile({ ort: undefined, datum: '' })).toBe('Datum: ________');
    expect(zeile({ ort: 'Basel', datum: '' })).toBe('Basel, den ________');
  });

  // ── W2·8 / V9.5: Nebenfunde N1–N3 der Gegenprüfungs-Runde 3 ────────────────

  // N1: `datum` wurde an drei Stellen roh auf Wahrheit geprüft (Zweigwahl in
  // `ortDatumZeile`, Datums-Formatierung, Datums-Warnung in `pruefeVaGates`),
  // `ort` dagegen mit `.trim()`. Ein Datum aus reinem Whitespace war damit
  // «vorhanden»: die Schlusszeile zeigte statt «Datum: ________» eine LEERE
  // Zeile über der Unterschriftslinie (bzw. «Basel, den   »), und die
  // Art.-361-Abs.-2-Warnung blieb aus. Über die UI ist der Wert nicht
  // erzeugbar — die Engine ist gleichwohl die Wahrheit (§3), und ein
  // localStorage-Altstand oder Import kann ihn tragen.
  it('N1: Whitespace-Datum zählt wie kein Datum – Warnung und beschrifteter Strich', () => {
    const zeile = (over: Partial<VaAntworten>) =>
      vaZusammenstellen(va(over)).dokument.absaetze
        .find((x) => x.bausteinId === 'V14_schluss_eigenhaendig')!.text.split('\n')[0];
    expect(zeile({ ort: undefined, datum: '  ' })).toBe('Datum: ________');
    expect(zeile({ ort: 'Basel', datum: '  ' })).toBe('Basel, den ________');
    expect(zeile({ ort: undefined, datum: '\t\n ' })).toBe('Datum: ________');
    // Die Gültigkeits-Warnung des Art. 361 Abs. 2 ZGB greift ebenso.
    expect(pruefeVaGates(va({ datum: '  ' })).warnungen
      .some((w) => w.includes('Ohne Datum ist der eigenhändige Vorsorgeauftrag ungültig'))).toBe(true);
    // Gegenprobe: ein echtes Datum bleibt unberührt (auch mit Rand-Whitespace).
    expect(zeile({ ort: undefined, datum: ' 2026-06-04 ' })).toBe('04.06.2026');
    expect(pruefeVaGates(va({ datum: ' 2026-06-04 ' })).warnungen.some((w) => w.includes('Ohne Datum'))).toBe(false);
  });

  // N2: Die Begründung nannte «Ort/Datum und Unterschrift» als eigenhändige
  // Bestandteile. Art. 361 Abs. 2 ZGB verlangt den Ort NICHT (Snapshot
  // Stand 1.7.2026: «von Anfang bis Ende von Hand niederzuschreiben, zu
  // datieren und zu unterzeichnen»). Konsistent zur Kommentierung von
  // `ortDatumZeile`, die den Ort schon als nicht verlangt behandelt.
  it('N2: V14-Begründung nennt den Ort nicht als Formbestandteil (Art. 361 Abs. 2 ZGB)', () => {
    const b = VA_SCHEMA.bausteine.find((x) => x.id === 'V14_schluss_eigenhaendig')!.begruendung;
    expect(b).not.toContain('Ort/Datum');
    expect(b).toContain('Datum und Unterschrift');
    expect(b).toContain('Gültigkeitserfordernis');
    // Der Ort wird als fakultativ ausgewiesen, nicht verschwiegen.
    expect(b).toContain('Ortsangabe');
  });

  // N3: `ort: 'Basel,'` ergab «Basel,, den 15.06.2026» – der Anschluss «, den»
  // bringt das Komma bereits mit. Normalisiert werden NUR abschliessende
  // Kommas/Whitespace (andere Schlusszeichen wie «Basel.» bleiben stehen,
  // GP-Nebenfund a); der Ortsinhalt bleibt unangetastet.
  it('N3: abschliessende Kommas/Whitespace am Ort erzeugen kein Doppelkomma', () => {
    const zeile = (over: Partial<VaAntworten>) =>
      vaZusammenstellen(va(over)).dokument.absaetze
        .find((x) => x.bausteinId === 'V14_schluss_eigenhaendig')!.text.split('\n')[0];
    expect(zeile({ ort: 'Basel,' })).toBe('Basel, den 04.06.2026');
    expect(zeile({ ort: 'Basel , ' })).toBe('Basel, den 04.06.2026');
    expect(zeile({ ort: 'Basel,', datum: '' })).toBe('Basel, den ________');
    // Binnen-Kommas bleiben: der Ort wird nicht inhaltlich beschnitten.
    expect(zeile({ ort: 'Riehen, BS' })).toBe('Riehen, BS, den 04.06.2026');
    // Ein Ort, der nur aus Kommas/Whitespace besteht, ist kein Ort (B7-Zweig).
    expect(zeile({ ort: ' , ' })).toBe('04.06.2026');
  });

  // ── W2·8 / B5: SSoT-Verdrahtung Beurkundung (Befund F6) ────────────────────
  //
  // Die Vorlagen-Engine führt keinen eigenen Kantons-Katalog mehr. Der Beleg
  // dafür ist kein Text-Vergleich, sondern die Deckungsgleichheit der beiden
  // Stammdaten-Quellen, aus denen die UI den Hinweis speist: für jeden Kanton
  // muss ein Notariats-Eintrag existieren und die Beurkundungs-Engine ein
  // Ergebnis liefern (ok mit Norm+Stand ODER ehrliches «offen», nie leer).
  it('Beurkundungs-Hinweis speist sich aus den Stammdaten – für alle 26 Kantone auflösbar', () => {
    KANTONE.forEach((k) => {
      const n = NOTARIATE[k];
      expect(n?.stelle, k).toBeTruthy();
      expect(NOTARIAT_SYSTEM_LABEL[n.system], k).toBeTruthy();
      const r = berechneBeurkundung({ geschaeftsart: 'vorsorgeauftrag', kanton: k });
      if (r.status === 'ok') {
        expect(r.posten, k).not.toBeNull();
        expect(r.posten!.quelle.erlassName, k).toBeTruthy();
        expect(r.posten!.quelle.artikel, k).toBeTruthy();
        expect(r.posten!.quelle.stand, k).toBeTruthy();
      } else {
        expect(r.posten, k).toBeNull();
        expect(r.hinweise.length, k).toBeGreaterThan(0);
      }
    });
  });

  it('die drei belegten Abweichungen des gestrichenen Katalogs sind aufgelöst (TG/BE/SG)', () => {
    // TG: der alte Katalog behauptete «gemischtes System» – Stammdatum ist Amtsnotariat.
    expect(NOTARIATE.TG.system).toBe('amtsnotariat');
    // BE: alter Richtwert «ab ca. CHF 500» – der Tarif nennt ein Minimum von CHF 300.
    const be = berechneBeurkundung({ geschaeftsart: 'vorsorgeauftrag', kanton: 'BE' });
    expect(be.status).toBe('ok');
    expect(be.posten!.quelle.erlassNr).toBe('BSG 169.81');
    expect(be.posten!.ergebnis.deterministisch ? '' : be.posten!.ergebnis.hinweis).toContain('300');
    // SG: alter Richtwert «ca. CHF 400» – der Tarif nennt den Rahmen 110–1100.
    const sg = berechneBeurkundung({ geschaeftsart: 'vorsorgeauftrag', kanton: 'SG' });
    expect(sg.status).toBe('ok');
    expect(sg.posten!.ergebnis.deterministisch).toBe(false);
    expect(sg.posten!.ergebnis.deterministisch ? undefined : sg.posten!.ergebnis.vonChf).toBe(110);
    expect(sg.posten!.ergebnis.deterministisch ? undefined : sg.posten!.ergebnis.bisChf).toBe(1100);
  });
});
