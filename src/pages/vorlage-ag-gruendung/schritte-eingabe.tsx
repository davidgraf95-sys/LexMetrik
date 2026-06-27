import { Field, inputCls } from '../../components/vorlagen/ui';
import { NormText } from '../../components/NormText';
import { NotariatsHinweis, HrAmtHinweis } from '../../components/vorlagen/Dokumentmappe';
import { PflichtDisclaimer } from '../../components/PflichtDisclaimer';
import { KANTONE } from '../../lib/kantone';
import { AG_FREMDWAEHRUNGEN } from '../../lib/vorlagen/gruendungAgDokumente';
import type { EinlageArt } from '../../lib/gruendungsunterlagen';
import type {
  AgDokAntworten,
  AgWaehrung,
  AgSacheinlageZeile,
  AgVrZeichnungsArt,
  AgVertretungsZeichnungsArt,
} from '../../lib/vorlagen/gruendungAgDokumente';
import { VR_ZEICHNUNGS_OPTIONEN, VERTRETUNGS_ZEICHNUNGS_OPTIONEN } from '../vorlagenAgGruendungDaten';
import type { AgSchrittCtx } from './ctx';

// Verhaltensneutral ausgelagerte Eingabe-Schritte (§6 Ziff. 6). Jede Funktion
// destrukturiert oben die benötigten Werte/Setter aus dem Ctx; die JSX-Bodies
// sind unverändert gegenüber der vormaligen Inline-Definition in
// VorlageAgGruendung.tsx. Reine Darstellung (§3).

export function SchrittKonstellation({ ctx }: { ctx: AgSchrittCtx }) {
  const {
    musterdatenFuellen, einlageArt, setEinlageArt, optingOut, setOptingOut,
    leistungen, setLeistungen, besondereVorteile, setBesondereVorteile,
    inhaberaktien, setInhaberaktien, eigeneBueros, setEigeneBueros,
    immobilienHauptzweck, setImmobilienHauptzweck, fremdwaehrung, setFremdwaehrung,
    bankInUrkunde, setBankInUrkunde, chVertretung, setChVertretung, checkliste,
  } = ctx;
  return (
    <div className="space-y-4">
      <PflichtDisclaimer />
      <button type="button" className="lc-btn-outline lc-btn-sm" onClick={musterdatenFuellen}
        title="Füllt alle Schritte mit einem vollständigen Demo-Datensatz (gemischte qualifizierte Gründung) — zum Ausprobieren; eigene Eingaben werden überschrieben.">
        Mit Musterdaten füllen (Demo)
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Liberierung">
          <select className={inputCls} value={einlageArt} onChange={(e) => setEinlageArt(e.target.value as EinlageArt)}>
            <option value="bar">Bareinlage</option>
            <option value="sacheinlage">Sacheinlage</option>
            <option value="verrechnung">Verrechnung</option>
            <option value="gemischt">Gemischt (bar + Sache/Verrechnung)</option>
          </select>
        </Field>
        <Field label="Revision">
          <select className={inputCls} value={optingOut ? 'opting' : 'rs'} onChange={(e) => setOptingOut(e.target.value === 'opting')}>
            <option value="opting">Verzicht (Opting-out, ≤ 10 Vollzeitstellen)</option>
            <option value="rs">Revisionsstelle bestellt</option>
          </select>
        </Field>
        <Field label="Leistungen der Aktionäre (CHF, optional — für die Emissionsabgabe)">
          <input className={inputCls} inputMode="numeric" placeholder="z. B. 100000" value={leistungen} onChange={(e) => setLeistungen(e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-y-2 text-body-s text-ink-700">
        <label className="flex items-center gap-2"><input type="checkbox" checked={besondereVorteile} onChange={(e) => setBesondereVorteile(e.target.checked)} /> Besondere Vorteile für Gründer/Dritte</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={inhaberaktien} onChange={(e) => setInhaberaktien(e.target.checked)} /> Inhaberaktien vorgesehen</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!eigeneBueros} onChange={(e) => setEigeneBueros(!e.target.checked)} /> c/o-Adresse (kein eigenes Büro)</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={immobilienHauptzweck} onChange={(e) => setImmobilienHauptzweck(e.target.checked)} /> Immobilien-Haupttätigkeit</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={fremdwaehrung} onChange={(e) => setFremdwaehrung(e.target.checked)} /> Aktienkapital in Fremdwährung</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!bankInUrkunde} onChange={(e) => setBankInUrkunde(!e.target.checked)} /> Bank wird in der Urkunde NICHT genannt</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={chVertretung} onChange={(e) => setChVertretung(e.target.checked)} /> Vertretungsberechtigte Person mit CH-Wohnsitz vorhanden</label>
      </div>
      {checkliste.blocker.map((b) => (
        <div key={b} className="lc-notice-warn">
          <p className="text-body-s font-medium">Eintragungshindernis</p>
          <p className="text-body-s"><NormText text={b} /></p>
        </div>
      ))}
    </div>
  );
}

export function SchrittGesellschaft({ ctx }: { ctx: AgSchrittCtx }) {
  const {
    firma, setFirma, sitz, setSitz, kanton, setKanton, zweck, setZweck, finmaTreffer,
    zweckErweiterung, setZweckErweiterung, vinkulierung, setVinkulierung,
    virtuelleGv, setVirtuelleGv, statutenUmfang, setStatutenUmfang,
    inhaberaktien, inhaberKotiert, setInhaberKotiert, verwahrungsstelle, setVerwahrungsstelle,
    schiedsklausel, setSchiedsklausel, schiedsOrt, setSchiedsOrt,
    kapitalband, setKapitalband, kbRichtung, setKbRichtung, kbEndeDatum, setKbEndeDatum,
    wc, kbUntergrenze, setKbUntergrenze, kbObergrenze, setKbObergrenze,
    bedingtesKapital, setBedingtesKapital, bkBetrag, setBkBetrag, bkKreis, setBkKreis,
    stichentscheidGv, setStichentscheidGv, gjBeginn, setGjBeginn, gjEnde, setGjEnde,
    gjErstesEnde, setGjErstesEnde,
  } = ctx;
  return (
    <div className="space-y-4">
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
      <HrAmtHinweis kanton={kanton} />
      <Field label="Zweck">
        <textarea className={inputCls} rows={3} value={zweck} onChange={(e) => setZweck(e.target.value)}
          placeholder="z. B. den Erwerb, das Halten und die Verwaltung von Beteiligungen" />
      </Field>
      {finmaTreffer.length > 0 && (
        <div className="lc-notice-warn">
          <p className="text-body-s">
            Firma/Zweck enthält «{finmaTreffer.join('», «')}»: Solche Bezeichnungen dürfen nur mit
            entsprechender FINMA-Bewilligung ins Handelsregister eingetragen werden; eine Bank darf vor
            der Bewilligung gar nicht eingetragen werden (Merkblatt HRegA ZH, 11.12.2024).
          </p>
        </div>
      )}
      <label className="flex items-center gap-2 text-body-s text-ink-700">
        <input type="checkbox" checked={zweckErweiterung} onChange={(e) => setZweckErweiterung(e.target.checked)} />
        Übliche Zweck-Erweiterungsklausel
      </label>
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
      {/* Stufe 2 P2: Inhaberaktien-Voraussetzung (Art. 622 Abs. 1bis OR) */}
      {inhaberaktien && (
        <div className="rounded-md border border-line p-3 space-y-3">
          <p className="text-body-s font-medium text-ink-900"><NormText text={`Inhaberaktien — Zulässigkeits-Voraussetzung (Art. 622 Abs. 1bis OR)`} /></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Voraussetzung">
              <select className={inputCls} value={inhaberKotiert ? 'kotiert' : 'bucheffekten'}
                onChange={(e) => setInhaberKotiert(e.target.value === 'kotiert')}>
                <option value="bucheffekten">Bucheffekten (BEG) + Verwahrungsstelle in der Schweiz</option>
                <option value="kotiert">Beteiligungspapiere an einer Börse kotiert</option>
              </select>
            </Field>
            {!inhaberKotiert && (
              <Field label="Verwahrungsstelle (Name und Ort)">
                <input className={inputCls} value={verwahrungsstelle}
                  onChange={(e) => setVerwahrungsstelle(e.target.value)} placeholder="z. B. SIX SIS AG, Olten" />
              </Field>
            )}
          </div>
          <p className="text-xs text-ink-500 max-w-reading">
            Inhaberaktien setzen Volliberierung voraus (Art. 683 OR) und schliessen Vinkulierung und die
            Statuten-Langfassung aus; der Nachweis ist der Anmeldung beizulegen (Art. 43 Abs. 1 lit. i HRegV).
          </p>
        </div>
      )}
      {/* Stufe 2 P3: Statuten-Zusatzklauseln */}
      <div className="rounded-md border border-line p-3 space-y-3">
        <p className="text-body-s font-medium text-ink-900">Statuten-Zusatzklauseln (optional)</p>
        <label className="flex items-center gap-2 text-body-s text-ink-700">
          <input type="checkbox" checked={schiedsklausel} onChange={(e) => setSchiedsklausel(e.target.checked)} />
          Schiedsklausel (Art. 697n OR)
        </label>
        {schiedsklausel && (
          <Field label="Sitz des Schiedsgerichts (Ort in der Schweiz)">
            <input className={inputCls} value={schiedsOrt} onChange={(e) => setSchiedsOrt(e.target.value)} placeholder="z. B. Zürich" />
          </Field>
        )}
        <label className="flex items-center gap-2 text-body-s text-ink-700">
          <input type="checkbox" checked={kapitalband} onChange={(e) => setKapitalband(e.target.checked)} />
          Kapitalband (Art. 653s ff. OR — VR-Ermächtigung, max. 5 Jahre, ±½ des Kapitals)
        </label>
        {kapitalband && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label="Richtung der Ermächtigung">
              <select className={inputCls} value={kbRichtung}
                onChange={(e) => setKbRichtung(e.target.value as AgDokAntworten['kbRichtung'])}>
                <option value="erhoehen">Nur Erhöhung (bei Opting-out zwingend)</option>
                <option value="beide">Erhöhung und Herabsetzung (nur mit Revisionsstelle)</option>
              </select>
            </Field>
            <Field label="Ende der Ermächtigung (max. 5 Jahre)">
              <input type="date" className={inputCls} value={kbEndeDatum} onChange={(e) => setKbEndeDatum(e.target.value)} />
            </Field>
            <Field label={`Untere Grenze (${wc}${kbRichtung === 'erhoehen' ? ' — bei «nur Erhöhung» = Aktienkapital' : ''})`}>
              <input className={inputCls} inputMode="numeric" value={kbUntergrenze} onChange={(e) => setKbUntergrenze(e.target.value)} />
            </Field>
            <Field label={`Obere Grenze (${wc}, höchstens das Anderthalbfache des Kapitals)`}>
              <input className={inputCls} inputMode="numeric" value={kbObergrenze} onChange={(e) => setKbObergrenze(e.target.value)} />
            </Field>
          </div>
        )}
        <label className="flex items-center gap-2 text-body-s text-ink-700">
          <input type="checkbox" checked={bedingtesKapital} onChange={(e) => setBedingtesKapital(e.target.checked)} />
          Bedingtes Kapital (Art. 653 ff. OR — Wandel-/Optionsrechte, max. ½ des Kapitals)
        </label>
        {bedingtesKapital && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label={`Nennbetrag des bedingten Kapitals (${wc})`}>
              <input className={inputCls} inputMode="numeric" value={bkBetrag} onChange={(e) => setBkBetrag(e.target.value)} placeholder="z. B. 50'000" />
            </Field>
            <Field label="Kreis der Berechtigten (Art. 653b Abs. 1 Ziff. 3 OR)">
              <input className={inputCls} value={bkKreis} onChange={(e) => setBkKreis(e.target.value)}
                placeholder="z. B. den Arbeitnehmerinnen und Arbeitnehmern der Gesellschaft" />
            </Field>
          </div>
        )}
        {statutenUmfang === 'lang' && (
          <label className="flex items-center gap-2 text-body-s text-ink-700"
            title="ZH-Langvorlage: «Bei Stimmengleichheit hat der Vorsitzende den Stichentscheid.» — abwählbar; ohne Klausel gilt: Stimmengleichheit = Antrag abgelehnt (SG-Default, Kantonsvergleich B8).">
            <input type="checkbox" checked={stichentscheidGv} onChange={(e) => setStichentscheidGv(e.target.checked)} />
            Stichentscheid des Vorsitzenden in der Generalversammlung (Langfassung)
          </label>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Geschäftsjahr-Beginn (Statuten)">
          <input className={inputCls} value={gjBeginn} onChange={(e) => setGjBeginn(e.target.value)} placeholder="z. B. 1. Januar" />
        </Field>
        <Field label="Geschäftsjahr-Ende (Statuten)">
          <input className={inputCls} value={gjEnde} onChange={(e) => setGjEnde(e.target.value)} placeholder="z. B. 31. Dezember" />
        </Field>
        <Field label="Erstes Geschäftsjahr endet am (optional — bei unterjähriger Gründung)">
          <input className={inputCls} value={gjErstesEnde} onChange={(e) => setGjErstesEnde(e.target.value)} placeholder="z. B. 31. Dezember 2026" />
        </Field>
      </div>
    </div>
  );
}

export function SchrittKapital({ ctx }: { ctx: AgSchrittCtx }) {
  const {
    fremdwaehrung, waehrung, setWaehrung, ak, setAk, anzahl, setAnzahl,
    nennwert, setNennwert, liberierung, setLiberierung, ausgabebetrag, setAusgabebetrag,
    kursChf, setKursChf, kursQuelle, setKursQuelle, bankInUrkunde, einlageArt,
    bankName, setBankName, bankOrt, setBankOrt, sacheinlagen, setSacheinlagen,
    wc, neuerKey, verrechnungen, setVerrechnungen, besondereVorteile, vorteile, setVorteile,
    revisorName, setRevisorName,
  } = ctx;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={fremdwaehrung ? `Aktienkapital (${waehrung}; Gegenwert mind. CHF 100'000)` : "Aktienkapital (CHF, mind. 100'000)"}>
          <input className={inputCls} inputMode="numeric" placeholder="Tausender mit Apostroph, z. B. 100'000" value={ak} onChange={(e) => setAk(e.target.value)} />
        </Field>
        <Field label="Anzahl Namenaktien">
          <input className={inputCls} inputMode="numeric" value={anzahl} onChange={(e) => setAnzahl(e.target.value)} />
        </Field>
        <Field label="Nennwert je Aktie">
          <input className={inputCls} inputMode="numeric" value={nennwert} onChange={(e) => setNennwert(e.target.value)} />
        </Field>
        <Field label="Liberierung (%, 20–100; einbezahlt mind. CHF 50'000)">
          <input className={inputCls} inputMode="numeric" value={liberierung} onChange={(e) => setLiberierung(e.target.value)} />
        </Field>
        <Field label="Ausgabebetrag je Aktie (leer = Nennwert; ein Agio ist stets voll zu leisten)">
          <input className={inputCls} inputMode="numeric" value={ausgabebetrag} onChange={(e) => setAusgabebetrag(e.target.value)} placeholder="z. B. 1'200" />
        </Field>
      </div>

      {fremdwaehrung && (
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

      {bankInUrkunde && (einlageArt === 'bar' || einlageArt === 'gemischt') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Bank (in der Urkunde genannt)">
            <input className={inputCls} value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </Field>
          <Field label="Bank-Ort">
            <input className={inputCls} value={bankOrt} onChange={(e) => setBankOrt(e.target.value)} />
          </Field>
        </div>
      )}

      {/* Etappe 2: Sacheinlagen (Art. 634 OR) */}
      {(einlageArt === 'sacheinlage' || einlageArt === 'gemischt') && (
        <div className="space-y-3">
          <p className="text-body-s font-medium text-ink-900"><NormText text={`Sacheinlagen (Art. 634 OR)`} /></p>
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
                <Field label={`Bewertung (${wc})`}>
                  <input className={inputCls} inputMode="numeric" value={s.wertChf}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, wertChf: e.target.value } : x))} />
                </Field>
                <Field label="Dafür ausgegebene Aktien">
                  <input className={inputCls} inputMode="numeric" value={s.aktienAnzahl}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, aktienAnzahl: e.target.value } : x))} />
                </Field>
                <Field label={`Gutschrift (${wc}, optional)`}>
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
                  <Field label={`Aktiven (${wc})`}>
                    <input className={inputCls} inputMode="numeric" value={s.aktivenChf}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, aktivenChf: e.target.value } : x))} />
                  </Field>
                  <Field label={`Passiven (${wc})`}>
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
      {(einlageArt === 'verrechnung' || einlageArt === 'gemischt') && (
        <div className="space-y-2">
          <p className="text-body-s font-medium text-ink-900"><NormText text={`Verrechnungsliberierung (Art. 634a OR)`} /></p>
          {verrechnungen.map((v) => (
            <div key={v.key} className="rounded-md border border-line p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                <Field label="Gläubiger:in (Name)">
                  <input className={inputCls} value={v.glaeubigerName}
                    onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, glaeubigerName: e.target.value } : x))} />
                </Field>
                <Field label={`Forderung (${wc})`}>
                  <input className={inputCls} inputMode="numeric" value={v.forderungChf}
                    onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, forderungChf: e.target.value } : x))} />
                </Field>
                <Field label="Aktien">
                  <input className={inputCls} inputMode="numeric" value={v.aktienAnzahl}
                    onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, aktienAnzahl: e.target.value } : x))} />
                </Field>
                <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                  onClick={() => setVerrechnungen((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
              </div>
              <Field label="Bestand und Verrechenbarkeit der Forderung (für den Gründungsbericht, Art. 635 Ziff. 2 OR)">
                <textarea className={inputCls} rows={2} value={v.begruendungTxt}
                  onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, begruendungTxt: e.target.value } : x))} />
              </Field>
            </div>
          ))}
          <button type="button" className="lc-btn-outline lc-btn-sm"
            onClick={() => setVerrechnungen((alt) => [...alt, { key: neuerKey(), glaeubigerName: '', forderungChf: '', aktienAnzahl: '', begruendungTxt: '' }])}>
            + Verrechnung hinzufügen
          </button>
        </div>
      )}

      {/* Etappe 2: Besondere Vorteile (Art. 636 OR) */}
      {besondereVorteile && (
        <div className="space-y-2">
          <p className="text-body-s font-medium text-ink-900"><NormText text={`Besondere Vorteile (Art. 636 OR)`} /></p>
          {vorteile.map((v) => (
            <div key={v.key} className="rounded-md border border-line p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto] gap-2 items-end">
                <Field label="Begünstigte:r (Name)">
                  <input className={inputCls} value={v.beguenstigter}
                    onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, beguenstigter: e.target.value } : x))} />
                </Field>
                <Field label={`Wert (${wc})`}>
                  <input className={inputCls} inputMode="numeric" value={v.wertChf}
                    onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, wertChf: e.target.value } : x))} />
                </Field>
                <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                  onClick={() => setVorteile((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
              </div>
              <Field label="Inhalt des Vorteils (Statuten-Pflichtinhalt, Art. 636 OR)">
                <textarea className={inputCls} rows={2} value={v.inhalt}
                  onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, inhalt: e.target.value } : x))} />
              </Field>
              <Field label="Begründung und Angemessenheit (für den Gründungsbericht, Art. 635 Ziff. 3 OR)">
                <textarea className={inputCls} rows={2} value={v.begruendungTxt}
                  onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, begruendungTxt: e.target.value } : x))} />
              </Field>
            </div>
          ))}
          <button type="button" className="lc-btn-outline lc-btn-sm"
            onClick={() => setVorteile((alt) => [...alt, { key: neuerKey(), beguenstigter: '', inhalt: '', wertChf: '', begruendungTxt: '' }])}>
            + Vorteil hinzufügen
          </button>
        </div>
      )}

      {(einlageArt !== 'bar' || besondereVorteile) && (
        <Field label="Zugelassene:r Revisor:in der Prüfungsbestätigung (Art. 635a OR; leer = Blanko)">
          <input className={inputCls} value={revisorName} onChange={(e) => setRevisorName(e.target.value)} />
        </Field>
      )}
    </div>
  );
}

export function SchrittPersonen({ ctx }: { ctx: AgSchrittCtx }) {
  const {
    gruender, setGruender, vr, setVr, neuerKey, vertretungen, setVertretungen,
    protokollfuehrer, setProtokollfuehrer, sitzungBeginn, setSitzungBeginn,
    sitzungEnde, setSitzungEnde, optingOut, rsName, setRsName, rsSitz, setRsSitz,
  } = ctx;
  return (
    <div className="space-y-4">
      {/* Gründer */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Gründer:innen und Zeichnung (Art. 629/630 OR)</p>
        {gruender.map((g) => (
          <div key={g.key} className="rounded-md border border-line p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Name">
                <input className={inputCls} value={g.name}
                  onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, name: e.target.value } : x))} />
              </Field>
              <Field label="Angaben (z. B. «von Basel, in Zürich, Musterweg 1»)">
                <input className={inputCls} value={g.angaben}
                  onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, angaben: e.target.value } : x))} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
              <Field label="Gezeichnete Aktien">
                <input className={inputCls} inputMode="numeric" value={g.anzahl}
                  onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, anzahl: e.target.value } : x))} />
              </Field>
              <Field label="Liberierung in % (leer = globaler Wert)">
                <input className={inputCls} inputMode="numeric" value={g.liberierung ?? ''}
                  onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, liberierung: e.target.value } : x))} />
              </Field>
              <button type="button" className="lc-btn-outline lc-btn-sm"
                title="Übernimmt den Namen in den Verwaltungsrat (Heimatort/Wohnort dort ergänzen)."
                disabled={!g.name.trim() || vr.some((v) => v.name.trim() === g.name.trim())}
                onClick={() => setVr((alt) => [...alt, { key: neuerKey(), name: g.name.trim(), herkunft: '', wohnort: '', adresse: '', praesident: alt.length === 0, zeichnungsArt: 'einzelunterschrift' }])}>
                → als VR-Mitglied übernehmen
              </button>
              <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                onClick={() => setGruender((alt) => alt.filter((x) => x.key !== g.key))}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="lc-btn-outline lc-btn-sm"
          onClick={() => setGruender((alt) => [...alt, { key: neuerKey(), name: '', angaben: '', anzahl: '', liberierung: '' }])}>
          + Gründer:in hinzufügen
        </button>
      </div>

      {/* Verwaltungsrat */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Verwaltungsrat (Art. 707 ff. OR)</p>
        {vr.map((v) => (
          <div key={v.key} className="rounded-md border border-line p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Field label="Name">
                <input className={inputCls} value={v.name}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, name: e.target.value } : x))} />
              </Field>
              <Field label="Heimatort / Staatsangehörigkeit">
                <input className={inputCls} value={v.herkunft}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, herkunft: e.target.value } : x))} />
              </Field>
              <Field label="Wohnort">
                <input className={inputCls} value={v.wohnort}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, wohnort: e.target.value } : x))} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Adresse (für die Wahlannahmeerklärung)">
                <input className={inputCls} value={v.adresse}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, adresse: e.target.value } : x))} />
              </Field>
              <Field label="Zeichnungsberechtigung">
                <select className={inputCls} value={v.zeichnungsArt}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, zeichnungsArt: e.target.value as AgVrZeichnungsArt } : x))}>
                  {VR_ZEICHNUNGS_OPTIONEN.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-s text-ink-700">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={v.praesident}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, praesident: e.target.checked } : x))} />
                Präsident:in
              </label>
              <label className="flex items-center gap-1.5"
                title="Die Person ist beim Beurkundungstermin anwesend und erklärt die Annahme in der Urkunde – die separate Wahlannahmeerklärung entfällt (Art. 43 Abs. 1 lit. c HRegV).">
                <input type="checkbox" checked={v.annahmeInUrkunde ?? false}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, annahmeInUrkunde: e.target.checked } : x))} />
                Annahme in der Urkunde
              </label>
              <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                onClick={() => setVr((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
            </div>
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

      {!optingOut && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Revisionsstelle (Name)">
            <input className={inputCls} value={rsName} onChange={(e) => setRsName(e.target.value)} />
          </Field>
          <Field label="Revisionsstelle (Sitz)">
            <input className={inputCls} value={rsSitz} onChange={(e) => setRsSitz(e.target.value)} />
          </Field>
        </div>
      )}
    </div>
  );
}

export function SchrittWeiteres({ ctx }: { ctx: AgSchrittCtx }) {
  const {
    eigeneBueros, rechtsdomizil, setRechtsdomizil, domizilhalterName, setDomizilhalterName,
    domizilhalterAdresse, setDomizilhalterAdresse, ort, setOrt, datum, setDatum,
    nachtragsbevollmaechtigter, setNachtragsbevollmaechtigter,
    konstituierungInUrkunde, setKonstituierungInUrkunde, domizilNurAnmeldung, setDomizilNurAnmeldung,
    immobilienHauptzweck, lkAusland, setLkAusland, lkNeuerwerb, setLkNeuerwerb,
    lkGrundstueck, setLkGrundstueck, nachtragAktiv, setNachtragAktiv,
    ntGruendungsdatum, setNtGruendungsdatum, ntUrkundeZiffer, setNtUrkundeZiffer,
    ntUrkundeText, setNtUrkundeText, ntStatutenArtikel, setNtStatutenArtikel,
    ntStatutenAbsatz, setNtStatutenAbsatz, ntStatutenText, setNtStatutenText,
  } = ctx;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {eigeneBueros ? (
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
        <label className="flex items-center gap-2"
          title="Konstituierung, Zeichnungsberechtigung und Domizil werden in der Gründungsurkunde erklärt (ZH Ziff. VII, Bedingung: VR vollzählig anwesend) – das separate VR-Protokoll entfällt.">
          <input type="checkbox" checked={konstituierungInUrkunde} onChange={(e) => setKonstituierungInUrkunde(e.target.checked)} />
          Konstituierung in der Urkunde
        </label>
        <label className="flex items-center gap-2"
          title="Das Domizil wird in der Urkunde weggelassen und steht nur in der HR-Anmeldung (ZH-Erläuterung zu Ziff. VII).">
          <input type="checkbox" checked={domizilNurAnmeldung} onChange={(e) => setDomizilNurAnmeldung(e.target.checked)} />
          Domizil nur in der Anmeldung
        </label>
      </div>

      {/* Etappe 4.3: Lex-Koller-Erklärung (Art. 18 BewG; ZH-Formular) */}
      {immobilienHauptzweck && (
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

      {/* Etappe 4.4: Gründungs-Nachtrag (ZH-Vorlage 3.4; ENTWURF) */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-body-s text-ink-700">
          <input type="checkbox" checked={nachtragAktiv} onChange={(e) => setNachtragAktiv(e.target.checked)} />
          Nachtrag zur Gründungsurkunde vorbereiten (nach Beanstandung durch die Handelsregisterbehörde)
        </label>
        {nachtragAktiv && (
          <div className="rounded-md border border-line p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Datum der Gründungsurkunde">
                <input type="date" className={inputCls} value={ntGruendungsdatum} onChange={(e) => setNtGruendungsdatum(e.target.value)} />
              </Field>
              <Field label="Geänderte Urkunden-Ziffer (z. B. III)">
                <input className={inputCls} value={ntUrkundeZiffer} onChange={(e) => setNtUrkundeZiffer(e.target.value)} />
              </Field>
            </div>
            <Field label="Neuer Wortlaut der Urkunden-Ziffer">
              <textarea className={inputCls} rows={3} value={ntUrkundeText} onChange={(e) => setNtUrkundeText(e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Geänderter Statuten-Artikel (Nr.)">
                <input className={inputCls} inputMode="numeric" value={ntStatutenArtikel} onChange={(e) => setNtStatutenArtikel(e.target.value)} />
              </Field>
              <Field label="Absatz (optional)">
                <input className={inputCls} inputMode="numeric" value={ntStatutenAbsatz} onChange={(e) => setNtStatutenAbsatz(e.target.value)} />
              </Field>
            </div>
            <Field label="Neuer Wortlaut des Statuten-Artikels">
              <textarea className={inputCls} rows={3} value={ntStatutenText} onChange={(e) => setNtStatutenText(e.target.value)} />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
