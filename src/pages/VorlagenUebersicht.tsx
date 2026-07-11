import { KATALOG_KARTEN } from '../lib/startseiteConfig';
import { OBERKATEGORIEN } from '../lib/oberkategorien';
import { KategorieSektion } from '../components/Katalog';
import { kartenDerKategorie } from '../lib/katalogKategorie';
import { KatalogHinweis } from '../components/KatalogHinweis';
import { MassgebendeGesetze } from '../components/normtext/MassgebendeGesetze';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { EntwurfLegende } from '../components/EntwurfLegende';

// ─── Vorlagen-Übersicht (/vorlagen) — UI-Welle, Ersatz für /recherche ───────
//
// Eigene Rubrik-Übersicht analog zu /gesetze und /rechner (Auftrag David):
// die fünf Dokument-Gruppen (Behördeneingaben · Verträge · Einseitige
// Willenserklärungen · Gesellschaftsrecht · Vorsorge & Nachlass) mit
// Rechtsgebiet-Filter, browsbar auf EINER Seite. Reine Wiederverwendung der
// bestehenden KategorieSektion/VorlagenRegister (§3/§5).
const VORLAGEN_KATEGORIE = OBERKATEGORIEN.find((k) => k.id === 'vorlagen')!;

export function VorlagenUebersicht() {
  return (
    <div className="space-y-8">
      <SeitenKopf
        overline="Vorlagen & Dokumente"
        titel="Vorlagen"
        intro="Verträge, Eingaben, Erklärungen und Dokumentmappen – regelbasiert aufgesetzt, mit ehrlichen Form-Grenzen. Nach Rechtsgebiet filterbar."
      />

      <EntwurfLegende />

      <KategorieSektion kat={VORLAGEN_KATEGORIE} karten={kartenDerKategorie(KATALOG_KARTEN, 'vorlagen')} ohneKopf />

      <MassgebendeGesetze modus="vorlage" />
      <KatalogHinweis />
    </div>
  );
}
