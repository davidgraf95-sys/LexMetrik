import type { Phase } from '../lib/gruendungsunterlagen';
import type { PdfBanner } from '../lib/vorlagen/banner';
import type {
  AgBereich, AgVrZeichnungsArt, AgVertretungsZeichnungsArt, AgGruenderZeile,
  AgVrZeile, AgVertretungsZeile, AgSacheinlageZeile, AgVerrechnungZeile, AgVorteilZeile,
} from '../lib/vorlagen/gruendungAgDokumente';

// §6-Datei-Schlankheit (19.6.2026): module-level Konstanten, Hydrations-Helfer und
// Leer-Defaults aus VorlageAgGruendung.tsx ausgelagert (verhaltensneutral).

export const SCHRITTE = [
  { id: 'konstellation', label: 'Konstellation' },
  { id: 'gesellschaft', label: 'Gesellschaft & Statuten' },
  { id: 'kapital', label: 'Kapital & Einlagen' },
  { id: 'personen', label: 'Personen & Organe' },
  { id: 'weiteres', label: 'Domizil & Optionen' },
  { id: 'dokumente', label: 'Checkliste & Dokumente' },
] as const;

export const PHASEN: { id: Phase; titel: string; lead: string }[] = [
  { id: 'vorbereitung', titel: '1 · Vor dem Notariatstermin', lead: 'Beschaffen bzw. erstellen — die Urkundsperson muss diese Belege beim Termin vorliegen haben (Art. 631 OR).' },
  { id: 'beurkundung', titel: '2 · Beurkundung', lead: 'Entsteht beim Notariat; Wahlannahmen können direkt in der Urkunde erklärt werden.' },
  { id: 'anmeldung', titel: '3 · Handelsregister-Anmeldung', lead: 'Einreichung aller Belege nach Art. 43 HRegV.' },
  { id: 'nachEintrag', titel: '4 · Nach dem Eintrag', lead: 'Pflichten ab Rechtspersönlichkeit (Art. 643 OR).' },
];

export const ERSTELLER_LABEL = { gruender: 'Gründer:innen', notariat: 'Notariat', bank: 'Bank', revisor: 'Revisor:in' } as const;

export const CHF = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 });

// Praxis-Runde (Auftrag David): Blocker sind klickbar und führen zum
// Schritt, in dem die Eingabe liegt (Bereichs-Tag aus der Engine, §3).
export const BEREICH_SCHRITT: Record<AgBereich, number> = {
  konstellation: 0, gesellschaft: 1, kapital: 2, personen: 3, weiteres: 4,
};

export const BANNER_ENTWURF: PdfBanner = {
  titel: 'ENTWURF – KEIN GÜLTIGES DOKUMENT',
  // Praxis-Runde: Text deckt ALLE Entwurfs-Dokumente der Mappe (auch
  // Nachtrag und Sacheinlagevertrag mit Grundstück), nicht nur
  // Statuten/Errichtungsakt.
  text: 'Vorbereitung für die Urkundsperson: Statuten werden notariell beglaubigt (Art. 22 Abs. 4 HRegV); Errichtungsakt, Nachtrag und Sacheinlageverträge mit Grundstücken bedürfen der öffentlichen Beurkundung (Art. 629 Abs. 1 und Art. 634 Abs. 2 OR).',
};

// D14: VR-Mitglieder können «ohne Zeichnungsberechtigung» sein (Gate: mind.
// eines vertretungsbefugt, Art. 718 Abs. 3 OR); weitere Zeichnungsberechtigte
// zusätzlich mit Kollektivprokura (ZH-Muster-Protokoll).
export const VR_ZEICHNUNGS_OPTIONEN: { id: AgVrZeichnungsArt; label: string }[] = [
  { id: 'einzelunterschrift', label: 'Einzelunterschrift' },
  { id: 'kollektivzuzweien', label: 'Kollektivunterschrift zu zweien' },
  { id: 'ohne', label: 'ohne Zeichnungsberechtigung' },
];
export const VERTRETUNGS_ZEICHNUNGS_OPTIONEN: { id: AgVertretungsZeichnungsArt; label: string }[] = [
  { id: 'einzelunterschrift', label: 'Einzelunterschrift' },
  { id: 'kollektivzuzweien', label: 'Kollektivunterschrift zu zweien' },
  { id: 'kollektivprokura', label: 'Kollektivprokura zu zweien' },
];

// ─── Punkt 7 (Perfektion): lokale Zwischenspeicherung ────────────────────────
// Versioniertes JSON unter EINEM Schlüssel; Hydration mit Normalisieren-
// Guards je Feld (Wizard-PFLICHT-Konvention: je Zeile fehlende Felder mit
// Defaults auffüllen, falsche Typen verwerfen — nie ungeprüft in den State).
export const STORAGE_KEY = 'lexmetrik:ag-gruendung:v1';

export function ladeStand(): Record<string, unknown> | null {
  // Nackter localStorage-Zugriff wie useWizardState: im SSR-Smoke wirft er
  // (ReferenceError) und wird gefangen; der Test-Stub liegt auf globalThis.
  try {
    const roh = localStorage.getItem(STORAGE_KEY);
    if (!roh) return null;
    const json: unknown = JSON.parse(roh);
    if (!json || typeof json !== 'object') return null;
    const o = json as { v?: unknown; stand?: unknown };
    if (o.v !== 1 || !o.stand || typeof o.stand !== 'object' || Array.isArray(o.stand)) return null;
    return o.stand as Record<string, unknown>;
  } catch {
    return null; // defekter/blockierter Speicher = wie «nichts gespeichert»
  }
}

export const txt = (v: unknown, def: string) => (typeof v === 'string' ? v : def);
export const bool = (v: unknown, def: boolean) => (typeof v === 'boolean' ? v : def);
export const wahl = <T extends string>(v: unknown, erlaubt: readonly T[], def: T): T =>
  typeof v === 'string' && (erlaubt as readonly string[]).includes(v) ? (v as T) : def;

/** Array-Hydration: nur Objekt-Zeilen übernehmen, je Feld der Vorlage den
 *  gespeicherten Wert nur bei passendem Typ (Wahl-Felder nur bei erlaubtem
 *  Wert) — sonst Default; keys werden NEU vergeben (1…n je Liste). */
export function zeilenGuard<T extends Record<string, string | boolean | undefined>>(
  roh: unknown,
  vorlage: Required<T>,
  wahlFelder: Partial<Record<keyof T, readonly string[]>> = {},
): (T & { key: number })[] {
  if (!Array.isArray(roh)) return [];
  return roh
    .filter((z): z is Record<string, unknown> => z !== null && typeof z === 'object' && !Array.isArray(z))
    .map((z, i) => {
      const zeile: Record<string, string | boolean | number | undefined> = { ...vorlage, key: i + 1 };
      for (const feld of Object.keys(vorlage)) {
        const wert = z[feld];
        const erlaubt = wahlFelder[feld];
        if (erlaubt) {
          if (typeof wert === 'string' && (erlaubt as readonly string[]).includes(wert)) zeile[feld] = wert;
        } else if ((typeof wert === 'string' || typeof wert === 'boolean') && typeof wert === typeof vorlage[feld]) {
          zeile[feld] = wert;
        }
      }
      return zeile as unknown as T & { key: number };
    });
}

export const GRUENDER_LEER: Required<AgGruenderZeile> = { name: '', angaben: '', anzahl: '', liberierung: '' };
export const VR_LEER: Required<AgVrZeile> = {
  name: '', herkunft: '', wohnort: '', adresse: '', praesident: false,
  zeichnungsArt: 'einzelunterschrift', annahmeInUrkunde: false,
};
export const VERTRETUNG_LEER: Required<AgVertretungsZeile> = { name: '', funktion: '', zeichnungsArt: 'kollektivzuzweien' };
export const SACHEINLAGE_LEER: Required<AgSacheinlageZeile> = {
  typ: 'sachgesamtheit', bezeichnung: '', belegDatum: '', wertChf: '', grundstueck: false,
  einlegerName: '', aktienAnzahl: '', gutschriftChf: '', zustand: '',
  imHrEingetragen: false, cheNr: '', aktivenChf: '', passivenChf: '', rueckwirkungDatum: '',
};
export const VERRECHNUNG_LEER: Required<AgVerrechnungZeile> = { glaeubigerName: '', forderungChf: '', aktienAnzahl: '', begruendungTxt: '' };
export const VORTEIL_LEER: Required<AgVorteilZeile> = { beguenstigter: '', inhalt: '', wertChf: '', begruendungTxt: '' };
