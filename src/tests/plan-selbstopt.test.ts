// src/tests/plan-selbstopt.test.ts — Rechenkerne der Bau-Messreihe (QS-SELBSTOPT: Lage & Vorschläge).
//
// Geprüft wird ausschliesslich `scripts/plan/selbstoptKern.ts` plus die Anzeige
// in `lage.ts`: alles Reine. Kein git, kein gh, kein Netz, keine Wanduhr — der
// Bezugszeitpunkt wird überall hereingegeben. Ein Test, der die Maschine misst,
// auf der er läuft, prüft nicht den Code (Muster von `plan-lage.test.ts`).
import {
  GENERIERT_MARKE,
  type Snapshot,
  type Zeitreihe,
} from '../../scripts/plan/selbstoptKern';
import { lageBlock, selbstoptZeile, vorschlagsZeile } from '../../scripts/plan/lage';
import {
  ANTIGRAVITY_SICHTUNG_SCHWELLE_TAGE,
  JULES_QUOTE_MIN_N,
  JULES_RUECKBAU_QUOTE,
  JULES_SKALIEREN_MEDIAN_MAX_MIN,
  JULES_SKALIEREN_MIN_N,
  JULES_SKALIEREN_QUOTE,
  MIN_SNAPSHOTS,
  ZWEITBLICK_DURCHGAENGE_SCHWELLE,
  befunde,
} from '../../scripts/plan/retro17Kern';
import type { Einheit } from '../../scripts/plan/parse';

function snapshot(p: Partial<Snapshot> = {}): Snapshot {
  return {
    erhobenAm: '2026-08-07T10:00:00.000Z',
    headCommit: 'abcdef1234567890abcdef1234567890abcdef12',
    torRot: { seitLetztem: { gesamt: 0, rot: 0, je: {} }, kumuliert: { gesamt: 0, rot: 0, je: {} } },
    ci: null,
    rework: null,
    flaky: null,
    tokens: null,
    fKlassen: {},
    fremdagenten: { jules: null, gemini: null, claude_token_pro_schritt: null },
    ausfaelle: [],
    ...p,
  };
}

describe('selbstoptZeile', () => {
  it('sagt es geradeheraus, wenn noch nichts gemessen wurde', () => {
    expect(selbstoptZeile(null)[0]).toContain('noch keine Zeitreihe');
  });

  it('zeigt Stand, CI-Rate und Tor-Rot des letzten Snapshots', () => {
    const z: Zeitreihe = {
      _generiert: GENERIERT_MARKE,
      schema: 1,
      snapshots: [
        snapshot({
          erhobenAm: '2026-08-07T12:00:00.000Z',
          ci: { laeufe: 50, verdikte: 35, failureRate: 0.23, cancelledRate: 0.3, rerunRate: 0.06, je: {} },
          torRot: { seitLetztem: { gesamt: 44, rot: 3, je: {} }, kumuliert: { gesamt: 44, rot: 3, je: {} } },
        }),
      ],
    };
    const zeile = selbstoptZeile(z)[0];
    expect(zeile).toContain('2026-08-07');
    expect(zeile).toContain('23 %');
    // Die Basis muss dastehen: 23 % von 35 Verdikten ist eine andere Aussage
    // als 23 % von 50 Läufen — und genau daran ist die erste Fassung gescheitert.
    expect(zeile).toContain('35 von 50');
    expect(zeile).toContain('3 von 44');
    // Der Zusatz ist nicht Zierde: ohne ihn liest sich die Zahl wie ein Urteil.
    expect(zeile).toContain('kein Tor-Kriterium');
  });

  it('bleibt vollständig, wenn die CI-Rate fehlt', () => {
    const z: Zeitreihe = { _generiert: GENERIERT_MARKE, schema: 1, snapshots: [snapshot()] };
    expect(selbstoptZeile(z)[0]).toContain('CI-Rate nicht erhoben');
  });
});

describe('befunde — Fremdagenten (QS-FREMDAGENTEN)', () => {
  const jules = (p: Partial<NonNullable<Snapshot['fremdagenten']['jules']>> = {}) => ({
    prs_gemerged_7d: 0,
    prs_geschlossen_7d: 0,
    proben_7d: 0,
    entwurf_antworten_7d: 0,
    prs_geschlossen_nummern: [],
    median_dauer_min: null,
    tickets_24h: 0,
    alarm: false,
    ...p,
  });
  const gemini = (p: Partial<NonNullable<Snapshot['fremdagenten']['gemini']>> = {}) => ({
    diskrepanz_laeufe: 0,
    diskrepanz_echt: 0,
    diskrepanz_schein: 0,
    zweitblick_durchgaenge: 0,
    kontingent_ereignisse: 0,
    ...p,
  });
  const mitFremdagenten = (jules_: ReturnType<typeof jules> | null, gemini_: ReturnType<typeof gemini> | null): Zeitreihe => ({
    _generiert: GENERIERT_MARKE,
    schema: 3,
    snapshots: [snapshot({ fremdagenten: { jules: jules_, gemini: gemini_, claude_token_pro_schritt: null } })],
  });
  /** Mehrere Snapshots mit aufsteigenden Stempeln, je einer Jules-Messung. */
  const reiheAus = (js: (ReturnType<typeof jules> | null)[]): Zeitreihe => ({
    _generiert: GENERIERT_MARKE,
    schema: 4,
    snapshots: js.map((j, i) =>
      snapshot({
        erhobenAm: `2026-09-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
        fremdagenten: { jules: j, gemini: null, claude_token_pro_schritt: null },
      }),
    ),
  });
  const arten = (z: Zeitreihe) => befunde(z, '').map((b) => b.art);

  it('schweigt ganz, wenn fremdagenten nicht erhoben ist (null/null)', () => {
    expect(arten(mitFremdagenten(null, null))).toEqual([]);
  });

  // (a) Rückbau-Regel: Quote < 2/3 über n ≥ 3.
  it('(a) schlägt Rückbau vor, wenn die Quote unter der Schwelle liegt', () => {
    expect(JULES_QUOTE_MIN_N).toBe(3);
    expect(JULES_RUECKBAU_QUOTE).toBeCloseTo(2 / 3);
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 1, prs_geschlossen_7d: 2 }), null); // 1/3 < 2/3, n=3
    expect(arten(z)).toContain('jules-rueckbau');
  });

  it('(a) schweigt an der Schwelle selbst (2/3 ist NICHT < 2/3)', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 2, prs_geschlossen_7d: 1 }), null); // genau 2/3
    expect(arten(z)).not.toContain('jules-rueckbau');
  });

  it('(a) schweigt unter der Mindest-Stichprobe, auch bei tiefer Quote', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 0, prs_geschlossen_7d: 1 }), null); // n=1 < 3
    expect(arten(z)).not.toContain('jules-rueckbau');
  });

  // (b) Skalierungs-Vorschlag: Quote ≥ 5/6 UND Median ≤ 45 min.
  it('(b) schlägt Skalierung vor, wenn Quote und Median beide die Schwelle reissen', () => {
    expect(JULES_SKALIEREN_QUOTE).toBeCloseTo(5 / 6);
    expect(JULES_SKALIEREN_MEDIAN_MAX_MIN).toBe(45);
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 5, prs_geschlossen_7d: 1, median_dauer_min: 45 }), null);
    expect(arten(z)).toContain('jules-skalieren');
  });

  it('(b) schweigt, wenn der Median über der Schwelle liegt (Quote allein reicht nicht)', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 5, prs_geschlossen_7d: 1, median_dauer_min: 46 }), null);
    expect(arten(z)).not.toContain('jules-skalieren');
  });

  it('(b) schweigt ohne auflösbare Dauer (median_dauer_min null)', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 5, prs_geschlossen_7d: 1, median_dauer_min: null }), null);
    expect(arten(z)).not.toContain('jules-skalieren');
  });

  // (b) Mindest-Stichprobe n >= 6 (Fahrplan §3, Zeile «Skalierung Jules»).
  it('(b) schweigt unter n = 6, auch wenn Quote und Median stimmen', () => {
    expect(JULES_SKALIEREN_MIN_N).toBe(6);
    // 5 gemerged / 0 geschlossen: Quote 100 %, Median gut — aber n = 5 < 6.
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 5, prs_geschlossen_7d: 0, median_dauer_min: 10 }), null);
    expect(arten(z)).not.toContain('jules-skalieren');
  });

  // Beschriftung (Nachbesserung 4.9.2026): die Kennzahl heisst Landungsquote,
  // nicht «Quote ohne Nacharbeit» — geschlossen misst Ablehnung, nicht Nacharbeit.
  it('(a) nennt die Kennzahl Landungsquote und grenzt sie gegen Nacharbeit ab', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 1, prs_geschlossen_7d: 2, prs_geschlossen_nummern: [1, 2] }), null);
    const b = befunde(z, '').find((x) => x.art === 'jules-rueckbau');
    expect(b?.anlass).toContain('Landungsquote (gemerged ÷ (gemerged + geschlossen), Proben ausgeschlossen)');
    expect(b?.hinweis).toContain('geschlossen ≠ Nacharbeit; handgeführte Nacharbeits-Quote steht in Fahrplan §5');
  });

  it('(b) belegt die Skalierungs-Schwelle mit Fahrplan §3, nicht §2', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 5, prs_geschlossen_7d: 1, median_dauer_min: 45, prs_geschlossen_nummern: [7] }), null);
    const b = befunde(z, '').find((x) => x.art === 'jules-skalieren');
    expect(b?.anlass).toContain('Fahrplan §3');
  });

  // (c) jeder NEU geschlossene Jules-PR ⇒ Lehre verankern. Je PR genau einmal.
  it('(c) schlägt vor, sobald ein Jules-PR geschlossen wurde, und nennt die Nummer', () => {
    const z = mitFremdagenten(jules({ prs_geschlossen_7d: 1, prs_geschlossen_nummern: [662] }), null);
    expect(arten(z)).toContain('jules-lehre');
    expect(befunde(z, '').find((b) => b.art === 'jules-lehre')?.anlass).toContain('#662');
  });

  it('(c) schweigt ohne geschlossenen PR', () => {
    const z = mitFremdagenten(jules({ prs_geschlossen_7d: 0 }), null);
    expect(arten(z)).not.toContain('jules-lehre');
  });

  // ROT-BEWEIS der Nachbesserung: derselbe abgelehnte PR steht 7 Tage lang in
  // jedem Snapshot. Ohne Entdopplung schlägt die Regel bei jeder Erhebung
  // dieselbe Lehre erneut vor — Muster wie bei den F-Klassen, die nur NEUE
  // datierte Vorfälle melden.
  it('(c) feuert je PR-Nummer nur einmal — frühere Snapshots entdoppeln', () => {
    const z = reiheAus([
      jules({ prs_geschlossen_7d: 1, prs_geschlossen_nummern: [662] }),
      jules({ prs_geschlossen_7d: 1, prs_geschlossen_nummern: [662] }),
    ]);
    expect(arten(z)).not.toContain('jules-lehre');
  });

  it('(c) feuert wieder, sobald eine NEUE Nummer dazukommt — und nennt nur sie', () => {
    const z = reiheAus([
      jules({ prs_geschlossen_7d: 1, prs_geschlossen_nummern: [662] }),
      jules({ prs_geschlossen_7d: 2, prs_geschlossen_nummern: [662, 700] }),
    ]);
    const b = befunde(z, '').find((x) => x.art === 'jules-lehre');
    expect(b?.anlass).toContain('#700');
    expect(b?.anlass).not.toContain('#662');
  });

  it('(c) ohne mitgeführte Nummern (Messung vor Schema 4) fällt auf die Zählung zurück', () => {
    const z = mitFremdagenten(jules({ prs_geschlossen_7d: 1, prs_geschlossen_nummern: null }), null);
    expect(arten(z)).toContain('jules-lehre');
  });

  // (d) Gemini Schein > echt.
  it('(d) schlägt Rückbau des Diskrepanz-Finders vor, wenn Schein überwiegt', () => {
    const z = mitFremdagenten(null, gemini({ diskrepanz_laeufe: 3, diskrepanz_echt: 1, diskrepanz_schein: 2 }));
    expect(arten(z)).toContain('gemini-rueckbau');
  });

  it('(d) schweigt, wenn echt mindestens gleich auf ist', () => {
    const z = mitFremdagenten(null, gemini({ diskrepanz_laeufe: 3, diskrepanz_echt: 2, diskrepanz_schein: 2 }));
    expect(arten(z)).not.toContain('gemini-rueckbau');
  });

  // (e) Phase-3-Durchgänge ≥ Schwelle (5).
  it('(e) schlägt vor, ab Schwelle Zweitblick-Durchgänge', () => {
    expect(ZWEITBLICK_DURCHGAENGE_SCHWELLE).toBe(5);
    const z = mitFremdagenten(null, gemini({ zweitblick_durchgaenge: 5 }));
    expect(arten(z)).toContain('zweitblick-schwelle');
  });

  it('(e) schweigt knapp unter der Schwelle', () => {
    const z = mitFremdagenten(null, gemini({ zweitblick_durchgaenge: 4 }));
    expect(arten(z)).not.toContain('zweitblick-schwelle');
  });

  // (f) jedes Kontingent-Ereignis.
  it('(f) schlägt vor, sobald ein Kontingent-Ereignis protokolliert ist', () => {
    const z = mitFremdagenten(null, gemini({ kontingent_ereignisse: 1 }));
    expect(arten(z)).toContain('kontingent-beleg');
  });

  it('(f) schweigt ohne Kontingent-Ereignis', () => {
    const z = mitFremdagenten(null, gemini({ kontingent_ereignisse: 0 }));
    expect(arten(z)).not.toContain('kontingent-beleg');
  });

  // (g) Alarm «Issue ohne Annahme».
  it('(g) schlägt vor, wenn die Jules-Messung einen Alarm meldet', () => {
    const z = mitFremdagenten(jules({ alarm: true, tickets_24h: 4 }), null);
    expect(arten(z)).toContain('jules-alarm');
  });

  it('(g) schweigt ohne Alarm', () => {
    const z = mitFremdagenten(jules({ alarm: false }), null);
    expect(arten(z)).not.toContain('jules-alarm');
  });

  // (h) Google-Ökosystem-Sichtung: letzte Sichtung > 30 Tage vor dem letzten
  // Snapshot-Stempel (2026-08-07T10:00 in `snapshot()`). Referenz ist der
  // Snapshot-Stempel, nie die Wanduhr (§2) — deshalb feste Kalenderdaten statt
  // relativer Offsets.
  it('(h) schweigt ohne letzteSichtungAntigravity (dritter Parameter weggelassen)', () => {
    expect(befunde(mitFremdagenten(null, null), '').map((b) => b.art)).not.toContain('antigravity-sichtung');
  });

  it('(h) schweigt an der Schwelle selbst (30 Tage ist NICHT > 30)', () => {
    expect(ANTIGRAVITY_SICHTUNG_SCHWELLE_TAGE).toBe(30);
    const z = mitFremdagenten(null, null);
    expect(befunde(z, '', '2026-07-08').map((b) => b.art)).not.toContain('antigravity-sichtung');
  });

  it('(h) schlägt vor, sobald die Schwelle gerissen ist (31 Tage), und nennt Datum + Tage', () => {
    const z = mitFremdagenten(null, null);
    const b = befunde(z, '', '2026-07-07').find((x) => x.art === 'antigravity-sichtung');
    expect(b).toBeDefined();
    expect(b?.anlass).toContain('2026-07-07');
    expect(b?.anlass).toContain('31 Tage');
  });

  it('(h) schweigt bei null explizit (kein Register gefunden)', () => {
    const z = mitFremdagenten(null, null);
    expect(befunde(z, '', null).map((b) => b.art)).not.toContain('antigravity-sichtung');
  });
});

describe('vorschlagsZeile', () => {
  /** N Snapshots mit aufsteigenden Zeitstempeln; der letzte trägt die Daten. */
  const reiheMit = (n: number, letzter: Partial<Snapshot> = {}): Zeitreihe => ({
    _generiert: GENERIERT_MARKE,
    schema: 2,
    snapshots: Array.from({ length: n }, (_, i) =>
      snapshot({
        erhobenAm: `2026-08-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
        ...(i === n - 1 ? letzter : {}),
      }),
    ),
  });

  it('schweigt still, wenn es keine (brauchbare) Zeitreihe gibt', () => {
    expect(vorschlagsZeile(null)).toEqual([]);
    expect(vorschlagsZeile(reiheMit(0))).toEqual([]);
  });

  it('nennt bei dünner Datenlage den Zählerstand', () => {
    const zeile = vorschlagsZeile(reiheMit(2))[0];
    expect(zeile).toContain(`Datenlage 2/${MIN_SNAPSHOTS}`);
    expect(zeile).toContain('zu dünn');
  });

  it('zählt ab genügender Datenlage die offenen Vorschläge', () => {
    const z = reiheMit(MIN_SNAPSHOTS, {
      ci: { laeufe: 50, verdikte: 50, failureRate: 0.9, cancelledRate: 0, rerunRate: 0.9, je: {} },
    });
    const zeile = vorschlagsZeile(z)[0];
    expect(zeile).toContain('2 Vorschlagsblöcke offen'); // ci-failure + ci-rerun
    expect(zeile).toContain('retro:17');
  });

  it('sagt es, wenn nichts über den Schwellen liegt', () => {
    expect(vorschlagsZeile(reiheMit(MIN_SNAPSHOTS))[0]).toContain('keine Vorschläge über den Schwellen');
  });

  // Der Pflicht-Einstieg darf keine Chronik lesen (~186 KB, Regex je Tor-Name).
  // Die Zahl hängt nicht davon ab — das ist die Voraussetzung dafür, sie
  // wegzulassen, und wird hier festgenagelt statt bloss behauptet.
  it('die Vorschlagszahl ist unabhängig vom Chronik-Text', () => {
    const z = reiheMit(MIN_SNAPSHOTS, {
      torRot: {
        seitLetztem: { gesamt: 0, rot: 0, je: {} },
        kumuliert: { gesamt: 20, rot: 5, je: { 'check:wackel': { gesamt: 20, rot: 5 } } },
      },
    });
    expect(befunde(z, '').length).toBe(befunde(z, 'check:wackel wurde am 1.1.2026 gebaut').length);
  });
});

describe('lageBlock — Andock-Muster', () => {
  let pos = 0;
  const einheit = (id: string): Einheit => ({
    id, checkbox: null, sektion: 'Die geordnete Abarbeitung', pos: pos++,
    etikett: { id, status: 'ready', blocker: null, dep: [], feld: null, fahrplan: null },
  });
  const kaputt = () => { throw new Error('git fehlt'); };

  it('hängt die Messreihen-Zeile GENAU EINMAL ans Ende an', () => {
    const zeilen = lageBlock([einheit('QS-SELBSTOPT')], [], { prs: false, laufe: kaputt, zeitreihe: () => null });
    const treffer = zeilen.filter((z) => z.startsWith('📈'));
    expect(treffer).toHaveLength(1);
    expect(zeilen[zeilen.length - 1]).toBe(treffer[0]);
  });

  /** Alle von QS-SELBSTOPT angehängten Zeilen — Messreihe und Vorschlagslage. */
  const ohneSelbstopt = (zeilen: string[]): string[] =>
    zeilen.filter((z) => !z.startsWith('📈') && !z.trimStart().startsWith('Selbstopt:'));

  it('zieht man die neuen Zeilen ab, ist der Block wie vorher', () => {
    const opt = { prs: false, laufe: kaputt } as const;
    const ohne = ohneSelbstopt(lageBlock([einheit('QS-A')], [], { ...opt, zeitreihe: () => null }));
    const mit = ohneSelbstopt(
      lageBlock([einheit('QS-A')], [], {
        ...opt,
        zeitreihe: () => ({ _generiert: GENERIERT_MARKE, schema: 2, snapshots: [snapshot()] }),
      }),
    );
    expect(mit).toEqual(ohne);
  });

  it('die Vorschlagszeile hängt unter der Messreihen-Zeile, nie dazwischen', () => {
    const zeilen = lageBlock([einheit('QS-B')], [], {
      prs: false,
      laufe: kaputt,
      zeitreihe: () => ({ _generiert: GENERIERT_MARKE, schema: 2, snapshots: [snapshot()] }),
    });
    const iMess = zeilen.findIndex((z) => z.startsWith('📈'));
    const iVor = zeilen.findIndex((z) => z.trimStart().startsWith('Selbstopt:'));
    expect(iMess).toBeGreaterThanOrEqual(0);
    expect(iVor).toBe(iMess + 1);
    expect(iVor).toBe(zeilen.length - 1);
  });
});
