import { useMemo } from 'react';
import {
  KK_DEFAULTS, kkZusammenstellen, pruefeKkGates, type KkAntworten, type KkKostenschluessel,
} from '../lib/vorlagen/konkubinat';
import { zahl } from '../lib/vorlagen/datum';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { VariantenKopf } from '../components/vorlagen/VariantenKopf';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Konkubinatsvertrag ────────────────────────────────────
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3).
// Innominatvertrag (Art. 19 OR), formfrei. Module Wohnen/Kosten/Inventar/
// einfache Gesellschaft/Auflösung. Hinweise in pruefeKkGates.

const SPEICHER_KEY = 'lexmetrik.vorlage.konkubinat.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien' },
  { id: 'regelung', label: 'Kosten, Wohnen & Vermögen' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_KK: PdfBanner = {
  titel: 'KONKUBINATSVERTRAG',
  text: 'Formfreier Innominatvertrag (Art. 19 OR), beidseitig zu unterzeichnen. Es besteht kein gesetzliches Konkubinatsrecht; Kindesbelange richten sich nach dem Gesetz.',
};

const KOSTEN_OPTIONEN: { id: KkKostenschluessel; label: string }[] = [
  { id: 'haelftig', label: 'je zur Hälfte' },
  { id: 'einkommen', label: 'nach Einkommen' },
  { id: 'fix', label: 'feste Beiträge' },
];

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function VorlageKonkubinat() {
  const card = karte('konkubinat');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<KkAntworten>({ defaults: KK_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis } = useMemo(() => kkZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeKkGates(a), [a]);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.partner1Name.trim()) f.push('Partnerin/Partner 1 angeben.');
      if (!a.partner2Name.trim()) f.push('Partnerin/Partner 2 angeben.');
    }
    if (i === 1) {
      if (a.wohnenAufnehmen && !a.wohnBeschrieb.trim()) f.push('Wohnsituation umschreiben (oder Wohn-Klausel deaktivieren).');
      if (a.kostenschluessel === 'fix' && (zahl(a.fix1CHF) === null || zahl(a.fix2CHF) === null)) f.push('Beide festen Monatsbeiträge in CHF angeben.');
      if (a.einfacheGesellschaft && !a.einfacheGesellschaftZweck.trim()) f.push('Gemeinsamen Zweck umschreiben (oder einfache Gesellschaft deaktivieren).');
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
            Der Konkubinatsvertrag ist ein <strong>Innominatvertrag</strong> (Art. 19 OR), formfrei
            gültig. Es gibt <strong>kein gesetzliches Konkubinatsrecht</strong> – der Vertrag regelt
            nur, was er ausdrücklich bestimmt.
          </div>
          <Field label="Partnerin / Partner 1">
            <input className={inputCls} value={a.partner1Name} onChange={(e) => set('partner1Name', e.target.value)} placeholder="Vorname Name" />
          </Field>
          <Field label="Adresse Partnerin / Partner 1" optional>
            <input className={inputCls} value={a.partner1Adresse} onChange={(e) => set('partner1Adresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Partnerin / Partner 2">
            <input className={inputCls} value={a.partner2Name} onChange={(e) => set('partner2Name', e.target.value)} placeholder="Vorname Name" />
          </Field>
          <Field label="Adresse Partnerin / Partner 2" optional>
            <input className={inputCls} value={a.partner2Adresse} onChange={(e) => set('partner2Adresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
        </div>
      );

      case 'regelung': return (
        <div className="space-y-4">
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.wohnenAufnehmen}
              onChange={(e) => set('wohnenAufnehmen', e.target.checked)} />
            <span><strong>Wohn-Klausel</strong> aufnehmen</span>
          </label>
          {a.wohnenAufnehmen && (
            <Field label="Wohnsituation" hint="Mietverhältnis/Eigentum und Nutzung der gemeinsamen Wohnung">
              <textarea className={inputCls + ' min-h-[3.5rem]'} value={a.wohnBeschrieb} onChange={(e) => set('wohnBeschrieb', e.target.value)} placeholder="z. B. gemeinsame Mietwohnung an der Beispielstrasse 1, 8000 Zürich; Hauptmieter ist Partner 1" />
            </Field>
          )}

          <Field label="Kosten des Zusammenlebens">
            <div className="grid grid-cols-3 gap-2">
              {KOSTEN_OPTIONEN.map((k) => (
                <button key={k.id} type="button"
                  onClick={() => set('kostenschluessel', k.id)}
                  className={`rounded-lg border px-3 py-2 text-body-s ${a.kostenschluessel === k.id ? 'border-brass-500 bg-brass-50 text-ink-900' : 'border-line text-ink-700'}`}>
                  {k.label}
                </button>
              ))}
            </div>
          </Field>
          {a.kostenschluessel === 'fix' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Beitrag Partner 1 (CHF/Monat)">
                <input className={inputCls} inputMode="decimal" value={a.fix1CHF} onChange={(e) => set('fix1CHF', e.target.value)} placeholder="z. B. 1500.00" />
              </Field>
              <Field label="Beitrag Partner 2 (CHF/Monat)">
                <input className={inputCls} inputMode="decimal" value={a.fix2CHF} onChange={(e) => set('fix2CHF', e.target.value)} placeholder="z. B. 1200.00" />
              </Field>
            </div>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.gemeinsamesKonto}
              onChange={(e) => set('gemeinsamesKonto', e.target.checked)} />
            <span><strong>Gemeinsames Konto</strong> für die gemeinsamen Kosten</span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.inventarAufnehmen}
              onChange={(e) => set('inventarAufnehmen', e.target.checked)} />
            <span>Verweis auf <strong>Inventarliste</strong> (Allein-/Miteigentum) aufnehmen</span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.einfacheGesellschaft}
              onChange={(e) => set('einfacheGesellschaft', e.target.checked)} />
            <span><strong>Einfache Gesellschaft</strong> für einen gemeinsamen Zweck <span className="text-ink-500">(z. B. gemeinsames Bauvorhaben, Art. 530 OR)</span></span>
          </label>
          {a.einfacheGesellschaft && (
            <Field label="Gemeinsamer Zweck">
              <input className={inputCls} value={a.einfacheGesellschaftZweck} onChange={(e) => set('einfacheGesellschaftZweck', e.target.value)} placeholder="z. B. Erwerb und Umbau der Liegenschaft …" />
            </Field>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.kinderHinweis}
              onChange={(e) => set('kinderHinweis', e.target.checked)} />
            <span><strong>Hinweis gemeinsame Kinder</strong> aufnehmen <span className="text-ink-500">(Sorge/Unterhalt nach Gesetz)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.vorsorgeHinweis}
              onChange={(e) => set('vorsorgeHinweis', e.target.checked)} />
            <span><strong>Hinweis Vorsorge/Erbrecht</strong> aufnehmen <span className="text-ink-500">(kein gesetzliches Erbrecht der Partner)</span></span>
          </label>
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
            <p className="lc-overline text-brass-700">Damit der Vertrag trägt</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Kein gesetzliches Konkubinatsrecht</strong> – nur das ausdrücklich Geregelte gilt.</li>
              <li><strong>Inventarliste</strong> beilegen – sie trennt Allein- von Miteigentum (Art. 646 ZGB).</li>
            </ul>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Kindesbelange richten sich nach dem Gesetz; massgebend sind Gesetz und konkreter Sachverhalt.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Konkubinatsvertrag als PDF', banner: BANNER_KK, dateiName: 'Konkubinatsvertrag.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Konkubinatsvertrag als Word (DOCX)', banner: BANNER_KK, dateiName: 'Konkubinatsvertrag.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Familienrecht'} · Vorlage`}
      titel="Konkubinatsvertrag"
      intro="Konkubinatsvertrag aus festen Bausteinen (Innominatvertrag, Art. 19 OR) – mit Kostenschlüssel, Wohn- und Inventar-Regelung, optionaler einfacher Gesellschaft und Auflösungsfolgen. Das fehlende gesetzliche Konkubinatsrecht wird offengelegt, nicht überspielt."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      kopfSchalter={<VariantenKopf detailgrad={a.detailgrad} onDetailgrad={(v) => set('detailgrad', v)} />}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_KK, dateiName: 'Konkubinatsvertrag.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_KK, dateiName: 'Konkubinatsvertrag.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
