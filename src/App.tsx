import { useState } from 'react';
import { LohnfortzahlungForm } from './components/forms/LohnfortzahlungForm';
import { KuendigungSperrForm } from './components/forms/KuendigungSperrForm';
import { KombinierteAnsicht } from './components/forms/KombinierteAnsicht';

type Tab = 'a' | 'b_c' | 'kombiniert';

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: 'a',          label: 'A – Lohnfortzahlung',    sub: 'Art. 324a OR' },
  { id: 'b_c',        label: 'B+C – Kündigung',        sub: 'Art. 335c / 336c OR' },
  { id: 'kombiniert', label: 'Kombiniert',              sub: 'A + B + C' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('a');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Beta</span>
                <span className="text-xs text-slate-500">Swiss Legal Calc</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Arbeitsrecht – Fristen &amp; Lohnfortzahlung</h1>
              <p className="text-sm text-slate-500 mt-1">
                Modul 1: Lohnfortzahlung (Art. 324a OR) · Kündigungsfristen (Art. 335c OR) · Sperrfristen (Art. 336c OR)
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs text-slate-400 font-mono">Orientierungsberechnung</p>
              <p className="text-xs text-slate-400">Keine Rechtsberatung</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-8 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="block">{t.label}</span>
              <span className="block text-xs font-normal opacity-70">{t.sub}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {tab === 'a' && <LohnfortzahlungForm />}
          {tab === 'b_c' && <KuendigungSperrForm />}
          {tab === 'kombiniert' && <KombinierteAnsicht />}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '⚖', title: 'Normentreue', body: 'Nur explizit genannte, geprüfte OR-Artikel werden fest verdrahtet. Aktenzeichen tragen Verifikations-Vorbehalt.' },
            { icon: '📋', title: 'Audit-Trail', body: 'Jeder Rechenschritt trägt Beschreibung, Zwischenergebnis und Normverweis. Vollständig im PDF-Rechenbericht.' },
            { icon: '🔒', title: 'Clientseitig', body: 'Alle Berechnungen lokal im Browser. Keine Daten werden übertragen. Deterministisch, offline-fähig.' },
          ].map((card) => (
            <div key={card.title} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-2xl mb-2">{card.icon}</div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{card.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-slate-800 rounded-xl p-5 text-slate-300">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Weitere Module geplant</p>
          <div className="flex flex-wrap gap-2">
            {['Verzugszins (Art. 104 OR)', 'Erbquoten / Pflichtteil (Revision 2023)', 'ZPO-Fristen (Art. 145 ZPO)', 'Mietrecht – Fristen'].map((m) => (
              <span key={m} className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">{m}</span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Hinweis: Basel-Stadt und Basel-Landschaft kennen keine Gerichtsferien nach Art. 145 ZPO (relevant für das ZPO-Fristen-Modul).
          </p>
        </div>
      </main>
    </div>
  );
}
