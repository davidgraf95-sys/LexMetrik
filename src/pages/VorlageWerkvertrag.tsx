import { useMemo } from 'react';
import { NormText } from '../components/NormText';
import {
  WV_DEFAULTS, wvZusammenstellen, pruefeWvGates, type WvAntworten, type WvWerkArt, type WvPreis,
} from '../lib/vorlagen/werkvertrag';
import { zahl } from '../lib/vorlagen/datum';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Checkbox, Field, inputCls } from '../components/vorlagen/ui';
import { ThemenEinstieg } from '../components/ThemenEinstieg';
import { VariantenKopf } from '../components/vorlagen/VariantenKopf';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Werkvertrag (Art. 363 ff. OR) ─────────────────────────
// P1-Grundtyp der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3).
// Formfreier Vertrag (beidseitig zu unterzeichnen). Zentrale Weiche
// beweglich/unbeweglich → Rügefrist (Art. 367 Abs. 1bis) und Verjährung
// (Art. 371). Brücke zum Gewährleistungs-Rechner (Rüge-/Verjährungsfristen).

const SPEICHER_KEY = 'lexmetrik.vorlage.werkvertrag.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien' },
  { id: 'werk', label: 'Werk & Vergütung' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_WV: PdfBanner = {
  titel: 'WERKVERTRAG – RÜGEFRIST UNBEWEGLICHES WERK 60 TAGE ZWINGEND (ART. 367 ABS. 1BIS OR)',
  text: 'Formfreier Vertrag, beidseitig zu unterzeichnen. Rücktrittsrecht des Bestellers gegen volle Schadloshaltung (Art. 377 OR).',
};

const WERKART_OPTIONEN: { id: WvWerkArt; label: string; hint: string }[] = [
  { id: 'beweglich', label: 'Bewegliches Werk', hint: 'z. B. Möbel, Maschine, Software' },
  { id: 'unbeweglich', label: 'Unbewegliches Werk', hint: 'Bau am Grundstück; Rügefrist 60 Tage' },
];

const PREIS_OPTIONEN: { id: WvPreis; label: string }[] = [
  { id: 'pauschal', label: 'Festpreis (Pauschal)' },
  { id: 'aufwand', label: 'nach Aufwand' },
];

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function VorlageWerkvertrag() {
  const card = karte('werkvertrag');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<WvAntworten>({ defaults: WV_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis } = useMemo(() => wvZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeWvGates(a), [a]);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.bestellerName.trim()) f.push('Besteller angeben.');
      if (!a.unternehmerName.trim()) f.push('Unternehmer angeben.');
    }
    if (i === 1) {
      if (!a.werkBeschrieb.trim()) f.push('Werk umschreiben (was herzustellen ist).');
      if (a.ablieferung.trim() && !ISO.test(a.ablieferung)) f.push('Ablieferungstermin als gültiges Datum angeben (oder leer lassen).');
      if (a.preis === 'pauschal' && zahl(a.pauschalCHF) === null) f.push('Festpreis in CHF angeben.');
      if (a.preis === 'aufwand' && zahl(a.ansatzCHF) === null) f.push('Ansatz in CHF angeben.');
      if (a.anzahlung && zahl(a.anzahlungCHF) === null) f.push('Akontobetrag in CHF angeben (oder Anzahlung deaktivieren).');
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
            Der Werkvertrag ist <strong>formfrei</strong> gültig; die beidseitige Unterzeichnung
            dient dem Beweis. Der <strong>Besteller</strong> bestellt das Werk, der
            <strong> Unternehmer</strong> stellt es her (Art. 363 OR).
          </div>
          <Field label="Besteller">
            <input className={inputCls} value={a.bestellerName} onChange={(e) => set('bestellerName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse des Bestellers" optional>
            <input className={inputCls} value={a.bestellerAdresse} onChange={(e) => set('bestellerAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Unternehmer">
            <input className={inputCls} value={a.unternehmerName} onChange={(e) => set('unternehmerName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse des Unternehmers" optional>
            <input className={inputCls} value={a.unternehmerAdresse} onChange={(e) => set('unternehmerAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
        </div>
      );

      case 'werk': return (
        <div className="space-y-4">
          <Field label="Werk" hint="was herzustellen ist – erscheint im Vertragstext">
            <textarea className={inputCls + ' min-h-[4.5rem]'} value={a.werkBeschrieb} onChange={(e) => set('werkBeschrieb', e.target.value)} placeholder="z. B. Einbau einer Küche gemäss Plan vom 1. März 2026" />
          </Field>
          <Field label="Art des Werks" hint="bestimmt Rügefrist und Verjährung">
            <div className="grid grid-cols-2 gap-2">
              {WERKART_OPTIONEN.map((w) => (
                <button key={w.id} type="button"
                  onClick={() => set('werkArt', w.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-body-s ${a.werkArt === w.id ? 'border-brass-500 bg-brass-50 text-ink-900' : 'border-line text-ink-700'}`}>
                  <span className="font-medium block">{w.label}</span>
                  <span className="text-ink-500 text-xs">{w.hint}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Ablieferungstermin" optional>
            <DatumsFeld value={a.ablieferung} onChange={(v) => set('ablieferung', v)} className={inputCls} />
          </Field>
          <Field label="Vergütung">
            <div className="grid grid-cols-2 gap-2">
              {PREIS_OPTIONEN.map((p) => (
                <button key={p.id} type="button"
                  onClick={() => set('preis', p.id)}
                  className={`rounded-lg border px-3 py-2 text-body-s ${a.preis === p.id ? 'border-brass-500 bg-brass-50 text-ink-900' : 'border-line text-ink-700'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </Field>
          {a.preis === 'pauschal' && (
            <Field label="Festpreis (CHF)" hint="bindet den Unternehmer (Art. 373 OR)">
              <input className={inputCls + ' sm:max-w-[12rem]'} inputMode="decimal" value={a.pauschalCHF} onChange={(e) => set('pauschalCHF', e.target.value)} placeholder="z. B. 12000.00" />
            </Field>
          )}
          {a.preis === 'aufwand' && (
            <div className="grid grid-cols-[1fr_1fr] gap-3">
              <Field label="Ansatz (CHF)">
                <input className={inputCls} inputMode="decimal" value={a.ansatzCHF} onChange={(e) => set('ansatzCHF', e.target.value)} placeholder="z. B. 120.00" />
              </Field>
              <Field label="je Einheit">
                <input className={inputCls} value={a.ansatzEinheit} onChange={(e) => set('ansatzEinheit', e.target.value)} placeholder="pro Stunde" />
              </Field>
            </div>
          )}
          <Checkbox
            checked={a.anzahlung}
            onChange={(v) => set('anzahlung', v)}
            label={<><span><strong>Akontozahlung</strong> bei Vertragsschluss vereinbaren</span></>} />
          {a.anzahlung && (
            <Field label="Akontobetrag (CHF)">
              <input className={inputCls + ' sm:max-w-[12rem]'} inputMode="decimal" value={a.anzahlungCHF} onChange={(e) => set('anzahlungCHF', e.target.value)} placeholder="z. B. 4000.00" />
            </Field>
          )}
          <Checkbox
            checked={a.abnahmeProtokoll}
            onChange={(v) => set('abnahmeProtokoll', v)}
            label={<><span>Gemeinsames <strong>Abnahmeprotokoll</strong> vereinbaren</span></>} />
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
            <p className="lc-overline text-brass-700">Damit der Werkvertrag trägt</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Mängel rechtzeitig rügen</strong> – beim unbeweglichen Werk gilt zwingend die 60-Tage-Frist (Art. 367 Abs. 1bis OR); sonst gilt das Werk als genehmigt.</li>
              <li><strong>Verjährung</strong> – 2 Jahre (beweglich) bzw. 5 Jahre (unbeweglich) ab Abnahme (Art. 371 OR).</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Rügefristen und Verjährung sind zwingend; massgebend sind Gesetz und konkreter Sachverhalt.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Werkvertrag als PDF', banner: BANNER_WV, dateiName: 'Werkvertrag.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Werkvertrag als Word (DOCX)', banner: BANNER_WV, dateiName: 'Werkvertrag.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Vertrag (OR)'} · Vorlage`}
      titel="Werkvertrag"
      intro="Werkvertrag aus festen Bausteinen (Art. 363 ff. OR) – mit Weiche bewegliches/unbewegliches Werk (Rügefrist und Verjährung), Festpreis- oder Aufwand-Vergütung und offengelegtem Rücktrittsrecht des Bestellers. Was Wertung wäre, wird offengelegt, nicht berechnet."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      kopfSchalter={<VariantenKopf detailgrad={a.detailgrad} onDetailgrad={(v) => set('detailgrad', v)} />}
      inhalt={inhalt()}
      fussnote={<ThemenEinstieg label="Mängelrüge- und Verjährungsfristen exakt berechnen:" links={[
        { to: '/rechner/gewaehrleistung', label: 'Gewährleistung & Mängelrüge' },
      ]} />}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_WV, dateiName: 'Werkvertrag.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_WV, dateiName: 'Werkvertrag.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
