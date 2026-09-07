import { Link } from 'react-router-dom';
import { NAVIGATION } from '../../lib/navigation';
import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';
import { usePaneKlasse } from '../layout/PaneKontext';
import type { Register } from '../../lib/startseiteModulTypen';

// ─── Die fünf Bereiche in EINER Reihe (W2·24-R10) ───────────────────────────
//
// Referenzbild `abnahme/design-identitaet/pult-freigegeben.html`, Marke
// `.bereiche`: Name (Archivo) · Zahl (Literata) · Einheit klein · ein Satz, und
// darüber der 3-px-Registerstrich. KEINE Kästen, KEINE Haarlinien — David
// 6.9.2026 zur Vorgängerform: «zu viel text und linien», «nicht trist».
//
// EINE ORDNUNG (§5): die Reihe iteriert über `NAVIGATION` — dieselbe Liste, die
// die Seitenleiste zeichnet. Sie wird hier NICHT nachgebaut und nicht
// nachsortiert; fehlt einem Abschnitt hier eine Angabe, erscheint er nicht,
// statt mit erfundenen Werten zu erscheinen (§8). NAVIGATION liegt ohnehin im
// Start-Bündel (die Seitenleiste rendert auf jeder Seite) — der Import kostet
// darum kein zusätzliches Gewicht (§15).
//
// §8 · DIE ZAHLEN SIND GEMESSEN, NICHT ILLUSTRIERT. Das Referenzbild trägt an
// dieser Stelle Beispielwerte; ausgeliefert wird ausschliesslich der
// buildseitige Zähler (`gen:zaehler`, Drift-Tor `check:zaehler`). Die EINHEIT
// sagt jedes Mal, WAS gezählt wurde: «im Volltext» nur dort, wo Volltext
// erfasst ist, «erfasst» bei den Materialien (bibliografische Verweise mit
// Live-Link, nie Volltext).
// Reine Darstellung (§3).

const z = STARTSEITE_ZAEHLER;
const nf = (n: number) => n.toLocaleString('de-CH');

/** Was neben dem Namen steht — je Navigations-Ziel genau einmal. */
interface Angabe {
  reg: Register;
  zahl: number;
  /** Was die Zahl zählt (§8: nie «Volltext», wo keiner erfasst ist). */
  einheit: string;
  /** Ein Satz, was der Bereich enthält — eine Bezeichnung, kein Versprechen. */
  satz: string;
}

const ANGABEN: Record<string, Angabe> = {
  '/gesetze': {
    reg: 'g', zahl: z.gesetzeVolltext, einheit: 'Erlasse im Volltext, Bund und Kantone',
    satz: 'Systematische Ordnung, 26 Kantone, internationales Recht',
  },
  '/rechtsprechung': {
    reg: 'r', zahl: z.rechtsprechungVolltext, einheit: 'Entscheide im Volltext',
    satz: 'Bundesgericht und kantonale Gerichte, nach Sachgebiet',
  },
  '/materialien': {
    reg: 'm', zahl: z.materialien, einheit: 'amtliche Materialien erfasst',
    satz: 'Kreisschreiben, Wegleitungen und Leitfäden nach Behörde',
  },
  '/rechner': {
    reg: 'w', zahl: z.rechner, einheit: 'Rechner',
    satz: 'Fristen, Gebühren und Beträge, Zuständigkeiten',
  },
  '/vorlagen': {
    reg: 'w', zahl: z.vorlagen, einheit: 'Vorlagen',
    satz: 'Verträge, Klagen und Gesuche zum Ausfüllen',
  },
};

// REGISTERSTRICH ALS FLÄCHE, NICHT ALS RAHMEN (Kanon R1/R3, Wächter
// `src/tests/listen-editor-r2f.test.tsx`): ein handgebautes `border-t-[3px]` in
// der Darstellungsschicht ist gesperrt — die Akzent-Oberkante läuft entweder
// über `lc-akzent-*` (Messing/Sperre) oder, wie hier und im früheren
// Satzspiegel, über einen eigenen 3-px-Streifen in der Registerfarbe.
/** Registerstrich über dem Bereich — Tabelle, weil die Farbe aus den Daten kommt. */
const STRICH: Record<Register, string> = {
  g: 'bg-reg-g', r: 'bg-reg-r', m: 'bg-reg-m', w: 'bg-reg-w',
};

export function BereichsReihe() {
  const pk = usePaneKlasse();
  return (
    // NAME «Bereiche der Sammlung», NICHT «Bereiche» (gemessen 6.9.2026, e2e):
    // die Reiterleiste der Titelblatt-Krone (`layout/Reiterleiste`, R2) trägt
    // bereits `nav aria-label="Bereiche"`. Zwei Landmarks gleichen Namens sind
    // in der Screenreader-Landmark-Liste nicht auseinanderzuhalten — und der
    // Playwright-Selektor traf im Strict Mode zwei Knoten.
    <nav aria-label="Bereiche der Sammlung" className={`grid gap-x-7 gap-y-6 ${pk(
      'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
      'grid-cols-2 @2xl/pane:grid-cols-3 @5xl/pane:grid-cols-5',
    )}`}>
      {NAVIGATION.map((abschnitt) => {
        if (!abschnitt.titel || !abschnitt.ziel) return null;
        const a = ANGABEN[abschnitt.ziel];
        if (!a) return null;
        return (
          <Link key={abschnitt.ziel} to={abschnitt.ziel}
            className="group grid content-start gap-1.5 no-underline">
            <span aria-hidden className={`block h-[3px] w-full ${STRICH[a.reg]}`} />
            <span className="mt-1 font-sans font-medium text-body-l leading-tight text-ink-900 group-hover:underline">
              {abschnitt.titel}
            </span>
            <span className="num font-serif text-h2 leading-none text-ink-900">
              {nf(a.zahl)}
              <small className="mt-1.5 block font-sans text-xs leading-snug text-ink-500">{a.einheit}</small>
            </span>
            <span className="font-sans text-xs leading-relaxed text-ink-600">{a.satz}</span>
          </Link>
        );
      })}
    </nav>
  );
}
