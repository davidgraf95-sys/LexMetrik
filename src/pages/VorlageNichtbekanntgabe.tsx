import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  NB_DEFAULTS, nbZusammenstellen, pruefeNbGates, nbFruehesterGesuchstag, type NbAntworten,
} from '../lib/vorlagen/nichtbekanntgabe';
import { fmtDatum } from '../lib/vorlagen/datum';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Nichtbekanntgabe Betreibung (Art. 8a III lit. d SchKG) ─
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 («Löschungsgesuch
// Betreibungsregister», FAHRPLAN-VORLAGEN-AUSBAU V2). Die 3-Monats-Schwelle
// und die Rechtsvorschlag-Voraussetzung liegen in pruefeNbGates.

const SPEICHER_KEY = 'lexmetrik.vorlage.nichtbekanntgabe.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Schuldner & Amt' },
  { id: 'betreibung', label: 'Betreibung' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_NB: PdfBanner = {
  titel: 'NICHTBEKANNTGABE – ERST 3 MONATE NACH ZUSTELLUNG (ART. 8a SCHKG)',
  text: 'Voraussetzung: Rechtsvorschlag erhoben. Das Amt fragt den Gläubiger an (20-Tage-Frist); keine Löschung im engeren Sinn.',
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function VorlageNichtbekanntgabe() {
  const card = karte('nichtbekanntgabe-betreibung');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<NbAntworten>({ defaults: NB_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis } = useMemo(() => nbZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeNbGates(a), [a]);
  const fruehester = nbFruehesterGesuchstag(a.zustellungZb);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.absenderName.trim()) f.push('Schuldnerin/Schuldner (gesuchstellende Partei) angeben.');
      if (!a.adressatName.trim()) f.push('Betreibungsamt angeben.');
    }
    if (i === 1) {
      if (!a.betreibungNr.trim()) f.push('Betreibungsnummer angeben.');
      if (!ISO.test(a.zustellungZb)) f.push('Zustellungsdatum des Zahlungsbefehls angeben.');
      if (!a.rechtsvorschlag) f.push(...gates.blocker.filter((b) => b.includes('RECHTSVORSCHLAG')));
    }
    if (i === 2) {
      if (!a.ort.trim()) f.push('Ort angeben.');
      if (!ISO.test(a.datum)) f.push('Datum des Gesuchs angeben.');
      f.push(...gates.blocker);
    }
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'parteien': return (
        <div className="space-y-4">
          <Field label="Schuldnerin / Schuldner (gesuchstellende Partei)">
            <input className={inputCls} value={a.absenderName} onChange={(e) => set('absenderName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse" optional>
            <input className={inputCls} value={a.absenderAdresse} onChange={(e) => set('absenderAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Betreibungsamt" hint="das Amt, das die Betreibung führt (steht auf dem Zahlungsbefehl)">
            <input className={inputCls} value={a.adressatName} onChange={(e) => set('adressatName', e.target.value)} placeholder="z. B. Betreibungsamt Basel-Stadt" />
          </Field>
          <Field label="Adresse des Betreibungsamts" optional>
            <input className={inputCls} value={a.adressatAdresse} onChange={(e) => set('adressatAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <div className="lc-notice text-body-s">
            Zuständiges Betreibungsamt samt Adresse ermitteln: {' '}
            <Link to="/rechner/zustaendigkeit?rechtsweg=schkg" className="text-brass-700 underline">Zuständigkeits-Rechner (Betreibung)</Link>.
          </div>
        </div>
      );

      case 'betreibung': return (
        <div className="space-y-4">
          <Field label="Betreibungsnummer">
            <input className={inputCls + ' sm:max-w-[14rem]'} value={a.betreibungNr} onChange={(e) => set('betreibungNr', e.target.value)} placeholder="z. B. 2026/12345" />
          </Field>
          <Field label="Gläubigerin / Gläubiger" optional>
            <input className={inputCls} value={a.glaeubigerName} onChange={(e) => set('glaeubigerName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Zustellung des Zahlungsbefehls" hint="das Gesuch ist erst nach Ablauf von drei Monaten seit der Zustellung zulässig">
            <DatumsFeld value={a.zustellungZb} onChange={(v) => set('zustellungZb', v)} className={inputCls} />
          </Field>
          {fruehester && (
            <div className="lc-notice text-body-s">
              Frühester Gesuchstag: <strong>{fmtDatum(fruehester)}</strong> – drei Monate seit Zustellung (Art. 8a Abs. 3 lit. d SchKG), vorsichtig nach den ZPO-Fristenregeln gerechnet (Fristbeginn am Folgetag, Art. 31 SchKG i. V. m. Art. 142 ZPO).
            </div>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.rechtsvorschlag}
              onChange={(e) => set('rechtsvorschlag', e.target.checked)} />
            <span>Ich habe <strong>Rechtsvorschlag erhoben</strong> <span className="text-ink-500">(zwingende Voraussetzung)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.keinVerfahrenBekannt}
              onChange={(e) => set('keinVerfahrenBekannt', e.target.checked)} />
            <span>Aussage aufnehmen: <strong>kein Beseitigungs-Verfahren bekannt</strong> <span className="text-ink-500">(nur wenn zutreffend – Rechtsöffnung/Klage wäre das Gegenteil)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.beilageZb}
              onChange={(e) => set('beilageZb', e.target.checked)} />
            <span>Beilagen-Zeile: <strong>Kopie des Zahlungsbefehls</strong></span>
          </label>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.warnungen.map((w, i) => (
            <div key={`w${i}`} className="lc-notice-warn text-body-s">{w}</div>
          ))}
          {gates.hinweise.map((h, i) => (
            <div key={i} className="lc-notice text-body-s">{h}</div>
          ))}

          <Field label="Ort und Datum des Gesuchs">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Basel" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>

          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Damit das Gesuch trägt</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Frühestens drei Monate nach Zustellung</strong> des Zahlungsbefehls einreichen (Art. 8a Abs. 3 lit. d SchKG).</li>
              <li><strong>Unterschreiben</strong> – das Gesuch geht als unterzeichnete Eingabe an das Betreibungsamt.</li>
            </ul>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Der Eintrag wird nicht gelöscht, sondern Dritten nicht mehr bekannt gegeben – und wieder bekannt gegeben, falls der Gläubiger den Nachweis erbringt oder die Betreibung fortsetzt.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Gesuch als PDF', banner: BANNER_NB, dateiName: 'Nichtbekanntgabe-Gesuch.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Gesuch als Word (DOCX)', banner: BANNER_NB, dateiName: 'Nichtbekanntgabe-Gesuch.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Betreibung & Konkurs (SchKG)'} · Vorlage`}
      titel="Gesuch um Nichtbekanntgabe einer Betreibung"
      intro="Gesuch an das Betreibungsamt, eine Betreibung mit erhobenem Rechtsvorschlag Dritten nicht mehr bekannt zu geben («Löschung» im Betreibungsregisterauszug, Art. 8a Abs. 3 lit. d SchKG, Fassung seit 1.1.2026) – mit deterministischer 3-Monats-Schwelle und ehrlicher Offenlegung der Wieder-Bekanntgabe. Was Wertung wäre, wird offengelegt, nicht berechnet."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_NB, dateiName: 'Nichtbekanntgabe-Gesuch.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_NB, dateiName: 'Nichtbekanntgabe-Gesuch.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
