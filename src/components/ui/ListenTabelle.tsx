import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';

// ─── ListenTabelle: EINE tabellarische Erlass-/Eintrags-Liste (D24, 6.9.2026) ─
//
// AUFTRAG David 6.9.2026 zum Bild der Kantons-Erlassliste BS «Relevanz»: «das
// hier soll tabellarisch aufgebaut sein sodass beide spalten jeweils zeile auf
// selber höhe haben».
//
// GEMESSEN vorher (Preview `dist`, `/gesetze?ebene=kanton&kt=BS&gliederung=
// relevanz`, 859 Erlasse): die beiden Spalten waren zwei UNABHÄNGIGE
// CSS-`columns`-Fragmente. Zeile i links und Zeile i rechts standen @1440 um
// bis zu 105 px versetzt (Paar 3: y 1090 vs. 1195), @1280 um bis zu 126 px —
// weil jeder Titel verschieden viele Zeilen umbrach. Dieselbe Ursache hatte
// `RechtsgebietUebersicht.tsx` schon 29.8.2026 als offenen Punkt notiert («die
// Metazeilen fluchten weiterhin nicht auf einer Linie … das löst kein Gap,
// sondern nur eine feste Titelhöhe»).
//
// DER BAU: EIN Raster über beide Spalten statt zwei Fragmente. Die Zeilen sind
// Grid-Zeilen — Zeile i ist links und rechts DIESELBE Zeile und damit
// zwangsläufig gleich hoch (Δ = 0 by construction, nicht by tuning). Gefüllt
// wird SPALTENWEISE (`grid-auto-flow: column` + `grid-template-rows: repeat(
// var(--tb-zeilen), auto)`), damit die Leserichtung von LM-141 erhalten bleibt:
// erst links von oben nach unten, dann rechts. `--tb-zeilen` = ceil(n/2), also
// nie eine dritte Spalte.
//
// WARUM `<ul>`/Grid und nicht `<table>`: eine echte Tabelle mit vier
// Spaltenpaaren müsste die Einträge im DOM PAAREN (Zeile = links+rechts) — und
// bei schmaler Breite, wo nur eine Spalte Platz hat, wäre die Paarung falsch
// (sie zwänge entweder Umsortieren im DOM oder `display:block`-Overrides, die
// die Tabellensemantik ohnehin wieder aufheben). Das Grid trägt EINE flache,
// leserichtige DOM-Ordnung für jede Breite; die Umschaltung ein-/zweispaltig
// ist reines CSS. Die Spaltenbedeutung steht als `aria-label` an der Liste.
//
// WARUM NICHT `ui/TrefferZeile`: der Baustein dort STAPELT (Titel über
// Untertitel über Meta) und kennt keine Nummern-Spalte — er hält gerade keine
// gemeinsamen Spaltenspuren über die Zeilen hinweg, was hier die ganze Zusage
// ist. Die beiden Bausteine tragen verschiedene Inhaltsklassen; ein Zusammenzug
// hiesse, die eine Zusage in der anderen aufzulösen (§5 will EINE Quelle je
// Sache, nicht EINEN Baustein für alles).
//
// Reine Darstellung (§3): kein Datenwissen, keine Logik, keine Sortierung.

/** Eine Zeile: Nummer/Kürzel · Titel · Meta. Der Aufrufer bestimmt, WAS in die
 *  Nummern-Spalte gehört (kantonal die systematische Nummer, beim Bund das
 *  Kürzel) — der Baustein setzt nur die Spur. */
export type ListenZeileDaten = {
  id: string;
  /** Erste Spalte: systematische Nummer, SR-Nr. oder Kürzel. */
  nummer?: string | null;
  /** Zweite Spalte: der volle Titel. Wird auf zwei Zeilen gekappt und steht
   *  vollständig im `title` (§8: nichts ist unerreichbar). */
  titel: string;
  /** Dritte Spalte, rechtsbündig in Tabellenziffern (Artikelzahl, Jahr, SR). */
  meta?: ReactNode;
  /** Badges vor dem Titel (aufgehoben, Sprache) — bleiben im Textfluss. */
  marken?: ReactNode;
  /** Interner Pfad; mit `extern` ein amtlicher Fremd-Link (§8). */
  href: string;
  extern?: boolean;
  onClick?: (ev: MouseEvent) => void;
};

/** Registerfarbe der Domäne (Gesetze/Rechtsprechung/Materialien/Werkzeuge) —
 *  trägt den 2-px-Strich an der linken Kante des Listenblocks. */
export type ListenRegister = 'g' | 'r' | 'm' | 'w';

export function ListenTabelle({
  zeilen, register = 'g', spaltig = true, nrBreite, beschriftung,
}: {
  zeilen: ListenZeileDaten[];
  register?: ListenRegister;
  /** `false` = immer einspaltig (schmale Flächen, kurze Listen). */
  spaltig?: boolean;
  /** Breite der Nummern-Spur (CSS-Länge). Default 5.5rem trägt die
   *  systematischen Nummern; Kürzel-Listen setzen mehr. */
  nrBreite?: string;
  /** a11y-Name der Liste — nennt zugleich, was die Spalten bedeuten. */
  beschriftung: string;
}) {
  if (zeilen.length === 0) return null;
  // Zeilen je Spalte: bei ungerader Zahl bekommt die linke Spalte die eine
  // mehr (die Liste liest sich links vollständig, bevor sie rechts weitergeht).
  const proSpalte = spaltig ? Math.ceil(zeilen.length / 2) : zeilen.length;
  const stil = {
    '--tb-zeilen': proSpalte,
    ...(nrBreite ? { '--tb-nr': nrBreite } : {}),
  } as CSSProperties;
  return (
    <div className="tb-huelle">
      <ul
        className={`tb-raster${spaltig ? ' tb-raster-2' : ''}`}
        data-reg={register}
        style={stil}
        aria-label={beschriftung}
      >
        {zeilen.map((z) => <ListenZeile key={z.id} z={z} />)}
      </ul>
    </div>
  );
}

function ListenZeile({ z }: { z: ListenZeileDaten }) {
  const inhalt = (
    <>
      {z.nummer && <span className="tb-nr num">{z.nummer}</span>}
      {/* Der volle Wortlaut steht im `title` — der sichtbare Text ist auf zwei
          Zeilen gekappt, damit die Zeilenhöhen nicht von einem einzelnen
          langen amtlichen Titel diktiert werden (D24). */}
      <span className="tb-titel" title={z.titel}>
        {z.marken}
        {z.titel}
      </span>
      {z.meta && <span className="tb-meta num">{z.meta}</span>}
    </>
  );
  return (
    <li className="tb-zeile">
      {z.extern ? (
        <a href={z.href} target="_blank" rel="noopener noreferrer" className="tb-link">
          {inhalt}
        </a>
      ) : (
        <Link to={z.href} onClick={z.onClick} className="tb-link">{inhalt}</Link>
      )}
    </li>
  );
}
