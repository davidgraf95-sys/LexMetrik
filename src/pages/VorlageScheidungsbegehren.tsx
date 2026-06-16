import { useMemo } from 'react';
import { NormText } from '../components/NormText';
import {
  SB_DEFAULTS, sbZusammenstellen, sbMaengel, sbHinweise, type SbAntworten,
} from '../lib/vorlagen/scheidungsbegehren';
import { KV_GERICHTE_BS } from '../lib/vorlagen/klageVereinfacht';
import { SgAdressatKachel } from '../components/vorlagen/SgBehoerdenWahl';
import { ParteiEditor } from './VorlageKlageVereinfacht';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Checkbox, Field, inputCls } from '../components/vorlagen/ui';
import { SelectionGrid } from '../components/ui/SelectionGrid';
import { KvGerichtWahl } from '../components/vorlagen/KvGerichtWahl';
import { KANTONE } from '../lib/kantone';
import type { Kanton } from '../types/legal';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';
import { gerichtsErlass } from '../data/gerichtsorganisationErlasse';

// ─── Vorlagen-Wizard: Gemeinsames Scheidungsbegehren (Art. 285/286 ZPO) ─────
// Zweite Musterklagen-Maske Familienrecht (Bauspez. §3.2). Weiche
// umfassende Einigung (Art. 111 ZGB/285 ZPO) ↔ Teileinigung (Art. 112
// ZGB/286 ZPO) mit dem PFLICHT-Antrag auf gerichtliche Beurteilung der
// streitigen Folgen. BEWUSST ohne localStorage (Parteidaten).

const SCHRITTE = [
  { id: 'gericht', label: 'Gericht & Einigung' },
  { id: 'parteien', label: 'Ehegatten & Kinder' },
  { id: 'vereinbarung', label: 'Vereinbarung & Anträge' },
  { id: 'pruefen', label: 'Prüfen & Ausgabe' },
] as const;

const BANNER_SB: PdfBanner = {
  titel: 'VON BEIDEN EHEGATTEN ZU UNTERZEICHNEN',
  text: 'Gemeinsames Scheidungsbegehren (Art. 285/286 ZPO) – mit der Vereinbarung über die Scheidungsfolgen und den Belegen einzureichen.',
};

const listeSetzen = (xs: string[], i: number, v: string) => xs.map((x, j) => (j === i ? v : x));

export function VorlageScheidungsbegehren() {
  const card = karte('scheidungsbegehren-gemeinsam');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<SbAntworten>({ defaults: SB_DEFAULTS });

  const ergebnis = useMemo(() => sbZusammenstellen(a), [a]);
  const maengel = useMemo(() => sbMaengel(a), [a]);
  const fehler = maengel.filter((m) => m.schritt === schritt).map((m) => m.text);

  const kinderSetzen = (idx: number, k: Partial<SbAntworten['kinder'][number]>) => {
    set('kinder', a.kinder.map((x, i) => (i === idx ? { ...x, ...k } : x)));
  };

  const freitextListe = (feld: 'streitigePunkte' | 'antraegeEhegatte1' | 'antraegeEhegatte2', label: string, placeholder: string) => (
    <Field label={label} optional={feld !== 'streitigePunkte'}>
      <div className="space-y-2">
        {a[feld].map((r, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputCls} value={r} placeholder={placeholder}
              onChange={(e) => set(feld, listeSetzen(a[feld], i, e.target.value))} />
            <button type="button" className="lc-btn-ghost lc-btn-sm"
              onClick={() => set(feld, a[feld].filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <button type="button" className="lc-btn-outline lc-btn-sm"
          onClick={() => set(feld, [...a[feld], ''])}>+ Eintrag hinzufügen</button>
      </div>
    </Field>
  );

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'gericht': return (
        <div className="space-y-4">
          <Field label="Einigungsstand">
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              items={[
                { code: 'voll' as const, label: 'Umfassende Einigung (Art. 285 ZPO)', sub: 'vollständige Vereinbarung über ALLE Scheidungsfolgen liegt vor (Art. 111 ZGB)' },
                { code: 'teil' as const, label: 'Teileinigung (Art. 286 ZPO)', sub: 'streitige Folgen soll das Gericht beurteilen (Art. 112 ZGB)' },
              ]}
              value={a.einigung}
              onSelect={(code) => set('einigung', code)}
            />
          </Field>
          <div className="space-y-3">
            <Field label="Kanton" hint="zwingender Gerichtsstand: Wohnsitz einer Partei (Art. 23 Abs. 1 ZPO)">
              <select className={inputCls} value={a.gerichtsKanton}
                onChange={(e) => set('gerichtsKanton', e.target.value as Kanton)}>
                {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
            {!a.gerichtManuellAktiv && (a.gerichtsKanton === 'BS' ? (
              <SgAdressatKachel
                zeilen={[KV_GERICHTE_BS.zivilgericht.name, KV_GERICHTE_BS.zivilgericht.strasse, KV_GERICHTE_BS.zivilgericht.plzOrt]}
                url={KV_GERICHTE_BS.zivilgericht.url} />
            ) : a.gerichtAufgeloest ? (
              <SgAdressatKachel zeilen={a.gerichtAufgeloest.zeilen} url={a.gerichtAufgeloest.url} />
            ) : (
              <div className="lc-notice text-body-s">
                Gericht unten über die kantonale Gerichtsschicht bestimmen — oder von Hand erfassen.
              </div>
            ))}
            {(() => {
              const e = gerichtsErlass(a.gerichtsKanton);
              return (
                <p className="text-xs text-ink-500">
                  Rechtsgrundlage Gerichtsorganisation: {e.url
                    ? <a href={e.url} target="_blank" rel="noreferrer" className="text-brass-700 underline">{e.abk} {a.gerichtsKanton} ({e.nummer}) ↗</a>
                    : <>{e.abk} {a.gerichtsKanton} ({e.nummer})</>}
                </p>
              );
            })()}
            {a.gerichtsKanton !== 'BS' && !a.gerichtManuellAktiv && (
              <KvGerichtWahl kanton={a.gerichtsKanton} materie=""
                onAufgeloest={(z) => set('gerichtAufgeloest', z ?? undefined)} />
            )}
            <Checkbox
              checked={a.gerichtManuellAktiv ?? false}
              onChange={(v) => set('gerichtManuellAktiv', v || undefined)}
              label={<><span>Adresse des Gerichts von Hand erfassen</span></>} />
            {a.gerichtManuellAktiv && (
              <div className="space-y-3 pl-6">
                <Field label="Gericht">
                  <input className={inputCls} value={a.gerichtManuell?.name ?? ''}
                    onChange={(e) => set('gerichtManuell', { name: e.target.value, strasse: a.gerichtManuell?.strasse ?? '', plzOrt: a.gerichtManuell?.plzOrt ?? '' })}
                    placeholder="z. B. Bezirksgericht X" />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Strasse und Hausnummer">
                    <input className={inputCls} value={a.gerichtManuell?.strasse ?? ''}
                      onChange={(e) => set('gerichtManuell', { name: a.gerichtManuell?.name ?? '', strasse: e.target.value, plzOrt: a.gerichtManuell?.plzOrt ?? '' })} />
                  </Field>
                  <Field label="PLZ und Ort">
                    <input className={inputCls} value={a.gerichtManuell?.plzOrt ?? ''}
                      onChange={(e) => set('gerichtManuell', { name: a.gerichtManuell?.name ?? '', strasse: a.gerichtManuell?.strasse ?? '', plzOrt: e.target.value })} />
                  </Field>
                </div>
              </div>
            )}
          </div>
        </div>
      );

      case 'parteien': return (
        <div className="space-y-5">
          <Field label="Ehegatte/Ehegattin 1">
            <ParteiEditor p={a.ehegatte1} onChange={(p) => set('ehegatte1', p)} />
          </Field>
          <Field label="Vertretung Partei 1" optional>
            <input className={inputCls} value={a.vertretung1 ?? ''} onChange={(e) => set('vertretung1', e.target.value || undefined)} placeholder="z. B. RA lic. iur. X" />
          </Field>
          <Field label="Ehegatte/Ehegattin 2">
            <ParteiEditor p={a.ehegatte2} onChange={(p) => set('ehegatte2', p)} />
          </Field>
          <Field label="Vertretung Partei 2" optional>
            <input className={inputCls} value={a.vertretung2 ?? ''} onChange={(e) => set('vertretung2', e.target.value || undefined)} placeholder="z. B. RA lic. iur. Y" />
          </Field>
          <Checkbox
            checked={a.kinderErfassen}
            onChange={(v) => set('kinderErfassen', v)}
            label={<><span>Gemeinsame minderjährige Kinder <span className="text-ink-500"><NormText text={`(gemeinsame Anträge sind Mindestinhalt, Art. 285 lit. d ZPO)`} /></span></span></>} />
          {a.kinderErfassen && (
            <div className="space-y-3 pl-6">
              {a.kinder.map((k, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_11rem_auto] gap-3 items-end">
                  <Field label={`Kind ${i + 1} – Vorname`}>
                    <input className={inputCls} value={k.vorname} onChange={(e) => kinderSetzen(i, { vorname: e.target.value })} />
                  </Field>
                  <Field label="Geburtsdatum">
                    <DatumsFeld value={k.geburtsdatum} onChange={(v) => kinderSetzen(i, { geburtsdatum: v })} className={inputCls} />
                  </Field>
                  <button type="button" className="lc-btn-ghost lc-btn-sm mb-1"
                    onClick={() => set('kinder', a.kinder.filter((_, j) => j !== i))}>Entfernen</button>
                </div>
              ))}
              <button type="button" className="lc-btn-outline lc-btn-sm"
                onClick={() => set('kinder', [...a.kinder, { vorname: '', geburtsdatum: '' }])}>
                + Kind hinzufügen
              </button>
            </div>
          )}
        </div>
      );

      case 'vereinbarung': return (
        <div className="space-y-4">
          <Field label={a.einigung === 'voll' ? 'Datum der vollständigen Vereinbarung' : 'Datum der Teilvereinbarung'}
            hint="die Vereinbarung ist Pflichtbeilage (Art. 285 lit. c ZPO) — diese Eingabe erstellt das Begehren, nicht die Vereinbarung selbst">
            <DatumsFeld value={a.vereinbarungDatum} onChange={(v) => set('vereinbarungDatum', v)} className={inputCls} />
          </Field>
          {a.einigung === 'teil' && (
            <>
              {freitextListe('streitigePunkte',
                'Streitige Scheidungsfolgen (Pflicht, Art. 286 Abs. 1 ZPO)',
                'z. B. nachehelicher Unterhalt')}
              {freitextListe('antraegeEhegatte1',
                'Anträge Partei 1 zu den streitigen Folgen (Art. 286 Abs. 2 ZPO)',
                'z. B. Es sei kein nachehelicher Unterhalt zuzusprechen')}
              {freitextListe('antraegeEhegatte2',
                'Anträge Partei 2 zu den streitigen Folgen (Art. 286 Abs. 2 ZPO)',
                'z. B. Die Partei 1 sei zu monatlichem Unterhalt von CHF … zu verpflichten')}
            </>
          )}
          <Checkbox
            checked={a.kostenHaelftig}
            onChange={(v) => set('kostenHaelftig', v)}
            label={<><span>Kosten-Antrag: hälftige Gerichtskosten, keine Parteientschädigungen <span className="text-ink-500">(üblich beim gemeinsamen Begehren)</span></span></>} />
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {sbHinweise(a).map((h, i) => (
            <div key={i} className="lc-notice text-body-s">{h}</div>
          ))}

          <Field label="Ort und Datum der Eingabe (Art. 285 lit. f ZPO)">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Zürich" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>

          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Vor der Einreichung</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>BEIDE Ehegatten unterzeichnen</strong><NormText text={` die Eingabe (Art. 285 lit. f ZPO).`} /></li>
              <li><strong>Beilegen:</strong> {a.einigung === 'voll' ? 'vollständige Vereinbarung' : 'Teilvereinbarung'} samt Belegen, Familienausweis{a.kinderErfassen ? ', Geburtsurkunden' : ''} (Art. 285 lit. c/e ZPO).</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Das Gericht hört beide Parteien an, prüft die Vereinbarung und ist bei Kinderbelangen an die Anträge nicht gebunden.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || maengel.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Begehren als PDF', banner: BANNER_SB, dateiName: 'Gemeinsames-Scheidungsbegehren.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Begehren als Word (DOCX)', banner: BANNER_SB, dateiName: 'Gemeinsames-Scheidungsbegehren.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Familienrecht'} · Vorlage`}
      titel="Gemeinsames Scheidungsbegehren"
      intro="Die gemeinsame Eingabe beider Ehegatten nach Art. 285/286 ZPO — bei umfassender Einigung mit Genehmigungsantrag zur vollständigen Vereinbarung (Art. 111 ZGB), bei Teileinigung mit dem Pflicht-Antrag, die streitigen Folgen gerichtlich zu beurteilen (Art. 112 ZGB). Inhalte der Vereinbarung bleiben Ihre Entscheidung; die Eingabe strukturiert den gesetzlichen Mindestinhalt."
      norms={card?.norms ?? []}
      badge="Beide unterzeichnen"
      fussnote="Eingaben werden NICHT lokal gespeichert (Parteidaten)."
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} kompakt direktExport={{
        pdf: { label: 'PDF', banner: BANNER_SB, dateiName: 'Gemeinsames-Scheidungsbegehren.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_SB, dateiName: 'Gemeinsames-Scheidungsbegehren.docx' } : undefined,
      }} />}
    />
  );
}
