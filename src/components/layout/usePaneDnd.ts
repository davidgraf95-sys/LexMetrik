import { useRef, useState, type DragEvent } from 'react';

// ─── Pane-Drag-Drop (Split-View) ───────────────────────────────────────────
//
// Umsortieren der Panes per HTML5-Drag-Drop (⠿-Griff am PaneKopf → Drop auf eine
// Pane-Spalte). GLOBALE Indizes über die ganze Pane-Liste (0 = primär, 1.. =
// sekundär); `move` interpretiert sie (Sekundär-Reorder vs. Tausch mit dem
// Hauptfenster). Muster wie TabPanel: gezogener Index in Ref (überlebt Re-Render),
// überfahrener Index als State (Drop-Indikator).
// ── W2·24 R2 (§5a Ziff. 4) · EIN REITER LÄSST SICH IN EIN FENSTER ZIEHEN ────
// Zweite Nutzlast auf denselben Spalten-Drop-Zielen: nicht nur ein Pane-Index
// (Umsortieren), sondern auch ein REITER-PFAD aus der Arbeitsleiste. Die beiden
// sind an der Nutzlast unterscheidbar — `gezogen.current` ist beim Reiter-Zug
// null, und der Zug führt den eigenen MIME-Typ `REITER_MIME`. `dragover` darf
// die Nutzlast nicht LESEN, nur ihre TYPEN prüfen; genau darum trägt der
// Reiter-Zug einen eigenen Typ statt einer Inhaltsprüfung auf `text/plain`.
export function usePaneDnd(
  move: (von: number, nach: number) => void,
  /** Reiter-Pfad auf Pane `ziel` fallen gelassen (0 = Hauptfenster). */
  onReiter?: (pfad: string, ziel: number) => void,
  /** MIME-Typ des Reiter-Zugs (aus `Reiterleiste`), nur gebraucht, wenn
   *  `onReiter` gesetzt ist. */
  reiterMime?: string,
) {
  const gezogen = useRef<number | null>(null);
  const [ueber, setUeber] = useState<number | null>(null);

  /** Props für den ⠿-Ziehgriff im PaneKopf (Pane i). */
  const griff = (i: number) => ({
    onDragStart: (e: DragEvent) => {
      gezogen.current = i;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(i));
    },
    onDragEnd: () => { gezogen.current = null; setUeber(null); },
  });

  /** Props für die Pane-Spalte i als Drop-Ziel (inkl. `ueber` für den Indikator). */
  const spalte = (i: number) => ({
    onDragOver: (e: DragEvent) => {
      const reiter = onReiter != null && reiterMime != null
        && gezogen.current == null && e.dataTransfer.types.includes(reiterMime);
      if (reiter || (gezogen.current != null && gezogen.current !== i)) {
        e.preventDefault();
        if (ueber !== i) setUeber(i);
      }
    },
    onDrop: (e: DragEvent) => {
      const von = gezogen.current;
      if (von == null && onReiter != null && reiterMime != null) {
        const pfad = e.dataTransfer.getData(reiterMime);
        if (pfad) { e.preventDefault(); onReiter(pfad, i); }
        setUeber(null);
        return;
      }
      e.preventDefault();
      if (von != null && von !== i) move(von, i);
      gezogen.current = null;
      setUeber(null);
    },
    ueber: ueber === i,
  });

  return { griff, spalte };
}
