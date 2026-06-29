import { useRef, useState, type DragEvent } from 'react';

// ─── Pane-Drag-Drop (Split-View) ───────────────────────────────────────────
//
// Umsortieren der Panes per HTML5-Drag-Drop (⠿-Griff am PaneKopf → Drop auf eine
// Pane-Spalte). GLOBALE Indizes über die ganze Pane-Liste (0 = primär, 1.. =
// sekundär); `move` interpretiert sie (Sekundär-Reorder vs. Tausch mit dem
// Hauptfenster). Muster wie TabPanel: gezogener Index in Ref (überlebt Re-Render),
// überfahrener Index als State (Drop-Indikator).
export function usePaneDnd(move: (von: number, nach: number) => void) {
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
      if (gezogen.current != null && gezogen.current !== i) {
        e.preventDefault();
        if (ueber !== i) setUeber(i);
      }
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      const von = gezogen.current;
      if (von != null && von !== i) move(von, i);
      gezogen.current = null;
      setUeber(null);
    },
    ueber: ueber === i,
  });

  return { griff, spalte };
}
