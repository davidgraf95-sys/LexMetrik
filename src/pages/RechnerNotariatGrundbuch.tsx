import { NotariatGrundbuchForm } from '../components/forms/NotariatGrundbuchForm';
import { Card } from '../components/ui/Card';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Notariats- & Grundbuchkosten /rechner/notariat-grundbuch (FAHRPLAN-NOTARIAT-
// GRUNDBUCH). Erwerbs-Nebenkosten beim Grundstückkauf aller 26 Kantone:
// Beurkundung + Grundbuch + Grundpfand + Handänderungssteuer. Dossier
// bibliothek/kosten/notariat-grundbuch-kantone.md.
export function RechnerNotariatGrundbuch() {
  const calc = getCalculator('notariat-grundbuch')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <Card>
        <NotariatGrundbuchForm />
      </Card>
    </div>
  );
}
