// ─── Amtlicher Gerichts-Zitierer (BGE / BGer) ───────────────────────────────
//
// Deterministischer Formatierer für die Fundstellen bundesgerichtlicher
// Entscheide nach der Plattform-Zitierkonvention (SSoT src/lib/konventionen.ts,
// Deutschschweizer Praxis):
//   · BGE:  «BGE 140 III 409 E. 4.3»   (amtliche Sammlung: Band · Teil · Seite)
//   · BGer: «BGer 5A_691/2023 vom 13. August 2024 E. 2.1»  (Datum ausgeschrieben)
//
// §2/§8: reiner STRUKTUR-Formatierer. Der Zitierer prüft die Form der Eingabe
// (Sammlungsteil, Geschäftsnummer-Muster, gültiges Datum), er PRÜFT NICHT, ob
// der Entscheid existiert oder was er sagt — das ist keine Recherche und keine
// inhaltliche Aussage (grenzwertig, ROADMAP W2·7: «statutes[] = genannt, nicht
// einschlägig»). Kein Netz, kein LLM, keine Schätzung.

const MONATE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
] as const;

// Die Teile der Amtlichen Sammlung der BGE-Leitentscheide: fünf Hauptteile
// (I Verfassungsrecht · II Verwaltungs-/Völkerrecht · III Zivilrecht/SchKG ·
// IV Strafrecht · V Sozialversicherungsrecht) plus die historische Fein-
// unterteilung Ia/Ib (z. B. BGE 100 Ia 305). Wortlaut-neutrale, deterministische Menge.
export const BGE_TEILE = ['I', 'Ia', 'Ib', 'II', 'III', 'IV', 'V'] as const;
export type BgeTeil = (typeof BGE_TEILE)[number];

export type GerichtszitatInput =
  | {
      typ: 'bge';
      band: string;        // Sammlungsband (positive Ganzzahl, z. B. «140»)
      teil: string;        // Sammlungsteil (BGE_TEILE)
      seite: string;       // Anfangsseite (positive Ganzzahl, z. B. «409»)
      erwaegung?: string;  // optional, z. B. «4.3» → « E. 4.3»
    }
  | {
      typ: 'bger';
      aktenzeichen: string; // Geschäftsnummer, z. B. «5A_691/2023»
      datum: string;        // ISO yyyy-MM-dd (Urteilsdatum)
      erwaegung?: string;
    };

export type GerichtszitatErgebnis = {
  status: 'ok' | 'unzulaessig';
  /** Plattform-Kurzform (Zitier-SSoT). null bei unzulässiger Eingabe. */
  zitat: string | null;
  /** BGer zusätzlich in der amtlichen Langform «Urteil des Bundesgerichts …». */
  langform?: string;
  fehler: string[];
  hinweise: string[];
};

// Geschäftsnummer des Bundesgerichts: Abteilungscode (eine Ziffer + 1–2
// Grossbuchstaben, z. B. 4A, 5A, 6B, 1C, 9C, 5D, 4F) · «_» · laufende Nummer
// · «/» · vierstelliges Jahr. Beispiel: 5A_691/2023, 4A_123/2025, 1C_45/2024.
const AKTENZEICHEN_RE = /^\d[A-Z]{1,2}_\d+\/\d{4}$/;
// Erwägungsziffer: Zahl, optional durch Punkte/Halbgeviert gegliedert, optional
// mit angehängtem Kleinbuchstaben (z. B. «2», «4.3», «2.1.3», «5a», «3.2-3.4»).
const ERWAEGUNG_RE = /^\d+(?:[.–-]\d+)*[a-z]?$/;

const istGanzzahl = (s: string): boolean => /^\d+$/.test(s.trim()) && Number(s.trim()) > 0;

function istGueltigesIsoDatum(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [j, m, t] = v.split('-').map(Number);
  const d = new Date(Date.UTC(j, m - 1, t));
  return d.getUTCFullYear() === j && d.getUTCMonth() === m - 1 && d.getUTCDate() === t;
}

function datumLang(iso: string): string {
  const [j, m, t] = iso.split('-').map(Number);
  return `${t}. ${MONATE[m - 1]} ${j}`;
}

function erwaegungZusatz(erwaegung: string | undefined, fehler: string[]): string {
  const roh = (erwaegung ?? '').trim();
  if (!roh) return '';
  if (!ERWAEGUNG_RE.test(roh)) {
    fehler.push('Die Erwägungsangabe ist ungültig – erwartet wird eine Ziffer wie «4.3» oder «2.1» (leer lassen, wenn keine).');
    return '';
  }
  return ` E. ${roh}`;
}

const HINWEIS_FORM =
  'Der Zitierer formatiert nur die eingegebene Fundstelle; er prüft nicht, ob der Entscheid existiert oder was er entscheidet. Fundstelle und Aussage sind an der amtlichen Quelle zu prüfen.';

// ─── Hauptfunktion ──────────────────────────────────────────────────────────

export function formatiereGerichtszitat(input: GerichtszitatInput): GerichtszitatErgebnis {
  const fehler: string[] = [];
  const hinweise: string[] = [HINWEIS_FORM];

  if (input.typ === 'bge') {
    const band = input.band.trim();
    const teil = input.teil.trim();
    const seite = input.seite.trim();
    if (!istGanzzahl(band)) fehler.push('Der Band der Amtlichen Sammlung muss eine positive Ganzzahl sein (z. B. «140»).');
    if (!(BGE_TEILE as readonly string[]).includes(teil)) {
      fehler.push(`Der Sammlungsteil muss einer von ${BGE_TEILE.join(', ')} sein (I Verfassungs-, II Verwaltungs-/Völkerrecht, III Zivil-/SchKG-, IV Straf-, V Sozialversicherungsrecht).`);
    }
    if (!istGanzzahl(seite)) fehler.push('Die Anfangsseite muss eine positive Ganzzahl sein (z. B. «409»).');
    const erw = erwaegungZusatz(input.erwaegung, fehler);
    if (fehler.length > 0) return { status: 'unzulaessig', zitat: null, fehler, hinweise };
    hinweise.push('BGE zitieren nur die Amtliche Sammlung der Leitentscheide; nicht publizierte Entscheide werden als «BGer …» mit Geschäftsnummer und Datum zitiert.');
    return { status: 'ok', zitat: `BGE ${band} ${teil} ${seite}${erw}`, fehler, hinweise };
  }

  // typ === 'bger'
  const az = input.aktenzeichen.trim();
  if (!AKTENZEICHEN_RE.test(az)) {
    fehler.push('Die Geschäftsnummer ist ungültig – erwartet wird das Muster «5A_691/2023» (Abteilungscode · Nummer · Jahr).');
  }
  if (!istGueltigesIsoDatum(input.datum)) {
    fehler.push('Das Urteilsdatum ist ungültig – erwartet wird ein Kalenderdatum (Tag/Monat/Jahr).');
  }
  const erw = erwaegungZusatz(input.erwaegung, fehler);
  if (fehler.length > 0) return { status: 'unzulaessig', zitat: null, fehler, hinweise };
  const lang = datumLang(input.datum);
  hinweise.push('Eine erst später zugeteilte BGE-Nummer ersetzt die Geschäftsnummer nicht – bei amtlicher Publikation zusätzlich als «BGE …» zitieren.');
  return {
    status: 'ok',
    zitat: `BGer ${az} vom ${lang}${erw}`,
    langform: `Urteil des Bundesgerichts ${az} vom ${lang}${erw}`,
    fehler,
    hinweise,
  };
}
