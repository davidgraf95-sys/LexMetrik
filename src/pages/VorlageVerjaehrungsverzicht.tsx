import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  VV_DEFAULTS, vvZusammenstellen, pruefeVvGates, type VvAntworten,
} from '../lib/vorlagen/verjaehrungsverzicht';
import { KDG_ZUGANGS_HINWEIS } from '../lib/vorlagen/kuendigungGemeinsam';
import { zahl } from '../lib/vorlagen/datum';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Verjährungsverzichtserklärung (Art. 141 OR) ───────────
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2).
// Erklärende Partei ist die SCHULDNERSEITE; Schriftform ist Gültigkeits-
// voraussetzung (Art. 141 Abs. 1bis OR). Die Höchstdauer-Mechanik liegt in
// pruefeVvGates; die salvatorische Begrenzung steht fest im Dokument.

const SPEICHER_KEY = 'lexmetrik.vorlage.verjaehrungsverzicht.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien' },
  { id: 'forderung', label: 'Forderung & Dauer' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_VV: PdfBanner = {
  titel: 'VERJÄHRUNGSVERZICHT – SCHRIFTFORM ZWINGEND (ART. 141 ABS. 1bis OR)',
  text: 'Von der Schuldnerseite zu unterzeichnen und nachweisbar zuzustellen. Gilt längstens für die gesetzliche Höchstdauer.',
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function VorlageVerjaehrungsverzicht() {
  const card = karte('verjaehrungsverzicht');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<VvAntworten>({ defaults: VV_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis } = useMemo(() => vvZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeVvGates(a), [a]);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.absenderName.trim()) f.push('Schuldnerin/Schuldner (erklärende Partei) angeben.');
      if (!a.adressatName.trim()) f.push('Gläubigerin/Gläubiger angeben.');
    }
    if (i === 1) {
      if (!a.forderungBeschrieb.trim()) f.push('Forderung bezeichnen (z. B. «Werklohnforderung aus Werkvertrag vom 1. Februar 2026»).');
      if (!ISO.test(a.verzichtBis)) f.push('Ende des Verzichts angeben.');
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
            Nur die <strong>Schuldnerseite</strong> kann auf die Einrede verzichten (Art. 141 Abs. 1 OR) –
            sie ist hier die erklärende Partei und unterschreibt.
          </div>
          <Field label="Schuldnerin / Schuldner (erklärende Partei)">
            <input className={inputCls} value={a.absenderName} onChange={(e) => set('absenderName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse der Schuldnerseite" optional>
            <input className={inputCls} value={a.absenderAdresse} onChange={(e) => set('absenderAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Gläubigerin / Gläubiger (Empfänger)">
            <input className={inputCls} value={a.adressatName} onChange={(e) => set('adressatName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse der Gläubigerseite" optional>
            <input className={inputCls} value={a.adressatAdresse} onChange={(e) => set('adressatAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
        </div>
      );

      case 'forderung': return (
        <div className="space-y-4">
          <Field label="Forderung" hint="bestimmte Bezeichnung – erscheint im Betreff und im Verzichts-Satz">
            <input className={inputCls} value={a.forderungBeschrieb} onChange={(e) => set('forderungBeschrieb', e.target.value)} placeholder="z. B. Werklohnforderung aus Werkvertrag vom 1. Februar 2026" />
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
          <Field label="Verzicht bis (Enddatum)" hint="höchstens zehn Jahre ab BEGINN der Verjährung (Art. 141 Abs. 1 OR) – die Erklärung begrenzt sich zusätzlich selbst auf die gesetzliche Höchstdauer">
            <DatumsFeld value={a.verzichtBis} onChange={(v) => set('verzichtBis', v)} className={inputCls} />
          </Field>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.vorbehaltEingetreten}
              onChange={(e) => set('vorbehaltEingetreten', e.target.checked)} />
            <span>Vorbehalt: Verzicht gilt nur, <strong>soweit die Verjährung nicht bereits eingetreten</strong> ist <span className="text-ink-500">(Praxis-Standard)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.keineAnerkennung}
              onChange={(e) => set('keineAnerkennung', e.target.checked)} />
            <span>Klarstellung: <strong>keine Anerkennung</strong> der Forderung (Art. 135 Ziff. 1 OR) <span className="text-ink-500">(Praxis-Standard)</span></span>
          </label>
          <div className="lc-notice text-body-s">
            Läuft die Frist bald ab? Verjährung samt Unterbrechungs-Folgen rechnen: {' '}
            <Link to="/rechner/verjaehrung" className="text-brass-700 underline">Verjährungs-Rechner</Link>.
          </div>
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
            <p className="lc-overline text-brass-700">Damit der Verzicht trägt</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Schriftform ist zwingend</strong> (Art. 141 Abs. 1bis OR) – drucken und von der Schuldnerseite unterschreiben lassen.</li>
              <li><strong>Zustellung nachweisen</strong> – {KDG_ZUGANGS_HINWEIS}</li>
            </ul>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Der Verzicht wirkt längstens für die gesetzliche Höchstdauer und ist keine Anerkennung der Forderung – massgebend sind Gesetz und konkreter Sachverhalt.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Verzichtserklärung als PDF', banner: BANNER_VV, dateiName: 'Verjaehrungsverzicht.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Verzichtserklärung als Word (DOCX)', banner: BANNER_VV, dateiName: 'Verjaehrungsverzicht.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Vertrag & Forderung (OR)'} · Vorlage`}
      titel="Verjährungsverzichtserklärung"
      intro="Erklärung der Schuldnerseite, für eine bestimmte Zeit auf die Einrede der Verjährung zu verzichten (Art. 141 OR) – mit fester Begrenzung auf die gesetzliche Höchstdauer, Standard-Vorbehalten und zwingender Schriftform. Was Wertung wäre, wird offengelegt, nicht berechnet."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} />}
    />
  );
}
