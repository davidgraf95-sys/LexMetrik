import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FE_DEFAULTS, feZusammenstellen, pruefeFeGates, type FeAntworten, type FeFristTyp,
} from '../lib/vorlagen/fristerstreckung';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Checkbox, Field, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Fristerstreckungsgesuch (Art. 144 ZPO) ────────────────
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2).
// Die Frist-Art-Weiche (gesetzlich = nicht erstreckbar) und die
// Vor-Fristablauf-Gates liegen in pruefeFeGates.

const SPEICHER_KEY = 'lexmetrik.vorlage.fristerstreckung.v1';

const SCHRITTE = [
  { id: 'verfahren', label: 'Verfahren & Gericht' },
  { id: 'frist', label: 'Frist & Begründung' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_FE: PdfBanner = {
  titel: 'FRISTERSTRECKUNG – VOR FRISTABLAUF EINREICHEN (ART. 144 ABS. 2 ZPO)',
  text: 'Nur gerichtliche Fristen sind erstreckbar. Ob die Gründe zureichend sind, entscheidet das Gericht.',
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

const FRIST_TYPEN: { wert: FeFristTyp; label: string; sub: string }[] = [
  { wert: 'gerichtlich', label: 'Gerichtliche Frist', sub: 'vom Gericht angesetzt (z. B. Klageantwort, Stellungnahme) – erstreckbar' },
  { wert: 'gesetzlich', label: 'Gesetzliche Frist', sub: 'von der ZPO bestimmt (z. B. Berufungsfrist) – NICHT erstreckbar' },
  { wert: 'unsicher', label: 'Unsicher', sub: 'Frist-Art noch klären – Warnung wird offengelegt' },
];

export function VorlageFristerstreckung() {
  const card = karte('fristerstreckungsgesuch');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<FeAntworten>({ defaults: FE_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis } = useMemo(() => feZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeFeGates(a), [a]);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.absenderName.trim()) f.push('Gesuchstellende Partei bzw. Vertretung angeben.');
      if (!a.adressatName.trim()) f.push('Gericht angeben.');
      if (!a.verfahrenBeschrieb.trim()) f.push('Verfahren bezeichnen (z. B. «Muster AG gegen Beispiel GmbH betreffend Forderung»).');
    }
    if (i === 1) {
      if (!a.fristBeschrieb.trim()) f.push('Frist bezeichnen (z. B. «Frist zur Erstattung der Klageantwort»).');
      if (!ISO.test(a.fristEnde)) f.push('Laufendes Fristende angeben.');
      if (!ISO.test(a.erstreckungBis)) f.push('Beantragtes neues Fristende angeben.');
      if (a.verfuegungVomErfassen && !ISO.test(a.verfuegungVom)) f.push('Datum der Verfügung angeben (oder Erfassung deaktivieren).');
      if (!a.begruendungPlatzhalter && !a.begruendung.trim()) f.push('Begründung erfassen – oder «Begründung später ausfüllen» wählen.');
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
      case 'verfahren': return (
        <div className="space-y-4">
          <Field label="Gesuchstellende Partei / Vertretung">
            <input className={inputCls} value={a.absenderName} onChange={(e) => set('absenderName', e.target.value)} placeholder="Firma / Vorname Name" />
          </Field>
          <Field label="Adresse" optional>
            <input className={inputCls} value={a.absenderAdresse} onChange={(e) => set('absenderAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Gericht" hint="das Gericht, das die Frist angesetzt hat – nur dieses kann sie erstrecken">
            <input className={inputCls} value={a.adressatName} onChange={(e) => set('adressatName', e.target.value)} placeholder="z. B. Zivilgericht Basel-Stadt" />
          </Field>
          <Field label="Adresse des Gerichts" optional>
            <input className={inputCls} value={a.adressatAdresse} onChange={(e) => set('adressatAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Verfahren" hint="erscheint im Betreff">
            <input className={inputCls} value={a.verfahrenBeschrieb} onChange={(e) => set('verfahrenBeschrieb', e.target.value)} placeholder="z. B. Muster AG gegen Beispiel GmbH betreffend Forderung" />
          </Field>
          <Field label="Geschäfts-Nr." optional>
            <input className={inputCls + ' sm:max-w-[14rem]'} value={a.verfahrenNr} onChange={(e) => set('verfahrenNr', e.target.value)} placeholder="z. B. ZG.2026.123" />
          </Field>
        </div>
      );

      case 'frist': return (
        <div className="space-y-4">
          <Field label="Art der Frist" hint="nur gerichtliche Fristen sind erstreckbar (Art. 144 ZPO)">
            <div className="space-y-2">
              {FRIST_TYPEN.map((t) => (
                <label key={t.wert} className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
                  <input type="radio" name="fristTyp" className="mt-0.5" checked={a.fristTyp === t.wert}
                    onChange={() => set('fristTyp', t.wert)} />
                  <span><strong>{t.label}</strong> <span className="text-ink-500">– {t.sub}</span></span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Frist" hint="bestimmte Bezeichnung – erscheint im Gesuch">
            <input className={inputCls} value={a.fristBeschrieb} onChange={(e) => set('fristBeschrieb', e.target.value)} placeholder="z. B. Frist zur Erstattung der Klageantwort" />
          </Field>
          <Checkbox
            checked={a.verfuegungVomErfassen}
            onChange={(v) => set('verfuegungVomErfassen', v)}
            label={<><span>Datum der <strong>fristansetzenden Verfügung</strong> nennen <span className="text-ink-500">(optional)</span></span></>} />
          {a.verfuegungVomErfassen && (
            <Field label="Verfügung vom">
              <DatumsFeld value={a.verfuegungVom} onChange={(v) => set('verfuegungVom', v)} className={inputCls} />
            </Field>
          )}
          <Field label="Laufendes Fristende">
            <DatumsFeld value={a.fristEnde} onChange={(v) => set('fristEnde', v)} className={inputCls} />
          </Field>
          <Field label="Beantragtes neues Fristende">
            <DatumsFeld value={a.erstreckungBis} onChange={(v) => set('erstreckungBis', v)} className={inputCls} />
          </Field>
          <Checkbox
            checked={a.ersteErstreckung}
            onChange={(v) => set('ersteErstreckung', v)}
            label={<><span>Es ist das <strong>erste</strong> Erstreckungsgesuch in dieser Frist <span className="text-ink-500">(wird im Gesuch offengelegt)</span></span></>} />
          <Checkbox
            checked={a.begruendungPlatzhalter}
            onChange={(v) => set('begruendungPlatzhalter', v)}
            label={<><span><strong>Begründung später ausfüllen</strong> <span className="text-ink-500">(Platzhalter-Block im Gesuch – vor Einreichung ergänzen)</span></span></>} />
          {!a.begruendungPlatzhalter && (
            <Field label="Begründung" hint="zureichende Gründe konkret darlegen (Art. 144 Abs. 2 ZPO)">
              <textarea className={inputCls + ' min-h-[6rem]'} value={a.begruendung} onChange={(e) => set('begruendung', e.target.value)}
                placeholder="z. B. Die Akten umfassen über 800 Seiten; die unterzeichnete Vertretung ist zudem vom … bis … landesabwesend." />
            </Field>
          )}
          <div className="lc-notice text-body-s">
            Fristende mit Stillstand und Feiertagen rechnen: {' '}
            <Link to="/rechner/zpo-fristen" className="text-brass-700 underline">ZPO-Fristen-Rechner</Link>.
          </div>
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
              <li><strong>Vor Fristablauf einreichen</strong> (Art. 144 Abs. 2 ZPO) – spätestens am letzten Tag beim Gericht einreichen oder der Schweizerischen Post übergeben (Art. 143 Abs. 1 ZPO).</li>
              <li><strong>Unterschreiben</strong> – das Gesuch geht als unterzeichnete Eingabe an das Gericht.</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Ob die Gründe zureichend sind, entscheidet das Gericht – ein Anspruch auf Erstreckung besteht nicht.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Gesuch als PDF', banner: BANNER_FE, dateiName: 'Fristerstreckungsgesuch.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Gesuch als Word (DOCX)', banner: BANNER_FE, dateiName: 'Fristerstreckungsgesuch.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Zivilprozess (ZPO)'} · Vorlage`}
      titel="Fristerstreckungsgesuch"
      intro="Gesuch an das Gericht, eine gerichtliche Frist zu erstrecken (Art. 144 Abs. 2 ZPO) – mit Frist-Art-Weiche (gesetzliche Fristen sind nicht erstreckbar), Vor-Fristablauf-Prüfung und Begründung als Maske oder Platzhalter. Was Wertung wäre, wird offengelegt, nicht berechnet."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_FE, dateiName: 'Fristerstreckungsgesuch.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_FE, dateiName: 'Fristerstreckungsgesuch.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
