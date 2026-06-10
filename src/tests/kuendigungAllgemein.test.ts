import { describe, it, expect } from 'vitest';
import {
  KV_DEFAULTS, KV_SCHEMA, kvZusammenstellen, kvDarlehenRueckzahlungBis, pruefeKvGates,
  type KvAntworten,
} from '../lib/vorlagen/kuendigungAllgemein';
import { dokumentAlsText } from '../lib/vorlagen/vorlagenText';

// Akzeptanztests Maske 3 (Spez. kuendigungs-masken.md; VVG-Wortlaute
// verifiziert 6.6.2026 an der Konsolidierung 20240101).

const basis = (over: Partial<KvAntworten> = {}): KvAntworten => ({
  ...KV_DEFAULTS,
  absenderName: 'Anna Muster', absenderAdresse: 'Beispielweg 1, 4051 Basel',
  adressatName: 'Versicherung AG', adressatAdresse: 'Polizenweg 2, 8000 Zürich',
  vertragsBezeichnung: 'Hausratversicherung',
  ort: 'Basel', datum: '2026-06-06',
  ...over,
});

describe('Vorlage Vertragskündigung (Maske 3, Presets)', () => {
  it('genau EIN Erklärungs-Baustein je Preset (gegenseitig exklusiv)', () => {
    const ids = ['V_erklaerung_generisch', 'V_versicherung', 'V_darlehen', 'V_auftrag', 'V_abo'];
    for (const preset of ['generisch', 'versicherung', 'darlehen', 'auftrag', 'abo_telecom'] as const) {
      const { ergebnis } = kvZusammenstellen(basis({ preset }));
      expect(ergebnis.aufgenommen.filter((x) => ids.includes(x)).length, preset).toBe(1);
    }
  });

  it('Darlehen: 6-Wochen-Datum nur bei ERFASSTEM (zugegangenem) Aufforderungsdatum — Art. 318 OR läuft ab Zugang (Bug-Check-Fix 10.6.2026)', () => {
    expect(kvDarlehenRueckzahlungBis('2026-06-06')).toBe('18.07.2026'); // +42 Tage
    const { ergebnis, rueckzahlungBis } = kvZusammenstellen(basis({ preset: 'darlehen', aufforderungDatum: '2026-06-06' }));
    expect(rueckzahlungBis).toBe('18.07.2026');
    expect(dokumentAlsText(ergebnis)).toContain('bis zum 18.07.2026');
    expect(dokumentAlsText(ergebnis)).toContain('seit Zugang der ersten Aufforderung vom 06.06.2026');
    // Deklarierte fachliche Änderung: OHNE erfasstes Aufforderungsdatum kein
    // konkretes Datum mehr (vorher ab Briefdatum gerechnet → zu früh, da die
    // empfangsbedürftige Aufforderung erst mit Zugang wirkt).
    const ohne = kvZusammenstellen(basis({ preset: 'darlehen' }));
    expect(ohne.rueckzahlungBis).toBeNull();
    expect(dokumentAlsText(ohne.ergebnis)).toContain('seit Zugang dieser Aufforderung');
    expect(dokumentAlsText(ohne.ergebnis)).not.toContain('somit bis zum');
  });

  it('Versicherung: verifizierte VVG-Gates — <3 Jahre Warnung, Lebensversicherung Warnung (35a Abs. 3), Krankenzusatz Hinweis (Abs. 4)', () => {
    const jung = pruefeKvGates(basis({ preset: 'versicherung', vertragsdauerUeber3Jahre: false }));
    expect(jung.warnungen.some((w) => w.includes('DRITTEN'))).toBe(true);
    const leben = pruefeKvGates(basis({ preset: 'versicherung', vertragsdauerUeber3Jahre: true, lebensversicherung: true }));
    expect(leben.warnungen.some((w) => w.includes('35a') && w.includes('Abs. 3'))).toBe(true);
    const kzv = pruefeKvGates(basis({ preset: 'versicherung', vertragsdauerUeber3Jahre: true, krankenzusatz: true }));
    expect(kzv.hinweise.some((h) => h.includes('Abs. 4'))).toBe(true);
    expect(kzv.hinweise.some((h) => h.includes('Art. 98 VVG'))).toBe(true); // Zwingend-Klassifikation
    expect(kzv.blocker).toEqual([]); // Hinweis-Gate, kein Blocker (Spez.)
  });

  it('Auftrag: Unzeit-Warnung (Art. 404 Abs. 2); Abo: ehrlicher Kein-Spezialgesetz-Hinweis', () => {
    expect(pruefeKvGates(basis({ preset: 'auftrag' })).warnungen.some((w) => w.includes('404 Abs. 2'))).toBe(true);
    expect(pruefeKvGates(basis({ preset: 'abo_telecom' })).hinweise.some((h) => h.includes('keine Frist'))).toBe(true);
  });

  it('Termin-Satz: nächstmöglich vs. Wunschdatum; Policen-/Vertragsnummer-Fragmente verschwinden leer', () => {
    const naechst = dokumentAlsText(kvZusammenstellen(basis()).ergebnis);
    expect(naechst).toContain('auf den nächstmöglichen Termin');
    expect(naechst).not.toContain('(Nr. ');
    const wunsch = dokumentAlsText(kvZusammenstellen(basis({
      preset: 'generisch', aufNaechstmoeglich: false, kuendigungsterminWunsch: '2026-12-31', vertragsnummer: 'V-123',
    })).ergebnis);
    expect(wunsch).toContain('per 31.12.2026');
    expect(wunsch).toContain('(Nr. V-123)');
  });

  it('Schema-Konventionen: Eingabe-Format, fertig, Brief-Anatomie vollständig', () => {
    expect(KV_SCHEMA.format).toBe('eingabe');
    expect(KV_SCHEMA.ausgabeArt).toBe('fertig');
    const rollen = KV_SCHEMA.bausteine.map((b) => b.rolle).filter(Boolean);
    for (const r of ['absender', 'adressat', 'datumzeile', 'betreff', 'schlussformel', 'unterschrift']) {
      expect(rollen, r).toContain(r);
    }
  });
});
