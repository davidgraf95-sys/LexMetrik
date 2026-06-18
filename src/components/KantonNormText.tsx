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
//  2. NUR «§ N» wird kantonal aufgelöst (eindeutig kantonal — der Bund nutzt
//     ausschliesslich «Art.»), und NUR wenn die Quelle eine echte kantonale
//     (nicht-fedlex) URL trägt. «Art. N» wird hier NIE kantonal aufgelöst: ein
//     bundesrechtlicher Posten (z. B. BGer, «Art. 65 BGG», fedlex-URL) hat
//     bare «Art. N»-Fragmente, die der Bund-Pass mangels Gesetz nicht erfasst —
//     sie kantonal auf die fedlex-URL zu zeigen ergäbe einen toten Popover.
//     Kantone mit Art.-Designator (Romandie/TI/BE/UR) verlinken ihre Artikel
//     weiterhin über den strukturierten KantonArtikelTrigger-Chip.
//  3. Überlappt ein kantonaler Treffer einen Bund-Treffer, gewinnt der Bund.
// Reste laufen durch RechtsprechungText (BGE/BGer). Reine Darstellung (§3),
// progressive enhancement (SSR-Erstrender = <a>/Text, Popover erst im Browser).

const INLINE_CLASS = 'underline decoration-dotted underline-offset-2 hover:text-brass-700';
const KANTON_CLASS = 'underline decoration-dotted underline-offset-2 hover:text-ink-800 cursor-pointer';

// Kantonaler «§»-Designator + optional Abs./lit./Ziff. (für die präzise
// Markierung im Popover via parsePassus). NUR «§» — siehe Sicherung (a) unten;
// «Art.» wird bewusst nicht kantonal aufgelöst.
const PASSUS_SUFFIX = '(?:\\s+Abs\\.\\s*\\d+[a-z]?(?:bis|ter)?)?(?:\\s+(?:lit\\.|Bst\\.)\\s*[a-z])?(?:\\s+Ziff\\.\\s*\\d+[a-z]?)?';
const RE_PARAGRAF = new RegExp('§\\s*\\d+[a-z]?(?:bis|ter)?' + PASSUS_SUFFIX, 'g');

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

  // 2. Kantonale Treffer — NUR «§ N» und NUR bei einer echten kantonalen Quelle.
  //    Zwei harte Sicherungen (Bug-Befund 17.6.2026):
  //    (a) «§» ist der eindeutig KANTONALE Designator — der Bund nutzt nur «Art.».
  //        «Art. N» wird hier bewusst NICHT kantonal aufgelöst: ein bundes-
  //        rechtliches Tarif-Posten (z. B. BGer, quelle.artikel «Art. 65 BGG»)
  //        trägt eine fedlex-URL; ein dort losstehendes «Art. N» (ohne Gesetz,
  //        vom Bund-Pass nicht erfasst) würde sonst als kantonaler Link auf eine
  //        fedlex-URL zeigen, die der Kanton-Loader nicht auflöst → toter Popover.
  //    (b) Quelle muss eine NICHT-fedlex-URL sein — föderale Quellen bekommen nie
  //        eine kantonale Behandlung. Reiner Sicherheitsgurt zu (a).
  const quelleUrl = quelle.quelleUrl;
  const istKantonaleQuelle = !!quelleUrl && !quelleUrl.includes('fedlex.admin.ch');
  const kantRegexe = istKantonaleQuelle ? [RE_PARAGRAF] : [];
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
