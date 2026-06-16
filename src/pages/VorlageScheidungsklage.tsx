import { useMemo } from 'react';
import { NormText } from '../components/NormText';
import {
  SK_DEFAULTS, skZusammenstellen, skMaengel, skWarnungen, skHinweise,
  type SkAntworten,
} from '../lib/vorlagen/scheidungsklage';
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

// ─── Vorlagen-Wizard: Scheidungsklage — unbegründete Eingabe (Art. 290 ZPO) ──
// Erste Musterklagen-Maske Familienrecht (Auftrag David 12.6.2026; Bauspez.
// familienrecht-klagen-vorlagen.md §3.3). Mindestinhalt lit. a–f als
// geführtes Raster; der 114-ZGB-Zweijahres-Check ist deterministisch,
// die 115-Würdigung wird offengelegt, nie geprüft (§2). Wie die
// Schwester-Klagen BEWUSST ohne localStorage (Parteidaten).

const SCHRITTE = [
  { id: 'gericht', label: 'Gericht & Scheidungsgrund' },
  { id: 'parteien', label: 'Parteien & Kinder' },
  { id: 'begehren', label: 'Scheidungsfolgen' },
  { id: 'pruefen', label: 'Prüfen & Ausgabe' },
] as const;

const BANNER_SK: PdfBanner = {
  titel: 'NACH DEM AUSDRUCK EIGENHÄNDIG UNTERZEICHNEN',
  text: 'Unbegründete Scheidungsklage (Art. 290 ZPO) – im Doppel beim Gericht am Wohnsitz einer Partei einzureichen.',
};

export function VorlageScheidungsklage() {
  const card = karte('scheidungsklage');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<SkAntworten>({ defaults: SK_DEFAULTS });

  const ergebnis = useMemo(() => skZusammenstellen(a), [a]);
  const maengel = useMemo(() => skMaengel(a), [a]);
  const warnungen = useMemo(() => skWarnungen(a), [a]);
  const fehler = maengel.filter((m) => m.schritt === schritt).map((m) => m.text);

  const kinderSetzen = (idx: number, k: Partial<SkAntworten['kinder'][number]>) => {
    const kinder = a.kinder.map((x, i) => (i === idx ? { ...x, ...k } : x));
    set('kinder', kinder);
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
            <Checkbox
              checked={a.gerichtManuellAktiv ?? false}
              onChange={(v) => set('gerichtManuellAktiv', v || undefined)}
              label={<><span>Adresse des Gerichts von Hand erfassen <span className="text-ink-500">(übersteuert die hinterlegte Anschrift)</span></span></>} />
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
                      onChange={(e) => set('gerichtManuell', { name: a.gerichtManuell?.name ?? '', strasse: e.target.value, plzOrt: a.gerichtManuell?.plzOrt ?? '' })}
                      placeholder="z. B. Gerichtsgasse 1" />
                  </Field>
                  <Field label="PLZ und Ort">
                    <input className={inputCls} value={a.gerichtManuell?.plzOrt ?? ''}
                      onChange={(e) => set('gerichtManuell', { name: a.gerichtManuell?.name ?? '', strasse: a.gerichtManuell?.strasse ?? '', plzOrt: e.target.value })}
                      placeholder="z. B. 8001 Zürich" />
                  </Field>
                </div>
              </div>
            )}
          </div>
          <Field label="Scheidungsgrund (Art. 290 lit. b ZPO)">
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              items={[
                { code: '114' as const, label: 'Getrenntleben (Art. 114 ZGB)', sub: 'mindestens zwei Jahre bei Eintritt der Rechtshängigkeit' },
                { code: '115' as const, label: 'Unzumutbarkeit (Art. 115 ZGB)', sub: 'vor Ablauf der zwei Jahre — schwerwiegende, nicht zuzurechnende Gründe' },
              ]}
              value={a.grund}
              onSelect={(code) => set('grund', code)}
            />
          </Field>
          {a.grund === '114' && (
            <Field label="Getrennt lebend seit" hint="der Zweijahres-Check läuft gegen das Einreichungsdatum (Schritt 4)">
              <DatumsFeld value={a.trennungSeit} onChange={(v) => set('trennungSeit', v)} className={inputCls} />
            </Field>
          )}
        </div>
      );

      case 'parteien': return (
        <div className="space-y-5">
          <Field label="Klagende Partei (Ehegatte/Ehegattin)">
            <ParteiEditor p={a.klaeger} onChange={(p) => set('klaeger', p)} />
          </Field>
          <Field label="Vertretung" optional>
            <input className={inputCls} value={a.vertretung ?? ''} onChange={(e) => set('vertretung', e.target.value || undefined)}
              placeholder="z. B. RA lic. iur. X, Kanzlei Y, Adresse" />
          </Field>
          <Field label="Beklagte Partei (Ehegatte/Ehegattin)">
            <ParteiEditor p={a.beklagte} onChange={(p) => set('beklagte', p)} />
          </Field>
          <Checkbox
            checked={a.kinderErfassen}
            onChange={(v) => set('kinderErfassen', v)}
            label={<><span>Gemeinsame minderjährige Kinder <span className="text-ink-500"><NormText text={`(Rechtsbegehren zu den Kindern sind dann Mindestinhalt, Art. 290 lit. d ZPO)`} /></span></span></>} />
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
                    { code: 'gericht' as const, label: 'Gerichtlich zu regeln', sub: 'Offizialmaxime — kein eigener Antrag' },
                    { code: 'klaeger' as const, label: 'Obhut bei der klagenden Partei' },
                    { code: 'beklagte' as const, label: 'Obhut bei der beklagten Partei' },
                    { code: 'alternierend' as const, label: 'Alternierende Obhut' },
                  ]}
                  value={a.obhut}
                  onSelect={(code) => set('obhut', code)}
                />
              </Field>
            </div>
          )}
        </div>
      );

      case 'begehren': return (
        <div className="space-y-4">
          <Field label="Nachehelicher Unterhalt (Art. 290 lit. c ZPO)">
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              items={[
                { code: 'gericht' as const, label: 'Gerichtlich festzusetzen' },
                { code: 'keiner' as const, label: 'Keiner (Negativ-Antrag)' },
                { code: 'beziffert' as const, label: 'Beziffert' },
              ]}
              value={a.unterhaltEhegatte}
              onSelect={(code) => set('unterhaltEhegatte', code)}
            />
          </Field>
          {a.unterhaltEhegatte === 'beziffert' && (
            <Field label="Monatlicher Unterhalt (CHF)" hint="die Höhe ist Ihre eigene Würdigung — LexMetrik rechnet keinen Unterhalt (Ermessensfrage)">
              <input className={inputCls + ' sm:max-w-[12rem]'} inputMode="decimal" value={a.unterhaltBetrag}
                onChange={(e) => set('unterhaltBetrag', e.target.value)} placeholder="z. B. 2500" />
            </Field>
          )}
          <Checkbox
            checked={a.gueterrecht}
            onChange={(v) => set('gueterrecht', v)}
            label={<><span>Güterrechtliche Auseinandersetzung beantragen <span className="text-ink-500">(Bezifferung vorbehalten)</span></span></>} />
          <Checkbox
            checked={a.vorsorgeausgleich}
            onChange={(v) => set('vorsorgeausgleich', v)}
            label={<><span>Vorsorgeausgleich beantragen <span className="text-ink-500">(Art. 122 ff. ZGB)</span></span></>} />
          <Field label="Weitere Rechtsbegehren" optional>
            <div className="space-y-2">
              {a.weitereRechtsbegehren.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls} value={r}
                    onChange={(e) => set('weitereRechtsbegehren', a.weitereRechtsbegehren.map((x, j) => (j === i ? e.target.value : x)))} />
                  <button type="button" className="lc-btn-ghost lc-btn-sm"
                    onClick={() => set('weitereRechtsbegehren', a.weitereRechtsbegehren.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              <button type="button" className="lc-btn-outline lc-btn-sm"
                onClick={() => set('weitereRechtsbegehren', [...a.weitereRechtsbegehren, ''])}>
                + Begehren hinzufügen
              </button>
            </div>
          </Field>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {warnungen.map((w, i) => (
            <div key={i} className="lc-notice-warn text-body-s">{w}</div>
          ))}
          {skHinweise(a).map((h, i) => (
            <div key={i} className="lc-notice text-body-s">{h}</div>
          ))}
          <Checkbox
            checked={a.vollmachtBeilage}
            onChange={(v) => set('vollmachtBeilage', v)}
            label={<><span>Vollmacht als Beilage aufführen</span></>} />
          <Field label="Ort und Datum der Eingabe (Art. 290 lit. f ZPO)">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Zürich" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>
          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Vor der Einreichung</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Unterschreiben und im Doppel einreichen</strong><NormText text={` (Art. 131 ZPO) — beim Gericht am Wohnsitz einer Partei.`} /></li>
              <li><strong>Belege beilegen</strong> (Art. 290 lit. e ZPO): Familienausweis/Eheurkunde{a.kinderErfassen ? ', Geburtsurkunden der Kinder' : ''}.</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Die Eingabe ist unbegründet zulässig; das Gericht lädt zur Einigungsverhandlung vor, und Kinderbelange regelt es von Amtes wegen.
            </label>
          </section>
          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || maengel.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Scheidungsklage als PDF', banner: BANNER_SK, dateiName: 'Scheidungsklage.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Scheidungsklage als Word (DOCX)', banner: BANNER_SK, dateiName: 'Scheidungsklage.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Familienrecht'} · Vorlage`}
      titel="Scheidungsklage (unbegründete Eingabe)"
      intro="Die Scheidungsklage nach Art. 290 ZPO mit dem gesetzlichen Mindestinhalt — Scheidungsgrund (Art. 114/115 ZGB), Begehren zu Kindern, Unterhalt, Güterrecht und Vorsorgeausgleich. Der Zweijahres-Check ist berechnet; was Würdigung wäre (Art. 115, Unterhaltsbeträge), wird offengelegt, nie gerechnet."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      fussnote="Eingaben werden NICHT lokal gespeichert (Parteidaten)."
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} kompakt direktExport={{
        pdf: { label: 'PDF', banner: BANNER_SK, dateiName: 'Scheidungsklage.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_SK, dateiName: 'Scheidungsklage.docx' } : undefined,
      }} />}
    />
  );
}
