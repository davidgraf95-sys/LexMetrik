import { useMemo, useRef, useState } from 'react';
import { NormText } from '../components/NormText';
import { Link } from 'react-router-dom';
import { Field, GruppenTitel, inputCls, NormChip } from '../components/vorlagen/ui';
import { MappenAnsicht, MappenGates, NotariatsHinweis, HrAmtHinweis } from '../components/vorlagen/Dokumentmappe';
import type { PdfBanner } from '../lib/vorlagen/banner';
import {
  keDokumentmappe,
  keVerfallDatum,
  KE_DEFAULTS,
  type KeAntworten,
  type KeRechtsform,
  type KeEinlageArt,
  type KeZeichnerZeile,
  type KeKlausel,
} from '../lib/vorlagen/kapitalerhoehung';
import { KANTONE } from '../lib/kantone';
import { PflichtDisclaimer } from '../components/PflichtDisclaimer';
import { useLocale, fedlexLokalisiert } from '../components/locale';
import { karte } from '../lib/startseiteConfig';
import { usePaneKlasse } from '../components/layout/PaneKontext';

// ─── Maske: Kapitalerhöhung AG/GmbH (Plan 9c, Auftrag David 7.6.2026) ────────
// Rechtslogik in lib/vorlagen/kapitalerhoehung.ts (§3); Wortlaut-Grundlage
// bibliothek/recherche/kapitalerhoehung-wortlaute.md. GV-/Feststellungs-
// Urkunden als ENTWURF (Beurkundungszwang 650 II / 652g II OR, §8);
// Zeichnungsscheine, Bericht und Anmeldung druckfertig.
// Hinweis /simplify: Tab-/Export-/Vorschau-Block ist bewusst dupliziert mit
// Gmbh-/AgDokumentmappe (3 Stellen) — Kandidat für einen geteilten Rahmen.

const BANNER_ENTWURF: PdfBanner = {
  titel: 'ENTWURF – KEIN GÜLTIGES DOKUMENT',
  text: 'Vorbereitung für die Urkundsperson: Erhöhungsbeschluss und Feststellungs-Urkunde bedürfen der öffentlichen Beurkundung (Art. 650 Abs. 2 / Art. 652g Abs. 2 OR).',
};
const BANNER_FERTIG: PdfBanner = {
  titel: 'NACH DEM AUSDRUCK DATIEREN UND UNTERSCHREIBEN',
  text: 'Im Original einzureichen (Art. 20 HRegV); Anmeldung innert sechs Monaten nach dem Beschluss, sonst fällt er dahin (Art. 650 Abs. 3 / Art. 781 Abs. 4 OR).',
};

const KLAUSELN: { id: KeKlausel; label: string }[] = [
  { id: 'nachschuss', label: 'Nachschusspflicht' },
  { id: 'nebenleistung', label: 'Nebenleistungspflichten' },
  { id: 'konkurrenzverbot', label: 'Konkurrenzverbot' },
  { id: 'vorkaufsrecht', label: 'Vorhand-/Vorkaufs-/Kaufsrechte' },
  { id: 'konventionalstrafe', label: 'Konventionalstrafen' },
];

export function VorlageKapitalerhoehung() {
  const card = karte('kapitalerhoehung');
  const { locale } = useLocale();

  const [rechtsform, setRechtsform] = useState<KeRechtsform>('ag');
  const [einlageArt, setEinlageArt] = useState<KeEinlageArt>('bar');
  const [firma, setFirma] = useState('');
  const [sitz, setSitz] = useState('');
  const [kanton, setKanton] = useState('ZH');
  const [bisher, setBisher] = useState(KE_DEFAULTS.bisherigesKapitalChf);
  const [bisherAnzahl, setBisherAnzahl] = useState(KE_DEFAULTS.bisherigeAnzahl);
  const [nennwert, setNennwert] = useState(KE_DEFAULTS.nennwertChf);
  const [anzahlNeue, setAnzahlNeue] = useState(KE_DEFAULTS.anzahlNeue);
  const [ausgabebetrag, setAusgabebetrag] = useState(KE_DEFAULTS.ausgabebetragChf);
  const [statutenArtikel, setStatutenArtikel] = useState(KE_DEFAULTS.statutenArtikelNr);
  const [gvDatum, setGvDatum] = useState('');
  const [zeichner, setZeichner] = useState<(KeZeichnerZeile & { key: number })[]>([]);
  const [bezugsrechtGewahrt, setBezugsrechtGewahrt] = useState(true);
  const [bankInUrkunde, setBankInUrkunde] = useState(true);
  const [bankName, setBankName] = useState('');
  const [bankOrt, setBankOrt] = useState('');
  const [befristung, setBefristung] = useState(true);
  const [berichtUnterzeichner, setBerichtUnterzeichner] = useState('');
  const [vorsitz, setVorsitz] = useState('');
  const [klauseln, setKlauseln] = useState<KeKlausel[]>([]);
  const [ort, setOrt] = useState('');
  const [datum, setDatum] = useState('');

  const naechsterKey = useRef(1);
  const neuerKey = () => naechsterKey.current++;

  const antworten: KeAntworten = useMemo(() => ({
    ...KE_DEFAULTS,
    rechtsform, einlageArt, firma, sitz, kanton,
    bisherigesKapitalChf: bisher, bisherigeAnzahl: bisherAnzahl,
    nennwertChf: nennwert, anzahlNeue, ausgabebetragChf: ausgabebetrag,
    statutenArtikelNr: statutenArtikel, gvDatum, zeichner,
    bezugsrechtGewahrt, bankInUrkundeGenannt: bankInUrkunde, bankName, bankOrt,
    befristungsKlausel: befristung, berichtUnterzeichner, vorsitzName: vorsitz,
    statutKlauseln: klauseln, ort, datum,
  }), [rechtsform, einlageArt, firma, sitz, kanton, bisher, bisherAnzahl, nennwert, anzahlNeue,
    ausgabebetrag, statutenArtikel, gvDatum, zeichner, bezugsrechtGewahrt, bankInUrkunde,
    bankName, bankOrt, befristung, berichtUnterzeichner, vorsitz, klauseln, ort, datum]);

  const mappe = useMemo(() => keDokumentmappe(antworten), [antworten]);

  const toggleKlausel = (k: KeKlausel) =>
    setKlauseln((alt) => (alt.includes(k) ? alt.filter((x) => x !== k) : [...alt, k]));

  const ag = rechtsform === 'ag';
  const docxErlaubt = card?.modus === 'vorlage' && (card.output?.includes('docx') ?? false);
  const pk = usePaneKlasse();

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600">
        <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-surface">←</span>
        Zurück zum Katalog
      </Link>
      <div className="space-y-3">
        <GruppenTitel>Gesellschaftsrecht · Dokumentmappe</GruppenTitel>
        <h1 className="text-h1 font-display font-semibold text-ink-900">Kapitalerhöhung (AG / GmbH)</h1>
        <p className="text-body-l text-ink-600 max-w-reading">
          Ordentliche Kapitalerhöhung gegen Bareinlage: Erhöhungsbeschluss und Feststellungs-Urkunde
          mit Statutenänderung entstehen als ENTWURF für die Urkundsperson (öffentliche Beurkundung
          bleibt zwingend); Zeichnungsscheine, Kapitalerhöhungsbericht und Handelsregister-Anmeldung
          druckfertig. Achtung Verfall: Anmeldung innert sechs Monaten nach dem Beschluss.
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {(card?.norms ?? []).map((n) => (
            <NormChip key={n.label} artikel={n.label} hrefOverride={fedlexLokalisiert(n.url, locale)} />
          ))}
          <span className="lc-badge lc-badge-warn">Beschluss-Urkunden als Entwurf</span>
        </div>
      </div>

      <PflichtDisclaimer />

      <section className="lc-card p-5 sm:p-6 space-y-5">
        <div className={pk('grid grid-cols-1 sm:grid-cols-3 gap-4', 'grid grid-cols-1 @xl/pane:grid-cols-3 gap-4')}>
          <Field label="Rechtsform">
            <select className={inputCls} value={rechtsform} onChange={(e) => setRechtsform(e.target.value as KeRechtsform)}>
              <option value="ag">Aktiengesellschaft (AG)</option>
              <option value="gmbh">GmbH</option>
            </select>
          </Field>
          <Field label="Art der Einlage">
            <select className={inputCls} value={einlageArt} onChange={(e) => setEinlageArt(e.target.value as KeEinlageArt)}>
              <option value="bar">Bareinlage</option>
              <option value="sacheinlage">Sacheinlage</option>
              <option value="verrechnung">Verrechnung</option>
              <option value="eigenkapital">Umwandlung von Eigenkapital</option>
            </select>
          </Field>
          <Field label="Kanton (Handelsregisteramt)">
            <select className={inputCls} value={kanton} onChange={(e) => setKanton(e.target.value)}>
              {KANTONE.map((kt) => <option key={kt} value={kt}>{kt}</option>)}
            </select>
          </Field>
        </div>

        <NotariatsHinweis kanton={kanton} />
      <HrAmtHinweis kanton={kanton} />

        <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-4', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-4')}>
          <Field label={`Firma (mit Zusatz «${ag ? 'AG' : 'GmbH'}»)`}>
            <input className={inputCls} value={firma} onChange={(e) => setFirma(e.target.value)} />
          </Field>
          <Field label="Sitz (politische Gemeinde)">
            <input className={inputCls} value={sitz} onChange={(e) => setSitz(e.target.value)} />
          </Field>
        </div>
        <div className={pk('grid grid-cols-1 sm:grid-cols-3 gap-4', 'grid grid-cols-1 @xl/pane:grid-cols-3 gap-4')}>
          <Field label={`Bisheriges ${ag ? 'Aktienkapital' : 'Stammkapital'} (CHF)`}>
            <input className={inputCls} inputMode="numeric" placeholder="Tausender mit Apostroph, z. B. 100'000" value={bisher} onChange={(e) => setBisher(e.target.value)} />
          </Field>
          <Field label={`Bisherige Anzahl ${ag ? 'Aktien' : 'Stammanteile'}`}>
            <input className={inputCls} inputMode="numeric" value={bisherAnzahl} onChange={(e) => setBisherAnzahl(e.target.value)} />
          </Field>
          <Field label="Nennwert (CHF)">
            <input className={inputCls} inputMode="numeric" value={nennwert} onChange={(e) => setNennwert(e.target.value)} />
          </Field>
          <Field label={`Anzahl NEUE ${ag ? 'Namenaktien' : 'Stammanteile'}`}>
            <input className={inputCls} inputMode="numeric" value={anzahlNeue} onChange={(e) => setAnzahlNeue(e.target.value)} />
          </Field>
          <Field label="Ausgabebetrag je Stück (CHF, ≥ Nennwert; Agio zulässig)">
            <input className={inputCls} inputMode="numeric" value={ausgabebetrag} onChange={(e) => setAusgabebetrag(e.target.value)} />
          </Field>
          <Field label="Statuten-Artikel der Kapitalbestimmung">
            <input className={inputCls} value={statutenArtikel} onChange={(e) => setStatutenArtikel(e.target.value)} placeholder="z. B. 3" />
          </Field>
        </div>
        <div className={pk('grid grid-cols-1 sm:grid-cols-3 gap-4', 'grid grid-cols-1 @xl/pane:grid-cols-3 gap-4')}>
          <Field label={`Datum ${ag ? 'GV' : 'GsV'}-Beschluss (6-Monats-Verfall!)`}
            hint={(() => { const v = keVerfallDatum(gvDatum); return v
              ? `Anmeldung spätestens am ${v.split('-').reverse().join('.')} — sonst fällt der Beschluss dahin (früher anmelden; eine Wochenend-/Feiertagsverlängerung ist nicht gesichert).`
              : undefined; })()}>
            <input type="date" className={inputCls} value={gvDatum} onChange={(e) => setGvDatum(e.target.value)} />
          </Field>
          <Field label="Kapitalerhöhungsbericht: unterzeichnet durch">
            <input className={inputCls} value={berichtUnterzeichner} onChange={(e) => setBerichtUnterzeichner(e.target.value)} placeholder={ag ? 'VR-Mitglied' : 'Geschäftsführer:in'} />
          </Field>
          <Field label={`Vorsitz ${ag ? 'Verwaltungsrat' : 'Geschäftsführung'}`}>
            <input className={inputCls} value={vorsitz} onChange={(e) => setVorsitz(e.target.value)} />
          </Field>
        </div>

        {/* Zeichner */}
        <div className="space-y-2">
          <p className="text-body-s font-medium text-ink-900"><NormText text={`Zeichner:innen (Zeichnungsschein je Person, Art. 652 OR)`} /></p>
          {zeichner.map((z) => (
            <div key={z.key} className={pk('grid grid-cols-1 sm:grid-cols-[2fr_3fr_1fr_auto_auto] gap-2 items-end', 'grid grid-cols-1 @5xl/pane:grid-cols-[2fr_3fr_1fr_auto_auto] gap-2 items-end')}>
              <Field label="Name">
                <input className={inputCls} value={z.name}
                  onChange={(e) => setZeichner((alt) => alt.map((x) => x.key === z.key ? { ...x, name: e.target.value } : x))} />
              </Field>
              <Field label="Angaben (Wohnort/Sitz)">
                <input className={inputCls} value={z.angaben}
                  onChange={(e) => setZeichner((alt) => alt.map((x) => x.key === z.key ? { ...x, angaben: e.target.value } : x))} />
              </Field>
              <Field label="Stück">
                <input className={inputCls} inputMode="numeric" value={z.anzahl}
                  onChange={(e) => setZeichner((alt) => alt.map((x) => x.key === z.key ? { ...x, anzahl: e.target.value } : x))} />
              </Field>
              {!ag && (
                <label className="flex items-center gap-1.5 text-body-s text-ink-700 pb-2">
                  <input type="checkbox" checked={z.bereitsBeteiligt}
                    onChange={(e) => setZeichner((alt) => alt.map((x) => x.key === z.key ? { ...x, bereitsBeteiligt: e.target.checked } : x))} />
                  bereits Gesellschafter:in
                </label>
              )}
              <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                onClick={() => setZeichner((alt) => alt.filter((x) => x.key !== z.key))}>✕</button>
            </div>
          ))}
          <button type="button" className="lc-btn-outline lc-btn-sm"
            onClick={() => setZeichner((alt) => [...alt, { key: neuerKey(), name: '', angaben: '', anzahl: '', bereitsBeteiligt: true }])}>
            + Zeichner:in hinzufügen
          </button>
        </div>

        {/* GmbH: statutarische Klauseln für den 777a-Hinweis an neue Zeichner */}
        {!ag && zeichner.some((z) => z.name.trim() && !z.bereitsBeteiligt) && (
          <div>
            <p className="text-body-s font-medium text-ink-900 mb-1.5">
              Statutarische Klauseln (Hinweispflicht im Zeichnungsschein für NEUE Gesellschafter, Art. 777a Abs. 2 OR)
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-body-s text-ink-700">
              {KLAUSELN.map((k) => (
                <label key={k.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={klauseln.includes(k.id)} onChange={() => toggleKlausel(k.id)} /> {k.label}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-body-s text-ink-700', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-x-6 gap-y-2 text-body-s text-ink-700')}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={bezugsrechtGewahrt} onChange={(e) => setBezugsrechtGewahrt(e.target.checked)} />
            Bezugsrecht weder eingeschränkt noch aufgehoben (Art. 652b OR)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!bankInUrkunde} onChange={(e) => setBankInUrkunde(!e.target.checked)} />
            Bank wird in der Urkunde NICHT genannt (separate Bescheinigung)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={befristung} onChange={(e) => setBefristung(e.target.checked)} />
            Zeichnungsschein-Befristung 3 Monate (Usanz, kein Gesetzesinhalt)
          </label>
        </div>
        {bankInUrkunde && (
          <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-4', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-4')}>
            <Field label="Bank (in der Urkunde genannt)">
              <input className={inputCls} value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </Field>
            <Field label="Bank-Ort">
              <input className={inputCls} value={bankOrt} onChange={(e) => setBankOrt(e.target.value)} />
            </Field>
          </div>
        )}
        <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-4', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-4')}>
          <Field label="Ort (Unterschriften)">
            <input className={inputCls} value={ort} onChange={(e) => setOrt(e.target.value)} />
          </Field>
          <Field label="Datum (Unterschriften)">
            <input type="date" className={inputCls} value={datum} onChange={(e) => setDatum(e.target.value)} />
          </Field>
        </div>

        <MappenGates gates={mappe.gates} />

        <MappenAnsicht dokumente={mappe.dokumente} docxErlaubt={docxErlaubt}
          startDokId="gv-beschluss" bannerEntwurf={BANNER_ENTWURF}
          bannerFertig={BANNER_FERTIG} />
      </section>
    </div>
  );
}
