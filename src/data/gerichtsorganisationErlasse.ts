import type { Kanton } from '../types/legal';

// ─── Kantonale Gerichtsorganisations-Erlasse (GOG/JusG/GerG/LOJ …) ──────────
// Auftrag David 10.6.2026: «bei allen Eingaben auch direkt mit direktlink die
// entsprechende stelle im gerichtsorganisationsgesetz oder wie es je kanton
// heisst». Quelle: bibliothek/behoerden/gog-gerichtsorganisation-kantone.md
// (zweifach geprüft 5.6.2026); URLs am 10.6.2026 je einzeln per HTTP
// verifiziert (amtliche Portale, LexWork-Muster bzw. zhlex/silgeneve/rsn/
// rsju/m3.ti.ch). SZ: kein verifizierbarer amtlicher Direktlink gefunden
// (SRSZ-Portal nicht maschinell erreichbar) — Eintrag ohne url, die UI
// zeigt dann nur die Erlass-Angabe (§8: kein Link auf Unverifiziertes).
// Artikel-genaue Anker sind auf den kantonalen Portalen nicht stabil
// adressierbar — der Link führt auf den Erlass, die Artikel-Angabe der
// konkreten Behörde liefert das GOG-Dossier (Folgearbeit nach Abnahme).

export interface GerichtsErlass {
  /** Amtliche Kurzbezeichnung, z. B. «GOG», «JusG», «LOJ». */
  abk: string;
  titel: string;
  /** Systematische Nummer der kantonalen Sammlung, z. B. «LS 211.1». */
  nummer: string;
  /** Amtliche Erlass-Seite (HTTP-verifiziert 10.6.2026); fehlt bei SZ. */
  url?: string;
}

export const GERICHTSORGANISATION_ERLASSE: Record<Kanton, GerichtsErlass> = {
  ZH: { abk: 'GOG', titel: 'Gesetz über die Gerichts- und Behördenorganisation im Zivil- und Strafprozess', nummer: 'LS 211.1', url: 'https://www.zhlex.zh.ch/Erlass.html?Open&Ordnr=211.1' },
  BE: { abk: 'GSOG', titel: 'Gesetz über die Organisation der Gerichtsbehörden und der Staatsanwaltschaft', nummer: 'BSG 161.1', url: 'https://www.belex.sites.be.ch/app/de/texts_of_law/161.1' },
  LU: { abk: 'JusG', titel: 'Justizgesetz', nummer: 'SRL 260', url: 'https://srl.lu.ch/app/de/texts_of_law/260' },
  UR: { abk: 'GOG', titel: 'Gesetz über die Organisation der richterlichen Behörden', nummer: 'RB 2.3221', url: 'https://rechtsbuch.ur.ch/app/de/texts_of_law/2.3221' },
  SZ: { abk: 'JG', titel: 'Justizgesetz', nummer: 'SRSZ 231.110' },
  OW: { abk: 'GOG', titel: 'Gesetz über die Gerichtsorganisation', nummer: 'GDB 134.1', url: 'https://gdb.ow.ch/app/de/texts_of_law/134.1' },
  NW: { abk: 'GerG', titel: 'Gesetz über die Gerichte und die Justizbehörden (Gerichtsgesetz)', nummer: 'NG 261.1', url: 'https://gesetze.nw.ch/app/de/texts_of_law/261.1' },
  GL: { abk: 'GOG', titel: 'Gerichtsorganisationsgesetz', nummer: 'GS III A/2', url: 'https://gesetze.gl.ch/app/de/texts_of_law/III%20A/2' },
  ZG: { abk: 'GOG', titel: 'Gesetz über die Organisation der Zivil- und Strafrechtspflege', nummer: 'BGS 161.1', url: 'https://bgs.zg.ch/app/de/texts_of_law/161.1' },
  FR: { abk: 'JG', titel: 'Justizgesetz (Loi sur la justice)', nummer: 'SGF 130.1', url: 'https://bdlf.fr.ch/app/de/texts_of_law/130.1' },
  SO: { abk: 'GO', titel: 'Gesetz über die Gerichtsorganisation', nummer: 'BGS 125.12', url: 'https://bgs.so.ch/app/de/texts_of_law/125.12' },
  BS: { abk: 'GOG', titel: 'Gesetz betreffend die Organisation der Gerichte und der Staatsanwaltschaft', nummer: 'SG 154.100', url: 'https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/154.100' },
  BL: { abk: 'GOG', titel: 'Gesetz über die Organisation der Gerichte', nummer: 'SGS 170', url: 'https://bl.clex.ch/app/de/texts_of_law/170' },
  SH: { abk: 'JG', titel: 'Justizgesetz', nummer: 'SHR 173.200', url: 'https://rechtsbuch.sh.ch/app/de/texts_of_law/173.200' },
  AR: { abk: 'JG', titel: 'Justizgesetz', nummer: 'bGS 145.31', url: 'https://ar.clex.ch/app/de/texts_of_law/145.31' },
  AI: { abk: 'GOG', titel: 'Gerichtsorganisationsgesetz', nummer: 'GS 173.000', url: 'https://ai.clex.ch/app/de/texts_of_law/173.000' },
  SG: { abk: 'GerG', titel: 'Gerichtsgesetz', nummer: 'sGS 941.1', url: 'https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/941.1' },
  GR: { abk: 'GOG', titel: 'Gerichtsorganisationsgesetz', nummer: 'BR 173.000', url: 'https://www.gr-lex.gr.ch/app/de/texts_of_law/173.000' },
  AG: { abk: 'GOG', titel: 'Gerichtsorganisationsgesetz', nummer: 'SAR 155.200', url: 'https://gesetzessammlungen.ag.ch/app/de/texts_of_law/155.200' },
  TG: { abk: 'ZSRG', titel: 'Gesetz über die Zivil- und Strafrechtspflege', nummer: 'RB 271.1', url: 'https://www.rechtsbuch.tg.ch/app/de/texts_of_law/271.1' },
  TI: { abk: 'LOG', titel: 'Legge sull’organizzazione giudiziaria', nummer: 'RL 177.100', url: 'https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/7343' },
  VD: { abk: 'LOJV', titel: 'Loi d’organisation judiciaire', nummer: 'RSV 173.01', url: 'https://www.lexfind.ch/tolv/183260/fr' },
  VS: { abk: 'LOJ', titel: 'Loi sur l’organisation de la Justice / Gesetz über die Organisation der Justiz', nummer: 'RS 173.1', url: 'https://lex.vs.ch/app/fr/texts_of_law/173.1' },
  NE: { abk: 'OJN', titel: 'Loi d’organisation judiciaire neuchâteloise', nummer: 'RSN 161.1', url: 'https://rsn.ne.ch/DATA/program/books/RSN2017/20171/htm/1611.htm' },
  GE: { abk: 'LOJ', titel: 'Loi sur l’organisation judiciaire', nummer: 'rsGE E 2 05', url: 'https://silgeneve.ch/legis/data/rsg_e2_05.htm' },
  JU: { abk: 'LOJ', titel: 'Loi d’organisation judiciaire', nummer: 'RSJU 181.1', url: 'https://rsju.jura.ch/fr/viewdocument.html?idn=20024&id=36876' },
};

export function gerichtsErlass(kanton: Kanton): GerichtsErlass {
  return GERICHTSORGANISATION_ERLASSE[kanton];
}
