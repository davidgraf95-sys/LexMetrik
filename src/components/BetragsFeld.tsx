import { useRef, type ChangeEvent } from 'react';

// ─── BetragsFeld – CHF-Eingabe mit Tausender-Apostroph (5.6.2026) ───────────
//
// Formatiert LIVE beim Tippen im Schweizer Format (12'500.50) und hält den
// Cursor stabil (Ziffern links vom Cursor bleiben konstant). Nach aussen
// fliesst der BEREINIGTE Rohwert (nur Ziffern, Punkt, optional Minus) —
// die Engines parsen also unverändert. Reine Darstellung, keine Logik (§3).

function betragFormatieren(roh: string): string {
  if (!roh) return '';
  const neg = roh.startsWith('-') ? '-' : '';
  const bereinigt = roh.replace(/[^\d.]/g, '');
  const [ganz = '', ...rest] = bereinigt.split('.');
  const dez = rest.length > 0 ? '.' + rest.join('').slice(0, 2) : '';
  const gruppiert = ganz.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return neg + gruppiert + dez;
}

function betragBereinigen(anzeige: string): string {
  const neg = anzeige.trim().startsWith('-') ? '-' : '';
  const bereinigt = anzeige.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const [ganz = '', ...rest] = bereinigt.split('.');
  return neg + ganz + (rest.length > 0 ? '.' + rest.join('') : '');
}

type Props = {
  value: string;                 // Rohwert (ohne Trennzeichen)
  onChange: (roh: string) => void;
  className?: string;
  placeholder?: string;
  erlaubeNegativ?: boolean;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
};

export function BetragsFeld({ value, onChange, className, placeholder, erlaubeNegativ, ...aria }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const caret = el.selectionStart ?? el.value.length;
    // Ziffern links vom Cursor zählen – daran wird der Cursor nach dem
    // Neuformatieren wieder ausgerichtet (Apostrophe zählen nicht).
    const ziffernLinks = el.value.slice(0, caret).replace(/[^\d.]/g, '').length;
    let roh = betragBereinigen(el.value);
    if (!erlaubeNegativ) roh = roh.replace(/^-/, '');
    onChange(roh);
    // Cursor nach React-Re-Render positionieren
    requestAnimationFrame(() => {
      const feld = ref.current;
      if (!feld) return;
      const anzeige = feld.value;
      let gezaehlt = 0;
      let pos = anzeige.length;
      for (let i = 0; i < anzeige.length; i++) {
        if (/[\d.]/.test(anzeige[i])) gezaehlt += 1;
        if (gezaehlt >= ziffernLinks) { pos = i + 1; break; }
      }
      if (ziffernLinks === 0) pos = anzeige.startsWith('-') ? 1 : 0;
      feld.setSelectionRange(pos, pos);
    });
  };

  return (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={betragFormatieren(value)}
      onChange={handle}
      className={className}
      placeholder={placeholder}
      {...aria}
    />
  );
}
