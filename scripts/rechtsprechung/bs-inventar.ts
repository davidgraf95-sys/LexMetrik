// ─── BS-Inventar: Gesamtlauf + Jahresfenster-Gegenprobe (Bauplan §5.2) ───────
//
// 1. Gesamtlauf OHNE Kriterien (999/Seite, Seiten 1..ceil(N/999) — Wrap-Falle §1.5):
//    pro Trefferzeile nF30_KEY, GN, Sekundär-GN, Entscheiddatum (kann leer sein),
//    Titel, Erstpublikations-/Aktualisierungsdatum. Assert: Zeilen == N, Keys unique.
// 2. Lokal auf den Scope filtern (Entscheiddatum ≥ 2022 ODER datumlos mit GN-Jahr ≥ 2022).
// 3. Jahresfenster-Gegenprobe: je Jahr 1 Request; Portal-N_J == Inventarzeilen des Jahres.
//
// Struktur-Parse (linkedom), nie Regex über den ganzen Body: eine Trefferzeile =
// die <table>, die den getMarkupDocument-Link enthält.

import { parseHTML } from 'linkedom';
import { holeBs, sucheUrl, trefferAnzahl } from './bs-client';

export interface InventarZeile {
  /** Interner Dokument-Schlüssel des Portals (1 Dokument = 1 Key) — technische Identität. */
  key: number;
  /** Geschäftsnummer (fachliche Identität, verbatim mit Punkten), z.B. 'ZB.2023.4'. */
  gn: string;
  /** Parallele Zweitnummer aus der Klammer, z.B. 'AG.2025.1' — null wenn keine. */
  gnSekundaer: string | null;
  /** Entscheiddatum ISO — null, wenn das Portal keines publiziert. */
  datum: string | null;
  titel: string;
  erstpublikation: string | null;
  aktualisiert: string | null;
}

export interface Inventar {
  erzeugt: string;
  quelle: string;
  /** Portal-Zählungen beim Lauf (Count-Gate-Anker, im JSON festgeschrieben). */
  portal: { gesamtN: number; jahre: Record<string, number> };
  /** Scope §2: Entscheiddatum ≥ 2022 ODER datumlos mit GN-Jahr ≥ 2022. */
  eintraege: InventarZeile[];
}

const dIso = (s: string | null): string | null => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((s ?? '').trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

/** GN-Jahr (mittleres Segment): 'IV.2025.93' → 2025; null wenn nicht parsebar. */
export function gnJahr(gn: string): number | null {
  // Präfix kann Ziffern tragen («K5.2023.13»).
  const m = /^[A-Za-z][A-Za-z0-9]*\.(\d{4})\./.exec(gn.trim());
  return m ? Number(m[1]) : null;
}

/** Trefferliste (eine Seite) strukturell parsen. */
export function parseTrefferliste(html: string): InventarZeile[] {
  const { document } = parseHTML(html);
  const out: InventarZeile[] = [];
  for (const a of document.querySelectorAll('a[href*="getMarkupDocument"]')) {
    const href = a.getAttribute('href') ?? '';
    const mKey = /[?&]nF30_KEY=(\d+)/.exec(href);
    if (!mKey) continue;
    const gnSpan = a.querySelector('span');
    const gn = (gnSpan?.textContent ?? '').trim();
    if (!gn) continue;
    // Die Trefferzeile = die umschliessende Ergebnis-Tabelle des Links.
    let tbl = a.parentElement;
    while (tbl && tbl.tagName !== 'TABLE') tbl = tbl.parentElement;
    if (!tbl) continue;
    // Sekundär-GN: Klammer-Text in der Link-Zelle NACH dem <a>.
    const zelle = a.parentElement;
    const zellText = (zelle?.textContent ?? '').replace(/\s+/g, ' ');
    const mSek = /\(([A-Za-z][A-Za-z0-9]*\.\d{4}\.\d+)\)/.exec(zellText);
    const tblText = (tbl.textContent ?? '').replace(/\s+/g, ' ');
    const mDat = /Entscheiddatum:\s*(\d{2}\.\d{2}\.\d{4})/.exec(tblText);
    const mErst = /Erstpublikationsdatum:\s*(\d{2}\.\d{2}\.\d{4})/.exec(tblText);
    const mAkt = /Aktualisierungsdatum:\s*(\d{2}\.\d{2}\.\d{4})/.exec(tblText);
    // Titel: die <b>-Zelle der zweiten Zeile (colspan-Zelle mit fettem Betreff).
    let titel = '';
    for (const b of tbl.querySelectorAll('td[colspan] b')) {
      const t = (b.textContent ?? '').trim();
      if (t) { titel = t.replace(/\s+/g, ' '); break; }
    }
    out.push({
      key: Number(mKey[1]),
      gn,
      gnSekundaer: mSek ? mSek[1] : null,
      datum: dIso(mDat?.[1] ?? null),
      titel,
      erstpublikation: dIso(mErst?.[1] ?? null),
      aktualisiert: dIso(mAkt?.[1] ?? null),
    });
  }
  return out;
}

const PRO_SEITE = 999;

/** Gesamtlauf + Scope-Filter + Jahres-Gegenprobe. Wirft bei jedem Count-Gate-Bruch. */
export async function baueInventar(datum: string): Promise<Inventar> {
  // 1. Gesamtlauf (ohne jedes Kriterium).
  const erste = await holeBs(sucheUrl({ seite: 1 }), (t) => trefferAnzahl(t) !== null);
  const gesamtN = trefferAnzahl(erste.text)!;
  const seiten = Math.ceil(gesamtN / PRO_SEITE);
  console.log(`[bs-inventar] Gesamtlauf: ${gesamtN} Geschäfte → ${seiten} Seiten`);
  const zeilen: InventarZeile[] = parseTrefferliste(erste.text);
  for (let s = 2; s <= seiten; s++) {
    const seite = await holeBs(sucheUrl({ seite: s }), (t) => trefferAnzahl(t) === gesamtN);
    zeilen.push(...parseTrefferliste(seite.text));
    process.stdout.write('.');
  }
  if (seiten > 1) process.stdout.write('\n');

  // Count-Gate G2: Zeilen == N, Keys eindeutig (Wrap-/Parse-Schutz).
  if (zeilen.length !== gesamtN) {
    throw new Error(`[bs-inventar] G2 ROT: ${zeilen.length} Zeilen ≠ Portal-N ${gesamtN}`);
  }
  const keys = new Set(zeilen.map((z) => z.key));
  if (keys.size !== zeilen.length) {
    throw new Error(`[bs-inventar] G2 ROT: nF30_KEYs nicht eindeutig (${zeilen.length} Zeilen, ${keys.size} Keys)`);
  }

  // 2. Scope §2 (lokal filtern).
  const scope = zeilen.filter((z) => {
    if (z.datum) return z.datum >= '2022-01-01';
    const jahr = gnJahr(z.gn);
    return jahr !== null && jahr >= 2022;
  });

  // 3. Jahresfenster-Gegenprobe (G1-Anker): je Jahr 1 Request.
  const aktJahr = Number(datum.slice(0, 4));
  const jahre: Record<string, number> = {};
  for (let j = 2022; j <= aktJahr; j++) {
    const r = await holeBs(sucheUrl({ seite: 1, von: `01.01.${j}`, bis: `31.12.${j}` }), (t) => trefferAnzahl(t) !== null);
    const nJ = trefferAnzahl(r.text)!;
    jahre[String(j)] = nJ;
    const inventarJ = zeilen.filter((z) => z.datum?.startsWith(`${j}-`)).length;
    if (inventarJ !== nJ) {
      throw new Error(`[bs-inventar] G1 ROT Jahr ${j}: Portal ${nJ} ≠ Inventar ${inventarJ}`);
    }
    console.log(`[bs-inventar] Jahr ${j}: Portal ${nJ} == Inventar ${inventarJ} ✓`);
  }

  // Deterministische Ordnung (§2): nF30_KEY aufsteigend.
  scope.sort((a, b) => a.key - b.key);
  const datumlos = scope.filter((z) => !z.datum).length;
  console.log(`[bs-inventar] Scope: ${scope.length} Geschäfte (davon ${datumlos} ohne Entscheiddatum)`);
  return {
    erzeugt: datum,
    quelle: 'https://rechtsprechung.gerichte.bs.ch (amtliches Portal, Findinfo/Omnis)',
    portal: { gesamtN, jahre },
    eintraege: scope,
  };
}
