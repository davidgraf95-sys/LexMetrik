import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

// ─── RubrikKachel: EIN Einstiegs-Kachel-Muster (C-5, 31.8.2026) ──────────────
//
// W2·19-DESIGN-KONSISTENZ · Runde 2, Paket C. Befund C-5: derselbe Inhalt —
// «Einstieg in eine Rubrik, mit Umfangszahl und Nutzensatz» — trug zwei
// Bauformen:
//   · `components/start/RubrikKacheln.tsx` (Startseite, Landkarte der Sammlung):
//     `lc-tile` + Icon + Titel + Nutzensatz + Zähler als 11-px-Fusszeile,
//   · `pages/Gesetze.tsx::Einstieg` (Bund/Kantone/International):
//     `lc-card` + grosse Zahl + Einheit-Overline + Titel + Untertitel + «Öffnen →».
// Beide sind auf DIESEN Baustein gezogen; die Kopien sind gelöscht, nicht
// angeglichen (§5/§10).
//
// KANON ist die /gesetze-Anatomie (`lc-card` · Zahl+Einheit · Titel ·
// Nutzensatz · «Öffnen →»): sie sagt den Umfang in der Form, die das Haus für
// Zähler gewählt hat (nackte Zahl, C-7), und benennt die Aktion. Die
// Startseiten-Fusszeile («1'458 Entscheide im Volltext») sagte dasselbe, nur
// leiser und in einer eigenen Form. Der WORTLAUT der Zähler ist unverändert
// übernommen — «erfasst» bleibt «erfasst», «im Volltext» bleibt «im Volltext»
// (§8, E6a·M5): er wandert nur von der Fusszeile in die Einheit neben der Zahl.
//
// Aufgelöste Divergenzen:
//   Fläche      `lc-tile` vs. `lc-card` → **lc-card**; damit erbt die Kachel die
//               EINE zentrale Hover-Regel (C-3, `index.css`) und braucht kein
//               eigenes `hover:border-brass-400` mehr.
//   Titel-Hover `brass-800` vs. `brass-700` → **brass-700** (Form der
//               Karten-Titel im Haus, u. a. `FristenHauptKarte`).
//   Nutzensatz  `ink-700` vs. `ink-500` → **ink-700**. Der Satz ist die
//               Erklärung der Kachel, nicht ihre Fussnote; die Wahl hebt den
//               Kontrast auf /gesetze und senkt ihn nirgends (F2/§8).
//   Stimme      `font-display` vs. `font-sans` → **font-sans**: wertidentisch
//               (`--font-display` == `--font-sans`, `index.css`), aber die
//               Zwei-Stimmen-Regel wird am Klassennamen auditiert (§G-e), und
//               eine Kachel ist Interaktion.
//
// Das Icon bleibt ein optionaler, rein dekorativer Slot (die Startseite führt
// ihre Landkarten-Icons weiter, /gesetze hat keine). Reine Darstellung (§3).

const KLASSE = 'lc-card group flex flex-col gap-1.5 p-5 text-left no-underline';

export function RubrikKachel({ ziel, onWahl, icon, zahl, einheit, titel, nutzen, extra }: {
  /** Link-Ziel (`<Link>`). Genau eines von `ziel`/`onWahl`. */
  ziel?: string;
  /** Auswahl ohne Ortswechsel (`<button>`), z. B. die Ebenen-Wahl auf /gesetze. */
  onWahl?: () => void;
  /** Dekoratives Rubrik-Icon (aria-hidden gesetzt der Baustein). */
  icon?: ReactNode;
  /** Umfangszahl — nackte Zahl (C-7), bereits landesüblich formatiert. */
  zahl?: ReactNode;
  /** Was gezählt wird, im Wortlaut der Fläche («Erlasse im Volltext», …). */
  einheit?: string;
  titel: ReactNode;
  /** EIN konkreter Nutzensatz (§8: kein «geprüft», keine Floskel). */
  nutzen: ReactNode;
  /** Zusatz unter dem Nutzensatz (z. B. Erfassungsgrad-Legende). */
  extra?: ReactNode;
}) {
  const inhalt = (
    <>
      {icon && <span aria-hidden className="shrink-0 text-brass-600">{icon}</span>}
      {zahl !== undefined && (
        // `flex-wrap`: lange Einheiten («amtliche Materialien erfasst») rutschen
        // unter die Zahl, statt die Kachel zu sprengen — kurze bleiben daneben.
        <span className="flex flex-wrap items-baseline gap-2">
          {/* GB-1 (W2·24, Befund G1, 7.9.2026): die ZAEHLER-MARKE traegt die
              Registerfarbe der Route. Messing sagte auf allen vier Registern
              dasselbe — also nichts; die Zahl ist auf den Uebersichten das
              groesste Element im ersten Bild und damit der Ort, an dem die
              Marke der Domaene sichtbar wird (FAHRPLAN §5). `text-brass-700`
              bleibt als Grundton stehen: ausserhalb einer Route mit Register
              (Meta-Seiten) faerbt nichts, und die Kachel darf nie eine
              geratene Farbe tragen (§8). Regel: index.css §GB-1b. */}
          <span className="lc-zaehler-marke num font-display text-h1 leading-none text-brass-700">{zahl}</span>
          {einheit && <span className="lc-overline">{einheit}</span>}
        </span>
      )}
      <span className="font-sans font-semibold text-ink-900 text-h3 tracking-tight transition-colors group-hover:text-brass-700">{titel}</span>
      <span className="text-body-s leading-snug text-ink-700">{nutzen}</span>
      {extra}
      {/* LM-027/LM-038 (B11-Karten, 4.9.2026): `mt-auto` verankert die
          Abschlusszeile am Kartenfuss. Gemessen auf `/` (1440 px) sass sie in
          einer Reihe gleich hoher Kacheln (322 px) auf FÜNF Höhen — y 265 / 280
          / 280 / 222 / 203 —, weil sie dem unterschiedlich langen Nutzensatz
          folgte; auf `/gesetze` auf drei (139 / 144 / 119), dort zusätzlich von
          der Erfassungsgrad-Legende der «Kantone»-Kachel verschoben. Der
          A3-Entscheid («Kacheln einer Reihe gleich hoch», Abnahme offen) wird
          NICHT gekippt: die Kachelhöhe bleibt, wie sie ist — nur die
          Abschlusszeile fluchtet. */}
      <span aria-hidden className="mt-auto pt-1 text-body-s font-medium text-brass-700">Öffnen →</span>
    </>
  );
  return ziel !== undefined
    ? <Link to={ziel} className={KLASSE}>{inhalt}</Link>
    : <button type="button" onClick={onWahl} className={KLASSE}>{inhalt}</button>;
}
