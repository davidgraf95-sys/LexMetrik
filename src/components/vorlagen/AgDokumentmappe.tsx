import { useMemo, useRef, useState } from 'react';
import { Field, inputCls } from './ui';
import { MappenAnsicht, MappenGates, NotariatsHinweis } from './Dokumentmappe';
import type { PdfBanner } from '../../lib/vorlagen/banner';
import type { AgGruendungEingaben } from '../../lib/gruendungsunterlagen';
import {
  agDokumentmappe,
  AG_DOK_DEFAULTS,
  type AgDokAntworten,
  type AgGruenderZeile,
  type AgVrZeile,
  type AgVertretungsZeile,
  type AgVrZeichnungsArt,
  type AgVertretungsZeichnungsArt,
  type AgSacheinlageZeile,
  type AgVerrechnungZeile,
  type AgVorteilZeile,
  type AgWaehrung,
  AG_FREMDWAEHRUNGEN,
} from '../../lib/vorlagen/gruendungAgDokumente';
import { KANTONE } from '../../lib/kantone';

// ─── Dokumentmappe der AG-Gründung (Plan 9b, 7.6.2026) ───────────────────────
// Darstellung + Eingabesammlung; Rechtslogik in lib/vorlagen/
// gruendungAgDokumente.ts (§3). Weichen kommen vom Checklisten-Teil (§5).

const BANNER_ENTWURF: PdfBanner = {
  titel: 'ENTWURF – KEIN GÜLTIGES DOKUMENT',
  text: 'Vorbereitung für die Urkundsperson: Die Statuten werden notariell beglaubigt (Art. 22 Abs. 4 HRegV), der Errichtungsakt öffentlich beurkundet (Art. 629 Abs. 1 OR).',
};
// D14: VR-Mitglieder können «ohne Zeichnungsberechtigung» sein (Gate: mind.
// eines vertretungsbefugt, Art. 718 Abs. 3 OR); weitere Zeichnungsberechtigte
// zusätzlich mit Kollektivprokura (ZH-Muster-Protokoll).
const VR_ZEICHNUNGS_OPTIONEN: { id: AgVrZeichnungsArt; label: string }[] = [
  { id: 'einzelunterschrift', label: 'Einzelunterschrift' },
  { id: 'kollektivzuzweien', label: 'Kollektivunterschrift zu zweien' },
  { id: 'ohne', label: 'ohne Zeichnungsberechtigung' },
];
const VERTRETUNGS_ZEICHNUNGS_OPTIONEN: { id: AgVertretungsZeichnungsArt; label: string }[] = [
  { id: 'einzelunterschrift', label: 'Einzelunterschrift' },
  { id: 'kollektivzuzweien', label: 'Kollektivunterschrift zu zweien' },
  { id: 'kollektivprokura', label: 'Kollektivprokura zu zweien' },
];

export function AgDokumentmappe({ weichen, docxErlaubt }: {
  weichen: AgGruendungEingaben;
  docxErlaubt: boolean;
}) {
  const [firma, setFirma] = useState('');
  const [sitz, setSitz] = useState('');
  const [kanton, setKanton] = useState('ZH');
  const [zweck, setZweck] = useState('');
  const [zweckErweiterung, setZweckErweiterung] = useState(true);
  const [ak, setAk] = useState(AG_DOK_DEFAULTS.aktienkapitalChf);
  const [anzahl, setAnzahl] = useState(AG_DOK_DEFAULTS.anzahlAktien);
  const [nennwert, setNennwert] = useState(AG_DOK_DEFAULTS.nennwertChf);
  const [liberierung, setLiberierung] = useState(AG_DOK_DEFAULTS.liberierungProzent);
  const [gruender, setGruender] = useState<(AgGruenderZeile & { key: number })[]>([]);
  const [vr, setVr] = useState<(AgVrZeile & { key: number })[]>([]);
  const [vertretungen, setVertretungen] = useState<(AgVertretungsZeile & { key: number })[]>([]);
  const [protokollfuehrer, setProtokollfuehrer] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankOrt, setBankOrt] = useState('');
  const [rechtsdomizil, setRechtsdomizil] = useState('');
  const [domizilhalterName, setDomizilhalterName] = useState('');
  const [domizilhalterAdresse, setDomizilhalterAdresse] = useState('');
  const [rsName, setRsName] = useState('');
  const [rsSitz, setRsSitz] = useState('');
  const [vinkulierung, setVinkulierung] = useState(false);
  const [virtuelleGv, setVirtuelleGv] = useState(false);
  const [statutenUmfang, setStatutenUmfang] = useState<AgDokAntworten['statutenUmfang']>('kurz');
  const [gjBeginn, setGjBeginn] = useState(AG_DOK_DEFAULTS.gjBeginn);
  const [gjEnde, setGjEnde] = useState(AG_DOK_DEFAULTS.gjEnde);
  const [sitzungBeginn, setSitzungBeginn] = useState('');
  const [sitzungEnde, setSitzungEnde] = useState('');
  const [nachtragsbevollmaechtigter, setNachtragsbevollmaechtigter] = useState('');
  // Etappe 2: qualifizierte Gründung
  const [sacheinlagen, setSacheinlagen] = useState<(AgSacheinlageZeile & { key: number })[]>([]);
  const [verrechnungen, setVerrechnungen] = useState<(AgVerrechnungZeile & { key: number })[]>([]);
  const [vorteile, setVorteile] = useState<(AgVorteilZeile & { key: number })[]>([]);
  const [revisorName, setRevisorName] = useState('');
  // Etappe 3.1: Fremdwährung (wirksam nur mit der Checklisten-Weiche)
  const [waehrung, setWaehrung] = useState<AgWaehrung>('EUR');
  const [kursChf, setKursChf] = useState('');
  const [kursQuelle, setKursQuelle] = useState('');
  // Etappe 4.3: Lex-Koller-Erklärung (Weiche immobilienHauptzweck)
  const [lkAusland, setLkAusland] = useState(false);
  const [lkNeuerwerb, setLkNeuerwerb] = useState(false);
  const [lkGrundstueck, setLkGrundstueck] = useState(false);
  const [ort, setOrt] = useState('');
  const [datum, setDatum] = useState('');

  const naechsterKey = useRef(1);
  const neuerKey = () => naechsterKey.current++;

  const antworten: AgDokAntworten = useMemo(() => ({
    ...weichen,
    ...AG_DOK_DEFAULTS,
    firma, sitz, kanton, zweck, zweckErweiterung,
    aktienkapitalChf: ak, anzahlAktien: anzahl, nennwertChf: nennwert,
    liberierungProzent: liberierung,
    gruender, verwaltungsraete: vr, weitereVertretungen: vertretungen,
    protokollfuehrerName: protokollfuehrer,
    bankName, bankOrt, rechtsdomizilAdresse: rechtsdomizil,
    domizilhalterName, domizilhalterAdresse,
    revisionsstelleName: rsName, revisionsstelleSitz: rsSitz,
    vinkulierung, virtuelleGv, statutenUmfang, gjBeginn, gjEnde,
    sitzungBeginn, sitzungEnde, nachtragsbevollmaechtigter,
    waehrung, kursChf, kursQuelle,
    lexKollerAuslandBeteiligt: lkAusland, lexKollerNeuerwerb: lkNeuerwerb, lexKollerGrundstueckErwerb: lkGrundstueck,
    sacheinlagen, verrechnungen, vorteile, revisorName, ort, datum,
  }), [weichen, firma, sitz, kanton, zweck, zweckErweiterung, ak, anzahl, nennwert, liberierung,
    gruender, vr, vertretungen, protokollfuehrer, bankName, bankOrt, rechtsdomizil,
    domizilhalterName, domizilhalterAdresse, rsName, rsSitz, vinkulierung, virtuelleGv,
    statutenUmfang, gjBeginn, gjEnde, sitzungBeginn, sitzungEnde, nachtragsbevollmaechtigter,
    waehrung, kursChf, kursQuelle, lkAusland, lkNeuerwerb, lkGrundstueck,
    sacheinlagen, verrechnungen, vorteile, revisorName, ort, datum]);

  const mappe = useMemo(() => agDokumentmappe(antworten), [antworten]);

  return (
    <section className="lc-card p-5 sm:p-6 space-y-5">
      <div>
        <p className="lc-overline">Dokumentmappe – Volldokumente (bar und qualifiziert, Namenaktien)</p>
        <p className="text-body-s text-ink-500 max-w-reading">
          Erzeugt aus denselben Weichen wie die Checkliste: Statuten und Errichtungsakt als
          ENTWURF für die Urkundsperson (öffentliche Beurkundung bleibt zwingend, Art. 629 OR),
          Wahlannahmen, VR-Konstituierungsprotokoll, Handelsregister-Anmeldung sowie bei der
          qualifizierten Gründung Sacheinlageverträge und Gründungsbericht druckfertig
          (Sacheinlagevertrag mit Grundstück: nur Entwurf, Art. 634 Abs. 2 OR).
          Eingaben verlassen den Browser nicht; keine Speicherung.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Firma (mit Zusatz «AG», Art. 950 OR)">
          <input className={inputCls} value={firma} onChange={(e) => setFirma(e.target.value)} placeholder="z. B. Muster Immobilien AG" />
        </Field>
        <Field label="Sitz (politische Gemeinde)">
          <input className={inputCls} value={sitz} onChange={(e) => setSitz(e.target.value)} placeholder="z. B. Zürich" />
        </Field>
        <Field label="Kanton (Handelsregisteramt)">
          <select className={inputCls} value={kanton} onChange={(e) => setKanton(e.target.value)}>
            {KANTONE.map((kt) => <option key={kt} value={kt}>{kt}</option>)}
          </select>
        </Field>
      </div>

      <NotariatsHinweis kanton={kanton} />

      <Field label="Zweck">
        <textarea className={inputCls} rows={2} value={zweck} onChange={(e) => setZweck(e.target.value)}
          placeholder="z. B. den Erwerb, das Halten und die Verwaltung von Beteiligungen" />
      </Field>
      <label className="flex items-center gap-2 text-body-s text-ink-700">
        <input type="checkbox" checked={zweckErweiterung} onChange={(e) => setZweckErweiterung(e.target.checked)} />
        Übliche Zweck-Erweiterungsklausel
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Field label="Aktienkapital (CHF, mind. 100'000)">
          <input className={inputCls} inputMode="numeric" placeholder="Tausender mit Apostroph, z. B. 100'000" value={ak} onChange={(e) => setAk(e.target.value)} />
        </Field>
        <Field label="Anzahl Namenaktien">
          <input className={inputCls} inputMode="numeric" value={anzahl} onChange={(e) => setAnzahl(e.target.value)} />
        </Field>
        <Field label="Nennwert je Aktie (CHF)">
          <input className={inputCls} inputMode="numeric" value={nennwert} onChange={(e) => setNennwert(e.target.value)} />
        </Field>
        <Field label="Liberierung (%, 20–100; einbezahlt mind. CHF 50'000)">
          <input className={inputCls} inputMode="numeric" value={liberierung} onChange={(e) => setLiberierung(e.target.value)} />
        </Field>
      </div>

      {/* Gründer */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Gründer:innen und Zeichnung (Art. 629/630 OR)</p>
        {gruender.map((g) => (
          <div key={g.key} className="grid grid-cols-1 sm:grid-cols-[2fr_3fr_1fr_auto] gap-2 items-end">
            <Field label="Name">
              <input className={inputCls} value={g.name}
                onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, name: e.target.value } : x))} />
            </Field>
            <Field label="Angaben (z. B. «von Basel, in Zürich, Musterweg 1»)">
              <input className={inputCls} value={g.angaben}
                onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, angaben: e.target.value } : x))} />
            </Field>
            <Field label="Aktien">
              <input className={inputCls} inputMode="numeric" value={g.anzahl}
                onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, anzahl: e.target.value } : x))} />
            </Field>
            <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
              onClick={() => setGruender((alt) => alt.filter((x) => x.key !== g.key))}>✕</button>
          </div>
        ))}
        <button type="button" className="lc-btn-outline lc-btn-sm"
          onClick={() => setGruender((alt) => [...alt, { key: neuerKey(), name: '', angaben: '', anzahl: '' }])}>
          + Gründer:in hinzufügen
        </button>
      </div>

      {/* Etappe 2: Sacheinlagen (Art. 634 OR) */}
      {(weichen.einlageArt === 'sacheinlage' || weichen.einlageArt === 'gemischt') && (
        <div className="space-y-3">
          <p className="text-body-s font-medium text-ink-900">Sacheinlagen (Art. 634 OR)</p>
          <p className="text-body-s text-ink-500 max-w-reading">
            Deckungs-Voraussetzungen (Art. 634 Abs. 1 OR): als Aktiven bilanzierbar, übertragbar,
            nach dem Eintrag sofort frei verfügbar (bei Grundstücken: bedingungsloser
            Grundbuch-Anspruch) und durch Übertragung auf Dritte verwertbar.
          </p>
          {sacheinlagen.map((s) => (
            <div key={s.key} className="rounded-md border border-line p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_2fr_auto] gap-2 items-end">
                <Field label="Art der Einlage">
                  <select className={inputCls} value={s.typ}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, typ: e.target.value as AgSacheinlageZeile['typ'] } : x))}>
                    <option value="sachgesamtheit">Sachgesamtheit (Inventarliste)</option>
                    <option value="geschaeft">Einzelunternehmen (Übernahmebilanz)</option>
                  </select>
                </Field>
                <Field label={s.typ === 'geschaeft' ? 'Firma des Einzelunternehmens' : 'Gegenstand (Umfang der Sacheinlage)'}>
                  <input className={inputCls} value={s.bezeichnung}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, bezeichnung: e.target.value } : x))} />
                </Field>
                <Field label="Einleger:in (Name)">
                  <input className={inputCls} value={s.einlegerName}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, einlegerName: e.target.value } : x))} />
                </Field>
                <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Sacheinlage entfernen"
                  onClick={() => setSacheinlagen((alt) => alt.filter((x) => x.key !== s.key))}>✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <Field label="Bewertung (CHF)">
                  <input className={inputCls} inputMode="numeric" value={s.wertChf}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, wertChf: e.target.value } : x))} />
                </Field>
                <Field label="Dafür ausgegebene Aktien">
                  <input className={inputCls} inputMode="numeric" value={s.aktienAnzahl}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, aktienAnzahl: e.target.value } : x))} />
                </Field>
                <Field label="Gutschrift (CHF, optional)">
                  <input className={inputCls} inputMode="numeric" value={s.gutschriftChf}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, gutschriftChf: e.target.value } : x))} />
                </Field>
                <Field label={s.typ === 'geschaeft' ? 'Übernahmebilanz per' : 'Inventarliste vom'}>
                  <input type="date" className={inputCls} value={s.belegDatum}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, belegDatum: e.target.value } : x))} />
                </Field>
              </div>
              {s.typ === 'geschaeft' && (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                  <label className="flex items-center gap-2 text-body-s text-ink-700 pb-2">
                    <input type="checkbox" checked={s.imHrEingetragen}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, imHrEingetragen: e.target.checked } : x))} />
                    im HR eingetragen
                  </label>
                  <Field label="UID (CHE-…, optional)">
                    <input className={inputCls} value={s.cheNr}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, cheNr: e.target.value } : x))} />
                  </Field>
                  <Field label="Aktiven (CHF)">
                    <input className={inputCls} inputMode="numeric" value={s.aktivenChf}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, aktivenChf: e.target.value } : x))} />
                  </Field>
                  <Field label="Passiven (CHF)">
                    <input className={inputCls} inputMode="numeric" value={s.passivenChf}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, passivenChf: e.target.value } : x))} />
                  </Field>
                  <Field label="Rechtsgeschäfte gelten ab (Rückwirkung)">
                    <input type="date" className={inputCls} value={s.rueckwirkungDatum}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, rueckwirkungDatum: e.target.value } : x))} />
                  </Field>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-2 items-start">
                <label className="flex items-center gap-2 text-body-s text-ink-700 pt-2">
                  <input type="checkbox" checked={s.grundstueck}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, grundstueck: e.target.checked } : x))} />
                  Grundstück enthalten (Vertrag wird öffentlich beurkundet, Art. 657 ZGB — Export nur als Entwurf)
                </label>
                <Field label="Zustand der Sacheinlage (für den Gründungsbericht; bei Geschäft: Würdigung je Bilanzposten)">
                  <textarea className={inputCls} rows={2} value={s.zustand}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, zustand: e.target.value } : x))} />
                </Field>
              </div>
            </div>
          ))}
          <button type="button" className="lc-btn-outline lc-btn-sm"
            onClick={() => setSacheinlagen((alt) => [...alt, {
              key: neuerKey(), typ: 'sachgesamtheit', bezeichnung: '', belegDatum: '', wertChf: '',
              grundstueck: false, einlegerName: '', aktienAnzahl: '', gutschriftChf: '', zustand: '',
              imHrEingetragen: false, cheNr: '', aktivenChf: '', passivenChf: '', rueckwirkungDatum: '',
            }])}>
            + Sacheinlage hinzufügen
          </button>
        </div>
      )}

      {/* Etappe 2: Verrechnungsliberierung (Art. 634a OR) */}
      {(weichen.einlageArt === 'verrechnung' || weichen.einlageArt === 'gemischt') && (
        <div className="space-y-2">
          <p className="text-body-s font-medium text-ink-900">Verrechnungsliberierung (Art. 634a OR)</p>
          {verrechnungen.map((v) => (
            <div key={v.key} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_3fr_auto] gap-2 items-end">
              <Field label="Gläubiger:in (Name)">
                <input className={inputCls} value={v.glaeubigerName}
                  onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, glaeubigerName: e.target.value } : x))} />
              </Field>
              <Field label="Forderung (CHF)">
                <input className={inputCls} inputMode="numeric" value={v.forderungChf}
                  onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, forderungChf: e.target.value } : x))} />
              </Field>
              <Field label="Aktien">
                <input className={inputCls} inputMode="numeric" value={v.aktienAnzahl}
                  onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, aktienAnzahl: e.target.value } : x))} />
              </Field>
              <Field label="Bestand/Verrechenbarkeit (für den Gründungsbericht)">
                <input className={inputCls} value={v.begruendungTxt}
                  onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, begruendungTxt: e.target.value } : x))} />
              </Field>
              <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                onClick={() => setVerrechnungen((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
            </div>
          ))}
          <button type="button" className="lc-btn-outline lc-btn-sm"
            onClick={() => setVerrechnungen((alt) => [...alt, { key: neuerKey(), glaeubigerName: '', forderungChf: '', aktienAnzahl: '', begruendungTxt: '' }])}>
            + Verrechnung hinzufügen
          </button>
        </div>
      )}

      {/* Etappe 2: Besondere Vorteile (Art. 636 OR) */}
      {weichen.besondereVorteile && (
        <div className="space-y-2">
          <p className="text-body-s font-medium text-ink-900">Besondere Vorteile (Art. 636 OR)</p>
          {vorteile.map((v) => (
            <div key={v.key} className="grid grid-cols-1 sm:grid-cols-[2fr_3fr_1fr_3fr_auto] gap-2 items-end">
              <Field label="Begünstigte:r (Name)">
                <input className={inputCls} value={v.beguenstigter}
                  onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, beguenstigter: e.target.value } : x))} />
              </Field>
              <Field label="Inhalt des Vorteils">
                <input className={inputCls} value={v.inhalt}
                  onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, inhalt: e.target.value } : x))} />
              </Field>
              <Field label="Wert (CHF)">
                <input className={inputCls} inputMode="numeric" value={v.wertChf}
                  onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, wertChf: e.target.value } : x))} />
              </Field>
              <Field label="Begründung/Angemessenheit (für den Gründungsbericht)">
                <input className={inputCls} value={v.begruendungTxt}
                  onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, begruendungTxt: e.target.value } : x))} />
              </Field>
              <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                onClick={() => setVorteile((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
            </div>
          ))}
          <button type="button" className="lc-btn-outline lc-btn-sm"
            onClick={() => setVorteile((alt) => [...alt, { key: neuerKey(), beguenstigter: '', inhalt: '', wertChf: '', begruendungTxt: '' }])}>
            + Vorteil hinzufügen
          </button>
        </div>
      )}

      {(weichen.einlageArt !== 'bar' || weichen.besondereVorteile) && (
        <Field label="Zugelassene:r Revisor:in der Prüfungsbestätigung (Art. 635a OR; leer = Blanko)">
          <input className={inputCls} value={revisorName} onChange={(e) => setRevisorName(e.target.value)} />
        </Field>
      )}

      {/* Etappe 4.3: Lex-Koller-Erklärung (Art. 18 BewG; ZH-Formular) */}
      {weichen.immobilienHauptzweck && (
        <div className="space-y-2">
          <p className="text-body-s font-medium text-ink-900">Lex-Koller-Erklärung (Erwerb von Grundstücken durch Personen im Ausland)</p>
          <div className="flex flex-col gap-1.5 text-body-s text-ink-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={lkAusland} onChange={(e) => setLkAusland(e.target.checked)} />
              Personen im Ausland (Art. 5 BewG) sind an der Gesellschaft beteiligt
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={lkNeuerwerb} onChange={(e) => setLkNeuerwerb(e.target.checked)} />
              Personen im Ausland erwerben mit der Gründung neu eine Beteiligung
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={lkGrundstueck} onChange={(e) => setLkGrundstueck(e.target.checked)} />
              Bei Sacheinlage: Die Gesellschaft erwirbt Nicht-Betriebsstätte-Grundstücke in der Schweiz
            </label>
          </div>
        </div>
      )}

      {/* Etappe 3.1: Fremdwährung (Art. 621 Abs. 2 OR; Anhang 3 HRegV) */}
      {weichen.fremdwaehrung && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Währung des Aktienkapitals (Anhang 3 HRegV)">
            <select className={inputCls} value={waehrung} onChange={(e) => setWaehrung(e.target.value as AgWaehrung)}>
              {AG_FREMDWAEHRUNGEN.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Umrechnungskurs (1 Einheit = X CHF; Art. 629 Abs. 3 OR)">
            <input className={inputCls} inputMode="decimal" value={kursChf} onChange={(e) => setKursChf(e.target.value)} placeholder="z. B. 0.93" />
          </Field>
          <Field label="Quelle des Devisenmittelkurses (Bank)">
            <input className={inputCls} value={kursQuelle} onChange={(e) => setKursQuelle(e.target.value)} placeholder="z. B. Zürcher Kantonalbank" />
          </Field>
        </div>
      )}

      {/* Verwaltungsrat */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Verwaltungsrat (Art. 707 ff. OR)</p>
        {vr.map((v) => (
          <div key={v.key} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_2fr_1fr_auto_auto] gap-2 items-end">
            <Field label="Name">
              <input className={inputCls} value={v.name}
                onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, name: e.target.value } : x))} />
            </Field>
            <Field label="Heimatort / Staat">
              <input className={inputCls} value={v.herkunft}
                onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, herkunft: e.target.value } : x))} />
            </Field>
            <Field label="Wohnort">
              <input className={inputCls} value={v.wohnort}
                onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, wohnort: e.target.value } : x))} />
            </Field>
            <Field label="Adresse (für die Wahlannahme)">
              <input className={inputCls} value={v.adresse}
                onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, adresse: e.target.value } : x))} />
            </Field>
            <Field label="Zeichnung">
              <select className={inputCls} value={v.zeichnungsArt}
                onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, zeichnungsArt: e.target.value as AgVrZeichnungsArt } : x))}>
                {VR_ZEICHNUNGS_OPTIONEN.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </Field>
            <label className="flex items-center gap-1.5 text-body-s text-ink-700 pb-2">
              <input type="checkbox" checked={v.praesident}
                onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, praesident: e.target.checked } : x))} />
              Präsident:in
            </label>
            <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
              onClick={() => setVr((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
          </div>
        ))}
        <button type="button" className="lc-btn-outline lc-btn-sm"
          onClick={() => setVr((alt) => [...alt, { key: neuerKey(), name: '', herkunft: '', wohnort: '', adresse: '', praesident: alt.length === 0, zeichnungsArt: 'einzelunterschrift' }])}>
          + VR-Mitglied hinzufügen
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Protokollführung (leer = Präsident:in)">
            <input className={inputCls} value={protokollfuehrer} onChange={(e) => setProtokollfuehrer(e.target.value)} />
          </Field>
          <Field label="Sitzungsbeginn (Uhrzeit, fürs Protokoll)">
            <input className={inputCls} value={sitzungBeginn} onChange={(e) => setSitzungBeginn(e.target.value)} placeholder="z. B. 11.00" />
          </Field>
          <Field label="Sitzungsende (Uhrzeit)">
            <input className={inputCls} value={sitzungEnde} onChange={(e) => setSitzungEnde(e.target.value)} placeholder="z. B. 11.15" />
          </Field>
        </div>
      </div>

      {/* Weitere Zeichnungsberechtigte */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Weitere Zeichnungsberechtigte (optional, ins VR-Protokoll)</p>
        {vertretungen.map((v) => (
          <div key={v.key} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_2fr_auto] gap-2 items-end">
            <Field label="Name">
              <input className={inputCls} value={v.name}
                onChange={(e) => setVertretungen((alt) => alt.map((x) => x.key === v.key ? { ...x, name: e.target.value } : x))} />
            </Field>
            <Field label="Funktion">
              <input className={inputCls} value={v.funktion}
                onChange={(e) => setVertretungen((alt) => alt.map((x) => x.key === v.key ? { ...x, funktion: e.target.value } : x))} />
            </Field>
            <Field label="Zeichnung">
              <select className={inputCls} value={v.zeichnungsArt}
                onChange={(e) => setVertretungen((alt) => alt.map((x) => x.key === v.key ? { ...x, zeichnungsArt: e.target.value as AgVertretungsZeichnungsArt } : x))}>
                {VERTRETUNGS_ZEICHNUNGS_OPTIONEN.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </Field>
            <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
              onClick={() => setVertretungen((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
          </div>
        ))}
        <button type="button" className="lc-btn-outline lc-btn-sm"
          onClick={() => setVertretungen((alt) => [...alt, { key: neuerKey(), name: '', funktion: '', zeichnungsArt: 'kollektivzuzweien' }])}>
          + Person hinzufügen
        </button>
      </div>

      {/* Kontext-Angaben aus den Weichen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {weichen.bankInUrkundeGenannt && weichen.einlageArt === 'bar' && (
          <>
            <Field label="Bank (in der Urkunde genannt)">
              <input className={inputCls} value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </Field>
            <Field label="Bank-Ort">
              <input className={inputCls} value={bankOrt} onChange={(e) => setBankOrt(e.target.value)} />
            </Field>
          </>
        )}
        {weichen.eigeneBueros ? (
          <Field label="Rechtsdomizil (Adresse am Sitz)">
            <input className={inputCls} value={rechtsdomizil} onChange={(e) => setRechtsdomizil(e.target.value)} />
          </Field>
        ) : (
          <>
            <Field label="Domizilhalter:in (c/o)">
              <input className={inputCls} value={domizilhalterName} onChange={(e) => setDomizilhalterName(e.target.value)} />
            </Field>
            <Field label="Adresse Domizilhalter:in">
              <input className={inputCls} value={domizilhalterAdresse} onChange={(e) => setDomizilhalterAdresse(e.target.value)} />
            </Field>
          </>
        )}
        {!weichen.optingOut && (
          <>
            <Field label="Revisionsstelle (Name)">
              <input className={inputCls} value={rsName} onChange={(e) => setRsName(e.target.value)} />
            </Field>
            <Field label="Revisionsstelle (Sitz)">
              <input className={inputCls} value={rsSitz} onChange={(e) => setRsSitz(e.target.value)} />
            </Field>
          </>
        )}
        <Field label="Geschäftsjahr-Beginn (Statuten)">
          <input className={inputCls} value={gjBeginn} onChange={(e) => setGjBeginn(e.target.value)} placeholder="z. B. 1. Januar" />
        </Field>
        <Field label="Geschäftsjahr-Ende (Statuten)">
          <input className={inputCls} value={gjEnde} onChange={(e) => setGjEnde(e.target.value)} placeholder="z. B. 31. Dezember" />
        </Field>
        <Field label="Ort (Unterschriften)">
          <input className={inputCls} value={ort} onChange={(e) => setOrt(e.target.value)} />
        </Field>
        <Field label="Datum">
          <input type="date" className={inputCls} value={datum} onChange={(e) => setDatum(e.target.value)} />
        </Field>
        <Field label="Nachtrags-Bevollmächtigte:r (optional; volle Personalien)">
          <input className={inputCls} value={nachtragsbevollmaechtigter} onChange={(e) => setNachtragsbevollmaechtigter(e.target.value)}
            placeholder="Vorname Name, Geburtsdatum, Bürgerort, Wohnadresse" />
        </Field>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-body-s text-ink-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={vinkulierung} onChange={(e) => setVinkulierung(e.target.checked)} />
          Vinkulierung der Namenaktien (Art. 685a f. OR)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={virtuelleGv} onChange={(e) => setVirtuelleGv(e.target.checked)} />
          Virtuelle/hybride Generalversammlung (Art. 701d OR)
        </label>
        <label className="flex items-center gap-2">
          Statuten-Umfang:
          <select className={inputCls} value={statutenUmfang}
            onChange={(e) => setStatutenUmfang(e.target.value as AgDokAntworten['statutenUmfang'])}>
            <option value="kurz">Kurzfassung (amtliche ZH-Kurzvorlage)</option>
            <option value="lang">Langfassung (mit Organisations-Artikeln)</option>
          </select>
        </label>
      </div>

      <MappenGates gates={mappe.gates} />

      <MappenAnsicht dokumente={mappe.dokumente} docxErlaubt={docxErlaubt}
        startDokId="statuten" bannerEntwurf={BANNER_ENTWURF} />
    </section>
  );
}
