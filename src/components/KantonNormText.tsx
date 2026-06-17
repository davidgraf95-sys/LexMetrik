import { NORM_IM_TEXT, fedlexLinkFuerArtikel } from '../lib/fedlex';
import { NormChip } from './vorlagen/ui';
import { KantonQuelleLink } from './KantonQuelleLink';
import { RechtsprechungText } from './RechtsprechungLink';

// ─── Kontext-bewusster Inline-Linker für kantonale Tarif-Hinweise (Phase 2,
//     Auftrag David «jede Norm verlinkt» + «§≡Art») ─────────────────────────
//
// Schwester von NormText, aber MIT Erlass-Kontext: Ein kantonaler Tarif
// (`KantonalerTarif`) bringt quelleUrl + Erlass + den eigenen `artikel` mit.
// Sein `hinweis` beschreibt GENAU diesen Erlass — darum lassen sich darin
// genannte «§ N» (bzw. «Art. N» bei Kantonen, die Art. verwenden) eindeutig auf
// EBEN DIESEN Erlass auflösen (quelleUrl → Kanton-Snapshot, wie KantonArtikelTrigger).
//
// Korrektheit (§1): kein blinder §-/Art.-Linker. Drei Sicherungen:
//  1. Bundesrechtliche «Art. N GESETZ» werden ZUERST über den Bund-Resolver
//     erkannt (fedlexLinkFuerArtikel) und als Bund-Chip gerendert — sie werden
//     NIE dem kantonalen Erlass zugeschrieben.
//  2. «§ N» ist ein eindeutig KANTONALER Designator (der Bund nutzt nur «Art.»)
//     und wird in einem erlass-gebundenen Hinweis immer auf den Kontext-Erlass
//     aufgelöst. Bundesfremde «Art. N» werden NUR aufgelöst, wenn der Tarif-
//     `artikel` selbst Art.-Stil nutzt (Romandie/TI/BE/UR …) — so wird ein lose
//     stehendes föderales «Art. N» in einem §-Kanton nicht falsch zugeschrieben.
//  3. Überlappt ein kantonaler Treffer einen Bund-Treffer, gewinnt der Bund.
// Reste laufen durch RechtsprechungText (BGE/BGer). Reine Darstellung (§3),
// progressive enhancement (SSR-Erstrender = <a>/Text, Popover erst im Browser).

const INLINE_CLASS = 'underline decoration-dotted underline-offset-2 hover:text-brass-700';
const KANTON_CLASS = 'underline decoration-dotted underline-offset-2 hover:text-ink-800 cursor-pointer';

// Kantonaler Designator je Stil. Erfasst N[a-z]/bis… + optional Abs./lit./Ziff.
// (für die präzise Markierung im Popover via parsePassus).
const PASSUS_SUFFIX = '(?:\\s+Abs\\.\\s*\\d+[a-z]?(?:bis|ter)?)?(?:\\s+(?:lit\\.|Bst\\.)\\s*[a-z])?(?:\\s+Ziff\\.\\s*\\d+[a-z]?)?';
const RE_PARAGRAF = new RegExp('§\\s*\\d+[a-z]?(?:bis|ter)?' + PASSUS_SUFFIX, 'g');
const RE_ARTIKEL = new RegExp('Art\\.\\s*\\d+[a-z]?(?:bis|ter|quater|quinquies)?' + PASSUS_SUFFIX, 'g');

interface Treffer { start: number; end: number; node: React.ReactNode; }

export function KantonNormText({ text, quelle }: {
  text: string;
  // quelleUrl/artikel optional: fehlt die Quelle-URL (z. B. Kanton ohne Erlass-
  // Link), wird NUR der Bund-/Rechtsprechungs-Pfad gerendert (kein toter
  // kantonaler Link). So ist die Komponente überall sicher einsetzbar.
  quelle: { quelleUrl?: string | null; artikel?: string; erlassName?: string; erlassNr?: string };
}) {
  const treffer: Treffer[] = [];

  // 1. Bund-Treffer (haben Vorrang) — nur was der Bund-Resolver wirklich auflöst.
  for (const m of text.matchAll(NORM_IM_TEXT)) {
    const roh = m[0];
    if (fedlexLinkFuerArtikel(roh) == null) continue;
    treffer.push({
      start: m.index, end: m.index + roh.length,
      node: <NormChip key={`b${m.index}`} artikel={roh} linkClass={INLINE_CLASS} />,
    });
  }

  // 2. Kantonale Treffer — nur mit Quelle-URL (sonst kein auflösbarer Link).
  //    «§ N» immer (eindeutig kantonal); «Art. N» nur, wenn der Tarif-Artikel
  //    selbst Art.-Stil nutzt.
  const quelleUrl = quelle.quelleUrl;
  const kantRegexe = quelleUrl ? [RE_PARAGRAF] : [];
  if (quelleUrl && (quelle.artikel ?? '').trimStart().startsWith('Art.')) kantRegexe.push(RE_ARTIKEL);
  for (const re of kantRegexe) {
    for (const m of text.matchAll(re)) {
      const start = m.index, end = start + m[0].length;
      // Überlappung mit einem Bund-Treffer (oder bereits erfasstem kant. Treffer)
      // → erster gewinnt; kein Doppel/Falsch.
      if (treffer.some((t) => start < t.end && end > t.start)) continue;
      treffer.push({
        start, end,
        node: (
          <KantonQuelleLink
            key={`k${start}`}
            quelle={{ quelleUrl: quelleUrl!, artikel: m[0], erlassName: quelle.erlassName, erlassNr: quelle.erlassNr }}
            className={KANTON_CLASS}
          >
            {m[0]}
          </KantonQuelleLink>
        ),
      });
    }
  }

  if (treffer.length === 0) return <RechtsprechungText text={text} />;

  // 3. In Dokumentreihenfolge zusammensetzen; Lücken durch RechtsprechungText.
  treffer.sort((a, b) => a.start - b.start);
  const teile: React.ReactNode[] = [];
  let zuletzt = 0;
  for (const t of treffer) {
    if (t.start < zuletzt) continue; // Sicherheitsnetz gegen Restüberlappung
    if (t.start > zuletzt) teile.push(<RechtsprechungText key={`r${zuletzt}`} text={text.slice(zuletzt, t.start)} />);
    teile.push(t.node);
    zuletzt = t.end;
  }
  if (zuletzt < text.length) teile.push(<RechtsprechungText key={`r${zuletzt}`} text={text.slice(zuletzt)} />);
  return <>{teile}</>;
}
