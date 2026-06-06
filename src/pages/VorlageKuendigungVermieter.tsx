import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { berechneMietkuendigung } from '../lib/mietrecht';
import type { Mietobjekt } from '../types/mietrecht';
import type { Kanton } from '../types/legal';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, NormLink, inputCls } from '../components/vorlagen/ui';
import { KANTONE } from '../lib/kantone';
import { PflichtDisclaimer } from '../components/PflichtDisclaimer';
import { useLocale, fedlexLokalisiert } from '../components/locale';
import { karte } from '../lib/startseiteConfig';

// ─── Maske 2b: Vermieter-Kündigung — CHECKLISTE, bewusst KEINE Vollvorlage ──
// Bauspezifikation: bibliothek/recherche/kuendigungs-masken.md (§8-Grenze):
// Die Vermieterkündigung von Wohn-/Geschäftsräumen ist NUR mit dem vom
// Kanton genehmigten amtlichen Formular gültig (Art. 266l Abs. 2 OR); ein
// frei formuliertes Schreiben ist nichtig (Art. 266o). LexMetrik kann das
// amtliche Formular weder ersetzen noch nachbilden → ehrliche Checkliste
// mit Termin-/Fristen-AUSKUNFT aus der Mietengine (partei 'vermieter') —
// als Information, nicht als Dokument. Keine Rechtslogik hier (§3).

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function VorlageKuendigungVermieter() {
  const card = karte('kuendigung-vermieter');
  const { locale } = useLocale();
  const [objekt, setObjekt] = useState<Mietobjekt>('wohnung');
  const [kanton, setKanton] = useState<Kanton | ''>('');
  const [zugang, setZugang] = useState('');

  // Reine AUSKUNFT (amtlichesFormular: true unterstellt — die Checkliste
  // verlangt es ohnehin als Punkt 1; Familienwohnungs-Zustellung separat).
  const auskunft = useMemo(() => {
    if (!ISO.test(zugang) || kanton === '') return null;
    try {
      return berechneMietkuendigung({
        kuendigungsart: 'ordentlich', objekt, zugang, kanton,
        partei: 'vermieter', terminQuelle: 'ortsueblich',
        amtlichesFormular: true, separateZustellung: true,
      });
    } catch {
      return null;
    }
  }, [objekt, kanton, zugang]);

  return (
    <div className="space-y-6">
      <Link to="/pro" className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600">
        <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-surface">←</span>
        Zurück zum Katalog
      </Link>
      <div className="space-y-3">
        <p className="lc-overline">Miete · Checkliste</p>
        <h1 className="text-h1 font-display font-semibold text-ink-900">Kündigung durch Vermieter:in</h1>
        <p className="text-body-l text-ink-600 max-w-reading">
          Bewusst KEINE ausfüllbare Vorlage: Die Vermieter-Kündigung von Wohn- und Geschäftsräumen ist nur
          mit dem vom Kanton genehmigten amtlichen Formular gültig — ein frei formuliertes Schreiben wäre
          nichtig. Diese Checkliste führt durch die Gültigkeitsvoraussetzungen; Termin und Fristen liefert
          der Rechner als Auskunft.
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {(card?.norms ?? []).map((n) => (
            <a key={n.label} href={fedlexLokalisiert(n.url, locale)} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">{n.label}</a>
          ))}
          <span className="lc-badge lc-badge-warn">Checkliste — kein Export</span>
        </div>
      </div>

      <PflichtDisclaimer />

      <section className="lc-card p-5 sm:p-6 space-y-4">
        <p className="lc-overline">Gültigkeits-Checkliste</p>
        <ol className="space-y-3 text-body-s text-ink-700 list-decimal pl-5">
          <li>
            <strong>Amtliches Formular des Kantons verwenden</strong> (<NormLink artikel="Art. 266l OR" /> Abs. 2):
            das vom Kanton genehmigte Kündigungsformular mit Rechtsmittelbelehrung — erhältlich bei der
            kantonalen Schlichtungsbehörde. Ohne Formular ist die Kündigung NICHTIG (<NormLink artikel="Art. 266o OR" />).
            Die zuständige Stelle Ihres Kantons finden Sie im <Link to="/rechner/zustaendigkeit" className="text-brass-700 underline">Zuständigkeitsrechner</Link>.
          </li>
          <li>
            <strong>Familienwohnung: separat an BEIDE zustellen</strong> (<NormLink artikel="Art. 266n OR" />):
            Kündigung (und eine allfällige Zahlungsfrist-Androhung nach Art. 257d) der Mieterin/dem Mieter
            UND dem Ehegatten bzw. der eingetragenen Partnerin/dem Partner in separaten Sendungen zustellen —
            Verstoss führt zur Nichtigkeit (Art. 266o).
          </li>
          <li>
            <strong>Termin und Frist einhalten</strong> — unten als Auskunft berechenbar; massgebend ist der
            ZUGANG bei den Empfänger:innen (eingeschrieben empfohlen).
          </li>
          <li>
            <strong>Begründung:</strong> auf Verlangen anzugeben; die Kündigung ist anfechtbar, wenn sie gegen
            Treu und Glauben verstösst (<NormLink artikel="Art. 271 OR" /> ff.) — die Mieterschaft kann innert
            30 Tagen anfechten und Erstreckung verlangen (Fristen unten in der Auskunft).
          </li>
        </ol>
      </section>

      <section className="lc-card p-5 sm:p-6 space-y-4">
        <p className="lc-overline">Termin- und Fristen-Auskunft (Mietengine)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Objektart">
            <select className={inputCls} value={objekt} onChange={(e) => setObjekt(e.target.value as Mietobjekt)}>
              <option value="wohnung">Wohnung</option>
              <option value="geschaeftsraum">Geschäftsraum</option>
              <option value="unbewegliche_sache">Übrige unbewegliche Sache</option>
            </select>
          </Field>
          <Field label="Kanton">
            <select className={inputCls} value={kanton} onChange={(e) => setKanton(e.target.value as Kanton | '')}>
              <option value="">– wählen –</option>
              {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Erwarteter Zugang">
            <DatumsFeld value={zugang} onChange={setZugang} className={inputCls} />
          </Field>
        </div>
        {auskunft && auskunft.status !== 'nichtig' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="lc-tile">
              <p className="lc-overline mb-1">Wirksamer Endtermin</p>
              <p className="num text-body-l font-semibold text-ink-900">{auskunft.endtermin ?? '–'}</p>
              {auskunft.verfehlterTermin && <p className="text-xs text-warn-700 mt-1">Wunschtermin verfehlt — nächstmöglicher gilt (Art. 266a Abs. 2).</p>}
            </div>
            <div className="lc-tile">
              <p className="lc-overline mb-1">Anfechtung möglich bis</p>
              <p className="num text-body-l text-ink-900">{auskunft.anfechtungBis ?? '–'}</p>
              <p className="text-xs text-ink-500 mt-1">30 Tage ab Empfang (Art. 273 Abs. 1 OR)</p>
            </div>
            <div className="lc-tile">
              <p className="lc-overline mb-1">Erstreckungsbegehren bis</p>
              <p className="num text-body-l text-ink-900">{auskunft.erstreckungBis ?? '–'}</p>
              <p className="text-xs text-ink-500 mt-1">Art. 273 Abs. 2 lit. a OR</p>
            </div>
          </div>
        )}
        <p className="text-xs text-ink-500">
          Ortsübliche Termine sind eine Tatfrage des konkreten Ortes; vertragliche Termine gehen vor.
          Vertiefte Berechnung (alle Kündigungsarten, Zahlungsverzug Art. 257d):{' '}
          <Link to="/rechner/mietrecht" className="text-brass-700 underline">Mietrecht-Fristenrechner</Link>.
        </p>
      </section>
    </div>
  );
}
