import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { istLesbar, type BrowseErlass } from '../../lib/normtext/browse-typen';
import { useErlassOeffnen, istErlassOffen } from '../../lib/useErlassOeffnen';
import { werkzeugeFuerNorm } from '../../lib/normtext/werkzeuge';
import { erlassPfad } from '../../lib/normtext/erlassAdresse';
import { StandChip } from '../ui/StandChip';
import { ListenTabelle, type ListenZeileDaten } from '../ui/ListenTabelle';

// Klick-Handler für eine Erlass-Verlinkung (Punkt G): der <Link> trägt weiter den
// nackten Basispfad (SEO/Mittelklick/Cmd-Klick/Copy-Link). Nur der EINFACHE
// Linksklick wird abgefangen — und auch nur, wenn das Gesetz schon offen ist:
// dann öffnet der Hook eine neue Instanz (?r). Sonst läuft der normale
// Link-Navigate, der ohnehin den Basispfad öffnet.
function macheOeffnenHandler(
  e: BrowseErlass,
  basePath: string,
  oeffne: (ebene: string, key: string, kuerzel?: string) => void,
) {
  return (ev: MouseEvent) => {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (!istErlassOffen(basePath)) return;
    ev.preventDefault();
    oeffne(e.ebene, e.key, e.kuerzel);
  };
}

// Erlass-Karte in der Übersicht /gesetze. Nüchtern/kanzleihaft (DESIGN-REGLEMENT):
// Kürzel als Anker, Titel klein, Meta (SR · Artikelzahl), Stand als Chip. Reine
// Darstellung (§3). 'snapshot' UND 'pdf-embed' (amtliches PDF in-app) führen in
// die In-App-Lesesicht; 'nur-live-link' trägt ehrlich nur den amtlichen Link (§8).

// Der Stand-Chip lag hier und in `materialien/MaterialKarte.tsx` zeichengleich
// als lokale Kopie (Design-Konsistenz, C-Begleitbefund «Stand-Chip-Dedupe»,
// 31.8.2026). Jetzt EIN Baustein in `ui/StandChip.tsx` — er nutzt zugleich die
// eine Datums-Quelle `<Datum>` (B-3: Daten laufen in der Textstimme, nicht Mono).

function KarteInhalt({ e }: { e: BrowseErlass }) {
  // Norm↔Werkzeug-Brücke (ROADMAP Schritt 2, Task 4.3): dezenter Hinweis, dass
  // dieser Erlass passende Rechner/Vorlagen trägt (das Alleinstellungsmerkmal,
  // §8: nur verfügbare Werkzeuge gezählt). Die Karte verlinkt in den Reader, wo
  // das Kontext-Panel sie ausklappt — hier nur das Signal, kein zweiter Link.
  const werkzeugAnzahl = werkzeugeFuerNorm(e.key).length;
  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-h3 font-semibold text-ink-900 leading-none">{e.kuerzel}</span>
        <span className="flex items-baseline gap-2 shrink-0">
          {/* §8: ganz aufgehobener Erlass bleibt auffindbar, ist aber sichtbar
              markiert (Design-Token danger, §13). */}
          {e.aufgehoben && <span className="lc-badge lc-badge-danger">aufgehoben</span>}
          {e.sprache !== 'de' && (
            <span className="lc-badge lc-badge-soft uppercase">{e.sprache}</span>
          )}
        </span>
      </div>
      {/* Entscheid David 29.8.2026 «4 grösser» (Design-Review T8): der Karten-
          TEXT steigt eine Stufe der bestehenden Skala, body-s → base (14→16 px).
          Kein neuer Wert — `base` ist die in tailwind.config.js dokumentierte
          16-px-Stufe, die auf /gesetze bisher übersprungen wurde (T8 mass hier
          einen 18→14-Sprung). Das Kürzel (h3, 20 px) bleibt der Anker; die
          Staffelung der Karte wird damit dicht statt gesprungen.
          Die Meta-Zeile darunter bleibt BEWUSST auf xs (12 px): sie ist ein
          Register aus Zahlen und Chips, kein Text. Mit 14 px gemessen (29.8.,
          1280 px, Relevanz-Sicht) wuchs die Karte 166→200 px und der Stand-Chip
          fiel bei StGB/SchKG auf eine eigene Zeile — die Zeile wurde unruhiger,
          nicht lesbarer. Mit dem Titel allein: 166→168 px, unverändert 6 Karten
          im Sichtfeld. */}
      <p className="mt-1.5 text-base text-ink-600 leading-snug line-clamp-2">{e.titel}</p>
      {/* LM-031 (B11-Karten, 4.9.2026): `mt-auto` verankert die Metazeile am
          Kartenfuss. Gemessen auf `/gesetze?ebene=bund` (1440 px): in einer
          Reihe gleich hoher Karten (190 px) blieben unter dem Inhalt 43 px
          leer, wo die bedingte Zeile «N passende Werkzeuge» fehlte, gegen 20 px
          dort, wo sie steht — die Metazeilen einer Reihe standen also
          verschieden hoch. Der Leerraum liegt jetzt zwischen Titel und Meta,
          die Metazeilen einer Reihe fluchten. Die Kartenhöhe bleibt unberührt
          (A3-Abnahme, FAHRPLAN-ARCHIV-RESTPUNKTE §20, nicht gekippt). */}
      <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
        {e.sr && <span>SR <span className="num">{e.sr}</span></span>}
        {/* EIN Meta-Schema für alle Karten (Fehlerbuch-Befund 47, auf Prod
            reproduziert 29.8.2026): «SR x.y · N Artikel · [Format] · Stand».
            Vorher standen MENGE und FORMAT im selben Slot, im selben Ton, als
            Zweig eines Entweder-oder — EMRK las sich als «SR 0.101 · amtliches
            PDF», CISG als «SR 0.221.211.1 · 101 Artikel». Wer die beiden
            International-Karten nebeneinander sah, konnte nicht erkennen, ob
            EMRK keine Artikel HAT oder ob dort etwas anderes ausgesagt wird.
            Jetzt sind es zwei getrennte Slots mit je eigener Stimme:

            · MENGE — nur wo wir sie wirklich haben. `artikelAnzahl` ist laut
              browse-typen.ts bei nicht-Snapshot-Erlassen 0; die Zahl hängt
              deshalb an `> 0`, nicht am Status. Das ist zugleich die Wache
              gegen ein «0 Artikel», das ein leeres Register behaupten würde,
              wo in Wahrheit gar kein Snapshot existiert (§8).
            · FORMAT — als Badge (`lc-badge-soft`, Token, §13/D2), also sichtbar
              eine ANDERE Art von Aussage als eine Zahl. Volltext-Snapshots
              tragen kein Tag: sie sind der Normalfall, und 1'300 Karten mit
              «Volltext» zu beschriften wäre Lärm, keine Auskunft. */}
        {e.artikelAnzahl > 0 && <span><span className="num">{e.artikelAnzahl}</span> Artikel</span>}
        {/* LM-035 (B11-Karten, 4.9.2026): die beiden Format-Tags sagten nicht,
            was sie bedeuten («Was ‹nur Live-Link› und ‹amtliches PDF› heissen,
            steht nirgends»). Der Titel benennt es in einem Satz — der WORTLAUT
            der Grundarten ⑦/⑧ (FAHRPLAN-GESETZES-UX §2), nicht neu erfunden.
            Die ungleiche Zeilenstruktur derselben Karten-Reihe ist seit
            Fehlerbuch-Befund 47 (29.8.2026) gebaut und am 4.9. nachgemessen:
            EMRK/UNO-Pakt/CISG tragen alle metaY 99, metaH 24. */}
        {e.status === 'pdf-embed' && <span className="lc-badge lc-badge-soft"
          title="Kein Volltext-Snapshot — die amtliche PDF-Fassung wird in der Leseansicht eingebettet.">amtliches PDF</span>}
        {e.status === 'nur-live-link' && <span className="lc-badge lc-badge-soft"
          title="Kein Volltext in LexMetrik — die Karte führt direkt zur amtlichen Fassung.">nur Live-Link</span>}
        <StandChip stand={e.stand} />
        {werkzeugAnzahl > 0 && (
          <span className="text-brass-700">
            <span className="num">{werkzeugAnzahl}</span> {werkzeugAnzahl === 1 ? 'passendes Werkzeug' : 'passende Werkzeuge'}
          </span>
        )}
      </div>
    </>
  );
}

// ─── D24 (David 6.9.2026) · EINE TABELLARISCHE ERLASSLISTE ───────────────────
//
// Hier standen ZWEI Zeilen-Bauformen für dieselbe Inhaltsklasse: `ErlassZeile`
// (Kürzel · Titel · SR, in zwei Varianten `kompakt`/`leitgesetz`) und
// `SysZeile` (SR · Titel · Artikelzahl/Jahr). Beide sind auf den EINEN
// Listen-Baustein `ui/ListenTabelle` gezogen, die Kopien sind gelöscht, nicht
// angeglichen (§5/§10) — die Variante `leitgesetz` löst sich dabei ganz auf:
// ihre Umkehrung «Titel führt, Kürzel sekundär» IST die Spaltenordnung der
// Tabelle (Nummer · Titel · Meta), sie braucht keinen Schalter mehr.
//
// Was der Zusammenzug fachlich bewahrt: die Verlinkung samt Zweit-Instanz-
// Handler, der amtliche Aussen-Link für `nur-live-link` (§8, mit «↗»), die
// «aufgehoben»-Markierung, Artikelzahl, Stand-Jahr, SR-Nummer.

/** Woraus die Nummern-Spalte gespeist wird. Kantonale «kuerzel» sind oft der
 *  ganze (bis 276 Zeichen lange) Titel — dort trägt die systematische Nummer
 *  die Spalte; beim Bund ist das Kürzel der Identitäts-Anker. */
export type ErlassListenArt = 'kanton' | 'bund';

// Stand-Jahr (ISO «YYYY-…») — reine Anzeige. Sehr alte Stände (vor 1990) werden
// dezent markiert: ein sehr alter Stand ist für die Anwältin ein nützliches
// Signal, soll aber nicht so laut wie ein frischer wirken. Fixe Schwelle (kein
// Date.now(), §2 — reine Darstellung).
const standJahr = (stand: string): string | null =>
  stand.slice(0, 4).match(/^\d{4}$/)?.[0] ?? null;

// D24: «Klammer-Nummer im Titel entfällt, da eigene Spalte». Der Titel trug die
// systematische Nummer ein zweites Mal («Abfallverordnung (786.100)») — im
// Register GEMESSEN am 6.9.2026: 587 Titel enden auf eine Klammer-Zahl, und in
// ALLEN 587 Fällen sind deren Ziffern zeichengleich mit den Ziffern der
// SR-/Systematik-Nummer derselben Zeile (0 Abweichungen). Nur dieser bewiesene
// Identitätsfall wird entfernt — keine Heuristik auf «sieht aus wie eine
// Nummer», sondern der Abgleich gegen das Datum der Nachbarspalte. Das Datum
// selbst bleibt unangetastet (die Doppelung im Feld `titel` gehört in die
// Korpus-Werkstatt, §5); hier fällt nur die zweite ANZEIGE derselben Zahl.
const KLAMMER_NUMMER = /\s*\(([0-9][0-9.]*)\)\s*$/;
function ohneDoppelteNummer(titel: string, nummer: string | null | undefined): string {
  const m = KLAMMER_NUMMER.exec(titel);
  if (!m || !nummer) return titel;
  const imTitel = m[1].replace(/\D/g, '');
  const inSpalte = nummer.replace(/\D/g, '');
  return imTitel && imTitel === inSpalte ? titel.slice(0, m.index) : titel;
}

/** Die Erlassliste als EINE Tabelle: Nummer/Kürzel · Titel · Meta, Zeile i
 *  links und rechts auf derselben Höhe (D24). */
export function ErlassTabelle({ erlasse, art, spaltig = true, beschriftung }: {
  erlasse: BrowseErlass[];
  art: ErlassListenArt;
  /** `false` erzwingt eine Spalte (kurze Listen, enge Flächen). */
  spaltig?: boolean;
  beschriftung: string;
}) {
  // Ein Hook-Aufruf für die ganze Liste (Rules of Hooks) — die Zeilen bekommen
  // den fertigen Handler als Wert.
  const oeffne = useErlassOeffnen();
  const zeilen: ListenZeileDaten[] = erlasse.map((e) => {
    const nummer = art === 'kanton' ? (e.sr ?? null) : e.kuerzel;
    const jahr = standJahr(e.stand);
    const altDezent = jahr != null && Number(jahr) < 1990;
    const lesbar = istLesbar(e);
    const meta = (
      <>
        {art === 'kanton' ? (
          <>
            {e.artikelAnzahl > 0 && <span>{e.artikelAnzahl} Art.</span>}
            {/* Sehr alte Stände dezent (italic) statt blass — Kontrast (S10/WCAG) bleibt gewahrt. */}
            {jahr && <span className={altDezent ? 'italic' : undefined}>{jahr}</span>}
          </>
        ) : (
          e.sr && <span>SR {e.sr}</span>
        )}
        {/* §8: führt aus der App hinaus (amtliche Fassung), gleiche Glyphe wie an den Quell-Links. */}
        {!lesbar && <span aria-hidden className="tb-extern">↗</span>}
      </>
    );
    const basePath = erlassPfad(e);
    return {
      id: e.key,
      nummer,
      titel: ohneDoppelteNummer(e.titel, nummer),
      // §8: ganz aufgehobener Erlass bleibt auffindbar, ist aber sichtbar markiert.
      marken: e.aufgehoben ? <span className="lc-badge lc-badge-danger mr-1.5">aufgehoben</span> : undefined,
      meta,
      href: lesbar ? basePath : e.quelleUrl,
      extern: !lesbar,
      onClick: lesbar ? macheOeffnenHandler(e, basePath, oeffne) : undefined,
    };
  });
  return (
    <ListenTabelle
      zeilen={zeilen}
      register="g"
      spaltig={spaltig}
      nrBreite={art === 'kanton' ? '6.5rem' : '7rem'}
      beschriftung={beschriftung}
    />
  );
}

export function ErlassKarte({ e }: { e: BrowseErlass }) {
  // Hook vor jeder Verzweigung (Rules of Hooks) — auch wenn der nur-live-link-
  // Pfad ihn nicht braucht.
  const oeffne = useErlassOeffnen();
  // nur-live-link: kein interner Reader (ehrlich, §8) → amtlicher Link extern.
  if (!istLesbar(e)) {
    return (
      <a
        href={e.quelleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="lc-card flex h-full flex-col p-4 no-underline"
      >
        <KarteInhalt e={e} />
        <span className="mt-2 inline-flex text-xs text-brass-700">↗ amtliche Fassung</span>
      </a>
    );
  }
  const basePath = erlassPfad(e);
  return (
    <Link
      to={basePath}
      onClick={macheOeffnenHandler(e, basePath, oeffne)}
      className="lc-card group flex h-full flex-col p-4 no-underline"
    >
      <KarteInhalt e={e} />
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brass-700 opacity-0 transition-opacity group-hover:opacity-100">
        {e.status === 'pdf-embed' ? 'Amtliches PDF öffnen →' : 'Volltext lesen →'}
      </span>
    </Link>
  );
}
