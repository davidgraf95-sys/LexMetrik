import { useState } from 'react';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { KANTONE } from '../lib/kantone';
import { KANTON_NAMEN } from '../data/tarif/typen';
import type { Kanton } from '../types/legal';
import { useEinstellungen, setzeEinstellung } from '../lib/einstellungen';
import { DETAILGRAD_OPTIONEN } from '../lib/vorlagen/detailgrad';
import { speichereThema, wendeThemaAn, systemThema, useThemaWahl, type ThemaWahl } from '../components/thema';
import { useAusgabeStil, setAusgabeStil } from '../components/vorlagen/ausgabeStil';

// ─── Rubrik «Einstellungen» (Auftrag David) ─────────────────────────────────
//
// Aggregierende View über die Nutzer-Defaults — der EINE Ort, an dem man sie
// pflegt (§5). Eigene Werte (Standard-Kanton, Profil, Vorlagen-Detailgrad) im
// Store lib/einstellungen.ts; Theme/Stil/Rechtsprechungs-Ansicht werden in ihre
// bestehenden Stores GEBRÜCKT, nicht dupliziert. Reine Darstellung (§3).

// Segmentierte Auswahl (Token-konform, voller Zustands-Matrix §13/F4).
function Segment<T extends string>({ wert, optionen, onWahl, label }: {
  wert: T; optionen: { id: T; label: string; sub?: string }[]; onWahl: (id: T) => void; label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {optionen.map((o) => {
        const aktiv = o.id === wert;
        return (
          <button key={o.id} type="button" aria-pressed={aktiv} onClick={() => onWahl(o.id)}
            className={`rounded-lg border px-3.5 py-2 text-left transition-colors ${
              aktiv ? 'border-brass-500 bg-brass-100/60 text-brass-800' : 'border-line bg-surface text-ink-700 hover:border-brass-300 hover:text-ink-900'
            }`}>
            <span className="block text-body-s font-medium">{o.label}</span>
            {o.sub && <span className="block text-xs text-ink-500">{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Zeile({ titel, hinweis, children }: { titel: string; hinweis?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 border-t border-line pt-5 first:border-t-0 first:pt-0">
      <p className="text-body-s font-medium text-ink-800">{titel}</p>
      {hinweis && <p className="text-xs text-ink-500 max-w-reading">{hinweis}</p>}
      <div className="pt-1">{children}</div>
    </div>
  );
}

// Direkter Bezug auf die Rechtsprechungs-Keys (Spiegel der Komponenten-Keys —
// die Seite ist die zentrale Pflegestelle; wirkt beim nächsten Besuch der Ansicht).
const DICHTE_KEY = 'rsp:dichte';
const FS_KEY = 'rsp-fs-idx';
const FS_LABELS = ['Klein', 'Normal', 'Gross', 'Sehr gross'];

// Gesamt-Reset über PRÄFIX statt Allowlist (Bug-Fix 26.6.2026): eine hartcodierte
// Liste verfehlte ~17 Vorlagen-Entwurf-Keys (`lexmetrik.vorlage.*`) und veraltete
// bei jeder neuen Vorlage. Alle App-Keys tragen ein bekanntes Präfix.
const RESET_PRAEFIXE = ['lexmetrik', 'rsp:', 'rsp-'];

function leseKey(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function schreibeKey(key: string, wert: string): void {
  try { localStorage.setItem(key, wert); } catch { /* privat-Modus */ }
}

export function Einstellungen() {
  const e = useEinstellungen();
  const stil = useAusgabeStil();
  // Theme aus dem geteilten Store (synchron mit dem Topbar-Umschalter); Rechtsprechungs-
  // Ansicht lokal (clientseitig, opt-in).
  const themaWahl: ThemaWahl = useThemaWahl() ?? 'auto';
  const [dichte, setDichte] = useState<string>(() => leseKey(DICHTE_KEY, 'liste'));
  const [fsIdx, setFsIdx] = useState<string>(() => leseKey(FS_KEY, '1'));

  const themaSetzen = (w: ThemaWahl) => {
    speichereThema(w); // benachrichtigt Store → Segment + Topbar synchron
    wendeThemaAn(w === 'auto' ? systemThema() : w);
  };

  const reset = () => {
    if (!window.confirm('Alle gespeicherten Einstellungen, Reiter, Favoriten und Vorlagen-Entwürfe zurücksetzen? Das kann nicht rückgängig gemacht werden.')) return;
    try {
      // Rückwärts iterieren (removeItem verschiebt die Indizes); alles mit einem
      // App-Präfix löschen — deckt ALLE Einstellungen/Reiter/Favoriten/Vorlagen-
      // Entwürfe/Zeiterfassung ab, ohne fragile Allowlist (Bug-Fix 26.6.).
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && RESET_PRAEFIXE.some((p) => k.startsWith(p))) localStorage.removeItem(k);
      }
    } catch { /* privat-Modus */ }
    window.location.reload();
  };

  return (
    <div className="max-w-[44rem] space-y-8">
      <SeitenKopf overline="Persönlich" titel="Einstellungen"
        intro="Standardwerte für die ganze Seite — sie werden lokal in diesem Browser gespeichert, nie übermittelt." />

      <section className="lc-card p-5 sm:p-6 space-y-5">
        <Zeile titel="Standard-Kanton" hinweis="Wird in Fristen- und Gebührenrechnern vorgewählt (ein Permalink oder eine eigene Wahl im Formular geht weiter vor).">
          <select aria-label="Standard-Kanton" value={e.standardKanton}
            onChange={(ev) => setzeEinstellung('standardKanton', ev.target.value as Kanton)}
            className="lc-input w-full max-w-xs">
            {KANTONE.map((k) => <option key={k} value={k}>{KANTON_NAMEN[k]} ({k})</option>)}
          </select>
        </Zeile>

        <Zeile titel="Profil (Name & Adresse)" hinweis="Optional. Füllt passende Absender-/Verfasser-Felder in Vorlagen vor. Leere Felder bleiben leer.">
          <div className="space-y-2 max-w-md">
            <input type="text" aria-label="Name" placeholder="Name / Kanzlei"
              value={e.profilName} onChange={(ev) => setzeEinstellung('profilName', ev.target.value)}
              className="lc-input w-full" />
            <textarea aria-label="Adresse" placeholder="Adresse (Strasse, PLZ Ort)" rows={2}
              value={e.profilAdresse} onChange={(ev) => setzeEinstellung('profilAdresse', ev.target.value)}
              className="lc-input w-full" />
          </div>
        </Zeile>
      </section>

      <section className="lc-card p-5 sm:p-6 space-y-5">
        <Zeile titel="Farbschema">
          <Segment label="Farbschema" wert={themaWahl} onWahl={themaSetzen}
            optionen={[
              { id: 'hell', label: 'Hell' },
              { id: 'dunkel', label: 'Dunkel' },
              { id: 'auto', label: 'Automatisch', sub: 'folgt dem System' },
            ]} />
        </Zeile>
      </section>

      <section className="lc-card p-5 sm:p-6 space-y-5">
        <Zeile titel="Vorlagen — Detailgrad" hinweis="Standardumfang neuer Vorlagen (eine Wahl im Wizard geht weiter vor).">
          <Segment label="Detailgrad" wert={e.vorlagenDetailgrad}
            onWahl={(id) => setzeEinstellung('vorlagenDetailgrad', id)} optionen={DETAILGRAD_OPTIONEN} />
        </Zeile>
        <Zeile titel="Vorlagen — Schriftbild">
          <Segment label="Schriftbild" wert={stil} onWahl={setAusgabeStil}
            optionen={[
              { id: 'modern', label: 'Modern' },
              { id: 'nuechtern', label: 'Nüchtern' },
            ]} />
        </Zeile>
      </section>

      <section className="lc-card p-5 sm:p-6 space-y-5">
        <Zeile titel="Rechtsprechung — Trefferliste" hinweis="Wirkt beim nächsten Öffnen der Rechtsprechungs-Übersicht.">
          <Segment label="Trefferliste" wert={dichte}
            onWahl={(id) => { setDichte(id); schreibeKey(DICHTE_KEY, id); }}
            optionen={[{ id: 'liste', label: 'Liste' }, { id: 'karten', label: 'Karten' }]} />
        </Zeile>
        <Zeile titel="Rechtsprechung — Lesegrösse" hinweis="Schriftgrösse im Entscheid-Leser.">
          <Segment label="Lesegrösse" wert={fsIdx}
            onWahl={(id) => { setFsIdx(id); schreibeKey(FS_KEY, id); }}
            optionen={FS_LABELS.map((l, i) => ({ id: String(i), label: l }))} />
        </Zeile>
      </section>

      <section className="lc-card p-5 sm:p-6 space-y-3">
        <Zeile titel="Zurücksetzen" hinweis="Löscht alle gespeicherten Einstellungen, offenen Reiter, Favoriten und Vorlagen-Entwürfe in diesem Browser.">
          <button type="button" onClick={reset}
            className="rounded-lg border border-danger-500 bg-surface px-3.5 py-2 text-body-s font-medium text-danger-700 transition-colors hover:bg-danger-bg">
            Alles zurücksetzen …
          </button>
        </Zeile>
      </section>
    </div>
  );
}
