import { Component, type ErrorInfo, type ReactNode } from 'react';
import { SeitenKopf } from './layout/SeitenKopf';

// Auffangnetz für unerwartete Render-Fehler (CLAUDE.md §3: reine Darstellung,
// keine Rechtslogik). React kennt für solche Fehler nur Klassen-Komponenten
// (getDerivedStateFromError / componentDidCatch). Ohne diese Grenze führt ein
// einzelner Render-Fehler zu einem leeren Bildschirm; hier erscheint stattdessen
// eine nüchterne Fehlanzeige im Projekt-Design mit Neuladen-Möglichkeit.

interface Props {
  children: ReactNode;
}

interface State {
  fehler: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { fehler: false };

  static getDerivedStateFromError(): State {
    return { fehler: true };
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
        <button type="button" onClick={() => window.location.reload()} className="lc-btn-primary">
          Seite neu laden
        </button>
      </div>
    );
  }
}
