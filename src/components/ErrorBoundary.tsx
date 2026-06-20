import { Component, type ErrorInfo, type ReactNode } from 'react';
import { SeitenKopf } from './layout/SeitenKopf';

// Auffangnetz für unerwartete Render-Fehler (CLAUDE.md §3: reine Darstellung,
// keine Rechtslogik). React kennt für solche Fehler nur Klassen-Komponenten
// (getDerivedStateFromError / componentDidCatch). Ohne diese Grenze führt ein
// einzelner Render-Fehler zu einem leeren Bildschirm; hier erscheint stattdessen
// eine nüchterne Fehlanzeige im Projekt-Design.
//
// SELBSTHEILUNG (Bug David 20.6.2026 «beim Seitenwechsel Fehler, erst der zweite
// Versuch klappt»): die häufigste Ursache ist ein transienter Lade-/Render-Fehler
// oder ein nach einem Deploy veralteter Chunk. Darum lädt die Grenze beim ERSTEN
// gefangenen Fehler EINMAL automatisch neu (per sessionStorage gegen eine
// Endlosschleife abgesichert; dasselbe Flag wie lazyRetry/vite:preloadError).
// Kommt der Fehler nach dem Neuladen wieder, ist er echt → wir zeigen die
// Fehlanzeige inkl. konkreter Meldung (Diagnose). Bei erfolgreicher Anzeige wird
// das Flag zurückgesetzt, damit die Selbstheilung später wieder greift.

const RELOAD_FLAG = 'lex-chunk-reload';

interface Props {
  children: ReactNode;
}

interface State {
  fehler: boolean;
  nachricht?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { fehler: false };

  static getDerivedStateFromError(error: Error): State {
    return { fehler: true, nachricht: error?.message };
  }

  componentDidMount() {
    // Diese Grenze (key={pathname} in App.tsx) ist frisch montiert und hat NICHT
    // gefangen → die Seite wird angezeigt → Selbstheilungs-Flag zurücksetzen.
    if (!this.state.fehler) {
      try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* kein sessionStorage */ }
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Nur lokale Diagnose – keine Übermittlung (Eingaben bleiben im Browser).
    console.error('Unerwarteter Render-Fehler:', error, info.componentStack);
    // Einmaliger Selbstheilungs-Versuch: neu laden holt frische Chunks und
    // räumt transiente Zustände aus. Endlosschleife verhindert das Flag.
    try {
      if (!sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
      }
    } catch { /* sessionStorage nicht verfügbar → Fehlanzeige bleibt stehen */ }
  }

  render() {
    if (!this.state.fehler) return this.props.children;
    return (
      <div className="py-16 max-w-reading space-y-4">
        <SeitenKopf overline="Fehler" titel="Diese Ansicht konnte nicht angezeigt werden"
          intro="Ein unerwarteter Fehler hat die Darstellung unterbrochen. Ihre Eingaben verlassen den Browser nicht; ein Neuladen der Seite stellt die Ansicht in der Regel wieder her." />
        {this.state.nachricht && (
          <p className="text-body-s text-ink-500">
            <span className="text-ink-400">Technische Meldung:</span>{' '}
            <code className="rounded bg-paper-sunken px-1.5 py-0.5 text-ink-700">{this.state.nachricht}</code>
          </p>
        )}
        <button type="button" onClick={() => window.location.reload()} className="lc-btn-primary">
          Seite neu laden
        </button>
      </div>
    );
  }
}
