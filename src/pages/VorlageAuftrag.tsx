import { useMemo } from 'react';
import { NormText } from '../components/NormText';
import {
  AF_DEFAULTS, afZusammenstellen, pruefeAfGates, type AfAntworten, type AfMandatstyp, type AfVerguetung,
} from '../lib/vorlagen/auftrag';
import { zahl } from '../lib/vorlagen/datum';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Checkbox, Field, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { VariantenKopf } from '../components/vorlagen/VariantenKopf';
import { karte } from '../lib/startseiteConfig';
import { usePaneKlasse } from '../components/layout/PaneKontext';

// ─── Vorlagen-Wizard: Auftrag / Dienstleistungsvertrag (Art. 394 ff. OR) ─────
// P1-Grundtyp der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3).
// Formfreier Vertrag (beidseitig zu unterzeichnen). Die Hinweise – allen voran
// das zwingende jederzeitige Auflösungsrecht (Art. 404 OR) – liegen in
// pruefeAfGates.

const SPEICHER_KEY = 'lexmetrik.vorlage.auftrag.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien' },
  { id: 'inhalt', label: 'Gegenstand & Vergütung' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_AF: PdfBanner = {
  titel: 'AUFTRAG – JEDERZEITIGES AUFLÖSUNGSRECHT ZWINGEND (ART. 404 OR)',
  text: 'Formfreier Vertrag, beidseitig zu unterzeichnen. Das Widerrufs-/Kündigungsrecht beider Parteien kann nicht gültig ausgeschlossen werden.',
};

const MANDAT_OPTIONEN: { id: AfMandatstyp; label: string; hint: string }[] = [
  { id: 'allgemein', label: 'Allgemein', hint: 'beliebige Geschäfte/Dienste' },
  { id: 'beratung', label: 'Beratung', hint: 'Consulting, Gutachten' },
  { id: 'treuhand', label: 'Treuhand', hint: 'treuhänderische Geschäfte' },
  { id: 'inkasso', label: 'Inkasso', hint: 'Forderungseinzug' },
];

const VERGUETUNG_OPTIONEN: { id: AfVerguetung; label: string }[] = [
  { id: 'pauschal', label: 'Pauschalhonorar' },
  { id: 'aufwand', label: 'nach Zeitaufwand' },
  { id: 'unentgeltlich', label: 'unentgeltlich' },
];

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function VorlageAuftrag() {
  const card = karte('auftrag');
  const pk = usePaneKlasse();
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<AfAntworten>({ defaults: AF_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis } = useMemo(() => afZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeAfGates(), []);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.auftraggeberName.trim()) f.push('Auftraggeberin angeben.');
      if (!a.beauftragteName.trim()) f.push('Beauftragte angeben.');
    }
    if (i === 1) {
      if (!a.gegenstand.trim()) f.push('Gegenstand des Auftrags umschreiben (welche Geschäfte/Dienste).');
      if (a.beginn.trim() && !ISO.test(a.beginn)) f.push('Beginn als gültiges Datum angeben (oder leer lassen).');
      if (a.verguetung === 'pauschal' && zahl(a.pauschalCHF) === null) f.push('Pauschalhonorar in CHF angeben.');
      if (a.verguetung === 'aufwand' && zahl(a.stundensatzCHF) === null) f.push('Stundenansatz in CHF angeben.');
    }
    if (i === 2) {
      if (!a.ort.trim()) f.push('Ort angeben.');
      if (!ISO.test(a.datum)) f.push('Datum der Unterzeichnung angeben.');
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
            Der Auftrag ist <strong>formfrei</strong> gültig; die beidseitige Unterzeichnung dient
            dem Beweis. Die <strong>Auftraggeberin</strong> erteilt den Auftrag, die
            <strong> Beauftragte</strong> besorgt die Geschäfte (Art. 394 OR).
          </div>
          <Field label="Auftraggeberin">
            <input className={inputCls} value={a.auftraggeberName} onChange={(e) => set('auftraggeberName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse der Auftraggeberin" optional>
            <input className={inputCls} value={a.auftraggeberAdresse} onChange={(e) => set('auftraggeberAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Beauftragte">
            <input className={inputCls} value={a.beauftragteName} onChange={(e) => set('beauftragteName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse der Beauftragten" optional>
            <input className={inputCls} value={a.beauftragteAdresse} onChange={(e) => set('beauftragteAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
        </div>
      );

      case 'inhalt': return (
        <div className="space-y-4">
          <Field label="Art des Mandats" hint="bestimmt die Rahmung der Gegenstandsumschreibung">
            <div className={pk('grid grid-cols-2 sm:grid-cols-4 gap-2', 'grid grid-cols-2 @3xl/pane:grid-cols-4 gap-2')}>
              {MANDAT_OPTIONEN.map((m) => (
                <button key={m.id} type="button"
                  onClick={() => set('mandatstyp', m.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-body-s ${a.mandatstyp === m.id ? 'border-brass-500 bg-brass-100 text-ink-900' : 'border-line text-ink-700'}`}>
                  <span className="font-medium block">{m.label}</span>
                  <span className="text-ink-500 text-xs">{m.hint}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Gegenstand des Auftrags" hint="welche Geschäfte/Dienste – erscheint im Vertragstext">
            <textarea className={inputCls + ' min-h-[4.5rem]'} value={a.gegenstand} onChange={(e) => set('gegenstand', e.target.value)} placeholder="z. B. Buchführung und Erstellung des Jahresabschlusses 2026" />
          </Field>
          <Field label="Beginn des Auftrags" optional>
            <DatumsFeld value={a.beginn} onChange={(v) => set('beginn', v)} className={inputCls} />
          </Field>
          <Field label="Vergütung">
            <div className="grid grid-cols-3 gap-2">
              {VERGUETUNG_OPTIONEN.map((v) => (
                <button key={v.id} type="button"
                  onClick={() => set('verguetung', v.id)}
                  className={`rounded-lg border px-3 py-2 text-body-s ${a.verguetung === v.id ? 'border-brass-500 bg-brass-100 text-ink-900' : 'border-line text-ink-700'}`}>
                  {v.label}
                </button>
              ))}
            </div>
          </Field>
          {a.verguetung === 'pauschal' && (
            <Field label="Pauschalhonorar (CHF)">
              <input className={inputCls + ' sm:max-w-[12rem]'} inputMode="decimal" value={a.pauschalCHF} onChange={(e) => set('pauschalCHF', e.target.value)} placeholder="z. B. 5000.00" />
            </Field>
          )}
          {a.verguetung === 'aufwand' && (
            <Field label="Stundenansatz (CHF)">
              <input className={inputCls + ' sm:max-w-[12rem]'} inputMode="decimal" value={a.stundensatzCHF} onChange={(e) => set('stundensatzCHF', e.target.value)} placeholder="z. B. 250.00" />
            </Field>
          )}
          <Checkbox
            checked={a.auslagenErsatz}
            onChange={(v) => set('auslagenErsatz', v)}
            label={<><span><strong>Auslagen- und Verwendungsersatz</strong> ausdrücklich aufnehmen <span className="text-ink-500"><NormText text={`(gesetzliche Pflicht, Art. 402 Abs. 1 OR)`} /></span></span></>} />
          <Checkbox
            checked={a.weisungsKlausel}
            onChange={(v) => set('weisungsKlausel', v)}
            label={<><span><strong>Weisungsbindung</strong> aufnehmen <span className="text-ink-500"><NormText text={`(Art. 397 Abs. 1 OR)`} /></span></span></>} />
          <Checkbox
            checked={a.substitution}
            onChange={(v) => set('substitution', v)}
            label={<><span>Beizug <strong>Dritter zur Ausführung</strong> zulassen <span className="text-ink-500"><NormText text={`(sonst persönliche Besorgung, Art. 398 Abs. 3 OR)`} /></span></span></>} />
          <Checkbox
            checked={a.vollmachtErweitert}
            onChange={(v) => set('vollmachtErweitert', v)}
            label={<><span><strong>Besondere Ermächtigung</strong> erteilen <span className="text-ink-500"><NormText text={`(für Vergleich, Grundstücke usw. – Art. 396 Abs. 3 OR)`} /></span></span></>} />
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.hinweise.map((h, i) => (
            <div key={i} className="lc-notice text-body-s"><NormText text={h} /></div>
          ))}

          <Field label="Ort und Datum der Unterzeichnung">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Zürich" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>

          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Damit der Auftrag trägt</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Jederzeitiges Auflösungsrecht</strong><NormText text={` – beide Parteien können den Auftrag jederzeit beenden; ein Ausschluss wäre wirkungslos (Art. 404 OR).`} /></li>
              <li><strong>Erfolg geschuldet?</strong> – ist ein bestimmtes Werk gewollt, ist der Werkvertrag (Art. 363 ff. OR) die richtige Grundlage.</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Der Auftrag schuldet sorgfältiges Tätigwerden, nicht einen Erfolg; massgebend sind Gesetz und konkreter Sachverhalt.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Auftrag als PDF', banner: BANNER_AF, dateiName: 'Auftrag.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Auftrag als Word (DOCX)', banner: BANNER_AF, dateiName: 'Auftrag.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Vertrag (OR)'} · Vorlage`}
      titel="Auftrag (Dienstleistungsvertrag)"
      intro="Dienstleistungsvertrag aus festen Bausteinen (Art. 394 ff. OR) – mit Gegenstands-Modulen (Beratung, Treuhand, Inkasso), Vergütungsweiche und offengelegtem zwingendem Auflösungsrecht. Was Wertung wäre, wird offengelegt, nicht berechnet."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      kopfSchalter={<VariantenKopf detailgrad={a.detailgrad} onDetailgrad={(v) => set('detailgrad', v)} />}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_AF, dateiName: 'Auftrag.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_AF, dateiName: 'Auftrag.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
