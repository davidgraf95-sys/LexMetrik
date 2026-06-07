import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { agGruendungsunterlagen, type EinlageArt, type Phase } from '../lib/gruendungsunterlagen';
import { Field, NormLink, inputCls } from '../components/vorlagen/ui';
import { AgDokumentmappe } from '../components/vorlagen/AgDokumentmappe';
import { PflichtDisclaimer } from '../components/PflichtDisclaimer';
import { useLocale, fedlexLokalisiert } from '../components/locale';
import { karte } from '../lib/startseiteConfig';

// ─── Maske: AG-Gründung — Checkliste + Dokumentmappe (Plan 9b, 7.6.2026) ─────
// Checkliste: deterministische Unterlagenliste (lib/gruendungsunterlagen.ts,
// Art. 43/44 HRegV). Dokumentmappe: Volldokumente aus denselben Weichen —
// Statuten/Errichtungsakt als ENTWURF (Beurkundungszwang Art. 629 OR, §8),
// Wahlannahmen/VR-Protokoll/HR-Anmeldung druckfertig. Wortlaut-Grundlage:
// bibliothek/recherche/gruendungsdokumente-wortlaute.md. Keine Rechtslogik
// hier (§3) — alles in lib/vorlagen/gruendungAgDokumente.ts.

const PHASEN: { id: Phase; titel: string; lead: string }[] = [
  { id: 'vorbereitung', titel: '1 · Vor dem Notariatstermin', lead: 'Beschaffen bzw. erstellen — die Urkundsperson muss diese Belege beim Termin vorliegen haben (Art. 631 OR).' },
  { id: 'beurkundung', titel: '2 · Beurkundung', lead: 'Entsteht beim Notariat; Wahlannahmen können direkt in der Urkunde erklärt werden.' },
  { id: 'anmeldung', titel: '3 · Handelsregister-Anmeldung', lead: 'Einreichung aller Belege nach Art. 43 HRegV.' },
  { id: 'nachEintrag', titel: '4 · Nach dem Eintrag', lead: 'Pflichten ab Rechtspersönlichkeit (Art. 643 OR).' },
];

const ERSTELLER_LABEL = { gruender: 'Gründer:innen', notariat: 'Notariat', bank: 'Bank', revisor: 'Revisor:in' } as const;

const CHF = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 });

export function VorlageAgGruendung() {
  const card = karte('ag-gruendung');
  const { locale } = useLocale();

  const [einlageArt, setEinlageArt] = useState<EinlageArt>('bar');
  const [besondereVorteile, setBesondereVorteile] = useState(false);
  const [optingOut, setOptingOut] = useState(true);
  const [eigeneBueros, setEigeneBueros] = useState(true);
  const [immobilienHauptzweck, setImmobilienHauptzweck] = useState(false);
  const [inhaberaktien, setInhaberaktien] = useState(false);
  const [fremdwaehrung, setFremdwaehrung] = useState(false);
  const [bankInUrkunde, setBankInUrkunde] = useState(true);
  const [chVertretung, setChVertretung] = useState(true);
  const [leistungen, setLeistungen] = useState('');

  const eingaben = useMemo(() => {
    const betrag = Number(leistungen.replace(/['’\s]/g, ''));
    return {
      einlageArt,
      besondereVorteile,
      optingOut,
      eigeneBueros,
      immobilienHauptzweck,
      inhaberaktien,
      fremdwaehrung,
      bankInUrkundeGenannt: bankInUrkunde,
      chWohnsitzVertretung: chVertretung,
      leistungenChf: leistungen.trim() === '' || Number.isNaN(betrag) ? undefined : betrag,
    };
  }, [einlageArt, besondereVorteile, optingOut, eigeneBueros, immobilienHauptzweck, inhaberaktien, fremdwaehrung, bankInUrkunde, chVertretung, leistungen]);

  const ergebnis = useMemo(() => agGruendungsunterlagen(eingaben), [eingaben]);

  return (
    <div className="space-y-6">
      <Link to="/pro" className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600">
        <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-surface">←</span>
        Zurück zum Katalog
      </Link>
      <div className="space-y-3">
        <p className="lc-overline">Gesellschaftsrecht · Checkliste</p>
        <h1 className="text-h1 font-display font-semibold text-ink-900">AG-Gründungsunterlagen</h1>
        <p className="text-body-l text-ink-600 max-w-reading">
          Checkliste UND Dokumentmappe: Die Checkliste leitet die registerrechtlich verlangten
          Belege (abschliessend in Art. 43/44 HRegV, Art. 620 ff. OR) aus Ihrer
          Gründungs-Konstellation ab. Die Dokumentmappe erzeugt daraus bei der Bargründung mit
          Namenaktien die Dokumente direkt — Statuten und Errichtungsakt als ENTWURF für die
          Urkundsperson (die öffentliche Beurkundung bleibt zwingend), Wahlannahmen,
          VR-Konstituierungsprotokoll und Handelsregister-Anmeldung druckfertig.
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {(card?.norms ?? []).map((n) => (
            <a key={n.label} href={fedlexLokalisiert(n.url, locale)} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">{n.label}</a>
          ))}
          <span className="lc-badge lc-badge-warn">Checkliste + Dokumentmappe (Urkunde als Entwurf)</span>
        </div>
      </div>

      <PflichtDisclaimer />

      <section className="lc-card p-5 sm:p-6 space-y-4">
        <p className="lc-overline">Gründungs-Konstellation</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <Field label="Leistungen der Aktionäre (CHF, optional)">
            <input className={inputCls} inputMode="numeric" placeholder="z. B. 100000" value={leistungen} onChange={(e) => setLeistungen(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-body-s text-ink-700">
          <label className="flex items-center gap-2"><input type="checkbox" checked={besondereVorteile} onChange={(e) => setBesondereVorteile(e.target.checked)} /> Besondere Vorteile für Gründer/Dritte</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={inhaberaktien} onChange={(e) => setInhaberaktien(e.target.checked)} /> Inhaberaktien vorgesehen</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!eigeneBueros} onChange={(e) => setEigeneBueros(!e.target.checked)} /> c/o-Adresse (kein eigenes Büro)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={immobilienHauptzweck} onChange={(e) => setImmobilienHauptzweck(e.target.checked)} /> Immobilien-Haupttätigkeit</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={fremdwaehrung} onChange={(e) => setFremdwaehrung(e.target.checked)} /> Aktienkapital in Fremdwährung</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!bankInUrkunde} onChange={(e) => setBankInUrkunde(!e.target.checked)} /> Bank wird in der Urkunde NICHT genannt</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={chVertretung} onChange={(e) => setChVertretung(e.target.checked)} /> Vertretungsberechtigte Person mit CH-Wohnsitz vorhanden</label>
        </div>
      </section>

      {ergebnis.blocker.map((b) => (
        <div key={b} className="lc-notice-warn">
          <p className="text-body-s font-medium">Eintragungshindernis</p>
          <p className="text-body-s">{b}</p>
        </div>
      ))}

      {PHASEN.map((ph) => {
        const zeilen = ergebnis.unterlagen.filter((x) => x.phase === ph.id);
        if (zeilen.length === 0) return null;
        return (
          <section key={ph.id} className="lc-card p-5 sm:p-6 space-y-3">
            <div>
              <p className="lc-overline">{ph.titel}</p>
              <p className="text-body-s text-ink-500">{ph.lead}</p>
            </div>
            <ul className="space-y-3">
              {zeilen.map((z) => (
                <li key={z.id} className="border-b border-line last:border-b-0 pb-3 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body-s font-medium text-ink-900">{z.titel}</span>
                    <NormLink artikel={z.norm} />
                    <span className="lc-chip">{ERSTELLER_LABEL[z.ersteller]}</span>
                    {z.ausgeloestDurch && <span className="lc-chip">wegen: {z.ausgeloestDurch}</span>}
                  </div>
                  {z.hinweis && <p className="text-xs text-ink-500 mt-1 max-w-reading">{z.hinweis}</p>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="lc-card p-5 sm:p-6 space-y-3">
        <p className="lc-overline">Kosten (Bund) und Hinweise</p>
        <ul className="lc-list space-y-2 text-body-s text-ink-700">
          <li>
            <span className="font-medium text-ink-900">Handelsregister-Gebühr: CHF 420</span> (GebV-HReg, SR 221.411.1, Anhang Ziff. 1.3 «Kapitalgesellschaften», Stand 1.1.2021) — zuzüglich allfälliger Zuschläge bis 50 % und Auslagen (Art. 3/4 GebV-HReg).
          </li>
          {ergebnis.emissionsabgabeChf !== null && (
            <li>
              <span className="font-medium text-ink-900">Emissionsabgabe: {CHF.format(ergebnis.emissionsabgabeChf)}</span> — 1 % des CHF 1 Mio. übersteigenden Teils der Leistungen (Art. 8 Abs. 1 und Art. 6 Abs. 1 lit. h StG); Bemessung mindestens zum Nennwert, Sachen zum Verkehrswert.
            </li>
          )}
          <li>
            Notariatsgebühren sind kantonal geregelt (z. B. BE: Gebührenverordnung BSG 169.81) und hier bewusst nicht beziffert; Bank-Sperrkonto je nach Institut (Praxisbeispiel ZKB: 0,5 ‰, mind. CHF 250).
          </li>
          {ergebnis.hinweise.map((h) => (
            <li key={h.slice(0, 40)}>{h}</li>
          ))}
        </ul>
        <p className="text-xs text-ink-500">
          Amtliche Vorlagen-Suite des HRegA Zürich: Musterstatuten (kurz/lang), VR-Protokoll, Wahlannahme-,
          Domizilannahmeerklärung und Unterschriftenblatt (zh.ch, notariate-zh.ch); Lex-Koller-Formular beim
          jeweiligen kantonalen Handelsregisteramt; elektronischer Weg über EasyGov (die Beurkundung bleibt beim Notariat).
          Vergleich der Unterlagen mit der GmbH:{' '}
          <Link to="/vorlagen/gmbh-gruendung" className="text-brass-700 underline">GmbH-Gründungsunterlagen</Link>.
        </p>
      </section>

      {/* Ausbaustufe 9b (7.6.2026): Volldokumente aus denselben Weichen */}
      <AgDokumentmappe weichen={eingaben}
        docxErlaubt={card?.modus === 'vorlage' && (card.output?.includes('docx') ?? false)} />
    </div>
  );
}
