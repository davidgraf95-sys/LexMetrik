import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EinfacheFristForm } from '../forms/EinfacheFristForm';
import { FristenKalender } from './FristenKalender';
import { ProzesskostenForm } from '../forms/ProzesskostenForm';
import { GebvKostenForm } from '../forms/GebvKostenForm';
import { NotariatGrundbuchForm } from '../forms/NotariatGrundbuchForm';
import { ZustaendigkeitForm } from '../forms/ZustaendigkeitForm';

// ─── Schnellrechner der Startseite (Startseite V2) ──────────────────────────
//
// Hostet die ECHTEN Rechner-Formulare der App (§5/§10 — keine Duplikation, keine
// eigene Rechtslogik §1/§3): Fristen = allgemeiner Fristenrechner (Ferien/Ver-
// fahren + Kanton), Gebühren = Prozess/Betreibung/Notariat per Auswahl,
// Zuständigkeit = Zivilprozess-Zuständigkeit. Jeder Tab verweist zusätzlich
// ausführlich auf den jeweiligen Voll-Rechner mit dem ganzen Funktionsumfang.

type Tab = 'fristen' | 'gebuehren' | 'zustaendigkeit';

const TABS: { id: Tab; label: string }[] = [
  { id: 'fristen', label: 'Fristen' },
  { id: 'gebuehren', label: 'Gebühren' },
  { id: 'zustaendigkeit', label: 'Zuständigkeit' },
];

// Gebühren-Unterauswahl als Segment-Buttons (ein Klick statt Select-Aufklappen,
// Auftrag David «weniger Klicks bis zum Resultat»). Der Grundstückkauf läuft
// SCHLANK (NotariatGrundbuchForm minimal: Kanton + Kaufpreis + Steuer); der
// volle Notariats-/Grundbuchrechner ist verlinkt («auf richtigen verweisen»).
type GebuehrenArt = 'prozess' | 'betreibung' | 'grundstueck';
const GEBUEHREN: { id: GebuehrenArt; kurz: string; href: string; rechner: string; was: string }[] = [
  { id: 'prozess', kurz: 'Prozesskosten', href: '/rechner/prozesskosten', rechner: 'Prozesskostenrechner', was: 'Modifikatoren, Vorschuss, Kostenrisiko, Rechenweg' },
  { id: 'betreibung', kurz: 'Betreibung', href: '/rechner/betreibungskosten', rechner: 'Betreibungskostenrechner', was: 'alle Gebührenarten, Rechenweg' },
  { id: 'grundstueck', kurz: 'Grundstückkauf', href: '/rechner/notariat-grundbuch', rechner: 'Notariats-/Grundbuchrechner', was: 'Grundpfand, Handänderungssteuer, interkantonaler Vergleich, PDF' },
];

// Ausführlicher Verweis auf den jeweiligen Voll-Rechner (Auftrag David).
function VollRechnerHinweis({ href, name, was }: { href: string; name: string; was: string }) {
  return (
    <p className="text-body-s text-ink-500 mt-1">
      Mehr Optionen ({was}) im{' '}
      <Link to={href} className="font-medium text-brass-700 hover:text-brass-600 no-underline">{name} →</Link>
    </p>
  );
}

function GebuehrenTab() {
  const [art, setArt] = useState<GebuehrenArt>('prozess');
  const aktiv = GEBUEHREN.find((g) => g.id === art)!;
  return (
    <div className="space-y-4">
      {/* Segment-Buttons: ein Klick wählt die Gebührenart (weniger Klicks). */}
      <div role="tablist" aria-label="Gebührenart" className="inline-flex flex-wrap gap-0.5 rounded-lg border border-line bg-surface p-0.5">
        {GEBUEHREN.map((g) => {
          const an = g.id === art;
          return (
            <button key={g.id} type="button" role="tab" aria-selected={an} onClick={() => setArt(g.id)}
              className={`px-3 py-1.5 text-body-s font-medium rounded-md transition-colors ${
                an ? 'bg-brass-100 text-brass-800' : 'text-ink-600 hover:text-ink-900'
              }`}>
              {g.kurz}
            </button>
          );
        })}
      </div>
      {art === 'prozess' && <ProzesskostenForm />}
      {art === 'betreibung' && <GebvKostenForm />}
      {art === 'grundstueck' && <NotariatGrundbuchForm minimal />}
      <VollRechnerHinweis href={aktiv.href} name={aktiv.rechner} was={aktiv.was} />
    </div>
  );
}

export function Schnellrechner() {
  const [tab, setTab] = useState<Tab>('fristen');
  return (
    <div className="lc-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-line">
        <span className="lc-overline text-ink-500">Schnell rechnen</span>
        <span className="lc-live lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>live hergeleitet</span>
      </div>
      <div role="tablist" aria-label="Schnellrechner" className="flex gap-1 px-3 pt-3">
        {TABS.map((t) => {
          const an = t.id === tab;
          return (
            <button key={t.id} type="button" role="tab" aria-selected={an}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-3 py-2.5 text-body-s font-medium rounded-t-md border-b-2 transition-colors ${
                an ? 'text-ink-900 border-brass-500 bg-surface-raised' : 'text-ink-600 border-transparent hover:text-ink-900'
              }`}>
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="p-5">
        {tab === 'fristen' && (
          <div className="space-y-4">
            {/* Zwei Hälften (Auftrag David): links rechnen (Ferien-Wahl), rechts
                der Fristen-Kalender als Monatsansicht — dieselbe Engine. */}
            <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
              <div className="space-y-2">
                <span className="lc-overline text-ink-500">Berechnen</span>
                <EinfacheFristForm minimal />
              </div>
              <div className="space-y-2 lg:border-l lg:border-line lg:pl-5">
                <span className="lc-overline text-ink-500">Kalender-Ansicht</span>
                <FristenKalender />
              </div>
            </div>
            <VollRechnerHinweis href="/rechner/tagerechner" name="Fristenrechner" was="Rückwärts, Zwischenfrist, ZPO/SchKG-Verfeinerung" />
          </div>
        )}
        {tab === 'gebuehren' && <GebuehrenTab />}
        {tab === 'zustaendigkeit' && (
          <div className="space-y-4">
            <ZustaendigkeitForm />
            <VollRechnerHinweis href="/rechner/zustaendigkeit" name="Zuständigkeitsrechner" was="örtliche Zuständigkeit, Weichen, Rechenweg" />
          </div>
        )}
      </div>
    </div>
  );
}
