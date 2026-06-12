import { useMemo } from 'react';
import {
  EG_DEFAULTS, egZusammenstellen, egMaengel, egHinweise, type EgAntworten,
} from '../lib/vorlagen/eheschutzgesuch';
import { KV_GERICHTE_BS } from '../lib/vorlagen/klageVereinfacht';
import { SgAdressatKachel } from '../components/vorlagen/SgBehoerdenWahl';
import { ParteiEditor } from './VorlageKlageVereinfacht';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, inputCls } from '../components/vorlagen/ui';
import { SelectionGrid } from '../components/ui/SelectionGrid';
import { KvGerichtWahl } from '../components/vorlagen/KvGerichtWahl';
import { KANTONE } from '../lib/kantone';
import type { Kanton } from '../types/legal';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';
import { gerichtsErlass } from '../data/gerichtsorganisationErlasse';

// ─── Vorlagen-Wizard: Eheschutzgesuch (Art. 175 ff. ZGB, summarisch) ────────
// Dritte Musterklagen-Maske Familienrecht (Bauspez. §3.1): der Begehren-
// Katalog trägt deterministische FORMELN (Wohnungs-Auszugsfrist, «monatlich
// im Voraus auf den Ersten», Rückwirkungs-Zusatz 173 III) — Beträge und
// Würdigungen bleiben Eingaben (§2). BEWUSST ohne localStorage.

const SCHRITTE = [
  { id: 'gericht', label: 'Gericht' },
  { id: 'parteien', label: 'Parteien & Kinder' },
  { id: 'massnahmen', label: 'Massnahmen & Unterhalt' },
  { id: 'pruefen', label: 'Prüfen & Ausgabe' },
] as const;

const BANNER_EG: PdfBanner = {
  titel: 'NACH DEM AUSDRUCK EIGENHÄNDIG UNTERZEICHNEN',
  text: 'Eheschutzgesuch (Art. 175 ff. ZGB) – summarisches Verfahren; Tatsachen glaubhaft machen, Belege beilegen.',
};

export function VorlageEheschutzgesuch() {
  const card = karte('eheschutzgesuch');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<EgAntworten>({ defaults: EG_DEFAULTS });

  const ergebnis = useMemo(() => egZusammenstellen(a), [a]);
  const maengel = useMemo(() => egMaengel(a), [a]);
  const fehler = maengel.filter((m) => m.schritt === schritt).map((m) => m.text);

  const kinderSetzen = (idx: number, k: Partial<EgAntworten['kinder'][number]>) => {
    set('kinder', a.kinder.map((x, i) => (i === idx ? { ...x, ...k } : x)));
  };

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'gericht': return (
        <div className="space-y-4">
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
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.gerichtManuellAktiv ?? false}
                onChange={(e) => set('gerichtManuellAktiv', e.target.checked || undefined)} />
              <span>Adresse des Gerichts von Hand erfassen</span>
            </label>
            {a.gerichtManuellAktiv && (
              <div className="space-y-3 pl-6">
                <Field label="Gericht">
                  <input className={inputCls} value={a.gerichtManuell?.name ?? ''}
                    onChange={(e) => set('gerichtManuell', { name: e.target.value, strasse: a.gerichtManuell?.strasse ?? '', plzOrt: a.gerichtManuell?.plzOrt ?? '' })} />
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
          <Field label="Faktisch getrennt seit" optional hint="erscheint im Feststellungs-Begehren">
            <DatumsFeld value={a.getrenntSeit} onChange={(v) => set('getrenntSeit', v)} className={inputCls} />
          </Field>
        </div>
      );

      case 'parteien': return (
        <div className="space-y-5">
          <Field label="Gesuchstellende Partei">
            <ParteiEditor p={a.gesuchsteller} onChange={(p) => set('gesuchsteller', p)} />
          </Field>
          <Field label="Vertretung" optional>
            <input className={inputCls} value={a.vertretung ?? ''} onChange={(e) => set('vertretung', e.target.value || undefined)} placeholder="z. B. RA lic. iur. X" />
          </Field>
          <Field label="Gesuchsgegnerische Partei">
            <ParteiEditor p={a.gesuchsgegner} onChange={(p) => set('gesuchsgegner', p)} />
          </Field>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.kinderErfassen}
              onChange={(e) => set('kinderErfassen', e.target.checked)} />
            <span>Gemeinsame minderjährige Kinder <span className="text-ink-500">(Massnahmen nach Kindesrecht, Art. 176 Abs. 3 ZGB)</span></span>
          </label>
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
              <Field label="Obhut (Antrag)">
                <SelectionGrid
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  items={[
                    { code: 'gericht' as const, label: 'Gerichtlich zu regeln' },
                    { code: 'gesuchsteller' as const, label: 'Obhut bei der gesuchstellenden Partei' },
                    { code: 'gesuchsgegner' as const, label: 'Obhut bei der gesuchsgegnerischen Partei' },
                    { code: 'alternierend' as const, label: 'Alternierende Obhut' },
                  ]}
                  value={a.obhut}
                  onSelect={(code) => set('obhut', code)}
                />
              </Field>
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.verkehrGerichtsueblich}
                  onChange={(e) => set('verkehrGerichtsueblich', e.target.checked)} />
                <span>Persönlicher Verkehr nach dem <strong>gerichtsüblichen</strong> Besuchs- und Ferienrecht beantragen <span className="text-ink-500">(sonst: gerichtlich zu regeln)</span></span>
              </label>
            </div>
          )}
        </div>
      );

      case 'massnahmen': return (
        <div className="space-y-4">
          <Field label="Eheliche Wohnung (Art. 176 Abs. 1 Ziff. 2 ZGB)">
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              items={[
                { code: 'gesuchsteller' as const, label: 'Zuweisung an die gesuchstellende Partei' },
                { code: 'gesuchsgegner' as const, label: 'Zuweisung an die Gegenpartei' },
                { code: 'gericht' as const, label: 'Gerichtlich zu regeln' },
                { code: 'keine' as const, label: 'Kein Wohnungs-Begehren' },
              ]}
              value={a.wohnung}
              onSelect={(code) => set('wohnung', code)}
            />
          </Field>
          {(a.wohnung === 'gesuchsteller' || a.wohnung === 'gesuchsgegner') && (
            <Field label="Auszugsfrist (Tage seit Rechtskraft)" hint="übliches Raster — keine gesetzliche Vorgabe">
              <input className={inputCls + ' sm:max-w-[8rem]'} inputMode="numeric" value={String(a.auszugsfristTage)}
                onChange={(e) => set('auszugsfristTage', Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
            </Field>
          )}
          {a.kinderErfassen && (
            <>
              <Field label="Kindesunterhalt">
                <SelectionGrid
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  items={[
                    { code: 'gericht' as const, label: 'Gerichtlich festzusetzen' },
                    { code: 'beziffert' as const, label: 'Beziffert (Bar/Betreuung getrennt)' },
                  ]}
                  value={a.kindesunterhalt}
                  onSelect={(code) => set('kindesunterhalt', code)}
                />
              </Field>
              {a.kindesunterhalt === 'beziffert' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Barunterhalt je Kind (CHF/Monat)">
                    <input className={inputCls} inputMode="decimal" value={a.barunterhaltBetrag}
                      onChange={(e) => set('barunterhaltBetrag', e.target.value)} placeholder="z. B. 1200" />
                  </Field>
                  <Field label="Betreuungsunterhalt (CHF/Monat)" optional>
                    <input className={inputCls} inputMode="decimal" value={a.betreuungsunterhaltBetrag}
                      onChange={(e) => set('betreuungsunterhaltBetrag', e.target.value)} placeholder="z. B. 800" />
                  </Field>
                </div>
              )}
            </>
          )}
          <Field label="Ehegattenunterhalt (Art. 176 Abs. 1 Ziff. 1 ZGB)">
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              items={[
                { code: 'gericht' as const, label: 'Gerichtlich festzusetzen' },
                { code: 'beziffert' as const, label: 'Beziffert' },
                { code: 'keiner' as const, label: 'Kein Begehren' },
              ]}
              value={a.ehegattenunterhalt}
              onSelect={(code) => set('ehegattenunterhalt', code)}
            />
          </Field>
          {a.ehegattenunterhalt === 'beziffert' && (
            <Field label="Ehegattenunterhalt (CHF/Monat)" hint="die Höhe ist Ihre Würdigung — LexMetrik rechnet keinen Unterhalt">
              <input className={inputCls + ' sm:max-w-[12rem]'} inputMode="decimal" value={a.ehegattenBetrag}
                onChange={(e) => set('ehegattenBetrag', e.target.value)} placeholder="z. B. 2500" />
            </Field>
          )}
          {a.ehegattenunterhalt !== 'keiner' && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.rueckwirkung}
                onChange={(e) => set('rueckwirkung', e.target.checked)} />
              <span>Rückwirkend auch für das <strong>Jahr vor Einreichung</strong> fordern <span className="text-ink-500">(Art. 173 Abs. 3 ZGB — weiter zurück nicht möglich)</span></span>
            </label>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.gueterTrennung}
              onChange={(e) => set('gueterTrennung', e.target.checked)} />
            <span>Gütertrennung beantragen <span className="text-ink-500">(Art. 176 Abs. 1 Ziff. 3 ZGB — nur «wenn es die Umstände rechtfertigen»)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.schuldneranweisung}
              onChange={(e) => set('schuldneranweisung', e.target.checked)} />
            <span>Schuldneranweisung beantragen <span className="text-ink-500">(Art. 177 ZGB — bei Nichterfüllung der Unterhaltspflicht)</span></span>
          </label>
          {a.schuldneranweisung && (
            <Field label="Arbeitgeberin / Schuldner der Gegenpartei">
              <input className={inputCls} value={a.arbeitgeberName} onChange={(e) => set('arbeitgeberName', e.target.value)} placeholder="z. B. Muster AG, Zürich" />
            </Field>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.verfuegungsbeschraenkung}
              onChange={(e) => set('verfuegungsbeschraenkung', e.target.checked)} />
            <span>Verfügungsbeschränkung beantragen <span className="text-ink-500">(Art. 178 ZGB — Vermögenswert individuell bezeichnen)</span></span>
          </label>
          {a.verfuegungsbeschraenkung && (
            <Field label="Vermögenswert (individuell)" hint="z. B. Grundstück mit Grundbuchblatt-Nr., Konto mit IBAN — keine Gesamtsperre">
              <input className={inputCls} value={a.vermoegenswert} onChange={(e) => set('vermoegenswert', e.target.value)} />
            </Field>
          )}
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {egHinweise(a).map((h, i) => (
            <div key={i} className="lc-notice text-body-s">{h}</div>
          ))}

          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.vollmachtBeilage}
              onChange={(e) => set('vollmachtBeilage', e.target.checked)} />
            <span>Vollmacht als Beilage aufführen</span>
          </label>

          <Field label="Ort und Datum der Eingabe">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Zürich" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>

          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Vor der Einreichung</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Unterschreiben und im Doppel einreichen</strong> (Art. 131 ZPO).</li>
              <li><strong>Glaubhaft machen:</strong> Einkommens-, Wohnkosten- und Kinderbelege beilegen — im Summarverfahren zählen die Urkunden.</li>
            </ul>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Unterhaltshöhen bestimmt das Gericht nach den konkreten Verhältnissen; die Begehren strukturieren meinen Standpunkt.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || maengel.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Gesuch als PDF', banner: BANNER_EG, dateiName: 'Eheschutzgesuch.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Gesuch als Word (DOCX)', banner: BANNER_EG, dateiName: 'Eheschutzgesuch.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Familienrecht'} · Vorlage`}
      titel="Eheschutzgesuch"
      intro="Das Gesuch um Regelung des Getrenntlebens (Art. 175 f. ZGB) im summarischen Verfahren — mit dem vollen Begehren-Katalog: Wohnung mit Auszugsfrist, Obhut und persönlicher Verkehr, Bar- und Betreuungsunterhalt als getrennte Begehren, Rückwirkung nach Art. 173 Abs. 3 ZGB, Gütertrennung, Schuldneranweisung und Verfügungsbeschränkung. Formeln sind berechnet, Beträge und Würdigungen bleiben Ihre Eingabe."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      fussnote="Eingaben werden NICHT lokal gespeichert (Parteidaten)."
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} kompakt direktExport={{
        pdf: { label: 'PDF', banner: BANNER_EG, dateiName: 'Eheschutzgesuch.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_EG, dateiName: 'Eheschutzgesuch.docx' } : undefined,
      }} />}
    />
  );
}
