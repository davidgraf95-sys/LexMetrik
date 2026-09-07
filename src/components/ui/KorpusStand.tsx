import { Fragment } from 'react';
import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';
import { Datum } from './Datum';

// ─── Korpus-Stand · EIN Baustein, drei Konsumenten (W2·23-STARTSEITE-V4) ─────
//
// Konsumenten: Ausgabe-Zeile des Titelblatts (`layout/Topbar`), Fuss der
// Seitenleiste und der mobilen Schublade (`layout/Sidebar`). §3: reine
// Darstellung, alle Werte aus der buildseitig erzeugten Mini-Datei (kein
// Register-Import in den Shell-Chunk, §15).
//
// ── D8 (David 6.9.2026) · WAS HIER STEHT, IST DAS ALTER DER INHALTE ─────────
//
// Bis hierher stand «Register erzeugt: Gesetze 05.09.2026 · Rechtsprechung
// 05.09.2026 · Materialien 05.09.2026» — drei Mal dasselbe Datum, weil es das
// Datum des BUILD-LAUFS war. David: irreführend. Die Zeile beantwortet die
// Frage, die ein Jurist an eine Sammlung stellt («wie aktuell ist der Bestand?»),
// und beantwortete sie mit einer Zahl über den Generator statt über den Inhalt.
//
// JETZT führt sie zwei Angaben, in dieser Rangfolge:
//  1. «Jüngster Eintrag» — je Sammlung das Datum des jüngsten INHALTS:
//     Gesetze = jüngster Konsolidierungsstand aller Volltext-Erlasse
//     («Stand», weil ein Erlass keinen Erscheinungstag, sondern eine Fassung
//     hat), Entscheide = jüngstes Entscheiddatum der Nicht-Verweise,
//     Materialien = jüngster Publikationsstand. Alle drei kommen buildseitig
//     aus denselben Registern wie die Zählwerte (`gen:zaehler`, Drift-Tor
//     `check:zaehler`) — keine zweite Wahrheit (§5), keine Client-Rechnung.
//     Fehlt ein Wert (im Register kein gültiges ISO-Datum), FÄLLT DIE ZEILE
//     WEG, statt eine Zahl zu erfinden (§8).
//  2. «Register erzeugt am …» — das Build-Datum bleibt sichtbar, aber klein und
//     ausdrücklich als das benannt, was es ist. Es ist die Antwort auf eine
//     ANDERE Frage («wann wurde zuletzt eingelesen?») und darf darum nicht
//     verschwinden; es darf nur nicht mehr als Stand der Inhalte gelesen werden.
//     Genannt wird der jüngste der drei Erzeugungsläufe — drei Build-Daten
//     nebeneinander waren genau der Lärm, der die erste Zeile verdeckt hat.
export function KorpusStand({ className = '' }: { className?: string }) {
  const z = STARTSEITE_ZAEHLER;
  // «Stand» nur beim Erlass: dort datiert das Feld eine FASSUNG, bei Entscheid
  // und Materialie den Eintrag selbst. Das Wort trägt also eine Bedeutung und
  // ist keine Verzierung.
  const zeilen: { name: string; iso: string; stand?: boolean }[] = [
    ...(z.juengsterGesetzStand ? [{ name: 'Gesetze', iso: z.juengsterGesetzStand, stand: true }] : []),
    ...(z.juengsterEntscheid ? [{ name: 'Entscheide', iso: z.juengsterEntscheid }] : []),
    ...(z.juengsteMaterialie ? [{ name: 'Materialien', iso: z.juengsteMaterialie }] : []),
  ];
  const erzeugt = [z.standGesetze, z.standRechtsprechung, z.standMaterialien]
    .filter(Boolean).sort().at(-1);
  return (
    <p className={`text-micro text-ink-500 leading-relaxed ${className}`}>
      {zeilen.length > 0 && (
        <>
          <span className="text-ink-600">Jüngster Eintrag:</span>{' '}
          {/* Der Trenner steht AUSSERHALB des `whitespace-nowrap`, damit die Zeile
              zwischen den Sammlungen umbrechen kann. Zusammen bleibt nur, was
              zusammengehört (Name + Datum).
              GEMESSEN 5.9.2026 (W2·23 Paket B, Preview @1440, Konsument
              Seitenleisten-Fuss): mit dem Trenner INNERHALB der nowrap-Spans gab es
              in der ganzen Zeile keinen einzigen Umbruchpunkt — sie mass 385 px in
              einer 223 px breiten Spalte und gab der Seitenleiste eine horizontale
              Scrollachse (scrollWidth 401 gegen clientWidth 255). */}
          {zeilen.map((r, i) => (
            <Fragment key={r.name}>
              {i > 0 && <span aria-hidden> · </span>}
              <span className="whitespace-nowrap">
                {r.name}{r.stand ? ' Stand' : ''} <Datum iso={r.iso} />
              </span>
            </Fragment>
          ))}
        </>
      )}
      {erzeugt && (
        <>
          {zeilen.length > 0 && <span aria-hidden> · </span>}
          <span className="whitespace-nowrap">Register erzeugt am <Datum iso={erzeugt} /></span>
        </>
      )}
    </p>
  );
}
