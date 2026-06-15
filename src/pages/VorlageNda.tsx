import { useMemo } from 'react';
import {
  NDA_DEFAULTS, ndaZusammenstellen, pruefeNdaGates, type NdaAntworten,
} from '../lib/vorlagen/nda';
import { zahl } from '../lib/vorlagen/datum';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Checkbox, Field, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { VariantenKopf } from '../components/vorlagen/VariantenKopf';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Geheimhaltungsvereinbarung (NDA) ──────────────────────
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3).
// Innominatvertrag (Art. 19 OR), formfrei. Weiche einseitig/gegenseitig +
// optionale Konventionalstrafe. Hinweise in pruefeNdaGates.

const SPEICHER_KEY = 'lexmetrik.vorlage.nda.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien & Richtung' },
  { id: 'inhalt', label: 'Inhalt & Strafe' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_NDA: PdfBanner = {
  titel: 'GEHEIMHALTUNGSVEREINBARUNG (NDA)',
  text: 'Formfreier Innominatvertrag (Art. 19 OR), beidseitig zu unterzeichnen. Übermässige Konventionalstrafen setzt der Richter herab (Art. 163 Abs. 3 OR).',
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function VorlageNda() {
  const card = karte('nda');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<NdaAntworten>({ defaults: NDA_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis } = useMemo(() => ndaZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeNdaGates(a), [a]);

  const einseitig = !a.gegenseitig;
  const labelA = a.gegenseitig ? 'Partei A' : 'Offenlegende Partei (A)';
  const labelB = a.gegenseitig ? 'Partei B' : 'Empfangende Partei (B)';

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.parteiAName.trim()) f.push(`${labelA} angeben.`);
      if (!a.parteiBName.trim()) f.push(`${labelB} angeben.`);
    }
    if (i === 1) {
      if (!a.zweck.trim()) f.push('Zweck der Offenlegung angeben.');
      if (a.dauerErfassen && (zahl(a.dauerJahre) === null || zahl(a.dauerJahre)! <= 0)) f.push('Dauer in Jahren angeben (oder Nachwirkungsfrist deaktivieren).');
      if (a.konventionalstrafe && zahl(a.strafeCHF) === null) f.push('Konventionalstrafe in CHF angeben (oder deaktivieren).');
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
          <Field label="Richtung der Geheimhaltung">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => set('gegenseitig', true)}
                className={`rounded-lg border px-3 py-2 text-left text-body-s ${a.gegenseitig ? 'border-brass-500 bg-brass-50 text-ink-900' : 'border-line text-ink-700'}`}>
                <span className="font-medium block">Gegenseitig</span>
                <span className="text-ink-500 text-xs">beide Parteien verpflichtet</span>
              </button>
              <button type="button" onClick={() => set('gegenseitig', false)}
                className={`rounded-lg border px-3 py-2 text-left text-body-s ${einseitig ? 'border-brass-500 bg-brass-50 text-ink-900' : 'border-line text-ink-700'}`}>
                <span className="font-medium block">Einseitig</span>
                <span className="text-ink-500 text-xs">nur Partei B verpflichtet</span>
              </button>
            </div>
          </Field>
          <Field label={labelA}>
            <input className={inputCls} value={a.parteiAName} onChange={(e) => set('parteiAName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label={`Adresse ${labelA}`} optional>
            <input className={inputCls} value={a.parteiAAdresse} onChange={(e) => set('parteiAAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label={labelB}>
            <input className={inputCls} value={a.parteiBName} onChange={(e) => set('parteiBName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label={`Adresse ${labelB}`} optional>
            <input className={inputCls} value={a.parteiBAdresse} onChange={(e) => set('parteiBAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
        </div>
      );

      case 'inhalt': return (
        <div className="space-y-4">
          <Field label="Zweck der Offenlegung" hint="erscheint im Vertragstext und begrenzt die Verwendung">
            <textarea className={inputCls + ' min-h-[4.5rem]'} value={a.zweck} onChange={(e) => set('zweck', e.target.value)} placeholder="z. B. Prüfung einer möglichen Zusammenarbeit im Bereich Softwareentwicklung" />
          </Field>
          <Field label="Konkretisierung der vertraulichen Informationen" optional hint="zusätzlich zur allgemeinen Definition">
            <input className={inputCls} value={a.infoBeschrieb} onChange={(e) => set('infoBeschrieb', e.target.value)} placeholder="z. B. Quellcode, Kundenlisten, Preiskalkulationen" />
          </Field>
          <Checkbox
            checked={a.dauerErfassen}
            onChange={(v) => set('dauerErfassen', v)}
            label={<><span><strong>Nachwirkungsfrist</strong> vereinbaren (Geheimhaltung gilt N Jahre über das Vorhaben hinaus)</span></>} />
          {a.dauerErfassen && (
            <Field label="Dauer nach Beendigung (Jahre)">
              <input className={inputCls + ' sm:max-w-[8rem]'} inputMode="numeric" value={a.dauerJahre} onChange={(e) => set('dauerJahre', e.target.value)} placeholder="z. B. 3" />
            </Field>
          )}
          <Checkbox
            checked={a.rueckgabe}
            onChange={(v) => set('rueckgabe', v)}
            label={<><span><strong>Rückgabe/Vernichtung</strong> der Unterlagen aufnehmen</span></>} />
          <Checkbox
            checked={a.konventionalstrafe}
            onChange={(v) => set('konventionalstrafe', v)}
            label={<><span><strong>Konventionalstrafe</strong> vereinbaren <span className="text-ink-500">(verfällt auch ohne Schaden; übermässige setzt der Richter herab, Art. 163 Abs. 3 OR)</span></span></>} />
          {a.konventionalstrafe && (
            <Field label="Konventionalstrafe je Verletzung (CHF)">
              <input className={inputCls + ' sm:max-w-[12rem]'} inputMode="decimal" value={a.strafeCHF} onChange={(e) => set('strafeCHF', e.target.value)} placeholder="z. B. 20000.00" />
            </Field>
          )}
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.hinweise.map((h, i) => (
            <div key={i} className="lc-notice text-body-s">{h}</div>
          ))}

          <Field label="Ort und Datum der Unterzeichnung">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Zürich" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>

          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Damit die NDA trägt</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Zweckbindung</strong> – die Informationen dürfen nur für den genannten Zweck verwendet werden.</li>
              <li><strong>Konventionalstrafe</strong> – beweiserleichternd, aber bei Übermass richterlich herabsetzbar (Art. 163 Abs. 3 OR).</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Die NDA ist ein Innominatvertrag; massgebend sind Gesetz und konkreter Sachverhalt.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'NDA als PDF', banner: BANNER_NDA, dateiName: 'Geheimhaltungsvereinbarung.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'NDA als Word (DOCX)', banner: BANNER_NDA, dateiName: 'Geheimhaltungsvereinbarung.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Vertrag (OR)'} · Vorlage`}
      titel="Geheimhaltungsvereinbarung (NDA)"
      intro="Geheimhaltungsvereinbarung aus festen Bausteinen (Innominatvertrag, Art. 19 OR) – mit Weiche einseitig/gegenseitig, Zweckbindung, Nachwirkungsfrist und optionaler Konventionalstrafe. Was Wertung wäre, wird offengelegt, nicht berechnet."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      kopfSchalter={<VariantenKopf detailgrad={a.detailgrad} onDetailgrad={(v) => set('detailgrad', v)} />}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_NDA, dateiName: 'Geheimhaltungsvereinbarung.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_NDA, dateiName: 'Geheimhaltungsvereinbarung.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
