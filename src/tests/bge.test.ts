import { describe, it, expect } from 'vitest';
import { rechtsprechungUrl, RECHTSPRECHUNG_IM_TEXT } from '../lib/bge';
import { VERIFIKATION } from '../data/verifikation';

// ─── Rechtsprechungs-Links (Auftrag David 6.6.2026) ─────────────────────────
// URL-Schemata empirisch verifiziert (§7, WebFetch 6.6.2026): ATF-Permalink
// zeigt BGE 139 III 78 direkt; AZA-Suche findet 5A_691/2023 als 1. Treffer.

describe('rechtsprechungUrl', () => {
  it('BGE → ATF-Permalink (direkt), Docid Band-Teil-Seite', () => {
    const l = rechtsprechungUrl('BGE 139 III 78');
    expect(l?.direkt).toBe(true);
    expect(l?.url).toBe(
      'https://www.bger.ch/ext/eurospider/live/de/php/clir/http/index.php?highlight_docid=atf%3A%2F%2F139-III-78%3Ade&lang=de&type=show_document',
    );
  });

  it('Erwägungs-Zusatz gehört nicht in die Docid («BGE 114 III 60 E. 2»)', () => {
    expect(rechtsprechungUrl('BGE 114 III 60 E. 2')?.url).toContain('atf%3A%2F%2F114-III-60%3Ade');
  });

  it('sozialversicherungsrechtlicher Teil V und alte Bände funktionieren', () => {
    expect(rechtsprechungUrl('BGE 115 V 437')?.url).toContain('115-V-437');
    expect(rechtsprechungUrl('BGE 81 II 56')?.url).toContain('81-II-56');
  });

  it('BGer-Urteil → amtlicher Suchlink (direkt=false; Permalink bräuchte das Entscheiddatum)', () => {
    const l = rechtsprechungUrl('BGer 4A_215/2011');
    expect(l?.direkt).toBe(false);
    expect(l?.url).toContain('type=simple_query');
    expect(l?.url).toContain(encodeURIComponent('4A_215/2011'));
    // auch ohne «BGer »-Präfix (Schreibweise in manchen Hinweisen)
    expect(rechtsprechungUrl('5A_691/2023')?.url).toContain(encodeURIComponent('5A_691/2023'));
  });

  it('Unbekanntes Format → null (kein geratener Link, §7)', () => {
    expect(rechtsprechungUrl('HGer ZH HG200015')).toBeNull();
    expect(rechtsprechungUrl('BGE III 78')).toBeNull();
  });

  it('JEDES Aktenzeichen im Verifikations-Register erhält einen Link (SSoT-Abdeckung)', () => {
    Object.values(VERIFIKATION).forEach((e) => {
      expect(rechtsprechungUrl(e.aktenzeichen), e.aktenzeichen).not.toBeNull();
    });
  });
});

describe('RECHTSPRECHUNG_IM_TEXT (Linkifizierung der Anzeige)', () => {
  it('findet BGE- und Urteils-Zitate im Fliesstext, Text bleibt rekonstruierbar', () => {
    const text =
      'Kein Stillstand (BGE 139 III 78); zur Klagebewilligung vgl. BGer 5A_691/2023 und BGE 140 III 561.';
    const treffer = [...text.matchAll(RECHTSPRECHUNG_IM_TEXT)].map((m) => m[0]);
    expect(treffer).toEqual(['BGE 139 III 78', 'BGer 5A_691/2023', 'BGE 140 III 561']);
  });

  it('greift nicht in gewöhnlichen Text oder Normzitate', () => {
    const text = 'Art. 311 Abs. 1 ZPO; 30 Tage ab Zustellung; SR 173.110.';
    expect([...text.matchAll(RECHTSPRECHUNG_IM_TEXT)]).toHaveLength(0);
  });
});
