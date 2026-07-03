// ─── GENERIERT via `npm run gen:zaehler` ────────────────────────────────
// NICHT von Hand editieren. Quellen (SSoT §5): public/normtext/register.json,
// public/rechtsprechung/register.json und der Katalog (startseiteConfig.ts).
// Drift-Tor: `npm run check:zaehler`. Nur echter Volltext ist gezählt
// (Gesetze/Entscheide: status snapshot bzw. Nicht-Verweise).

export interface StartseiteZaehler {
  /** Bundeserlasse im Volltext (status snapshot). */
  gesetzeBundVolltext: number;
  /** Kantonserlasse im Volltext (status snapshot). */
  gesetzeKantonVolltext: number;
  /** Bund + Kanton im Volltext. */
  gesetzeVolltext: number;
  /** Gerichtsentscheide im Volltext (Nicht-Verweise). */
  rechtsprechungVolltext: number;
  /** Verfügbare Rechner (eigene Seite). */
  rechner: number;
  /** Verfügbare Vorlagen (eigene Seite). */
  vorlagen: number;
  /** Stand der Gesetzes-Register-Erzeugung (ISO). */
  standGesetze: string;
  /** Stand der Rechtsprechungs-Register-Erzeugung (ISO). */
  standRechtsprechung: string;
}

export const STARTSEITE_ZAEHLER: StartseiteZaehler = {
  "gesetzeBundVolltext": 218,
  "gesetzeKantonVolltext": 1231,
  "gesetzeVolltext": 1449,
  "rechtsprechungVolltext": 342,
  "rechner": 20,
  "vorlagen": 25,
  "standGesetze": "2026-07-01",
  "standRechtsprechung": "2026-07-02"
};
