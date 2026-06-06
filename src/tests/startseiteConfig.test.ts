import { describe, it, expect } from 'vitest';
import {
  istVerfuegbar,
  ALLE_KARTEN, RECHTSGEBIETE, RECHTSGEBIET_SEKTIONEN, RECHTSBEREICH_SEKTIONEN,
  SEKTIONEN, VORLAGE_SEKTIONEN, karte,
} from '../lib/startseiteConfig';
import { CALCULATORS } from '../lib/calculators';

// Annahmekriterien «Fedlex-Direktlinks für die Norm-Pills»:
// artikelgenaue Anker, kein ?version=, geplante Kacheln ohne Pills.

// Ehrliches Status-Modell: «aktiv» = entwurf|geprüft; aktuell ist NICHTS geprüft.
const aktiv = ALLE_KARTEN.filter((k) => k.status !== 'geplant');
const geplant = ALLE_KARTEN.filter((k) => k.status === 'geplant');

describe('Norm-Pills (Fedlex-Direktlinks)', () => {
  it('jede aktive Kachel (Entwurf) trägt mindestens ein Norm-Pill', () => {
    aktiv.forEach((k) => expect(k.norms.length, k.id).toBeGreaterThan(0));
  });

  it('jede URL ist ein Fedlex-Direktlink: artikelgenauer Anker ODER Gesetzes-Seite (Normentreue-Fallback)', () => {
    // Anker-los nur erlaubt, wenn die Pill ein GANZES Gesetz referenziert
    // (Label ohne «Art.») – z. B. das Fristengesetz SR 173.110.3 beim
    // Tagerechner (Auftrag 5.6.2026: Link auf die Gesetzes-Seite, bis ein
    // Anker artikelgenau verifiziert und fachlich abgenommen ist).
    aktiv.flatMap((k) => k.norms).forEach((n) => {
      if (/^Art\./.test(n.label)) {
        expect(n.url, n.label).toMatch(/^https:\/\/www\.fedlex\.admin\.ch\/eli\/cc\/[\w/]+\/de#art_\d+(_[a-z])?$/);
      } else {
        expect(n.url, n.label).toMatch(/^https:\/\/www\.fedlex\.admin\.ch\/eli\/cc\/[\w/]+\/de$/);
      }
    });
  });

  it('keine URL enthält einen ?version=-Parameter', () => {
    aktiv.flatMap((k) => k.norms).forEach((n) => expect(n.url, n.label).not.toContain('?version='));
  });

  it('kein Eintrag ist «geprüft»; alle Pills tragen verified:false bis zur fachlichen Prüfung', () => {
    expect(ALLE_KARTEN.some((k) => k.status === 'geprüft')).toBe(false);
    aktiv.flatMap((k) => k.norms).forEach((n) => expect(n.verified, n.label).toBe(false));
  });

  it('Aufzählungs-Labels (/, ·, «und») sind in Einzel-Pills aufgetrennt', () => {
    aktiv.flatMap((k) => k.norms).forEach((n) => {
      expect(n.label, n.label).not.toMatch(/[/·]| und /);
    });
  });

  it('geplante Kacheln («In Vorbereitung») tragen keine Norm-Pills', () => {
    expect(geplant.length).toBeGreaterThan(0);
    geplant.forEach((k) => expect(k.norms, k.id).toEqual([]));
  });
});

describe('Stufen-Zuteilung (tier)', () => {
  // Free/Pro-Zuordnung gemäss Auftrag «Katalog-Ausbau» §3 (5.6.2026):
  // free = kostenlose Auswahl; alle übrigen pro. Pro zeigt free UND pro.
  it('die Free-Auswahl entspricht der Auftrags-Liste; alle übrigen «pro»', () => {
    const free = ALLE_KARTEN.filter((k) => k.tier === 'free').map((k) => k.id).sort();
    expect(free).toEqual([
      'eigenhaendiges-testament',
      'kuendigung-arbeitnehmer', 'mahnung', 'patientenverfuegung',
      'tagerechner', 'teuerungsrechner', 'verzugszins', 'vollmacht', 'vorsorgeauftrag',
    ]);
    ALLE_KARTEN.forEach((k) => expect(['free', 'pro'], k.id).toContain(k.tier));
  });
});

// Implementierte Vorlagen-Routen (manuell gepflegt, vgl. src/App.tsx)
const VORLAGEN_ROUTEN = new Set(['/vorlagen/testament', '/vorlagen/patientenverfuegung', '/vorlagen/vorsorgeauftrag', '/vorlagen/schlichtungsgesuch-bs', '/vorlagen/arbeitsvertrag', '/vorlagen/mietvertrag', '/vorlagen/vollmacht', '/vorlagen/klage-vereinfacht', '/vorlagen/kuendigung-arbeitnehmer', '/vorlagen/kuendigung-arbeitgeber', '/vorlagen/kuendigung-mieter', '/vorlagen/kuendigung-vertrag', '/vorlagen/kuendigung-vermieter']);

describe('Routen-Integrität', () => {
  it('jede aktive Karte verlinkt auf eine registrierte Route', () => {
    const slugs = new Set(CALCULATORS.map((c) => c.slug));
    aktiv.forEach((k) => {
      if (k.modus === 'vorlage') {
        expect(VORLAGEN_ROUTEN.has(k.href!), `${k.id} → ${k.href}`).toBe(true);
        // Deklarierte Verfeinerung 6.6.2026 (Maske 2b): schemaId nur für
        // EXPORTIERENDE Vorlagen Pflicht — reine Checklisten (§8-Grenze,
        // kein output) haben bewusst kein Schema.
        if (k.output && k.output.length > 0) expect(k.schemaId, k.id).toBeTruthy();
      } else {
        expect(k.href, k.id).toMatch(/^\/rechner\//);
        const slug = k.href!.replace('/rechner/', '').split('#')[0];
        expect(slugs.has(slug), `${k.id} → ${slug}`).toBe(true);
      }
    });
  });

  it('jeder registrierte Rechner hat eine aktive Katalog-Karte', () => {
    const hrefs = new Set(aktiv.map((k) => k.href!.split('#')[0]));
    CALCULATORS.filter((c) => c.status === 'entwurf').forEach((c) => {
      expect(hrefs.has(`/rechner/${c.slug}`), c.slug).toBe(true);
    });
  });
});

describe('Modus «Vorlagen» (Katalog-Regeln)', () => {
  const vorlagen = ALLE_KARTEN.filter((k) => k.modus === 'vorlage');

  it('alle fünf Dokument-Typen sind belegt (inkl. korrespondenz)', () => {
    (['vorsorge', 'vertrag', 'eingabe', 'gesellschaft', 'korrespondenz'] as const).forEach((art) => {
      expect(vorlagen.some((v) => v.art === art), art).toBe(true);
    });
  });

  it('geplante Vorlagen: keine Norm-Pills, kein href, keine schemaId', () => {
    vorlagen.filter((v) => v.status === 'geplant').forEach((v) => {
      expect(v.norms, v.id).toEqual([]);
      expect(v.href, v.id).toBeUndefined();
      expect('schemaId' in v && v.schemaId, v.id).toBeFalsy();
    });
  });

  it('jede Karte trägt einen gültigen Modus; related-IDs lösen modusübergreifend auf', () => {
    const ids = new Set(ALLE_KARTEN.map((k) => k.id));
    ALLE_KARTEN.forEach((k) => {
      expect(['rechner', 'vorlage'], k.id).toContain(k.modus);
      (k.related ?? []).forEach((r) => expect(ids.has(r), `${k.id} → ${r}`).toBe(true));
    });
  });
});

// ── Katalog-Integrität nach dem Ausbau auf 111 Einträge (Review-Befunde) ────

describe('Katalog-Integrität (Rechtsgebiet-Gliederung)', () => {
  it('jede Karte hat ein rechtsgebiet aus RECHTSGEBIETE (sonst keine Sektion → unsichtbar)', () => {
    const set = new Set(RECHTSGEBIETE);
    ALLE_KARTEN.forEach((k) => expect(set.has(k.rechtsgebiet), `${k.id}: ${k.rechtsgebiet}`).toBe(true));
  });

  it('jeder rechtsbereich ist einer der vier definierten Codes', () => {
    const set = new Set(RECHTSBEREICH_SEKTIONEN.map((b) => b.code));
    ALLE_KARTEN.forEach((k) => expect(set.has(k.rechtsbereich), k.id).toBe(true));
  });

  it('jede Karten-id ist eindeutig', () => {
    const ids = ALLE_KARTEN.map((k) => k.id);
    expect(new Set(ids).size, JSON.stringify(ids.filter((x, i) => ids.indexOf(x) !== i))).toBe(ids.length);
  });

  it('Rechner-art ∈ Output-Typen, Vorlage-art ∈ Dokument-Typen (sonst leere Filter-Pill)', () => {
    const rechnerArt = new Set(SEKTIONEN.map((s) => s.art));
    const vorlageArt = new Set(VORLAGE_SEKTIONEN.map((s) => s.art));
    ALLE_KARTEN.forEach((k) =>
      expect((k.modus === 'rechner' ? rechnerArt : vorlageArt).has(k.art), `${k.id}/${k.art}`).toBe(true));
  });

  it('geplante Rechner: keine Norm-Pills, kein href (Invariante wie bei Vorlagen)', () => {
    ALLE_KARTEN.filter((k) => k.modus === 'rechner' && k.status === 'geplant').forEach((k) => {
      expect(k.norms, k.id).toEqual([]);
      expect(k.href, k.id).toBeUndefined();
    });
  });

  it('related verweist nie auf sich selbst und löst auf (modusübergreifend)', () => {
    const ids = new Set(ALLE_KARTEN.map((k) => k.id));
    ALLE_KARTEN.forEach((k) => (k.related ?? []).forEach((r) => {
      expect(r, `${k.id} self-ref`).not.toBe(k.id);
      expect(ids.has(r), `${k.id} → ${r}`).toBe(true);
    }));
  });

  it('Sektions-ids sind innerhalb jeder Gliederung eindeutig', () => {
    for (const arr of [RECHTSGEBIET_SEKTIONEN, RECHTSBEREICH_SEKTIONEN, SEKTIONEN, VORLAGE_SEKTIONEN]) {
      const ids = arr.map((s: { id: string }) => s.id);
      expect(new Set(ids).size, ids.join(',')).toBe(ids.length);
    }
    // bewusst NICHT arrayübergreifend: gerendert wird nur die
    // Rechtsgebiet-Gliederung; die übrigen Listen speisen Filter-Pills.
  });

  it('die von den Wizard-Seiten referenzierten karte()-ids existieren', () => {
    ['schlichtungsgesuch', 'patientenverfuegung', 'eigenhaendiges-testament', 'vorsorgeauftrag', 'arbeitsvertrag', 'mietvertrag-wohnen']
      .forEach((id) => expect(karte(id), id).toBeDefined());
  });
});

describe('istVerfuegbar (Pro-Katalog-Auftrag, Phase 1)', () => {
  // Deklarierte Erweiterung 6.6.2026: + Erb-Fristen-Rechner (Quick-Win 1) → 21.
  // Deklarierte Erweiterung Katalog-Split 6.6.2026 (Auftrag David): die längst
  // gebauten Rechtswege SchKG/Straf des Zuständigkeitsrechners erhalten eigene
  // Gebiets-Einstiegskarten (schkg-/straf-zustaendigkeit, entwurf) → 23.
  // Deklarierte Erweiterung Kündigungs-Masken 6.6.2026: Vorlagen 9–13
  // (1a AN free · 1b AG · 2a Mieter · 3 Vertrag/Presets · 2b Vermieter-
  // Checkliste [§8-Grenze, ohne Export]) → 28. Familie KOMPLETT.
  it('verfügbar = status !== geplant; Regressionszählung 28 (Stand 6.6.2026, Kündigungs-Familie komplett)', () => {
    const verf = ALLE_KARTEN.filter(istVerfuegbar);
    expect(verf.length).toBe(28);
    expect(verf.every((k) => k.status !== 'geplant')).toBe(true);
    expect(ALLE_KARTEN.filter((k) => !istVerfuegbar(k)).every((k) => k.status === 'geplant')).toBe(true);
  });
});

describe('RECHTSBEREICH_GRUPPEN (Pro-Katalog, Phase 2) – Vollständigkeit beider Modelle', () => {
  it('jedes Config-Rechtsgebiet liegt in genau EINER Gruppe; keine Gruppe nennt Unbekanntes', async () => {
    const { ALLE_GRUPPEN_MODELLE } = await import('../lib/rechtsbereichGruppen');
    for (const [modell, gruppen] of Object.entries(ALLE_GRUPPEN_MODELLE)) {
      const genannt = gruppen.flatMap((g) => g.gebiete);
      // keine Doppelnennung
      expect(new Set(genannt).size, `${modell}: Doppelnennung`).toBe(genannt.length);
      // vollständig: jedes RECHTSGEBIET genau einmal
      for (const gebiet of RECHTSGEBIETE) {
        expect(genannt.filter((x) => x === gebiet).length, `${modell}: ${gebiet}`).toBe(1);
      }
      // nichts Unbekanntes
      for (const g of genannt) {
        expect(RECHTSGEBIETE.includes(g as (typeof RECHTSGEBIETE)[number]), `${modell}: unbekannt ${g}`).toBe(true);
      }
    }
  });
});

describe('FREE_REIHENFOLGE (Free-Kachelwand, Phase 1)', () => {
  it('jede ID existiert mit tier free; kein free-Eintrag geht verloren; deterministisch', async () => {
    const { FREE_REIHENFOLGE, freeKartenSortiert } = await import('../lib/freeReihenfolge');
    const free = ALLE_KARTEN.filter((k) => k.tier === 'free');
    for (const id of FREE_REIHENFOLGE) {
      const k = ALLE_KARTEN.find((x) => x.id === id);
      expect(k, id).toBeTruthy();
      expect(k!.tier, id).toBe('free');
    }
    const sortiert = freeKartenSortiert();
    expect(sortiert.map((k) => k.id).sort()).toEqual(free.map((k) => k.id).sort());
    expect(sortiert).toEqual(freeKartenSortiert()); // deterministisch
    // kuratierte Reihenfolge greift
    expect(sortiert[0].id).toBe('tagerechner');
  });
});
