import { useMemo } from 'react';
import {
  KAN_DEFAULTS, kanZusammenstellen, pruefeKanGates, type KanAntworten, type KanProbezeit,
} from '../lib/vorlagen/kuendigungArbeitnehmer';
import { KDG_ZUGANGS_HINWEIS } from '../lib/vorlagen/kuendigungGemeinsam';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, NormLink, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Kündigung durch Arbeitnehmer:in (Maske 1a, free) ──────
// Bauspezifikation: bibliothek/recherche/kuendigungs-masken.md (6.6.2026).
// Beendigungsdatum LIVE aus lib/kuendigungsfrist.ts; keine Rechtslogik hier (§3).

const SPEICHER_KEY = 'lexmetrik.vorlage.kuendigung-arbeitnehmer.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien' },
  { id: 'anstellung', label: 'Anstellung & Frist' },
  { id: 'termin', label: 'Kündigungstermin' },
  { id: 'bitten', label: 'Zeugnis & Abrechnung' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_KAN: PdfBanner = {
  titel: 'KÜNDIGUNGSSCHREIBEN – ZU UNTERZEICHNEN UND NACHWEISBAR ZUZUSTELLEN',
  text: 'Die Kündigung ist formfrei gültig (vorbehältlich vertraglicher Schriftform). Massgebend ist der Zugang beim Arbeitgeber – eingeschriebene Zustellung empfohlen.',
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function VorlageKuendigungArbeitnehmer() {
  const card = karte('kuendigung-arbeitnehmer');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<KanAntworten>({ defaults: KAN_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis, engine } = useMemo(() => kanZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeKanGates(a, engine), [a, engine]);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.absenderName.trim()) f.push('Eigenen Namen angeben.');
      if (!a.absenderAdresse.trim()) f.push('Eigene Adresse angeben.');
      if (!a.adressatName.trim()) f.push('Arbeitgeberin/Arbeitgeber angeben.');
      if (!a.adressatAdresse.trim()) f.push('Adresse der Arbeitgeberin/des Arbeitgebers angeben.');
    }
    if (i === 1) {
      if (!ISO.test(a.vertragsbeginn)) f.push('Vertragsbeginn angeben (für Dienstjahr und Probezeit).');
      if (a.probezeit === 'vereinbart' && (a.probezeitMonate < 1 || a.probezeitMonate > 3)) f.push('Vereinbarte Probezeit: 1–3 Monate (Art. 335b OR).');
      if (a.fristQuelle === 'abweichend' && a.abweichendeFristMonate < 1) f.push('Abweichende Frist: mindestens 1 Monat (Art. 335c Abs. 2 OR).');
    }
    if (i === 2) {
      if (!ISO.test(a.zugangKuendigung)) f.push('Erwarteten Zugang der Kündigung angeben (Stichtag der Fristberechnung).');
    }
    if (i === 4) {
      if (!a.ort.trim()) f.push('Ort angeben.');
      if (!ISO.test(a.datum)) f.push('Datum der Erklärung angeben.');
    }
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'parteien': return (
        <div className="space-y-4">
          <Field label="Ihr Name (kündigende Arbeitnehmerin / kündigender Arbeitnehmer)">
            <input className={inputCls} value={a.absenderName} onChange={(e) => set('absenderName', e.target.value)} placeholder="Vorname Name" />
          </Field>
          <Field label="Ihre Adresse">
            <input className={inputCls} value={a.absenderAdresse} onChange={(e) => set('absenderAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Arbeitgeberin / Arbeitgeber" hint="Firma gemäss Arbeitsvertrag">
            <input className={inputCls} value={a.adressatName} onChange={(e) => set('adressatName', e.target.value)} placeholder="Firma / Name" />
          </Field>
          <Field label="Adresse der Arbeitgeberin / des Arbeitgebers">
            <input className={inputCls} value={a.adressatAdresse} onChange={(e) => set('adressatAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
        </div>
      );

      case 'anstellung': return (
        <div className="space-y-4">
          <Field label="Vertragsbeginn" hint="bestimmt Dienstjahr und gesetzliche Frist (Art. 335c OR)">
            <DatumsFeld value={a.vertragsbeginn} onChange={(v) => set('vertragsbeginn', v)} className={inputCls} />
          </Field>
          <Field label="Probezeit" hint="7-Tage-Frist, falls der Zugang noch in die Probezeit fällt (Art. 335b OR)">
            <select className={inputCls} value={a.probezeit} onChange={(e) => set('probezeit', e.target.value as KanProbezeit)}>
              <option value="keine">Keine Probezeit (vorbei oder wegbedungen)</option>
              <option value="gesetzlich">Gesetzliche Probezeit (1 Monat)</option>
              <option value="vereinbart">Vertraglich verlängert (2–3 Monate)</option>
            </select>
          </Field>
          {a.probezeit === 'vereinbart' && (
            <Field label="Vereinbarte Probezeit (Monate)">
              <input type="number" min={1} max={3} className={inputCls + ' num sm:max-w-[9rem]'} value={a.probezeitMonate}
                onChange={(e) => set('probezeitMonate', Number(e.target.value))} />
            </Field>
          )}
          <Field label="Kündigungsfrist" hint="abweichende Frist gilt nur bei Schriftform/GAV (Art. 335c Abs. 2 OR)">
            <select className={inputCls} value={a.fristQuelle} onChange={(e) => set('fristQuelle', e.target.value as KanAntworten['fristQuelle'])}>
              <option value="gesetzlich">Gesetzliche Frist (1/2/3 Monate nach Dienstjahr)</option>
              <option value="abweichend">Vertraglich abweichende Frist</option>
            </select>
          </Field>
          {a.fristQuelle === 'abweichend' && (
            <div className="space-y-3">
              <Field label="Abweichende Frist (Monate)">
                <input type="number" min={1} className={inputCls + ' num sm:max-w-[9rem]'} value={a.abweichendeFristMonate}
                  onChange={(e) => set('abweichendeFristMonate', Number(e.target.value))} />
              </Field>
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.abweichendeFristFormGueltig}
                  onChange={(e) => set('abweichendeFristFormGueltig', e.target.checked)} />
                <span>Die abweichende Frist steht schriftlich im Vertrag, NAV oder GAV
                  <span className="text-ink-500"> (Gültigkeitsvoraussetzung – sonst gilt die gesetzliche Frist)</span></span>
              </label>
            </div>
          )}
        </div>
      );

      case 'termin': return (
        <div className="space-y-4">
          <Field label="Erwarteter Zugang der Kündigung" hint="Stichtag der Fristberechnung – nicht das Absendedatum">
            <DatumsFeld value={a.zugangKuendigung} onChange={(v) => set('zugangKuendigung', v)} className={inputCls} />
          </Field>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.kuendigungsterminMonatsende}
              onChange={(e) => set('kuendigungsterminMonatsende', e.target.checked)} />
            <span>Kündigungstermin ist das Monatsende <span className="text-ink-500">(gesetzlicher Regelfall, Art. 335c Abs. 1 OR)</span></span>
          </label>
          {engine?.beendigungsdatum && (
            <div className="lc-tile">
              <p className="lc-overline">Beendigung des Arbeitsverhältnisses</p>
              <p className="text-h2 font-display font-semibold text-ink-900 leading-none num">
                {engine.beendigungsdatum.toLocaleDateString('de-CH')}
              </p>
              <p className="text-body-s text-ink-600 mt-1.5">{engine.ergebnis.ergebnis}</p>
              {engine.istProbezeit && (
                <p className="text-body-s text-warn-700 mt-1">Zugang liegt in der Probezeit – 7-Tage-Frist (<NormLink artikel="Art. 335b OR" />).</p>
              )}
            </div>
          )}
          <div className="lc-notice text-body-s">{KDG_ZUGANGS_HINWEIS}</div>
        </div>
      );

      case 'bitten': return (
        <div className="space-y-4">
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.zeugnisVerlangen}
              onChange={(e) => set('zeugnisVerlangen', e.target.checked)} />
            <span>Qualifiziertes Arbeitszeugnis verlangen <span className="text-ink-500">(Anspruch nach Art. 330a OR)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.schlussabrechnungVerlangen}
              onChange={(e) => set('schlussabrechnungVerlangen', e.target.checked)} />
            <span>Schlussabrechnung verlangen <span className="text-ink-500">(Lohn, anteiliger 13. Monatslohn, Feriensaldo, Überstunden)</span></span>
          </label>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.warnungen.map((w, i) => (
            <div key={i} className="lc-notice-warn text-body-s">{w}</div>
          ))}
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
            <p className="lc-overline text-brass-700">Damit die Kündigung trägt</p>
            <ul className="space-y-2 text-body-s text-ink-700">
              <li><strong>Unterschreiben und nachweisbar zustellen</strong> – eingeschrieben und zusätzlich per A-Post (Beweis + zeitnaher Zugang).</li>
              <li><strong>Zugang ist massgebend</strong> – die Frist läuft ab Zugang beim Arbeitgeber, nicht ab Versand.</li>
              <li><strong>Vertragliche Schriftform</strong> (falls vereinbart) ist mit diesem unterschriebenen Brief erfüllt.</li>
            </ul>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Das Beendigungsdatum beruht auf meinen Eingaben (Vertragsbeginn, Zugang, Frist) – bei Unsicherheit den Arbeitsvertrag/GAV prüfen.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Kündigung als PDF', banner: BANNER_KAN, dateiName: 'Kuendigung-Arbeitsverhaeltnis.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Kündigung als Word (DOCX)', banner: BANNER_KAN, dateiName: 'Kuendigung-Arbeitsverhaeltnis.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Arbeit'} · Vorlage`}
      titel="Kündigung durch Arbeitnehmer:in"
      intro="Stellt das Kündigungsschreiben aus festen Bausteinen zusammen und berechnet das Beendigungsdatum live nach Art. 335a–c OR (Dienstjahr, Probezeit, abweichende Fristen). Sperrfristen gelten für die Arbeitnehmer-Kündigung nicht. Ohne Sprachmodell: gleiche Eingaben, gleiches Dokument."
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
