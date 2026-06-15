import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  KV_DEFAULTS, kvZusammenstellen, pruefeKvGates, type KvAntworten, type KvPreset,
} from '../lib/vorlagen/kuendigungAllgemein';
import { KDG_ZUGANGS_HINWEIS } from '../lib/vorlagen/kuendigungGemeinsam';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, inputCls } from '../components/vorlagen/ui';
import { SelectionGrid } from '../components/ui/SelectionGrid';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Allgemeine Vertragskündigung (Maske 3, Presets) ───────
// Bauspezifikation: bibliothek/recherche/kuendigungs-masken.md (6.6.2026).
// Presets setzen Norm-Anker/Bausteine/Hinweise; KEINE berechnete Frist ohne
// Spezialgesetz (§2). Arbeit/Miete verweisen auf die spezialisierten Masken.

const SPEICHER_KEY = 'lexmetrik.vorlage.kuendigung-vertrag.v1';

const SCHRITTE = [
  { id: 'typ', label: 'Vertragstyp' },
  { id: 'parteien', label: 'Parteien' },
  { id: 'vertrag', label: 'Vertrag' },
  { id: 'termin', label: 'Termin' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_KV: PdfBanner = {
  titel: 'KÜNDIGUNGSSCHREIBEN – ZU UNTERZEICHNEN UND NACHWEISBAR ZUZUSTELLEN',
  text: 'Massgebend sind Vertrag/AGB und der Zugang beim Empfänger — eingeschriebene Zustellung empfohlen. Versicherung: schriftlich oder in textnachweisbarer Form (Art. 35a VVG), Police angeben.',
};

const PRESETS: { code: KvPreset; label: string; sub: string }[] = [
  { code: 'generisch', label: 'Allgemeiner Dauervertrag', sub: 'Ohne Spezialgesetz — vertragliche/gesetzliche Frist' },
  { code: 'versicherung', label: 'Versicherung (VVG)', sub: 'Art. 35a: Ende des 3. Jahres, 3 Monate Frist' },
  { code: 'krankenkasse', label: 'Krankenkasse (Grundversicherung)', sub: 'Art. 7 KVG: Prämienmitteilung bzw. Semesterende' },
  { code: 'darlehen', label: 'Darlehen', sub: 'Art. 318: Rückzahlung innert 6 Wochen ab Aufforderung' },
  { code: 'auftrag', label: 'Auftrag / Mandat', sub: 'Art. 404: jederzeit — Achtung Unzeit' },
  { code: 'abo_telecom', label: 'Abo / Telecom', sub: 'AGB-Termine — ehrlich ohne berechnete Frist' },
];

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function VorlageKuendigungVertrag() {
  const card = karte('kuendigung-vertrag');
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<KvAntworten>({ defaults: KV_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis, rueckzahlungBis } = useMemo(() => kvZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeKvGates(a), [a]);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 1) {
      if (!a.absenderName.trim()) f.push('Eigenen Namen angeben.');
      if (!a.absenderAdresse.trim()) f.push('Eigene Adresse angeben.');
      if (!a.adressatName.trim()) f.push('Vertragspartnerin/Vertragspartner angeben.');
      if (!a.adressatAdresse.trim()) f.push('Adresse der Gegenpartei angeben.');
    }
    if (i === 2) {
      if (!a.vertragsBezeichnung.trim()) f.push('Vertrag bezeichnen (z. B. «Hausratversicherung», «Fitness-Abo»).');
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
      case 'typ': return (
        <div className="space-y-4">
          <SelectionGrid
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            items={PRESETS.map((p) => ({ code: p.code, label: p.label, sub: p.sub }))}
            value={a.preset}
            onSelect={(code) => set('preset', code)}
          />
          {/* Verweis-Presets der Spez. (arbeitsvertrag/miete_moebliert): KEINE
              eigenen Dokument-Pfade — ehrlicher Sprung zur Spezial-Maske. */}
          <div className="lc-notice text-body-s">
            Arbeitsverhältnis kündigen? → <Link to="/vorlagen/kuendigung-arbeitnehmer" className="text-brass-700 underline">Kündigung durch Arbeitnehmer:in</Link>{' '}
            bzw. <Link to="/vorlagen/kuendigung-arbeitgeber" className="text-brass-700 underline">durch Arbeitgeber:in</Link> (Fristen + Sperrfristen live). ·{' '}
            Mietverhältnis (auch möbliertes Zimmer)? → <Link to="/vorlagen/kuendigung-mieter" className="text-brass-700 underline">Kündigung durch Mieter:in</Link> (Endtermin live).
          </div>
        </div>
      );

      case 'parteien': return (
        <div className="space-y-4">
          <Field label="Ihr Name">
            <input className={inputCls} value={a.absenderName} onChange={(e) => set('absenderName', e.target.value)} placeholder="Vorname Name / Firma" />
          </Field>
          <Field label="Ihre Adresse">
            <input className={inputCls} value={a.absenderAdresse} onChange={(e) => set('absenderAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="Vertragspartnerin / Vertragspartner">
            <input className={inputCls} value={a.adressatName} onChange={(e) => set('adressatName', e.target.value)} placeholder="Firma / Name" />
          </Field>
          <Field label="Adresse der Gegenpartei">
            <input className={inputCls} value={a.adressatAdresse} onChange={(e) => set('adressatAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
        </div>
      );

      case 'vertrag': return (
        <div className="space-y-4">
          <Field label="Vertragsbezeichnung">
            <input className={inputCls} value={a.vertragsBezeichnung} onChange={(e) => set('vertragsBezeichnung', e.target.value)}
              placeholder={a.preset === 'versicherung' ? 'z. B. Hausratversicherung' : a.preset === 'krankenkasse' ? 'z. B. Grundversicherung (OKP)' : a.preset === 'darlehen' ? 'z. B. Privatdarlehen vom …' : 'z. B. Fitness-Abo'} />
          </Field>
          <Field label="Vertrags-/Kundennummer" optional>
            <input className={inputCls + ' sm:max-w-[16rem]'} value={a.vertragsnummer} onChange={(e) => set('vertragsnummer', e.target.value)} />
          </Field>
          {a.preset === 'versicherung' && (
            <div className="space-y-3">
              <Field label="Policennummer" optional>
                <input className={inputCls + ' sm:max-w-[16rem]'} value={a.policennummer} onChange={(e) => set('policennummer', e.target.value)} />
              </Field>
              <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.vertragsdauerUeber3Jahre}
                  onChange={(e) => set('vertragsdauerUeber3Jahre', e.target.checked)} />
                <span>Der Vertrag läuft bereits im dritten Jahr oder länger <span className="text-ink-500">(Voraussetzung der ordentlichen Kündigung, Art. 35a Abs. 1 VVG)</span></span>
              </label>
              <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.lebensversicherung}
                  onChange={(e) => set('lebensversicherung', e.target.checked)} />
                <span>Es handelt sich um eine Lebensversicherung <span className="text-warn-700">(vom ordentlichen Kündigungsrecht ausgenommen, Art. 35a Abs. 3 VVG)</span></span>
              </label>
              <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.krankenzusatz}
                  onChange={(e) => set('krankenzusatz', e.target.checked)} />
                <span>Zusatzversicherung zur Krankenversicherung <span className="text-ink-500">(Kündigungsrecht nur Versicherungsnehmer:in, Art. 35a Abs. 4 VVG)</span></span>
              </label>
            </div>
          )}
          {a.preset === 'krankenkasse' && (
            <div className="space-y-3">
              <Field label="Versicherten-Nummer" optional>
                <input className={inputCls + ' sm:max-w-[16rem]'} value={a.kkVersichertennummer} onChange={(e) => set('kkVersichertennummer', e.target.value)} />
              </Field>
              <Field label="Anlass der Kündigung">
                <SelectionGrid
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  items={[
                    { code: 'praemienmitteilung', label: 'Neue Prämie mitgeteilt', sub: '1 Monat auf Ende des Vormonats — der 30.-November-Fall (Art. 7 Abs. 2 KVG)' },
                    { code: 'ordentlich', label: 'Ordentliche Kündigung', sub: '3 Monate auf Semesterende 30.6./31.12. (Art. 7 Abs. 1 KVG)' },
                  ]}
                  value={a.kkGrund}
                  onSelect={(code) => set('kkGrund', code)}
                />
              </Field>
              <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.kkBesondereForm}
                  onChange={(e) => set('kkBesondereForm', e.target.checked)} />
                <span>Besondere Versicherungsform <span className="text-ink-500">(wählbare Franchise, HMO/Hausarzt/Telmed — ordentlicher Wechsel nur auf Jahresende, Art. 94 Abs. 2 KVV)</span></span>
              </label>
              <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.kkAusstaende}
                  onChange={(e) => set('kkAusstaende', e.target.checked)} />
                <span>Es bestehen offene Prämien, Kostenbeteiligungen oder Betreibungskosten <span className="text-warn-700">(Wechselsperre, Art. 64a Abs. 6 KVG)</span></span>
              </label>
            </div>
          )}
          {a.preset === 'darlehen' && (
            <Field label="Datum der (ersten) Rückzahlungs-Aufforderung" optional hint="leer = Datum dieses Schreibens; daraus rechnet sich die 6-Wochen-Frist (Art. 318 OR)">
              <DatumsFeld value={a.aufforderungDatum} onChange={(v) => set('aufforderungDatum', v)} className={inputCls} />
            </Field>
          )}
          {a.preset === 'darlehen' && rueckzahlungBis && (
            <div className="lc-tile">
              <p className="lc-overline">Rückzahlung bis</p>
              <p className="text-h2 font-display font-semibold text-ink-900 leading-none num">{rueckzahlungBis}</p>
              <p className="text-body-s text-ink-600 mt-1.5">Sechs Wochen ab Aufforderung (Art. 318 OR) — reine Datums-Addition, vertragliche Regelungen gehen vor.</p>
            </div>
          )}
        </div>
      );

      case 'termin': return (
        <div className="space-y-4">
          <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.aufNaechstmoeglich}
              onChange={(e) => set('aufNaechstmoeglich', e.target.checked)} />
            <span>Auf den <strong>nächstmöglichen Termin</strong> kündigen <span className="text-ink-500">(empfohlen — kein Risiko eines verfehlten Wunschtermins)</span></span>
          </label>
          {!a.aufNaechstmoeglich && (
            <Field label="Gewünschter Kündigungstermin">
              <DatumsFeld value={a.kuendigungsterminWunsch} onChange={(v) => set('kuendigungsterminWunsch', v)} className={inputCls} />
            </Field>
          )}
          <Field label="Erwarteter Zugang" optional hint="für Ihre eigene Fristkontrolle — der Brief nennt ihn nicht">
            <DatumsFeld value={a.zugang} onChange={(v) => set('zugang', v)} className={inputCls} />
          </Field>
          <div className="lc-notice text-body-s">{KDG_ZUGANGS_HINWEIS}</div>
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
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Unterschreiben und nachweisbar zustellen</strong> — eingeschrieben empfohlen; massgebend ist der Zugang.</li>
              <li><strong>Vertrag/AGB prüfen:</strong> Mindestlaufzeiten und Termine gehen diesem Schreiben vor{a.preset === 'versicherung' ? ' (Art. 35a VVG: Abweichungen nur zu Ihren Gunsten, Art. 98 VVG)' : ''}.</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Diese Maske berechnet keine Frist, wo kein Gesetz eine vorgibt — massgebend sind mein Vertrag und dessen Termine.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Kündigung als PDF', banner: BANNER_KV, dateiName: 'Kuendigung-Vertrag.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Kündigung als Word (DOCX)', banner: BANNER_KV, dateiName: 'Kuendigung-Vertrag.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Vertrag & Forderung (OR)'} · Vorlage`}
      titel="Vertrag kündigen (Versicherung · Krankenkasse · Darlehen · Auftrag · Abo)"
      intro="EIN Kündigungsschreiben mit Vertragstyp-Presets: Versicherung nach Art. 35a VVG, Krankenkassen-Grundversicherung nach Art. 7 KVG (Prämienmitteilung bzw. Semesterende, Wortlaute verifiziert), Darlehen mit 6-Wochen-Frist (Art. 318 OR), Auftrag mit Unzeit-Warnung (Art. 404 OR), Abo/Telecom ehrlich nach AGB. Wo kein Gesetz eine Frist vorgibt, wird keine erfunden."
      norms={card?.norms ?? []}
      badge="Zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_KV, dateiName: 'Kuendigung-Vertrag.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_KV, dateiName: 'Kuendigung-Vertrag.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
