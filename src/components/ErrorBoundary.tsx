import { Component, type ErrorInfo, type ReactNode } from 'react';
import { SeitenKopf } from './layout/SeitenKopf';

// Auffangnetz für unerwartete Render-Fehler (CLAUDE.md §3: reine Darstellung,
// keine Rechtslogik). React kennt für solche Fehler nur Klassen-Komponenten
// (getDerivedStateFromError / componentDidCatch). Ohne diese Grenze führt ein
// einzelner Render-Fehler zu einem leeren Bildschirm; hier erscheint stattdessen
// eine nüchterne Fehlanzeige im Projekt-Design mit der konkreten Meldung.
//
// SELBSTHEILUNG bewusst NICHT hier: das «beim Seitenwechsel Fehler, zweiter
// Versuch klappt» entsteht durch transiente/veraltete Lazy-Chunks und wird
// loop-sicher von lazyRetry + dem vite:preloadError-Handler (main.tsx) erledigt
// — beide setzen ihr Reload-Flag nur einmal und löschen es erst bei
// NACHGEWIESEN erfolgreichem Import. Ein Auto-Reload AUS der Boundary heraus
// wäre gefährlich: ein deterministischer Render-Fehler würde endlos neu laden
// (die Boundary montiert beim Lazy-Suspense zunächst fehlerfrei, der Fehler
// kommt erst im zweiten Commit). Darum zeigt die Boundary den Fehler ehrlich an,
// statt ihn wegzuladen; ein Sidebar-/Link-Wechsel setzt sie via key={pathname}
// (App.tsx) ohnehin zurück.

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

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Nur lokale Diagnose – keine Übermittlung (Eingaben bleiben im Browser).
    console.error('Unerwarteter Render-Fehler:', error, info.componentStack);
  }

  render() {
    if (!this.state.fehler) return this.props.children;
    return (
      <div className="py-16 max-w-reading space-y-4">
        <SeitenKopf overline="Fehler" titel="Diese Ansicht konnte nicht angezeigt werden"
          intro="Ein unerwarteter Fehler hat die Darstellung unterbrochen. Ihre Eingaben verlassen den Browser nicht; ein Neuladen der Seite stellt die Ansicht in der Regel wieder her." />
        {this.state.nachricht && (
          <p className="text-body-s text-ink-500">
            <span className="text-ink-500">Technische Meldung:</span>{' '}
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
