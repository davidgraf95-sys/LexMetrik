import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SAMMLUNG_TITEL } from '../../lib/seo';
import { usePaneKlasse } from '../layout/PaneKontext';
import { useHeute } from './Begruessung';

// ─── Erste Ebene des Pults: die Begrüssung (W2·24-R10, D18) ────────────────
//
// Referenzbild `abnahme/design-identitaet/pult-freigegeben.html`, Marke `.such`:
// Titelblatt-Wort, darunter die Begrüssung kursiv in Literata mit kleinem Datum
// daneben. Kein Kasten, keine Fläche.
//
// ── D18 (David 6.9.2026) · HIER STEHT KEINE SUCHE MEHR ──────────────────────
// Wortlaut: «insgesamt braucht es auf der startseite keine suche. nur oben
// reicht». Bis hierher trug dieser Block die grosse Hero-Suche
// (`start/UniversalSuche`) und der Streifen oben zeigte auf «/» dafür KEIN Feld.
// Jetzt gilt das Umgekehrte, und zwar app-weit: die EINE Suche ist die
// Kopf-Suche (`layout/HeaderSuche`), auf jeder Route dieselbe. Mit der
// Hero-Suche entfallen zwei Dinge, die nur an ihr hingen:
//   · die BEISPIEL-LINKS («Art. 336c OR · BGE 152 V 52 · …») samt dem Satz «Die
//     Taste / springt hierher» — Sprach-Diät (§Reglement A), und die Taste
//     springt jetzt in den Kopf, nicht hierher;
//   · die `?q=`-KOPPLUNG. Sie war eine echte Funktion (teilbarer Permalink auf
//     eine Suche) und geht nicht verloren, sondern zieht dorthin, wo sie
//     hingehört: `/?q=…` leitet auf `/suche?q=…` weiter (unten). Die
//     Kopf-Suche ist ein Dropdown ohne Adress-Kopplung (bewusst, `HeaderSuche`:
//     «kein ?q=-Umweg»); die Volltext-Seite `pages/Suche.tsx` führt denselben
//     Hook (`useUniversalSuche`, §5) und liest `?q=` seit jeher.
//
// Die Begrüssung bleibt die grosse Zeile (D14, «begrüssung prominenter»).
//
// Aus `start/Hero` hervorgegangen (R3), mit zwei Rückbauten (§17-Gegengewicht):
//   · KEINE MARGINALIE mehr. Titel, Wochentag und Datum standen links in einer
//     150-px-Spalte; das Pult hat keine solche Spalte, und die Angaben stehen
//     jetzt in der Zeile, in der man sie liest.
//   · DIE BESTANDS-AUFZÄHLUNG IST WEG (`SAMMLUNG_BESTAND`, «Gesetze, Entscheide,
//     Materialien, Rechner, Vorlagen.»). Genau diese fünf stehen seit R10 als
//     BEREICHE mit ihren gemessenen Zahlen unmittelbar darunter — der Satz war
//     dieselbe Auskunft ein zweites Mal und gehört zu dem, was David am
//     6.9.2026 als «zu viel text» gesehen hat. Die Konstante selbst bleibt: der
//     Seitenfuss (`layout/Footer`) trägt sie unverändert auf jeder Seite.
//
// A-1-AUSNAHME (R3-α, 31.8.2026), fortgeschrieben: kein `SeitenTitel`. Der
// Baustein trägt die Seiten-Titelgrösse (`text-h2 sm:text-h1`) und die
// Pane-Kaskade; das Pult hat keine Titelzeile dieser Art — sein Titel ist das
// kleine Titelblatt-Wort über der Begrüssung. Eine <h1> bleibt es trotzdem
// (genau eine je Seite, SICHTBAR — `e2e/a11y.e2e.ts` prüft `h1` auf
// Sichtbarkeit, eine `sr-only`-H1 wäre dort rot).
// GRÖSSE ≠ RANG (R10-NACHZUG, D14): der Gruss (ein <p>) ist optisch grösser als
// diese <h1> — das ist zulässig, weil die Heading-Ordnung SEMANTISCH bleibt
// (genau eine, sichtbare H1; der Gruss erzeugt keine zweite Überschrift und
// keinen Sprung in der Heading-Liste, `e2e/a11y.e2e.ts` misst `heading-order`
// am Baum, nicht an Schriftgrössen). Optische Grösse ist ein Darstellungsmittel
// (§3), Heading-Rang ein Struktur-Merkmal — beides läuft hier bewusst
// auseinander.

export function SuchBlock() {
  const { gruss, wochentag, datum } = useHeute();
  const pk = usePaneKlasse();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';

  // `/?q=…` — der Permalink, den die frühere Hero-Suche schrieb (D18). Er bleibt
  // gültig und landet auf der Volltext-Suche; ohne `q` passiert nichts. `replace`,
  // damit die Zurück-Taste nicht in einer Schleife auf «/» zurückführt.
  useEffect(() => {
    if (q.trim()) navigate(`/suche?q=${encodeURIComponent(q.trim())}`, { replace: true });
  }, [q, navigate]);

  // Breiten-Deckel wie im Referenzbild (`.such{max-width:860px}`).
  return (
    <div className="max-w-[54rem]">
      <h1 className="font-sans text-xs text-ink-500">{SAMMLUNG_TITEL}</h1>
      {/* Gruss und Datum kommen aus EINER Uhrzeit (`useHeute`); beide weichen
          zwischen Build und Client ab (der Build backt einen Gruss und den
          Build-Tag) und tragen darum ehrlich `suppressHydrationWarning`.
          GRÖSSE (R10-NACHZUG, D14): `text-h2 lg:text-h1` — ~24 px @390 (h2,
          25.6 px), ~32 px @1440 (h1, 32 px). Im Pane misst `@3xl/pane` denselben
          Wechsel an der Pane-Breite statt am Viewport (B-1, `PaneKontext.ts`). */}
      <p className={`mt-0.5 flex flex-wrap items-baseline gap-x-3 font-serif italic text-ink-900 ${pk('text-h2 lg:text-h1', 'text-h2 @3xl/pane:text-h1')}`}>
        <span suppressHydrationWarning>{gruss}</span>
        <span suppressHydrationWarning className="num font-sans not-italic text-xs text-ink-500">
          {wochentag}, {datum}
        </span>
      </p>
    </div>
  );
}
