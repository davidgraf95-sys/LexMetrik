import { useMemo, type ReactNode } from 'react';
import { NormText } from '../components/NormText';
import {
  LV_DEFAULTS, lvNormalisieren, lvZusammenstellen, pruefeLvGates, type LvAntworten,
} from '../lib/vorlagen/lehrvertrag';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { BetragsFeld } from '../components/BetragsFeld';
import { DatumsFeld } from '../components/DatumsFeld';
import { Checkbox, Field, GruppenTitel, inputCls } from '../components/vorlagen/ui';
import { SelectionGrid } from '../components/ui/SelectionGrid';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VariantenKopf } from '../components/vorlagen/VariantenKopf';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Lehrvertrag (Art. 344–346a OR) ────────────────────────
// Sonderregime der «besonderen Einzelarbeitsverträge» mit eigenem Schema
// (lib/vorlagen/lehrvertrag.ts). Schriftform = Gültigkeit (344a I), Pflicht-
// inhalt nach 344a II, behördliche Genehmigung (BBG 14). Eingaben bleiben im
// Browser (localStorage).

const SPEICHER_KEY = 'lexmetrik.vorlage.lehrvertrag.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien' },
  { id: 'bildung', label: 'Bildung & Dauer' },
  { id: 'lohn', label: 'Lohn, Zeit & Ferien' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_LV: PdfBanner = {
  titel: 'LEHRVERTRAG – SCHRIFTFORM ERFORDERLICH, DER KANTONALEN BEHÖRDE EINZUREICHEN',
  text: 'Der Lehrvertrag bedarf zu seiner Gültigkeit der Schriftform (Art. 344a Abs. 1 OR) und der Genehmigung durch die kantonale Behörde vor Lehrbeginn (Art. 14 BBG). Bei Minderjährigkeit unterzeichnet die gesetzliche Vertretung mit.',
};

export function VorlageLehrvertrag({ kopf }: { kopf: ReactNode }) {
  const { a, set, setA, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<LvAntworten>({
      defaults: LV_DEFAULTS,
      speicherKey: SPEICHER_KEY,
      normalisieren: lvNormalisieren,
    });

  const { ergebnis } = useMemo(() => lvZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeLvGates(a), [a]);

  // Lohn-Staffel an die Lehrdauer koppeln (ein CHF-Feld je Lehrjahr).
  const setDauer = (rohJahre: number) => {
    const n = Math.min(5, Math.max(1, Math.round(rohJahre) || 1));
    setA((prev) => ({
      ...prev,
      dauerJahre: n,
      lohnLehrjahre: Array.from({ length: n }, (_, i) => ({ jahr: i + 1, chf: prev.lohnLehrjahre[i]?.chf ?? '' })),
    }));
  };
  const setLohn = (idx: number, chf: string) =>
    set('lohnLehrjahre', a.lohnLehrjahre.map((l, i) => (i === idx ? { ...l, chf } : l)));

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.betriebName.trim()) f.push('Lehrbetrieb angeben (Firma bzw. Name).');
      if (!a.betriebAdresse.trim()) f.push('Adresse des Lehrbetriebs angeben.');
      if (!a.lernendeVorname.trim() || !a.lernendeName.trim()) f.push('Vor- und Nachname der lernenden Person angeben.');
      if (!a.lernendeAdresse.trim()) f.push('Adresse der lernenden Person angeben.');
    }
    if (i === 1) {
      if (!a.beruf.trim()) f.push('Beruf / Bildungsfeld angeben (Art. 344a Abs. 2 OR).');
      if (!a.beginn) f.push('Lehrbeginn angeben.');
    }
    if (i === 2 && a.lohnLehrjahre.some((l) => !l.chf.trim())) f.push('Lohn für jedes Lehrjahr angeben (Art. 344a Abs. 2 OR).');
    if (i === 3 && !a.datum) f.push('Vertragsdatum angeben.');
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const card = karte('arbeitsvertrag');

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'parteien': return (
        <div className="space-y-5">
          <div className="space-y-3">
            <GruppenTitel>Lehrbetrieb</GruppenTitel>
            <Field label="Firma / Name"><input className={inputCls} value={a.betriebName} onChange={(e) => set('betriebName', e.target.value)} placeholder="Muster AG" /></Field>
            <Field label="Adresse"><input className={inputCls} value={a.betriebAdresse} onChange={(e) => set('betriebAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" /></Field>
          </div>
          <div className="space-y-3">
            <GruppenTitel>Lernende Person</GruppenTitel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Vorname"><input className={inputCls} value={a.lernendeVorname} onChange={(e) => set('lernendeVorname', e.target.value)} /></Field>
              <Field label="Nachname"><input className={inputCls} value={a.lernendeName} onChange={(e) => set('lernendeName', e.target.value)} /></Field>
            </div>
            <Field label="Adresse"><input className={inputCls} value={a.lernendeAdresse} onChange={(e) => set('lernendeAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" /></Field>
            <Field label="Geburtsdatum" hint="steuert die gesetzliche Vertretung (< 18) und die 5-Wochen-Ferien (< 20, Art. 345a OR)">
              <DatumsFeld value={a.lernendeGeburtsdatum} onChange={(v) => set('lernendeGeburtsdatum', v)} className={inputCls} />
            </Field>
            <Field label="Gesetzliche Vertretung" optional hint="bei Minderjährigkeit Pflicht – unterzeichnet den Vertrag mit (Art. 345 Abs. 2 OR)">
              <input className={inputCls} value={a.gesetzlicheVertretung} onChange={(e) => set('gesetzlicheVertretung', e.target.value)} placeholder="z. B. Maria Beispiel" />
            </Field>
          </div>
        </div>
      );

      case 'bildung': return (
        <div className="space-y-4">
          <Field label="Beruf / berufliche Grundbildung"><input className={inputCls} value={a.beruf} onChange={(e) => set('beruf', e.target.value)} placeholder="z. B. Kauffrau/Kaufmann" /></Field>
          <div className="space-y-2">
            <GruppenTitel>Abschluss</GruppenTitel>
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              items={([
                ['efz', 'EFZ', '3–4 Jahre'],
                ['eba', 'EBA', '2 Jahre'],
                ['andere', 'Andere', 'berufliche Grundbildung'],
              ] as const).map(([code, label, sub]) => ({ code, label, sub }))}
              value={a.bildungstyp}
              onSelect={(code) => set('bildungstyp', code)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Lehrbeginn"><DatumsFeld value={a.beginn} onChange={(v) => set('beginn', v)} className={inputCls} /></Field>
            <Field label="Dauer (Jahre)" hint="koppelt die Lohnstaffel"><input type="number" min={1} max={5} className={inputCls + ' num w-28'} value={a.dauerJahre} onChange={(e) => setDauer(Number(e.target.value))} /></Field>
          </div>
          <div className="space-y-2">
            <GruppenTitel><NormText text={`Probezeit (Art. 344a Abs. 3 OR)`} /></GruppenTitel>
            <Field label="Probezeit (Monate)" hint="ein bis drei Monate; ohne Abrede gilt von Gesetzes wegen drei Monate">
              <input type="number" min={1} max={6} className={inputCls + ' num w-28'} value={a.probezeitMonate} onChange={(e) => set('probezeitMonate', Number(e.target.value))} />
            </Field>
            {a.probezeitMonate > 3 && (
              <Checkbox
                checked={a.probezeitBehoerde}
                onChange={(v) => set('probezeitBehoerde', v)}
                label={<><span>Die Verlängerung über drei Monate ist von der kantonalen Behörde bewilligt <span className="text-ink-500"><NormText text={`(Art. 344a Abs. 4 OR – sonst höchstens drei Monate)`} /></span></span></>} />
            )}
          </div>
        </div>
      );

      case 'lohn': return (
        <div className="space-y-4">
          <div className="space-y-2">
            <GruppenTitel><NormText text={`Lohn je Lehrjahr (Art. 344a Abs. 2 OR)`} /></GruppenTitel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {a.lohnLehrjahre.map((l, i) => (
                <Field key={l.jahr} label={`${l.jahr}. Lehrjahr (CHF / Monat)`}>
                  <BetragsFeld className={inputCls + ' num'} value={l.chf} onChange={(v) => setLohn(i, v)} placeholder="z. B. 700" />
                </Field>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Wochenarbeitszeit (Stunden)" hint="inkl. Berufsfachschule und üK"><input type="number" min={1} max={45} step={0.5} className={inputCls + ' num'} value={a.wochenstunden} onChange={(e) => set('wochenstunden', Number(e.target.value) || 41)} /></Field>
            <Field label="Ferien (Wochen / Lehrjahr)" hint="mindestens 5 Wochen bis zum vollendeten 20. Altersjahr (Art. 345a Abs. 3 OR)"><input type="number" min={4} max={8} className={inputCls + ' num'} value={a.ferienWochen} onChange={(e) => set('ferienWochen', Number(e.target.value) || 5)} /></Field>
          </div>
          <Field label="Berufsfachschule" optional><input className={inputCls} value={a.berufsfachschule} onChange={(e) => set('berufsfachschule', e.target.value)} placeholder="z. B. BFS Basel" /></Field>
          {a.detailgrad === 'experte' && (
            <div className="space-y-2 pt-1">
              <GruppenTitel><NormText text={`Weitere Leistungen (Art. 344a Abs. 5 OR)`} /></GruppenTitel>
              <Checkbox
                checked={a.berufswerkzeuge}
                onChange={(v) => set('berufswerkzeuge', v)}
                label={<><span>Berufswerkzeuge werden vom Lehrbetrieb gestellt</span></>} />
              <Checkbox
                checked={a.unterkunftVerpflegung}
                onChange={(v) => set('unterkunftVerpflegung', v)}
                label={<><span>Beitrag an Unterkunft und Verpflegung</span></>} />
              <Checkbox
                checked={a.versicherungspraemien}
                onChange={(v) => set('versicherungspraemien', v)}
                label={<><span>Übernahme der Prämien der obligatorischen Unfallversicherung</span></>} />
            </div>
          )}
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.blocker.length > 0 && (
            <div className="lc-notice-danger space-y-1">
              <p className="lc-overline text-danger-700 mb-1">Vor der Ausgabe zu beheben</p>
              {gates.blocker.map((b, i) => <p key={i} className="text-body-s text-danger-700">• <NormText text={b} /></p>)}
            </div>
          )}
          {gates.warnungen.map((w, i) => <div key={i} className="lc-notice-warn text-body-s"><NormText text={w} /></div>)}
          {gates.hinweise.map((h, i) => <div key={i} className="lc-notice text-body-s"><NormText text={h} /></div>)}

          <Field label="Ort und Datum des Vertragsschlusses">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Basel" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>

          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Form-Gate – damit der Lehrvertrag trägt</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Schriftform ist Gültigkeitsvoraussetzung</strong><NormText text={` (Art. 344a Abs. 1 OR): Lehrbetrieb, lernende Person und – bei Minderjährigkeit – die gesetzliche Vertretung unterzeichnen.`} /></li>
              <li><strong>Genehmigung der kantonalen Behörde</strong> vor Lehrbeginn (Art. 14 BBG); ohne sie darf die Bildung nicht beginnen.</li>
              <li><strong>Jugendarbeitsschutz</strong> (ArGV 5) und Bildungsverordnung des Berufs sind zwingend zu beachten.</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Dies ist ein Entwurf nach festen Bausteinen; Schriftform, behördliche Genehmigung und die Bildungsverordnung sind gesondert sicherzustellen.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Lehrvertrag als PDF', banner: BANNER_LV, dateiName: 'Lehrvertrag-Entwurf.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Lehrvertrag als Word (DOCX)', banner: BANNER_LV, dateiName: 'Lehrvertrag-Entwurf.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Arbeit'} · Vorlage`}
      titel="Lehrvertrag"
      intro="Stellt einen Lehrvertrag nach Art. 344 ff. OR aus festen, juristisch vorformulierten Bausteinen zusammen – mit dem zwingenden Pflichtinhalt (Art, Dauer, Lohn, Probezeit, Arbeitszeit, Ferien), den 5 Wochen Ferien bis zum 20. Altersjahr und der Schriftform als Gültigkeitsvoraussetzung. Ohne Sprachmodell: gleiche Eingaben, gleiches Dokument."
      norms={card?.norms ?? []}
      badge="Schriftform · behördlich zu genehmigen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      kopfSchalter={<div className="space-y-3">
        {kopf}
        <VariantenKopf detailgrad={a.detailgrad} onDetailgrad={(v) => set('detailgrad', v)} />
      </div>}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_LV, dateiName: 'Lehrvertrag-Entwurf.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_LV, dateiName: 'Lehrvertrag-Entwurf.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
