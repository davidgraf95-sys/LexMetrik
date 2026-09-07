import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { NormChip } from '../../../components/vorlagen/NormChip';
import { SUCH_META } from '../suchHighlight';
import { BezuegeKopf, type BezugsMarke } from './BezuegeKopf';
import { BezuegeZeile } from './BezuegeZeile';
import { LeitfallZeile } from './ArtikelLeser.leitfaelle';
import type { ArtikelBezuege } from '../bezuegeLaden';
import type { LeitfallRef } from '../../../lib/rechtsprechung/norm-index';
import type { MaterialBezug, Werkzeug } from '../../../lib/normtext/werkzeuge';
import type { ArtikelRevision } from '../../../lib/verzahnung/artikel-revisionen';

// ═══ Der BEZÜGE-FUSS des Artikels — EIN Baustein für BEIDE Formen ═══════════
//
// §6.6-Split aus `./ArtikelLeser.tsx` (W2·24-F, 7.9.2026 — 866 Zeilen gegen
// die Schwelle 800). Herausgelöst sind die vier Rubriken (Entscheide ·
// Materialien · Verweise · Rechnen) samt der Zahlen-Zeile, aus der sie
// aufklappen.
//
// ── W2·24-D34 (David 7.9.2026) · DIE ZEILE STEHT AM ARTIKELENDE ────────────
// Wörtlich: «das mit den bezügen soll unten an den artikel und nicht direkt
// nach der artikel nummer». Bis D33 sass die Zeile direkt unter der
// Artikelnummer (Breitform, `kopfForm`) — dort trennte sie die Überschrift von
// ihrem eigenen Wortlaut. Sie steht jetzt UNTER dem letzten Absatz und dem
// Fussnoten-Apparat, vor dem nächsten Artikel, mit einer feinen Trennlinie
// darüber (Linien statt Flächen, F0.6). Im Druck bleibt sie ausgeblendet.
//
// DAMIT FÄLLT DIE ZWEITE STELLE. Bis D33 hatte die ZEILENFORM (@390, Pane,
// Trefferliste) einen EIGENEN Artikelfuss im Beiwerk der Hauptdatei: eine
// offene Verweis-Chip-Reihe und daneben `BezuegeZeile`/`LeitfallZeile` als
// zweiter Konsument derselben Bezugsdaten. Zwei Orte, zwei Gestalten, ein
// Fachinhalt — genau die zweite Wahrheit, die §5 verbietet. Beide Orte sind
// jetzt DIESER Baustein; die Form entscheidet nichts mehr (kein `kopfForm`-
// Aufhänger). Der alte Zweig ist ersatzlos gelöscht, nicht bewacht
// (§17-Gegengewicht).
//
// NEBENWIRKUNG, die ausdrücklich erwünscht ist: die Verweis-Chips und die
// Entscheid-Liste stehen in beiden Formen nur noch INNERHALB des `<details>`.
// Ein geschlossenes `<details>` legt seinen Inhalt nicht ins Layout — die
// unbedingte Fuss-Zeile der Zeilenform, die beim Eintreffen des Shards in den
// Lesekörper hineinwuchs (Pos. 12, `e2e/leser-v3-kontext-cls` (b)), kann es
// darum baulich nicht mehr geben.
//
// ── W2·24-D35-F1 (David 7.9.2026) · DIE ZEILE WIRD ZUR FUNKTIONSZEILE ──────
// Wörtlich, Nachtrag zum Variante-A-Entscheid: «das alles soll dann nur auf
// klick aufklappbar sein». Diese Datei RECHNET die Zahlen und liefert je Rubrik
// den Inhalt, den ihr Griff aufklappt; die Zeile selbst (Griffe, Zustand,
// Aktions-Slot) steht in `./BezuegeKopf.tsx`. Neu ist der Slot `aktionen`: die
// Artikel-Aktionen «Zitat · Link · Amtliche Fassung ↗» (zum fehlenden vierten
// Knopf «⧉ Daneben öffnen» s. die Abweichungs-Notiz in `./ArtikelAktionen.tsx`)
// stehen seither RECHTS in derselben Zeile und dauerhaft sichtbar, statt in der
// Artikel-Kopfzeile unter `opacity-0` (Herleitung in `./ArtikelAktionen.tsx`).
//
// Der D34-Satz über das geschlossene `<details>` gilt für seinen Stand
// unverändert weiter (§2b) — der Bau ist seit D35-F1 noch strenger: eine
// zugeklappte Rubrik rendert ihren Inhalt GAR NICHT (bedingtes Rendern statt
// versteckter Box). Sie kann also weder Layout noch Ladung auslösen.
//
// VERHALTENSNEUTRAL (§6) gegenüber D33 im INHALT: Markup, Reihenfolge, Klassen
// und die Rechnung der Marken sind unverändert; verändert sind der ORT und die
// Namen der von aussen kommenden Werte (`onBezuegeOeffnen` → `onOeffnen`,
// `bezuegeLaedt && !bezuege` → `laedt`). Golden-Beweis über
// `npm run golden:vergleich` und `check:golden-normtext`.

export function ArtikelBezuegeFuss({
  bezuege, bezuegeImFuss, leitfaelle, materialien, verweise, werkzeuge, zaehler,
  zitat, revision, onOeffnen, laedt, aktionen,
}: {
  bezuege?: ArtikelBezuege;
  bezuegeImFuss?: ArtikelBezuege;
  leitfaelle?: LeitfallRef[];
  materialien?: MaterialBezug[];
  /** Die im Artikel genannten, auflösbaren Normverweise (`sammleVerweise`). */
  verweise: string[];
  /** Rechner/Vorlagen an genau diesem Artikel (`randNotizWerkzeuge`). */
  werkzeuge: readonly Werkzeug[];
  zaehler?: { entscheide: number; materialien: number };
  /** KURZ-Zitat («Art. 957 OR») — Fundstellen-Signal für den Entscheid-Sprung. */
  zitat: string;
  revision?: ArtikelRevision | null;
  onOeffnen?: () => void;
  laedt?: boolean;
  /** D35-F1 · die Artikel-Aktionen rechts in derselben Zeile. */
  aktionen?: ReactNode;
}) {
  /** Die Zahlen der Funktionszeile — ausschliesslich aus Daten, die der Artikel
   *  ohnehin führt (§8: keine Rubrik ohne echte Zahl, keine neue Ladelogik). */
  // W2·24-R6c: die Zähl-Datei schlägt beide bisherigen Quellen — sie ist
  // GEZÄHLT, nicht gefiltert, und deshalb dieselbe Zahl vor und nach dem Laden
  // des Shards (die Zeile springt nicht mehr um, sobald der Apparat eintrifft).
  // Ohne Datei bleibt die frühere Reihenfolge unverändert bestehen: gefilterte
  // Kanten, sonst Leitfälle.
  // ── D30 (David 6.9.2026) · «ZÄHLER = LISTENLÄNGE NACH DEM LADEN» ──────────
  // Die Reihenfolge unten bleibt die von R6c (Zähl-Datei zuerst) — sie ist der
  // Grund, aus dem die Zahl beim Eintreffen des Shards nicht umspringt.
  //
  // DAVIDS REGEL IST DAMIT NICHT UMGANGEN, SONDERN AN DER WURZEL ERFÜLLT: die
  // Zähl-Datei zählt `gesamtProArtikel` des Shards, also OHNE UI-Filter
  // (`scripts/gen-bezuege-zaehler.ts`), und die Liste bezieht ihre Kanten seit
  // D30 aus `alleFuer` — ebenfalls ohne UI-Filter. Beide Wege zählen dasselbe;
  // die Zahl kann also gar nicht mehr springen, egal welcher zuerst da ist.
  // (Bis D30 tat sie es: gemessen OR 336c «11 Entscheide» im Kopf gegen 3
  // gezeigte, weil `bezuegeFuer` die Panel-Facetten anwandte — Herleitung in
  // `../bezuegeLaden`.) Dass die beiden Wege übereinstimmen, ist eine ZUSAGE
  // und keine Hoffnung: `e2e/leser-bezuege-inhalt-d30.e2e.ts` (b) misst
  // Zeilenzahl gegen die Zahl der gerenderten Zeilen.
  //
  // Der Fallback nimmt `bezuegeImFuss` VOR `bezuege`: das ist die Quelle, die
  // auch die Liste darunter zeigt — die Zahl beschriebe sonst eine andere
  // Menge als das, was daneben steht. (Bis D34 hiess die Prop
  // `bezuegeImKopf`; der Ort hat gewechselt, die Rangfolge nicht.)
  const b = bezuegeImFuss ?? bezuege;
  const bezugsMarken: BezugsMarke[] = [
    {
      reg: 'r',
      anzahl: zaehler ? zaehler.entscheide : (b ? b.kanten.length : (leitfaelle?.length ?? 0)),
      wort: ['Entscheid', 'Entscheide'],
      brauchtDaten: true,
      /* ── D30 · DIE ENTSCHEIDE, DIE DER ZÄHLER VERSPRICHT ─────────
         `form="rand"`: senkrecht gestapelte Zeilen mit Zitierung und
         Regeste, Leitentscheide zuerst (die Gruppen laufen nach
         `STATUS_RANG`, BGE vor allem anderen). Das ist DIESELBE
         Komponente und dieselbe Portionierung wie überall sonst — nur
         die Gestalt, die R4 für die schmale Randspalte gebaut hat und
         die hier aus demselben Grund richtig ist: in einer aufgeklappten
         Liste unter dem Artikel sucht niemand eine waagrechte
         Scrollachse. Der Klick öffnet daneben (Split-Regel M3) — das
         bringt `KanteMitVorschau` mit, nicht diese Stelle. */
      inhalt: b
        ? <BezuegeZeile kanten={b.kanten} gesamt={b.gesamt}
            zeitAktiv={b.zeitAktiv} kantonAktiv={b.kantonAktiv}
            normZitat={zitat} revision={revision} form="rand" />
        : (leitfaelle && leitfaelle.length > 0
            ? <LeitfallZeile refs={leitfaelle} normZitat={zitat} revision={revision} />
            : null),
    },
    // Die Rubrik erscheint NUR mit echter Zahl (`anzahl > 0` filtert sie sonst
    // in `BezuegeKopf` heraus) — ohne Zähl-Datei steht sie also gar nicht da,
    // statt eine Null zu behaupten (§8). Dieselbe Deckungsgleichheit wie oben:
    // die Zähl-Datei entdoppelt die Material-Kanten nach Dokument, und genau so
    // baut `projiziereMaterialien` die Liste (ein Eintrag je Dokument).
    // ── D30 · MATERIALIEN, dieselbe Anatomie wie «Rechnen» ───────
    // Ein Titel je Dokument, daneben die Art (Behörde + Doktyp) —
    // dieselbe Zeilenform wie der Rechnen-Block (§5), damit die Rubriken
    // EINE Liste sind und nicht drei Gestalten. `sublabel` ist die
    // amtliche Fundstelle-Ziffer im Dokument; sie steht nur, wenn der
    // Kanten-Shard sie führt.
    {
      reg: 'm',
      anzahl: zaehler?.materialien ?? (materialien?.length ?? 0),
      wort: ['Materialie', 'Materialien'],
      brauchtDaten: true,
      inhalt: materialien && materialien.length > 0
        ? (
          <>
            <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Materialien</span>
            <ul className="lr6-notiz-liste">
              {materialien.map((mat) => (
                <li key={mat.key} data-bez-material>
                  <Link to={mat.pfad}>{mat.titel}</Link>
                  <span className="lr6-notiz-art">
                    {mat.behoerdeKuerzel} {mat.doktypLabel}{mat.sublabel ? ` · ${mat.sublabel}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )
        : null,
    },
    {
      reg: 'g',
      anzahl: verweise.length,
      wort: ['Verweis', 'Verweise'],
      inhalt: (
        <>
          <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Verweise</span>
          <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
            {verweise.map((v) => <NormChip key={v} artikel={v} />)}
          </span>
        </>
      ),
    },
    {
      reg: 'w',
      anzahl: werkzeuge.length,
      wort: ['Rechner', 'Rechner'],
      inhalt: (
        <>
          <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Rechnen</span>
          <ul className="lr6-notiz-liste">
            {werkzeuge.map((w) => (
              <li key={w.id}>
                <Link to={w.href}>{w.titel}</Link>
                {/* Art des Werkzeugs: ein Rechner rechnet, eine Vorlage
                    füllt ein Dokument — für die Auswahl der Unterschied. */}
                <span className="lr6-notiz-art">{w.modus === 'vorlage' ? 'Vorlage' : 'Rechner'}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
  ];
  return (
    <div {...{ [SUCH_META]: '' }}>
      <BezuegeKopf marken={bezugsMarken} zitat={zitat} aktionen={aktionen}
        onOeffnen={onOeffnen} laedt={laedt} />
    </div>
  );
}
