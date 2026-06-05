import type { Kanton } from '../../types/legal';

// ─── Behörden-Stammdaten für Eingaben — Grundgerüst (5.6.2026) ──────────────
//
// JEDE automatisch eingesetzte Behörden-/Gerichtsadresse muss VOLLSTÄNDIG
// sein (Name, Zusatz, Strasse MIT Hausnummer, PLZ, Ort) und eine datierte
// amtliche Quelle tragen. Eingaben-Wizards wählen zu Beginn den KANTON;
// die Registry löst die zuständige Adresse auf. Ist ein Kanton (noch)
// nicht hinterlegt, zeigt der Wizard eine klare Fehlermeldung — mit der
// Möglichkeit, die Adresse von Hand zu erfassen (Override gilt immer).
//
// Pilot-Abdeckung: Basel-Stadt. Weitere Kantone werden hier ergänzt
// (eine Adresse pro Eingabe-Art × Kanton; nie raten — nur amtliche Quellen).

export type BehoerdenAdresse = {
  name: string;        // z. B. «Zivilgericht Basel-Stadt»
  zusatz?: string;     // z. B. «Schlichtungsbehörde»
  strasse: string;     // MIT Hausnummer
  plzOrt: string;
  stand: string;       // Verifikationsdatum
  quelle: string;      // amtliche Quelle
};

export type EingabeArt = 'schlichtungsbehoerde_zivil' | 'schlichtungsstelle_miete' | 'schlichtungsstelle_diskriminierung';

export const BEHOERDEN: Record<EingabeArt, Partial<Record<Kanton, BehoerdenAdresse>>> = {
  // Schlichtungsbehörde in Zivilsachen (Art. 197 ff. ZPO)
  schlichtungsbehoerde_zivil: {
    BS: {
      name: 'Zivilgericht Basel-Stadt',
      zusatz: 'Schlichtungsbehörde',
      strasse: 'Bäumleingasse 5',
      plzOrt: '4001 Basel',
      stand: '5.6.2026',
      quelle: 'staatskalender.bs.ch (Kanzlei Schlichtungsbehörde)',
    },
  },
  // Paritätische Spezialstellen (Art. 200 ZPO)
  schlichtungsstelle_miete: {
    BS: {
      name: 'Staatliche Schlichtungsstelle für Mietstreitigkeiten',
      strasse: 'Grenzacherstrasse 62',
      plzOrt: '4005 Basel',
      stand: '5.6.2026',
      quelle: 'staatskalender.bs.ch',
    },
  },
  schlichtungsstelle_diskriminierung: {
    BS: {
      name: 'Kantonale Schlichtungsstelle für Diskriminierungsfragen',
      strasse: 'Grenzacherstrasse 62',
      plzOrt: '4005 Basel',
      stand: '5.6.2026',
      quelle: 'staatskalender.bs.ch',
    },
  },
};

export function behoerdeFuer(art: EingabeArt, kanton: Kanton): BehoerdenAdresse | null {
  return BEHOERDEN[art][kanton] ?? null;
}

/** Adressblock (eine Zeile pro Bestandteil) für den Dokument-Adressaten. */
export function behoerdeAlsBlock(b: { name: string; zusatz?: string; strasse: string; plzOrt: string }): string {
  return [b.name, b.zusatz, b.strasse, b.plzOrt].filter(Boolean).join('\n');
}

/** Manuell erfasste Behördenadresse (Override — gilt vor der Registry). */
export type BehoerdeManuell = { name: string; strasse: string; plzOrt: string };

export function behoerdeManuellVollstaendig(m?: BehoerdeManuell): boolean {
  return !!(m?.name?.trim() && m?.strasse?.trim() && m?.plzOrt?.trim());
}
