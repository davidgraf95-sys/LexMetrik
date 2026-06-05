import { useMemo } from 'react';
import {
  AV_DEFAULTS, AV_MINDESTLOEHNE, AV_OFFENE_VERIFIKATIONEN,
  avZusammenstellen, pruefeAvGates, type AvAntworten,
} from '../lib/vorlagen/arbeitsvertrag';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { BetragsFeld } from '../components/BetragsFeld';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, NormLink, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { KANTONE } from '../lib/kantone';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Einzelarbeitsvertrag (Art. 319 ff. OR) ────────────────
// Erste Vorlage auf dem generischen Wizard-Rahmen. Validierungskern ist die
// Matrix des Gutachtens 5.6.2026 (absolut/relativ zwingend, Schriftform,
// Disclosure) — siehe lib/vorlagen/arbeitsvertrag.ts. Eingaben bleiben im
// Browser (localStorage).

const SPEICHER_KEY = 'lexmetrik.vorlage.arbeitsvertrag.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien' },
  { id: 'stelle', label: 'Stelle & Beginn' },
  { id: 'lohn', label: 'Lohn' },
  { id: 'zeit', label: 'Arbeitszeit & Ferien' },
  { id: 'absicherung', label: 'Absicherung & Spesen' },
  { id: 'klauseln', label: 'Besondere Klauseln' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_AV: PdfBanner = {
  titel: 'VERTRAGSENTWURF — VON BEIDEN PARTEIEN ZU UNTERZEICHNEN',
  text: 'Der Arbeitsvertrag ist formfrei gültig (Art. 320 OR); einzelne Klauseln (Konkurrenzverbot, Überstunden-Wegbedingung, abweichende Fristen, Pauschalspesen) bedürfen der Schriftform — die beidseitige Unterzeichnung dieses Vertrags erfüllt sie.',
};

const MINDESTLOHN_KANTONE = new Set(AV_MINDESTLOEHNE.map((m) => m.kanton));

export function VorlageArbeitsvertrag() {
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<AvAntworten>({
      defaults: AV_DEFAULTS,
      speicherKey: SPEICHER_KEY,
    });

  const ergebnis = useMemo(() => avZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeAvGates(a), [a]);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.arbeitgeberName.trim()) f.push('Arbeitgeber angeben (Firma bzw. Name).');
      if (!a.arbeitgeberAdresse.trim()) f.push('Adresse des Arbeitgebers angeben.');
      if (!a.arbeitnehmerVorname.trim() || !a.arbeitnehmerName.trim()) f.push('Vor- und Nachname der Arbeitnehmerin / des Arbeitnehmers angeben.');
      if (!a.arbeitnehmerAdresse.trim()) f.push('Adresse der Arbeitnehmerin / des Arbeitnehmers angeben.');
    }
    if (i === 1) {
      if (!a.funktion.trim()) f.push('Funktion angeben (Art. 330b OR).');
      if (!a.arbeitsort.trim()) f.push('Arbeitsort angeben.');
      if (!a.beginn) f.push('Stellenantritt angeben.');
      if (a.befristet && !a.befristetBis) f.push('Enddatum der Befristung angeben (Art. 334 OR).');
    }
    if (i === 2 && !a.lohnBetrag.trim()) f.push('Lohn angeben (Art. 322/330b OR).');
    if (i === 6 && !a.datum) f.push('Vertragsdatum angeben.');
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const card = karte('arbeitsvertrag');

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'parteien': return (
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="lc-overline">Arbeitgeber</p>
            <Field label="Rechtsform">
              <select className={inputCls} value={a.arbeitgeberTyp} onChange={(e) => set('arbeitgeberTyp', e.target.value as AvAntworten['arbeitgeberTyp'])}>
                <option value="juristisch">juristische Person (AG, GmbH, Verein …)</option>
                <option value="natuerlich">natürliche Person</option>
              </select>
            </Field>
            <Field label={a.arbeitgeberTyp === 'juristisch' ? 'Firma' : 'Name'}>
              <input className={inputCls} value={a.arbeitgeberName} onChange={(e) => set('arbeitgeberName', e.target.value)}
                placeholder={a.arbeitgeberTyp === 'juristisch' ? 'Muster AG' : 'Vorname Nachname'} />
            </Field>
            <Field label="Adresse">
              <input className={inputCls} value={a.arbeitgeberAdresse} onChange={(e) => set('arbeitgeberAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
            </Field>
          </div>
          <div className="space-y-3">
            <p className="lc-overline">Arbeitnehmer/in</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Vorname"><input className={inputCls} value={a.arbeitnehmerVorname} onChange={(e) => set('arbeitnehmerVorname', e.target.value)} /></Field>
              <Field label="Nachname"><input className={inputCls} value={a.arbeitnehmerName} onChange={(e) => set('arbeitnehmerName', e.target.value)} /></Field>
            </div>
            <Field label="Adresse">
              <input className={inputCls} value={a.arbeitnehmerAdresse} onChange={(e) => set('arbeitnehmerAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
            </Field>
            <Field label="Geburtsdatum" optional hint="steuert den Mindest-Ferienanspruch (5 Wochen bis zum vollendeten 20. Altersjahr, Art. 329a OR)">
              <DatumsFeld value={a.arbeitnehmerGeburtsdatum ?? ''} onChange={(v) => set('arbeitnehmerGeburtsdatum', v || undefined)} className={inputCls} />
            </Field>
          </div>
        </div>
      );

      case 'stelle': return (
        <div className="space-y-4">
          <Field label="Funktion / Tätigkeit">
            <input className={inputCls} value={a.funktion} onChange={(e) => set('funktion', e.target.value)} placeholder="z. B. Sachbearbeiterin Treuhand" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_10rem] gap-3">
            <Field label="Arbeitsort">
              <input className={inputCls} value={a.arbeitsort} onChange={(e) => set('arbeitsort', e.target.value)} placeholder="z. B. Basel" />
            </Field>
            <Field label="Kanton" optional hint="für die Mindestlohn-Prüfung">
              <select className={inputCls} value={a.arbeitsortKanton ?? ''} onChange={(e) => set('arbeitsortKanton', e.target.value || undefined)}>
                <option value="">– wählen –</option>
                {KANTONE.map((k) => <option key={k} value={k}>{k}{MINDESTLOHN_KANTONE.has(k) ? ' (Mindestlohn)' : ''}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Stellenantritt">
            <DatumsFeld value={a.beginn} onChange={(v) => set('beginn', v)} className={inputCls} />
          </Field>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.befristet} onChange={(e) => {
              set('befristet', e.target.checked);
              // Stale-State vermeiden: bei Befristung gibt es keine ordentliche
              // Kündigung — abweichende Frist zurücksetzen (Review-Befund B1).
              if (e.target.checked) { set('kuendigungsfrist', 'gesetzlich'); set('kuendigungsfristMonate', undefined); }
            }} />
            <span>Befristetes Arbeitsverhältnis <span className="text-ink-500">(endet ohne Kündigung, Art. 334 OR)</span></span>
          </label>
          {a.befristet && (
            <Field label="Befristet bis">
              <DatumsFeld value={a.befristetBis ?? ''} onChange={(v) => set('befristetBis', v || undefined)} className={inputCls} />
            </Field>
          )}
          {/* Probezeit ist auch beim befristeten Verhältnis vereinbar */}
          {(
            <div className="space-y-3 pt-1">
              <p className="lc-overline">Probezeit (Art. 335b OR)</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {([
                  // Bei Befristung gibt es keine gesetzliche Vermutung
                  // (Art. 335b Abs. 1 OR) — die Probezeit wird VEREINBART.
                  ['gesetzlich', a.befristet ? '1 Monat (vereinbart)' : 'Gesetzlich', a.befristet ? 'ausdrückliche Abrede' : '1 Monat'],
                  ['verlaengert', a.befristet ? '2–3 Monate (vereinbart)' : 'Verlängert', '2–3 Monate (schriftlich)'],
                  ['wegbedungen', 'Keine', 'Probezeit wegbedungen'],
                ] as const).map(([code, label, sub]) => (
                  <button key={code} type="button" onClick={() => set('probezeit', code)} aria-pressed={a.probezeit === code}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      a.probezeit === code ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface hover:border-brass-400'
                    }`}>
                    <span className="block text-body-s font-semibold text-ink-900">{label}</span>
                    <span className="block text-xs text-ink-500">{sub}</span>
                  </button>
                ))}
              </div>
              {a.probezeit === 'verlaengert' && (
                <Field label="Probezeit (Monate)" hint="höchstens drei Monate (Art. 335b Abs. 2 OR)">
                  <input type="number" min={2} max={3} className={inputCls + ' w-28'} value={a.probezeitMonate ?? 3}
                    onChange={(e) => set('probezeitMonate', Number(e.target.value))} />
                </Field>
              )}
            </div>
          )}
        </div>
      );

      case 'lohn': return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([['monatslohn', 'Monatslohn'], ['stundenlohn', 'Stundenlohn']] as const).map(([code, label]) => (
              <button key={code} type="button" onClick={() => {
                set('lohnModell', code);
                // Ferienzuschlag gibt es nur im Stundenlohn (Review-Befund B1)
                if (code === 'monatslohn') set('ferienzuschlagSeparat', undefined);
              }} aria-pressed={a.lohnModell === code}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  a.lohnModell === code ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface hover:border-brass-400'
                }`}>
                <span className="block text-body-s font-semibold text-ink-900">{label}</span>
              </button>
            ))}
          </div>
          <Field label={a.lohnModell === 'monatslohn' ? 'Bruttolohn pro Monat (CHF)' : 'Bruttolohn pro Stunde (CHF)'}>
            <BetragsFeld className={inputCls + ' num'} value={a.lohnBetrag} onChange={(v) => set('lohnBetrag', v)} placeholder={a.lohnModell === 'monatslohn' ? "z. B. 6'500" : 'z. B. 32.50'} />
          </Field>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.dreizehnter} onChange={(e) => set('dreizehnter', e.target.checked)} />
            <span>13. Monatslohn <span className="text-ink-500">(Lohnbestandteil — bei unterjährigem Ein-/Austritt pro rata geschuldet)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.gratifikation} onChange={(e) => set('gratifikation', e.target.checked)} />
            <span>Freiwillige Gratifikation vorsehen <span className="text-ink-500">(Vorbehalts-Klausel wird automatisch aufgenommen, Art. 322d OR)</span></span>
          </label>
          {a.lohnModell === 'stundenlohn' && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.ferienzuschlagSeparat ?? false} onChange={(e) => set('ferienzuschlagSeparat', e.target.checked)} />
              <span>Ferienlohn laufend ausrichten (gesondert ausgewiesener Zuschlag) <span className="text-warn-700">— nur bei unregelmässiger Teilzeit zulässig (BGE 149 III 202)</span></span>
            </label>
          )}
        </div>
      );

      case 'zeit': return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pensum (%)">
              <input type="number" min={1} max={100} className={inputCls + ' num'} value={a.pensumProzent}
                onChange={(e) => set('pensumProzent', Math.min(100, Math.max(1, Number(e.target.value) || 100)))} />
            </Field>
            <Field label="Wochenstunden (bei 100 %)" hint="Höchstarbeitszeit 45/50 Std. (Art. 9 ArG)">
              <input type="number" min={1} max={50} step={0.5} className={inputCls + ' num'} value={a.wochenstunden}
                onChange={(e) => set('wochenstunden', Number(e.target.value) || 42)} />
            </Field>
          </div>
          <div className="space-y-2">
            <p className="lc-overline">Überstunden (Art. 321c OR)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {([
                ['gesetzlich', 'Gesetzlich', 'Freizeit oder Lohn + 25 %'],
                ['kompensation', 'Kompensation', 'grundsätzlich Freizeit'],
                ['inbegriffen', 'Im Lohn inbegriffen', 'Wegbedingung (schriftlich)'],
              ] as const).map(([code, label, sub]) => (
                <button key={code} type="button" onClick={() => set('ueberstunden', code)} aria-pressed={a.ueberstunden === code}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    a.ueberstunden === code ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface hover:border-brass-400'
                  }`}>
                  <span className="block text-body-s font-semibold text-ink-900">{label}</span>
                  <span className="block text-xs text-ink-500">{sub}</span>
                </button>
              ))}
            </div>
            {a.ueberstunden === 'inbegriffen' && (
              <p className="lc-notice-warn text-body-s">
                Gilt nur für OR-Überstunden. Überzeit über der wöchentlichen Höchstarbeitszeit
                (45/50 Std.) bleibt zwingend zuschlagspflichtig (<NormLink artikel="Art. 13 ArG" />) und
                kann nicht wegbedungen werden.
              </p>
            )}
          </div>
          <Field label="Ferien (Wochen pro Dienstjahr)" hint="mindestens 4 Wochen; 5 Wochen bis zum vollendeten 20. Altersjahr (Art. 329a OR)">
            <input type="number" min={4} max={8} className={inputCls + ' w-28 num'} value={a.ferienWochen}
              onChange={(e) => set('ferienWochen', Number(e.target.value) || 4)} />
          </Field>
          {!a.befristet && (
            <div className="space-y-2 pt-1">
              <p className="lc-overline">Kündigungsfrist nach der Probezeit (Art. 335c OR)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([
                  ['gesetzlich', 'Gesetzliche Staffel', '1 / 2 / 3 Monate nach Dienstjahren'],
                  ['abweichend', 'Einheitliche Frist', 'für beide Parteien gleich (schriftlich)'],
                ] as const).map(([code, label, sub]) => (
                  <button key={code} type="button" onClick={() => set('kuendigungsfrist', code)} aria-pressed={a.kuendigungsfrist === code}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      a.kuendigungsfrist === code ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface hover:border-brass-400'
                    }`}>
                    <span className="block text-body-s font-semibold text-ink-900">{label}</span>
                    <span className="block text-xs text-ink-500">{sub}</span>
                  </button>
                ))}
              </div>
              {a.kuendigungsfrist === 'abweichend' && (
                <Field label="Frist (Monate, auf Monatsende)" hint="nie unter einem Monat (Art. 335c Abs. 2 OR); Parität für beide Parteien">
                  <input type="number" min={1} max={12} className={inputCls + ' w-28 num'} value={a.kuendigungsfristMonate ?? 3}
                    onChange={(e) => set('kuendigungsfristMonate', Number(e.target.value))} />
                </Field>
              )}
            </div>
          )}
        </div>
      );

      case 'absicherung': return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="lc-overline">Lohnfortzahlung bei Krankheit (Art. 324a OR)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {([
                ['gesetzlich', 'Gesetzliche Regelung', '3 Wochen im 1. Dienstjahr, danach Skala'],
                ['ktg', 'Krankentaggeld-Versicherung', 'gleichwertige Lösung (Abs. 4)'],
              ] as const).map(([code, label, sub]) => (
                <button key={code} type="button" onClick={() => set('lohnfortzahlung', code)} aria-pressed={a.lohnfortzahlung === code}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    a.lohnfortzahlung === code ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface hover:border-brass-400'
                  }`}>
                  <span className="block text-body-s font-semibold text-ink-900">{label}</span>
                  <span className="block text-xs text-ink-500">{sub}</span>
                </button>
              ))}
            </div>
            {a.lohnfortzahlung === 'ktg' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Taggeld (% des Lohnes)"><input type="number" min={50} max={100} className={inputCls + ' num'} value={a.ktgProzent ?? 80} onChange={(e) => set('ktgProzent', Number(e.target.value))} /></Field>
                <Field label="Leistungsdauer (Tage)" hint="innert 900 Tagen"><input type="number" min={180} max={1095} className={inputCls + ' num'} value={a.ktgTage ?? 730} onChange={(e) => set('ktgTage', Number(e.target.value))} /></Field>
                <Field label="Wartefrist (Tage)" hint="über 3 Tage nur gleichwertig, wenn der Arbeitgeber 80 % zahlt">
                  <select className={inputCls} value={a.ktgWartefristTage ?? 0} onChange={(e) => set('ktgWartefristTage', Number(e.target.value))}>
                    {[0, 2, 3, 30, 60, 90].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                {(a.ktgWartefristTage ?? 0) > 0 && (
                  <Field label="Lohn während Wartefrist (%)"><input type="number" min={0} max={100} className={inputCls + ' num'} value={a.ktgWartefristLohnProzent ?? 80} onChange={(e) => set('ktgWartefristLohnProzent', Number(e.target.value))} /></Field>
                )}
                <Field label="Prämienanteil Arbeitnehmer/in (%)" hint="über 50 % gefährdet die Gleichwertigkeit"><input type="number" min={0} max={100} className={inputCls + ' num'} value={a.ktgPraemieAnProzent ?? 50} onChange={(e) => set('ktgPraemieAnProzent', Number(e.target.value))} /></Field>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="lc-overline">Spesen (Art. 327a OR)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {([
                ['effektiv', 'Effektiver Ersatz', 'gegen Beleg (gesetzliches Minimum)'],
                ['pauschal', 'Pauschalspesen', 'pro Monat (schriftlich; muss alles decken)'],
              ] as const).map(([code, label, sub]) => (
                <button key={code} type="button" onClick={() => set('spesen', code)} aria-pressed={a.spesen === code}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    a.spesen === code ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface hover:border-brass-400'
                  }`}>
                  <span className="block text-body-s font-semibold text-ink-900">{label}</span>
                  <span className="block text-xs text-ink-500">{sub}</span>
                </button>
              ))}
            </div>
            {a.spesen === 'pauschal' && (
              <Field label="Pauschale (CHF pro Monat)" hint="muss alle notwendigen Auslagen decken — sonst insoweit nichtig (Art. 327a Abs. 3 OR)">
                <BetragsFeld className={inputCls + ' num w-40'} value={a.spesenPauschaleCHF ?? ''} onChange={(v) => set('spesenPauschaleCHF', v)} placeholder="z. B. 200" />
              </Field>
            )}
          </div>
          <div className="space-y-2">
            <p className="lc-overline">Gesamtarbeitsvertrag</p>
            <select className={inputCls} value={a.gav} onChange={(e) => set('gav', e.target.value as AvAntworten['gav'])}>
              <option value="nein">Kein GAV anwendbar</option>
              <option value="ja">GAV anwendbar</option>
              <option value="unbekannt">Unklar — noch zu prüfen</option>
            </select>
            {a.gav === 'ja' && (
              <Field label="GAV (Bezeichnung)">
                <input className={inputCls} value={a.gavName ?? ''} onChange={(e) => set('gavName', e.target.value)} placeholder="z. B. Landes-GAV des Gastgewerbes (L-GAV)" />
              </Field>
            )}
            {a.gav === 'ja' && (
              <Field label="Art der Geltung" hint="blosse Verweisung erzeugt keine Normwirkung (Art. 356/357 OR)">
                <select className={inputCls} value={a.gavTyp ?? ''} onChange={(e) => set('gavTyp', (e.target.value || undefined) as AvAntworten['gavTyp'])}>
                  <option value="">– wählen –</option>
                  <option value="ave">allgemeinverbindlich erklärt (AVE)</option>
                  <option value="mitgliedschaft">beidseitige Verbandsmitgliedschaft</option>
                  <option value="verweis">blosse vertragliche Verweisung</option>
                </select>
              </Field>
            )}
          </div>
        </div>
      );

      case 'klauseln': return (
        <div className="space-y-4">
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.konkurrenzverbot} onChange={(e) => set('konkurrenzverbot', e.target.checked)} />
            <span><strong>Konkurrenzverbot</strong> vereinbaren <span className="text-ink-500">(Art. 340 ff. OR — nach Ort, Zeit und Gegenstand zu begrenzen)</span></span>
          </label>
          {a.konkurrenzverbot && (
            <div className="lc-card p-4 space-y-3">
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium">
                <input type="checkbox" className="mt-0.5" checked={a.kvEinblickBestaetigt ?? false} onChange={(e) => set('kvEinblickBestaetigt', e.target.checked)} />
                Die Stelle gewährt Einblick in den Kundenkreis oder in Fabrikations-/Geschäftsgeheimnisse, deren Verwendung den Arbeitgeber erheblich schädigen könnte (Art. 340 Abs. 2 OR).
              </label>
              <Field label="Gegenstand (untersagte Tätigkeit)">
                <input className={inputCls} value={a.kvGegenstand ?? ''} onChange={(e) => set('kvGegenstand', e.target.value)} placeholder="z. B. Treuhand- und Revisionsdienstleistungen" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_9rem] gap-3">
                <Field label="Örtlicher Geltungsbereich">
                  <input className={inputCls} value={a.kvOrt ?? ''} onChange={(e) => set('kvOrt', e.target.value)} placeholder="z. B. Kantone BS und BL" />
                </Field>
                <Field label="Dauer (Monate)" hint="in der Regel höchstens 3 Jahre">
                  <input type="number" min={1} max={60} className={inputCls + ' num'} value={a.kvDauerMonate ?? 12} onChange={(e) => set('kvDauerMonate', Number(e.target.value))} />
                </Field>
              </div>
              <Field label="Konventionalstrafe (CHF je Übertretung)" optional hint="Bezahlung befreit vom Verbot; weiterer Schaden bleibt ersatzpflichtig (Art. 340b OR)">
                <BetragsFeld className={inputCls + ' num w-40'} value={a.kvKonventionalstrafeCHF ?? ''} onChange={(v) => set('kvKonventionalstrafeCHF', v)} placeholder="z. B. 20'000" />
              </Field>
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.kvRealerfuellung ?? false} onChange={(e) => set('kvRealerfuellung', e.target.checked)} />
                <span>Realerfüllung vorbehalten <span className="text-ink-500">(Beseitigung des vertragswidrigen Zustands, Art. 340b Abs. 3 OR — «besonders schriftlich verabredet»)</span></span>
              </label>
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.kvStrafeBefreitNicht ?? false} onChange={(e) => set('kvStrafeBefreitNicht', e.target.checked)} />
                <span>Zahlung der Konventionalstrafe befreit <strong>nicht</strong> vom Verbot <span className="text-ink-500">(abweichende Abrede, Art. 340b Abs. 2 OR)</span></span>
              </label>
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.kvKarenz ?? false} onChange={(e) => set('kvKarenz', e.target.checked)} />
                <span><strong>Karenzentschädigung</strong> vereinbaren <span className="text-ink-500">(gesetzlich nicht vorgeschrieben; erlaubt ein weitergehendes Verbot, Art. 340a Abs. 2 OR)</span></span>
              </label>
              {a.kvKarenz && (
                <div className="pl-6 space-y-3">
                  <Field label="Karenzentschädigung (CHF pro Monat)">
                    <BetragsFeld className={inputCls + ' num w-40'} value={a.kvKarenzCHFProMonat ?? ''} onChange={(v) => set('kvKarenzCHFProMonat', v || undefined)} placeholder="z. B. 2'000" />
                  </Field>
                  <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                    <input type="checkbox" className="mt-0.5" checked={a.kvKarenzVerzichtsrecht ?? false} onChange={(e) => set('kvKarenzVerzichtsrecht', e.target.checked)} />
                    <span>Einseitiges Verzichtsrecht des Arbeitgebers vorbehalten <span className="text-ink-500">(ohne Abrede keine einseitige Befreiung — BGer 4A_5/2025)</span></span>
                  </label>
                  <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                    <input type="checkbox" className="mt-0.5" checked={a.kvKarenzErsatzAnrechenbar ?? false} onChange={(e) => set('kvKarenzErsatzAnrechenbar', e.target.checked)} />
                    <span>Ersatzeinkommen anrechenbar <span className="text-ink-500">(nur bei ausdrücklicher Abrede — BGer 4A_5/2025 E. 5.3)</span></span>
                  </label>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-ink-500">
            Treue-/Geheimhaltungspflicht, Datenschutz und Schlussbestimmungen werden automatisch
            aufgenommen. Nicht enthalten (anwaltliche Beratung empfohlen): Lohnrückbehalt,
            Bonuspläne, Erfindungen/IP-Zuordnung über Art. 332 OR hinaus, Kaderverträge.
          </p>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.blocker.length > 0 && (
            <div className="rounded-lg border bg-danger-bg p-4 space-y-1" style={{ borderColor: 'var(--danger-500)' }}>
              <p className="lc-overline text-danger-700 mb-1">Vor der Ausgabe zu beheben</p>
              {gates.blocker.map((b, i) => <p key={i} className="text-body-s text-danger-700">• {b}</p>)}
            </div>
          )}
          {gates.warnungen.map((w, i) => (
            <div key={i} className="lc-notice-warn text-body-s">{w}</div>
          ))}
          {gates.hinweise.map((h, i) => (
            <div key={i} className="lc-notice text-body-s">{h}</div>
          ))}

          <Field label="Ort und Datum des Vertragsschlusses">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Basel" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>

          {/* Form-Gate */}
          <section className="rounded-xl border-2 p-5 space-y-3" style={{ borderColor: 'var(--brass-500)', background: 'var(--brass-100)' }}>
            <p className="lc-overline text-brass-700">Form-Gate — damit der Vertrag trägt</p>
            <ul className="space-y-2 text-body-s text-ink-700">
              <li><strong>Beidseitig unterzeichnen</strong> — erst die Unterschriften beider Parteien erfüllen die Schriftform der formbedürftigen Klauseln (Konkurrenzverbot, Wegbedingungen, abweichende Fristen).</li>
              <li><strong>Elektronisch nur mit QES:</strong> Die Schriftform erfüllt elektronisch nur die qualifizierte elektronische Signatur mit qualifiziertem Zeitstempel (Art. 14 Abs. 2bis OR) — einfache E-Signatur oder eingescannte Unterschrift genügen nicht.</li>
              <li><strong>GAV/NAV prüfen:</strong> Anwendbare Mindeststandards gehen diesem Vertrag vor (Art. 357/360a OR).</li>
              <li><strong>Mindestlohn prüfen</strong> bei Arbeitsort in GE, BS, NE, JU, TI (jährlich indexiert; ab 2026 auch Stadt Luzern).</li>
              <li><strong>Sozialversicherungen anmelden</strong> (AHV/ALV/BVG/UVG) — nicht Gegenstand dieser Vorlage.</li>
            </ul>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Dies ist ein Entwurf nach festen Bausteinen — GAV/NAV, kantonale Mindestlöhne und der Einzelfall sind gesondert zu prüfen.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Vertrag als PDF', banner: BANNER_AV, dateiName: 'Arbeitsvertrag-Entwurf.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Vertrag als Word (DOCX)', banner: BANNER_AV, dateiName: 'Arbeitsvertrag-Entwurf.docx' }
              : undefined} />

          {/* Offene Verifikationen (transparent) */}
          <details className="lc-card p-4">
            <summary className="cursor-pointer text-body-s font-medium text-ink-700">Offene Verifikationen ({AV_OFFENE_VERIFIKATIONEN.length})</summary>
            <ul className="mt-2 space-y-1.5">
              {AV_OFFENE_VERIFIKATIONEN.map((v, i) => <li key={i} className="text-xs text-ink-500">– {v}</li>)}
            </ul>
          </details>
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Arbeit'} · Vorlage`}
      titel="Einzelarbeitsvertrag"
      intro="Stellt einen Arbeitsvertrag nach Art. 319 ff. OR aus festen, juristisch vorformulierten Bausteinen zusammen — mit harten Schranken für zwingendes Recht (Probezeit, Fristen, Ferien, Ferienlohn) und offengelegten Hinweisen zu heiklen Klauseln. Ohne Sprachmodell: gleiche Eingaben, gleiches Dokument."
      norms={card?.norms ?? []}
      badge="Beidseitig zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} />}
    />
  );
}
