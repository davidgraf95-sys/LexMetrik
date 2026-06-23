// ─── Systematik des Bundesrechts (Auftrag David 20.6.2026) ──────────────────
//
// Eine FUNKTIONALE Gliederung statt der reinen SR-Nummernfolge: vom Fundament
// (Verfassung) über das Verhältnis Bürger↔Bürger (Privatrecht + dessen
// Durchsetzung) und Bürger↔Staat (Verwaltungsrecht) bis zum internationalen
// Rahmen. Vorbild: Davids «Systematik des Rechts».
//
// Reine ANZEIGE-Ordnung (kein Norminhalt, §7 unberührt): jede Untergruppe
// referenziert bestehende Register-Erlasse über ihren `key`. Erlasse, die hier
// (noch) nicht zugeordnet sind, fallen in der Gesetze-Seite in «Weitere
// Erlasse» — so geht nie ein Eintrag verloren. Praktikabilität: die geläufigen
// Leitgesetze stehen in den oberen Kategorien/Gruppen; selteneres weiter unten.

export interface SystematikGruppe {
  id: string;
  titel: string;
  /** Register-Keys (UPPERCASE wie in register.ts) in Anzeige-Reihenfolge. */
  keys: string[];
}

export interface SystematikKategorie {
  nr: string;        // '01' …
  id: string;
  titel: string;
  lede: string;
  /** Praktikabilität: die geläufigsten Kategorien sind anfangs offen. */
  standardOffen?: boolean;
  gruppen: SystematikGruppe[];
}

export const SYSTEMATIK: SystematikKategorie[] = [
  {
    nr: '01', id: 'staat', titel: 'Staats- und Verfassungsrecht',
    lede: 'Das Fundament der Rechtsordnung — alles Übrige fusst auf der Bundesverfassung.',
    gruppen: [
      { id: 'verfassung', titel: 'Verfassung & Bundesorgane', keys: ['BV', 'PARLG', 'RVOG', 'BPR', 'BGG', 'BGERR'] },
    ],
  },
  {
    nr: '02', id: 'privatrecht', titel: 'Privatrecht',
    lede: 'Das Verhältnis Bürger ↔ Bürger — Zivilgesetzbuch, Obligationenrecht und die privatrechtlichen Nebenerlasse.',
    standardOffen: true,
    gruppen: [
      { id: 'zgb', titel: 'Zivilgesetzbuch (ZGB) & Grundbuch', keys: ['ZGB', 'ZSTV', 'GBV'] },
      { id: 'or', titel: 'Obligationenrecht (OR) & Handelsregister', keys: ['OR', 'VMWG', 'HREGV', 'GEBV_HREG', 'FUSG'] },
      { id: 'ip', titel: 'Immaterialgüter & Wettbewerb', keys: ['URG', 'PATG', 'MSCHG', 'DESG', 'SORTG', 'UWG', 'KG'] },
      { id: 'neben', titel: 'Internationales Privatrecht & weitere Erlasse', keys: ['IPRG', 'VVG', 'DSG', 'DSV', 'KKG', 'PRHG', 'PRG', 'BEG', 'PARTG', 'BGBB'] },
    ],
  },
  {
    nr: '03', id: 'zivilverfahren', titel: 'Zivilprozess- und Zwangsvollstreckungsrecht',
    lede: 'Die Durchsetzung des Privatrechts — Zivilprozess und Schuldbetreibung/Konkurs.',
    standardOffen: true,
    gruppen: [
      { id: 'zpo', titel: 'Zivilprozess (ZPO)', keys: ['ZPO'] },
      { id: 'schkg', titel: 'Schuldbetreibung & Konkurs (SchKG)', keys: ['SCHKG', 'GEBV_SCHKG'] },
    ],
  },
  {
    nr: '04', id: 'straf', titel: 'Strafrecht und Strafverfahren',
    lede: 'Der staatliche Sanktionsanspruch — materielles Strafrecht, Strafprozess und das Nebenstrafrecht.',
    standardOffen: true,
    gruppen: [
      { id: 'stgb', titel: 'Strafrecht (StGB)', keys: ['STGB'] },
      { id: 'stpo', titel: 'Strafverfahren', keys: ['STPO', 'JSTPO', 'JSTG'] },
      { id: 'neben', titel: 'Neben- & Militärstrafrecht, Rechtshilfe', keys: ['BETMG', 'VSTRR', 'IRSG', 'MSTG', 'MSTP', 'MG'] },
    ],
  },
  {
    nr: '05', id: 'verwaltung', titel: 'Verwaltungsrecht',
    lede: 'Das Verhältnis Bürger ↔ Staat — der praktisch umfangreichste Ast: Verfahren, Steuern, Sozialversicherung, Migration, Bau/Umwelt, Finanzmarkt.',
    gruppen: [
      { id: 'verfahren', titel: 'Verwaltungsverfahren & Rechtspflege', keys: ['VWVG', 'VGG', 'VG', 'BGOE'] },
      { id: 'steuern', titel: 'Steuern & Abgaben', keys: ['DBG', 'STHG', 'MWSTG', 'MWSTV', 'VSTG', 'VSTV', 'STG'] },
      { id: 'sozial', titel: 'Sozialversicherung', keys: ['ATSG', 'ATSV', 'AHVG', 'AHVV', 'IVG', 'IVV', 'ELG', 'ELV', 'BVG', 'BVV_2', 'UVG', 'UVV', 'MVG', 'FAMZG', 'KVG', 'KVV', 'KLV', 'EOG', 'AVIG', 'AVIV'] },
      { id: 'migration', titel: 'Migration & Gleichstellung', keys: ['AIG', 'VZAE', 'ASYLG', 'BUEG', 'GLG'] },
      { id: 'umwelt', titel: 'Raumplanung, Bau & Umwelt', keys: ['RPG', 'USG', 'GSCHG', 'NHG', 'WAG', 'ENG', 'CO2_GESETZ'] },
      { id: 'wirtschaft', titel: 'Wirtschaft & Finanzmarkt', keys: ['BANKG', 'KAG', 'FINMAG', 'FINIG', 'VAG', 'FIDLEG', 'GWG', 'BEWG'] },
      { id: 'gesundheit', titel: 'Gesundheit & Lebensmittel', keys: ['HMG', 'EPG', 'TXG', 'LMG'] },
      { id: 'sektoren', titel: 'Beschaffung, Verkehr & Kommunikation', keys: ['BOEB', 'SVG', 'VRV', 'VZV', 'SSV', 'LFG', 'EBG', 'FMG'] },
      { id: 'arbeit', titel: 'Arbeit, Bildung & Anwaltsrecht', keys: ['ARG', 'BBG', 'BGFA'] },
    ],
  },
  {
    nr: '06', id: 'voelker', titel: 'Völker- und Europarecht',
    lede: 'Der internationale Rahmen — wirkt über Querverweise (EMRK, LugÜ u. a.) in die nationalen Äste hinein.',
    gruppen: [
      { id: 'menschenrechte', titel: 'Menschenrechte', keys: ['EMRK', 'UNO_PAKT_II'] },
      { id: 'international', titel: 'Internationales Verfahren & Vertragsrecht', keys: ['LUGUE', 'VRK'] },
    ],
  },
];

// ─── Kantonale Systematik (Sachgebiets-Gliederung nach systematischer Nummer) ──
//
// Ein kantonaler Vollkorpus (z.B. BS 859 Erlasse) wird nach der OFFIZIELLEN
// systematischen Nummer gegliedert — so, wie die amtliche Systematische
// Rechtssammlung des Kantons aufgebaut ist. Top-Level = führende Ziffer der
// Nummer («640.100»→'6', «BSG 154.21»→'1'). Das ist deterministisch (§2; aus der
// Nummer abgeleitet, KEINE Titel-Heuristik) und vollständig (jeder Erlass trägt
// eine Nummer). Reine Anzeige-Ordnung (§3), kein Norminhalt.
//
// Die Sachgebiets-TITEL je Kanton stammen aus der amtlichen Systematik und sind
// verifiziert (bibliothek/recherche/kantons-systematik-labels.md, §1/§7). Fehlt
// ein Titel, zeigt die UI ehrlich «Bereich N» statt eines geratenen Sachgebiets
// (§8). Kantone ohne Dezimalschema (z.B. GL: römisch «III B/7/1») bekommen bei
// Bedarf eine eigene Extraktionsregel; ohne Regel greift der neutrale Fallback.

/** Ein Sachgebiet (Knoten des amtlichen Systematik-Baums). */
export interface Sachgebiet { nummer: string; name: string; }

/** Amtliche Systematik eines Kantons (aus /normtext/kanton-systematik.json,
 *  erzeugt von scripts/normtext/kanton-systematik-run.ts): Top-Sachgebiete mit
 *  ihren Untergruppen (2. Ebene) + Index jedes Baum-Knotens (nur Ziffern) →
 *  [Top-Nummer, Untergruppe-Nummer] seiner Vorfahren. */
export interface KantonSystematik {
  roots: Array<Sachgebiet & { kinder: Sachgebiet[] }>;
  index: Record<string, [string, string]>;
}

const nurZiffern = (s: string): string => s.replace(/\D/g, '');

/**
 * Ordnet einen Erlass über Längster-Präfix-Match im amtlichen Systematik-Baum
 * seinem Top-Sachgebiet UND seiner Untergruppe (2. Ebene) zu. Deterministisch
 * (§2). Korrekt auch bei abweichenden Schemata (AI Hunderter, UR 10/20/…, ZG
 * +10), weil der Baum die echte Hierarchie liefert. Neutraler Fallback (§8) auf
 * die führende Ziffer, wenn keine Daten vorliegen oder die Nummer nicht greift.
 */
export function sachgruppe(
  sys: KantonSystematik | undefined,
  sr: string | null | undefined,
): { top: string; sub: string } {
  const d = nurZiffern(sr ?? '');
  if (sys && d) {
    for (let l = d.length; l >= 1; l--) {
      const treffer = sys.index[d.slice(0, l)];
      if (treffer !== undefined) return { top: treffer[0], sub: treffer[1] };
    }
  }
  return { top: d ? d[0] : '~', sub: '' };
}

/** Anzeige-Titel eines Top-Sachgebiets (amtlich, sonst ehrlicher Fallback, §8). */
export function topTitel(sys: KantonSystematik | undefined, top: string): string {
  const r = sys?.roots.find((x) => x.nummer === top);
  if (r) return r.name;
  return top === '~' ? 'Ohne Systematik-Nummer' : `Bereich ${top}`;
}

/** Anzeige-Titel einer Untergruppe (innerhalb eines Top-Sachgebiets). */
export function subTitel(sys: KantonSystematik | undefined, top: string, sub: string): string {
  const k = sys?.roots.find((x) => x.nummer === top)?.kinder.find((c) => c.nummer === sub);
  return k ? k.name : '';
}

/** Vergleichsfunktion für die Anzeige-Reihenfolge der Top-Sachgebiete (amtliche
 *  Baum-Reihenfolge; unbekannte/neutrale Schlüssel hinten). */
export function sachgebietRang(sys: KantonSystematik | undefined): (top: string) => number {
  const order = new Map((sys?.roots ?? []).map((r, i) => [r.nummer, i]));
  return (s) => order.get(s) ?? 999;
}

/** Vergleichsfunktion für die Reihenfolge der Untergruppen eines Top-Sachgebiets. */
export function untergruppeRang(sys: KantonSystematik | undefined, top: string): (sub: string) => number {
  const kinder = sys?.roots.find((x) => x.nummer === top)?.kinder ?? [];
  const order = new Map(kinder.map((k, i) => [k.nummer, i]));
  return (s) => (s === '' ? -1 : order.get(s) ?? 998);
}

/** Key → [Kategorie-id, Gruppen-id] für schnelle Zuordnung; mehrfach genannte
 *  Keys nehmen die ERSTE Nennung (Primär-Einordnung). */
export const SYSTEMATIK_VON_KEY: ReadonlyMap<string, { kat: string; gruppe: string }> = (() => {
  const m = new Map<string, { kat: string; gruppe: string }>();
  for (const k of SYSTEMATIK) for (const g of k.gruppen) for (const key of g.keys) {
    if (!m.has(key)) m.set(key, { kat: k.id, gruppe: g.id });
  }
  return m;
})();
