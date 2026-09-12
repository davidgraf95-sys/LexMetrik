import { AbrufFehler } from '../ui/AbrufFehler';

// ═══ «Die Übersetzung der Titel konnte nicht geladen werden» ═════════════════
//
// Auflage der Gegenprüfung zu PR #802 (§8). Seit der Aufteilung des Materialien-
// Registers (12.9.2026) kommen die FR/IT-Titel aus `register-i18n.json` und werden
// nur bei locale fr/it geholt. Scheitert dieser Abruf, zeigt die Fläche die
// deutschen Titel — richtig (nie eine leere Zeile statt des amtlichen Titels),
// aber es darf nicht STILL geschehen: der Leser könnte einen Netzfehler sonst für
// eine Datenlücke halten.
//
// Kein eigener Ton und kein eigener Satzbau — der Kanon-Baustein `ui/AbrufFehler`
// trägt beides (F2-4). Die Liste selbst bleibt stehen, sie ist ja vollständig.
//
// Die BEDINGUNG steht hier, nicht beim Aufrufer: sie ist Teil der Aussage. Nur
// `nicht-geladen` zählt — eine fehlende Einzel-Übersetzung ist «nichts erfasst» und
// war auch vor der Aufteilung stumm; darüber zu warnen wäre eine neue Behauptung.
export function TitelRueckfallZeile({ bezuege, bereich }: {
  /** Die angezeigten Bezüge; jeder trägt den Grund seines Titel-Rückfalls. */
  bezuege: ReadonlyArray<{ titelRueckfall?: 'nicht-erfasst' | 'nicht-geladen' }>;
  /** Fläche, an der die Zeile hängt — Marker für die Sonden (`data-titel-rueckfall`). */
  bereich: 'botschaften' | 'vernehmlassungen';
}) {
  if (!bezuege.some((b) => b.titelRueckfall === 'nicht-geladen')) return null;
  return (
    <AbrufFehler gegenstand="Die Übersetzung der Titel" href="https://www.fedlex.admin.ch"
      daten={{ 'data-titel-rueckfall': bereich }} />
  );
}
