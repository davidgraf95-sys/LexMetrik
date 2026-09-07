import { describe, it, expect } from 'vitest';
import { katalogKurzform, verlaufLabel } from '../lib/verlaufLabel';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';

// ═══ M7 · DIE KURZFORM EINES RECHNER-REITERS (Prüfbefund R11 #21) ═══════════
//
// GEMESSEN 6.9.2026 (Preview 4362, Chromium 1440×900, fünf Reiter offen): der
// Reiter «Verfahrens- & Rechtsmittelfristen» war mit **268 px** der breiteste
// der ganzen Leiste — 19 % der Fensterbreite, so viel wie zwei Gesetzes-Reiter
// («Art. 336c OR» 124 px + «ZGB» 93 px) zusammen. §5a Ziff. 2 verlangt für den
// Reiter die kanonische KURZFORM; der Katalog-`title` ist aber eine
// Beschreibung dessen, was der Rechner kann.
//
// ROT ZU BEKOMMEN (§6.7, beide Richtungen einmal gefahren):
//   (a) das Feld `kurz` bei `zpo-fristen` in `lib/startseiteKartenFristen.ts`
//       entfernen ⇒ der erste Fall misst null statt «ZPO-Fristen».
//   (b) in `lib/verlaufLabel.katalogKurzform` statt `karte?.kurz` einen
//       geratenen Wert zurückgeben (z. B. das erste Wort des Titels) ⇒ der
//       §7-Fall unten wird rot, weil dann JEDE Karte eine Kurzform hätte.

describe('M7 — Katalog-Kurzform für Reiter', () => {
  it('ein Rechner mit langem Katalog-Titel trägt seine Kurzform', () => {
    expect(katalogKurzform('/rechner/zpo-fristen')).toBe('ZPO-Fristen');
    // Der VOLLE Titel bleibt erhalten — er steht weiter im `title` des Reiters
    // und überall sonst (§8: nichts geht verloren, es wird nur kürzer gezeigt).
    expect(verlaufLabel('/rechner/zpo-fristen')).toBe('Verfahrens- & Rechtsmittelfristen');
  });

  it('die Kurzform ist kürzer als der Titel — sonst wäre das Feld sinnlos', () => {
    for (const k of ALLE_KARTEN) {
      if (!k.kurz) continue;
      expect(k.kurz.length, `${k.id}: «${k.kurz}» ist nicht kürzer als «${k.title}»`)
        .toBeLessThan(k.title.length);
    }
  });

  it('§7 — eine Karte OHNE `kurz` bekommt keine geratene Kurzform, sondern null', () => {
    // `tagerechner` führt bewusst kein `kurz`: sein Titel «Fristenrechner
    // (Tage · ZPO · SchKG)» kürzt sich über die bestehende Klammer-Regel
    // (`Reiterleiste.ohneUntertitel`) von selbst auf «Fristenrechner».
    expect(katalogKurzform('/rechner/tagerechner')).toBeNull();
    // Und ein Pfad ohne Katalog-Karte überhaupt.
    expect(katalogKurzform('/gesetze/bund/OR')).toBeNull();
    expect(katalogKurzform('/gibtesnicht')).toBeNull();
  });

  it('Query und Anker stören die Auflösung nicht (der Reiter trägt beides)', () => {
    expect(katalogKurzform('/rechner/zpo-fristen?e=2025-01-15&k=ZH')).toBe('ZPO-Fristen');
  });

  it('jede Karte mit `kurz` ist auch wirklich erreichbar — sonst pflegte man ein totes Feld', () => {
    for (const k of ALLE_KARTEN) {
      if (!k.kurz) continue;
      expect(istVerfuegbar(k), `${k.id} trägt eine Kurzform, ist aber nicht verfügbar`).toBe(true);
      expect(k.href, `${k.id} trägt eine Kurzform, hat aber keine Seite`).toBeTruthy();
    }
  });
});
