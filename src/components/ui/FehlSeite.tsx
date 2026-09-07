import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SeitenKopf } from '../layout/SeitenKopf';
import { usePaneKlasse } from '../layout/PaneKontext';

// ═══ EINE Fehlseite (D-6, W2·19-DESIGN-KONSISTENZ · B2/BAU-4, 31.8.2026) ════
//
// GEMESSEN (Finder-Welle D, Runde 1): dieselbe Auskunft — «was Sie aufgerufen
// haben, gibt es hier nicht» — trug DREI Bauformen und drei Wege hinaus:
//
//   Fläche                        Kopf                  Aussage            Weiterweg
//   ─────────────────────────────────────────────────────────────────────────────────
//   pages/NotFound                SeitenKopf            Lead-Absatz        3 Links, ohne Pfeil
//   gesetz-leser/FehlSeite        Rücksprung + KEIN     `lc-notice-warn`   «‹ Zur Gesetzes-
//                                 Titel                 -Kasten             sammlung»
//   MaterialLeser (Fehl-Zweig)    SeitenKopf            im `intro`         «← Alle Materialien»
//                                                                           (`lc-btn-outline`)
//   EntscheidLeser :541           Rücksprung + KEIN     `lc-notice-warn`   «‹ Zur Recht-
//                                 Titel                 -Kasten             sprechung»
//
// KANON, Stück für Stück aus dem Bestand hergeleitet (Fahrplan §1: schweigt das
// Reglement, gewinnt die verbreitetere Form):
//
//   · KOPF = die SeitenKopf-Familie (Overline · Ablesekante · `SeitenTitel`).
//     Sie ist die einzige der drei Formen, die überhaupt einen Titel setzt —
//     zwei der vier Flächen liessen die H1 der Seite ganz weg und sprangen von
//     der App-Leiste direkt in einen Warn-Kasten. Der Kopf wird KONSUMIERT, nicht
//     nachgebaut (§5/§10): `layout/SeitenKopf` → `ui/SeitenTitel` (A-1).
//
//   · AUSSAGE = der Lead des Kopfes, kein `lc-notice-warn`-Kasten. D-7 hat den
//     Kasten für die ABDECKUNGSLÜCKE mit eigener Erklärung reserviert
//     (`ui/Leerzustand`, IA-2/§11.1); ein Tippfehler in der Adresse ist keine.
//     Der WORTLAUT bleibt unverändert erhalten (§8) — er wandert nur aus dem
//     Kasten in den Lead.
//
//   · WEITERWEG = Pflicht, vom Typ erzwungen (`wege` ist ein nicht-leeres
//     Tupel, ein Aufruf ohne Weg kompiliert nicht) — dieselbe Bauweise wie der
//     Pflicht-`weiterweg` in `ui/Leerzustand`. REGL:122/C1: nie eine Sackgasse.
//     Das war der EntscheidLeser bis heute: ein Warn-Kasten, ein Rücksprung,
//     sonst nichts.
//
//   · PFEIL = «←». KORREKTUR der Finder-Zählung (Finder-D meldete 7:3; am
//     Bestand 31.8.2026 NICHT reproduzierbar — die Zahl gilt als falsifiziert,
//     nicht als überholt). NACHGEZÄHLT in der Klasse «Rücksprung-Link auf eine
//     Übersichtsseite»:
//       «←» 6× — RechnerStub:24 · MaterialLeser:86/:151 · Gesetze:341/:556 ·
//                Katalog:363
//       «‹» 5× — EntscheidLeser:544/:965 · gesetz-leser/FehlSeite:38 ·
//                gesetz-leser/inhalt-ansichten:130/:177
//     6:5 trägt schwächer als gemeldet, kippt den Entscheid aber nicht: die
//     Mehrheit steht, und dieses Paket zieht die drei Stellen nach, die es
//     besitzt (die zwei in `inhalt-ansichten` bleiben Rest → Fahrplan §3).
//     NICHT mitgezählt und bewusst UNANGETASTET ist die andere «‹»-Klasse — der
//     Pfeil in engen Kopf-/Ortsleisten und in der Erlass-Blätterung
//     (`OrtsAngabe`, `LeserKopf`, `LeserLesespalte`): dort steht er als
//     Chevron neben einem Wort in einer Zeile, nicht als Rückweg einer Seite.
//     FORM = der ruhige Textlink (`text-body-s font-medium text-brass-700`),
//     ebenfalls die Mehrheitsform (4× Textlink gegen 2× `lc-btn-outline` in
//     `MaterialLeser`): der Rückweg aus einer Fehlseite ist eine Auskunft,
//     keine Erledigung — dieselbe Herleitung wie beim `QuellLink` (B-1).
//
// IM PANE DICHTER: der Kopf bleibt derselbe Baustein (er skaliert seit A-1
// selbst an der Pane-Breite); pane-abhängig ist NUR der Aussenabstand — eine
// 620-px-Pane kann sich `py-16` nicht leisten, und `usePaneKlasse` ist die eine
// Stelle, an der diese Unterscheidung im Haus getroffen wird (§5).
//
// §3: reine Darstellung/Navigation. Der Baustein entscheidet nicht, OB etwas
// fehlt — das sagt ihm der Aufrufer.

/** Ein Weg aus der Fehlseite hinaus. */
export interface FehlWeg {
  to: string;
  label: string;
}

export function FehlSeite({ bereich, objekt, name, erklaerung, wege, vorschlaege, suchfeld }: {
  /** Overline: die Fläche, in der der Nutzer steht («Rechtsprechung», «404 · Nicht gefunden»). */
  bereich: string;
  /** Das Ding, das fehlt — trägt den Titel («Entscheid» → «Entscheid nicht gefunden»). */
  objekt: string;
  /** Der ANGEFRAGTE Schlüssel. §8: benennen, was gesucht wurde, statt allgemein
   *  zu bedauern. Mono, weil er ein Aktenzeichen/eine SR-Nummer ist. */
  name?: string;
  /** Zusätzlicher ehrlicher Satz («Möglicherweise wurde er noch nicht erfasst.»). */
  erklaerung?: ReactNode;
  /** Mindestens EIN Weg hinaus — Pflicht, nicht Sorgfalt (REGL:122/C1). */
  wege: [FehlWeg, ...FehlWeg[]];
  /** «Meinten Sie …?» — deterministische Vorschläge des Aufrufers. */
  vorschlaege?: ReactNode;
  /** Eingebettetes Suchfeld des Aufrufers (Register/Manifest der Domäne). */
  suchfeld?: ReactNode;
}) {
  const pk = usePaneKlasse();
  const intro = (name || erklaerung) ? (
    <>
      {name && <>«<span className="num">{name}</span>» ist nicht als {objekt} im Bestand. </>}
      {erklaerung}
    </>
  ) : undefined;
  return (
    <div className={pk('py-16 space-y-6', 'py-6 space-y-5')}>
      <SeitenKopf overline={bereich} titel={`${objekt} nicht gefunden`} intro={intro} />
      {vorschlaege}
      {suchfeld}
      <nav aria-label="Weiterweg" className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {wege.map((w) => (
          <Link key={w.to} to={w.to}
            className="text-body-s font-medium text-brass-700 hover:text-brass-600 no-underline">
            ← {w.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
