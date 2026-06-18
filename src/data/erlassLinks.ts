import type { Kanton } from '../types/legal';

// ─── Amtliche Links der zitierten kantonalen Kosten-Erlasse ─────────────────
// Anordnung David 6.6.2026 («verlinke kantonale gesetzesnormen»). Quelle:
// Verlinkungs-Recherche 6.6.2026 — jede URL am amtlichen Portal geprüft
// (Status 200 + Titel; HTML vor PDF; lexfind nur als Fallback UR/SZ).
// SH-Gerichtskosten: Tiefenerfassung 6.6.2026 — Justizgesetz SHR 173.200
// (Art. 81–87, Fassung 1.5.2026); die «Kostenverordnung 2003» war Fehlzuordnung.

export interface ErlassLinks { schlichtung: string; gericht: string | null }

export const ERLASS_LINKS: Record<Kanton, ErlassLinks> = {
  ZH: { schlichtung: 'https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/erlass-211_11-2010_09_08-2011_01_01-087.html', gericht: 'https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/erlass-211_11-2010_09_08-2011_01_01-087.html' },
  BE: { schlichtung: 'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12', gericht: 'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12' },
  LU: { schlichtung: 'https://srl.lu.ch/app/de/texts_of_law/265', gericht: 'https://srl.lu.ch/app/de/texts_of_law/265' },
  UR: { schlichtung: 'https://www.lexfind.ch/tolv/223462/de', gericht: 'https://www.lexfind.ch/tolv/223462/de' },
  SZ: { schlichtung: 'https://www.lexfind.ch/tolv/81645/de', gericht: 'https://www.lexfind.ch/tolv/81645/de' },
  OW: { schlichtung: 'https://gdb.ow.ch/app/de/texts_of_law/134.15', gericht: 'https://gdb.ow.ch/app/de/texts_of_law/134.15' },
  NW: { schlichtung: 'https://gesetze.nw.ch/app/de/texts_of_law/261.2', gericht: 'https://gesetze.nw.ch/app/de/texts_of_law/261.2' },
  GL: { schlichtung: 'https://gesetze.gl.ch/app/de/texts_of_law/III-A.5', gericht: 'https://gesetze.gl.ch/app/de/texts_of_law/III-A.5' },
  ZG: { schlichtung: 'https://bgs.zg.ch/app/de/texts_of_law/161.7', gericht: 'https://bgs.zg.ch/app/de/texts_of_law/161.7' },
  FR: { schlichtung: 'https://bdlf.fr.ch/app/de/texts_of_law/130.11', gericht: 'https://bdlf.fr.ch/app/de/texts_of_law/130.11' },
  SO: { schlichtung: 'https://bgs.so.ch/app/de/texts_of_law/615.11', gericht: 'https://bgs.so.ch/app/de/texts_of_law/615.11' },
  BS: { schlichtung: 'https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/154.810', gericht: 'https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/154.810' },
  BL: { schlichtung: 'https://bl.clex.ch/app/de/texts_of_law/170.31', gericht: 'https://bl.clex.ch/app/de/texts_of_law/170.31' },
  SH: { schlichtung: 'https://rechtsbuch.sh.ch/app/de/texts_of_law/173.200', gericht: 'https://rechtsbuch.sh.ch/app/de/texts_of_law/173.200' },
  AR: { schlichtung: 'https://ar.clex.ch/app/de/texts_of_law/233.3', gericht: 'https://ar.clex.ch/app/de/texts_of_law/233.3' },
  AI: { schlichtung: 'https://ai.clex.ch/app/de/texts_of_law/173.810', gericht: 'https://ai.clex.ch/app/de/texts_of_law/173.810' },
  SG: { schlichtung: 'https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/941.12', gericht: 'https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/941.12' },
  GR: { schlichtung: 'https://www.gr-lex.gr.ch/app/de/texts_of_law/320.210', gericht: 'https://www.gr-lex.gr.ch/app/de/texts_of_law/320.210' },
  AG: { schlichtung: 'https://gesetzessammlungen.ag.ch/app/de/texts_of_law/662.110', gericht: 'https://gesetzessammlungen.ag.ch/app/de/texts_of_law/662.110' },
  TG: { schlichtung: 'https://www.rechtsbuch.tg.ch/app/de/texts_of_law/638.1', gericht: 'https://www.rechtsbuch.tg.ch/app/de/texts_of_law/638.1' },
  TI: { schlichtung: 'https://m3.ti.ch/CAN/RLeggi/public/raccolta-leggi/legge/num/137', gericht: 'https://m3.ti.ch/CAN/RLeggi/public/raccolta-leggi/legge/num/137' },
  VD: { schlichtung: 'https://prestations.vd.ch/pub/blv-publication/actes/consolide/270.11.5', gericht: 'https://prestations.vd.ch/pub/blv-publication/actes/consolide/270.11.5' },
  VS: { schlichtung: 'https://lex.vs.ch/app/fr/texts_of_law/173.8', gericht: 'https://lex.vs.ch/app/fr/texts_of_law/173.8' },
  NE: { schlichtung: 'https://rsn.ne.ch/DATA/program/books/RSN2024/20245/htm/164.1.htm', gericht: 'https://rsn.ne.ch/DATA/program/books/RSN2024/20245/htm/164.1.htm' },
  GE: { schlichtung: 'https://silgeneve.ch/legis/data/rsg_e1_05p10.htm', gericht: 'https://silgeneve.ch/legis/data/rsg_e1_05p10.htm' },
  JU: { schlichtung: 'https://rsju.jura.ch/fr/viewdocument.html?idn=20021&id=34172', gericht: 'https://rsju.jura.ch/fr/viewdocument.html?idn=20021&id=34172' },
};

/** GebV SchKG (SR 281.35) — Fedlex, geltende Fassung. */
export const GEBV_SCHKG_URL = 'https://www.fedlex.admin.ch/eli/cc/1996/2937_2937_2937/de';
