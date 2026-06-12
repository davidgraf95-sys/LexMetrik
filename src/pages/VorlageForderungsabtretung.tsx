import { useMemo } from 'react';
import {
  FA_DEFAULTS, faZusammenstellen, pruefeFaGates, type FaAntworten,
} from '../lib/vorlagen/forderungsabtretung';
import { KDG_ZUGANGS_HINWEIS } from '../lib/vorlagen/kuendigungGemeinsam';
import { zahl } from '../lib/vorlagen/datum';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Abtretungserklärung / Zession (Art. 164 ff. OR) ───────
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2).
// Erklärende Partei ist die ZEDENTIN; die Schriftform verlangt ihre
// Unterschrift (Art. 165 Abs. 1 OR). Die Hinweise liegen in pruefeFaGates.

const SPEICHER_KEY = 'lexmetrik.vorlage.forderungsabtretung.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien' },
  { id: 'forderung', label: 'Forderung & Optionen' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_FA: PdfBanner = {
  titel: 'ABTRETUNG – SCHRIFTFORM ZWINGEND (ART. 165 ABS. 1 OR)',
  text: 'Von der abtretenden Partei (Zedentin/Zedent) zu unterzeichnen. Abtretungsverbote im Grundvertrag vorbehalten (Art. 164 Abs. 1 OR).',
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function VorlageForderungsabtretung() {
  const card = karte('forderungsabtretung');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<FaAntworten>({ defaults: FA_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis } = useMemo(() => faZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeFaGates(), []);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.absenderName.trim()) f.push('Zedentin/Zedent (abtretende Partei) angeben.');
      if (!a.adressatName.trim()) f.push('Zessionarin/Zessionar (Erwerberin) angeben.');
      if (!a.schuldnerName.trim()) f.push('Schuldnerin/Schuldner der Forderung angeben.');
    }
    if (i === 1) {
      if (!a.forderungBeschrieb.trim()) f.push('Forderung bezeichnen (z. B. «Kaufpreisforderung aus Kaufvertrag vom 1. Februar 2026»).');
      if (a.betragErfassen && zahl(a.betrag) === null) f.push('Betrag in CHF angeben (oder Erfassung deaktivieren).');
    }
    if (i === 2) {
      if (!a.ort.trim()) f.push('Ort angeben.');
      if (!ISO.test(a.datum)) f.push('Datum der Erklärung angeben.');
      f.push(...gates.blocker);
    }
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'parteien': return (
        <div className="space-y-4">
          <div className="lc-notice text-body-s">
            Die <strong>Zedentin/der Zedent</strong> (bisherige Gläubigerseite) erklärt die Abtretung
            und unterschreibt – nur ihre Unterschrift verlangt die Schriftform (Art. 165 Abs. 1 OR).
            Eine Einwilligung des Schuldners ist nicht nötig (Art. 164 Abs. 1 OR).
          </div>
          <Field label="Zedentin / Zedent (abtretende Partei)">
            <input className={inputCls} value={a.absenderName} onChange={(e) => set('absenderName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse der Zedentin" optional>
            <input className={inputCls} value={a.absenderAdresse} onChange={(e) => set('absenderAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Zessionarin / Zessionar (Erwerberin der Forderung)">
            <input className={inputCls} value={a.adressatName} onChange={(e) => set('adressatName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse der Zessionarin" optional>
            <input className={inputCls} value={a.adressatAdresse} onChange={(e) => set('adressatAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Schuldnerin / Schuldner der Forderung">
            <input className={inputCls} value={a.schuldnerName} onChange={(e) => set('schuldnerName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse der Schuldnerseite" optional>
            <input className={inputCls} value={a.schuldnerAdresse} onChange={(e) => set('schuldnerAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
        </div>
      );

      case 'forderung': return (
        <div className="space-y-4">
          <Field label="Forderung" hint="bestimmte Bezeichnung – erscheint im Betreff und im Abtretungs-Satz">
            <input className={inputCls} value={a.forderungBeschrieb} onChange={(e) => set('forderungBeschrieb', e.target.value)} placeholder="z. B. Kaufpreisforderung aus Kaufvertrag vom 1. Februar 2026" />
          </Field>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.betragErfassen}
              onChange={(e) => set('betragErfassen', e.target.checked)} />
            <span>Betrag in der Erklärung nennen <span className="text-ink-500">(optional – die Bezeichnung muss die Forderung auch ohne Betrag bestimmen)</span></span>
          </label>
          {a.betragErfassen && (
            <Field label="Forderungsbetrag (CHF)">
              <input className={inputCls + ' sm:max-w-[12rem]'} inputMode="decimal" value={a.betrag} onChange={(e) => set('betrag', e.target.value)} placeholder="z. B. 25000.00" />
            </Field>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.zinsenAusdruecklich}
              onChange={(e) => set('zinsenAusdruecklich', e.target.checked)} />
            <span>Rückständige Zinsen <strong>ausdrücklich mitabtreten</strong> <span className="text-ink-500">(sonst nur gesetzliche Vermutung, Art. 170 Abs. 3 OR)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.urkundenUebergabe}
              onChange={(e) => set('urkundenUebergabe', e.target.checked)} />
            <span>Zusage der <strong>Urkunden-/Beweismittel-Übergabe</strong> aufnehmen <span className="text-ink-500">(gesetzliche Pflicht, Art. 170 Abs. 2 OR)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.anzeigeAnkuendigen}
              onChange={(e) => set('anzeigeAnkuendigen', e.target.checked)} />
            <span>Ankündigen, dass der <strong>Schuldner schriftlich informiert</strong> wird <span className="text-ink-500">(bis zur Anzeige befreit ihn die gutgläubige Zahlung an die Alt-Gläubigerin, Art. 167 OR)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.annahmeZeile}
              onChange={(e) => set('annahmeZeile', e.target.checked)} />
            <span>Gegenzeichnungs-Zeile der <strong>Zessionarin</strong> aufnehmen <span className="text-ink-500">(formfrei möglich – die Zeile schafft Klarheit)</span></span>
          </label>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.hinweise.map((h, i) => (
            <div key={i} className="lc-notice text-body-s">{h}</div>
          ))}

          <Field label="Ort und Datum der Erklärung">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Basel" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>

          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Damit die Abtretung trägt</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Schriftform ist zwingend</strong> (Art. 165 Abs. 1 OR) – drucken und von der Zedentin unterschreiben lassen.</li>
              <li><strong>Schuldner-Anzeige nachweisbar zustellen</strong> – {KDG_ZUGANGS_HINWEIS}</li>
            </ul>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Die Abtretung setzt die Abtretbarkeit der Forderung voraus (kein Abtretungsverbot) – massgebend sind Gesetz und konkreter Sachverhalt.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Abtretungserklärung als PDF', banner: BANNER_FA, dateiName: 'Abtretungserklaerung.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Abtretungserklärung als Word (DOCX)', banner: BANNER_FA, dateiName: 'Abtretungserklaerung.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Vertrag & Forderung (OR)'} · Vorlage`}
      titel="Abtretungserklärung (Zession)"
      intro="Erklärung der bisherigen Gläubigerseite, eine bestimmte Forderung an eine Erwerberin abzutreten (Art. 164 ff. OR) – mit zwingender Schriftform, Klarstellung zu den Zinsen und Hinweisen zu Abtretungsverboten und Schuldner-Anzeige. Was Wertung wäre, wird offengelegt, nicht berechnet."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_FA, dateiName: 'Abtretungserklaerung.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_FA, dateiName: 'Abtretungserklaerung.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
