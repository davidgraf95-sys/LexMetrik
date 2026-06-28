import { BEGRUENDUNG_VORBEHALT } from '../lib/begruendung';
import { useKopieren } from './useKopieren';

// ─── «Für die Rechtsschrift»-Absatz — geteilter Baustein (FAHRPLAN-PRAXIS 2.2) ─
// Zeigt den kopierfertigen Begründungs-Absatz (lib/begruendung.ts) und
// kopiert ihn mit einem Klick. Reine Darstellung (§3). Die EINE Aufrufstelle
// pro Form ist BegruendungSlot (B2-0); diese Komponente rendert den fertigen
// Text. Copy-Mechanik: useKopieren (B2-1); Vorbehalt: lib-Konstante (§5/§8).

export function BegruendungAbsatz({ text }: { text: string }) {
  const { kopiert, kopieren } = useKopieren(text);
  if (!text.trim()) return null;
  return (
    <details className="lc-card p-4">
      <summary className="cursor-pointer text-body-s font-medium text-ink-700">
        Für die Rechtsschrift — kopierfertiger Begründungs-Absatz
      </summary>
      <p className="mt-3 text-body-s text-ink-900 leading-relaxed bg-paper-sunken rounded-md p-3 select-all">
        {text}
      </p>
      <button type="button" className="lc-btn-outline lc-btn-sm mt-3" onClick={kopieren}>
        {kopiert ? 'Kopiert ✓' : 'Absatz kopieren'}
      </button>
      <p className="text-xs text-ink-500 mt-2">
        {BEGRUENDUNG_VORBEHALT}
      </p>
    </details>
  );
}
