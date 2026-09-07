/**
 * scripts/normtext/zh-tarif-geometrie.ts — x-koordinatenbasierte Extraktion der
 * ZH-Tarif-Tabellen (Streitwert-Staffeln und NotGebV-Anhang).
 *
 * Herausgezogen aus adapter-zh-pdf.ts am 31.8.2026 (§6.6 Datei-Schlankheit,
 * reiner Umzug — der Adapter re-exportiert beide Funktionen unverändert, die
 * Regeneration aller 24 ZH-Erlasse ist byte-gleich).
 *
 * §2: rein und deterministisch (kein pdfjs, kein Netz, kein FS) — beide
 * Funktionen arbeiten auf bereits gelesenen Roh-Stücken {x,y,h,s,p}.
 */

import { fuegeZeilen } from './zh-text.ts';

/** Grösster erlaubter Abstand (pt) zwischen der gewählten Wortgrenze und der
 *  Spaltengrenze. Gemessen am einzigen Fall im Bestand: 3.5 pt. Liegt keine
 *  Wortgrenze näher als 12 pt, bleibt das Fragment ungeteilt — dann ist die
 *  Klebung nicht sicher lokalisierbar (§1: lieber ungeteilt als falsch geteilt). */
const SPALTENRAND_TOLERANZ_PT = 12;

/**
 * Trennt ein Fragment, das die GEMESSENE Spaltengrenze überläuft, an der ihr
 * nächstgelegenen Wortgrenze (Bug B-5, Gegenprüfung Runde 2, 31.8.2026).
 *
 * ANLASS: In der ersten Staffelzeile von ZH-211.11 § 4 liefert pdfjs
 * «000 25% des Streitwertes, mind. Fr. 150» als EIN Fragment ab x = 153.6
 * (Breite 115.1) — es beginnt in der Streitwert-Spalte und läuft über die
 * Grundgebühr-Grenze (x = 169.2, gemessen am Spaltenkopf) hinweg. Die
 * x-Zuordnung steckte die ganze Zeile in Spalte 1; der Snapshot trug
 * ['bis 1 000 25% des Streitwertes, mind. Fr. 150', '', ''] statt drei Zellen.
 *
 * VERFAHREN (§1: kein Zeichen wird geändert, nur die Zellzuordnung):
 * Aus x, Breite und Zeichenzahl wird für jede Wortgrenze im Fragment ihre
 * x-Position geschätzt; gewählt wird die der Spaltengrenze nächste. Fehlt die
 * Breite oder liegt keine Wortgrenze innerhalb der Toleranz, bleibt das
 * Fragment unangetastet.
 *
 * NUR an `threshold1`: diese Grenze ist am Spaltenkopf GEMESSEN
 * («Grundgebühr»/«Gebühr»-x). `threshold2` ist dagegen ein empirischer Versatz
 * (threshold1 + 47) — auf einer geschätzten Grenze zu schneiden hiesse, eine
 * Schätzung auf eine Schätzung zu setzen. Die Grundgebühr|Zuschlag-Klebung
 * löst weiterhin der «zuzügl.»-Nachlauf.
 */
export function teileAmSpaltenrand<T extends { x: number; s: string; w?: number }>(
  zeile: readonly T[],
  schwelle: number,
): Array<{ x: number; s: string; w?: number }> {
  const raus: Array<{ x: number; s: string; w?: number }> = [];
  for (const st of zeile) {
    const w = st.w;
    if (!w || st.x >= schwelle || st.x + w <= schwelle || !st.s.includes(' ')) {
      raus.push({ x: st.x, s: st.s, w: st.w });
      continue;
    }
    const len = st.s.length;
    let besterIdx = -1;
    let besterAbstand = Infinity;
    for (let i = 0; i < len; i++) {
      if (st.s[i] !== ' ') continue;
      const geschaetztesX = st.x + ((i + 1) / len) * w;
      const abstand = Math.abs(geschaetztesX - schwelle);
      if (abstand < besterAbstand) {
        besterAbstand = abstand;
        besterIdx = i;
      }
    }
    if (besterIdx < 0 || besterAbstand > SPALTENRAND_TOLERANZ_PT) {
      raus.push({ x: st.x, s: st.s, w: st.w });
      continue;
    }
    const links = st.s.slice(0, besterIdx).trimEnd();
    const rechts = st.s.slice(besterIdx + 1).trimStart();
    const trennX = st.x + ((besterIdx + 1) / len) * w;
    // Der rechte Teil steht DEFINITIONSGEMÄSS in der Spalte rechts der Grenze —
    // die aus der Zeichenzahl geschätzte Trenn-x kann sie um wenige Punkte
    // verfehlen (hier 165.4 gegen 169.2). Darum auf die Grenze anheben, sonst
    // landete das Fragment wieder in der linken Spalte.
    const rechtsX = Math.max(trennX, schwelle);
    if (links) raus.push({ x: st.x, s: links, w: trennX - st.x });
    if (rechts) raus.push({ x: rechtsX, s: rechts, w: st.x + w - rechtsX });
  }
  return raus;
}

// ─────────────────────────────────────────────────────────────────────────────
// x-koordinatenbasierte Streitwert-Staffel-Extraktion (ZH-215.3 § 4, ZH-211.11 § 3 + § 4)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrahiert eine Streitwert-Staffel-Tabelle aus den rohen PDF-Stücken {x,y,h,s,p}
 * einer §-Region. Unterstützt zwei Tabellenformen, automatisch erkannt am Kopf:
 *
 * 3-Spalten-Form (ZH-215.3 § 4, ZH-211.11 § 4, h≈7.50 pt):
 *   Kopf «Streitwert | Grundgebühr» → kopf: ['Streitwert','Grundgebühr',''] (die
 *   dritte Spalte trägt im PDF KEINEN Kopf — s. Titel-Kommentar unten)
 *   threshold1 = x von «Grundgebühr» (≈169 pt); threshold2 = threshold1+47 (≈216 pt).
 *   «zuzügl.»-Token in col2 wird an den Anfang von col3 verschoben (deterministisch).
 *
 * 2-Spalten-Form (ZH-211.11 § 3, h≈7.98 pt):
 *   Kopf «Streitwert | Gebühr» → kopf: ['Streitwert','Gebühr']
 *   threshold1 = x von «Gebühr» (≈203 pt); kein threshold2.
 *   Datenzeilen 2-spaltig: [Streitwert, Gebühr].
 *
 * Erkennungslogik (§1: nur aus x-Geometrie, kein Ziffern-Raten):
 *   - TABLE_MAX_H = 8.5 pt: erfasst beide Tabellenschrift-Höhen (7.50 und 7.98).
 *   - Kopfzeile = erste y-Gruppe mit «Streitwert»-Stück.
 *   - «Grundgebühr» in derselben Kopfzeile → 3-Spalten-Form;
 *     «Gebühr» ohne «Grundgebühr» → 2-Spalten-Form.
 *   - Keine Heuristik/Ziffern-Raten — nur Stück-x als Spalten-Zuordnung.
 *
 * Guard: keine Kopfzeile oder < 2 Datenzeilen → null (mehrdeutige Geometrie).
 * §2: kein Date.now/Math.random. §3: reine Extraktion, kein UI-Code.
 *
 * Zur einzigen Ausnahme von «Stücke werden nie intern aufgespalten» (Bug B-5,
 * Gegenprüfung Runde 2): siehe `teileAmSpaltenrand`.
 */
export function extrahiereZhStreitwertStaffel(
  stuecke: Array<{ x: number; y: number; h: number; s: string; p: number; w?: number }>,
): { kopf: string[]; zeilen: string[][]; einleitung: string } | null {
  if (stuecke.length === 0) return null;

  // ── Schritt 1: Tabellenschrift filtern
  // TABLE_MAX_H = 8.5 pt: erfasst ZH-211.11 § 3 (h=7.98) + ZH-211.11/215.3 § 4 (h=7.50).
  // Body-Text (h≈9.18) und Absatz-Hochzahlen (h≈5.70) werden ausgeschlossen.
  // Marginalien (x≤60, h≤7.7) ausschliessen (liegen bei x≈28 im Aussenrand).
  const TABLE_MAX_H = 8.5; // Tabellenschrift bis 7.98; Body-Text 9.18
  const TABLE_MIN_H = 6.5; // Absatz-Hochzahlen h≈5.7: NICHT Tabellenspalten
  const MARG_X_MAX = 60;   // Marginalien-Stücke liegen bei x≈28

  const tabStuecke = stuecke.filter(
    (s) => s.h >= TABLE_MIN_H && s.h <= TABLE_MAX_H && s.x > MARG_X_MAX,
  );

  if (tabStuecke.length === 0) return null;

  // ── Schritt 2: Zeilen (p, y-absteigend) bilden
  const byPY = new Map<string, Array<{ x: number; s: string; w?: number }>>();
  for (const s of tabStuecke) {
    const key = `${s.p}_${Math.round(s.y)}`;
    let l = byPY.get(key);
    if (!l) {
      l = [];
      byPY.set(key, l);
    }
    l.push({ x: s.x, s: s.s, w: s.w });
  }

  const zeilen = [...byPY.entries()].sort((a, b) => {
    const [pa, ya] = a[0].split('_').map(Number);
    const [pb, yb] = b[0].split('_').map(Number);
    return pa - pb || yb - ya;
  });

  // ── Schritt 3: Kopfzeile finden + Tabellenform erkennen
  // Erste Zeile mit «Streitwert»-Stück = Kopfzeile.
  // threshold1 = x der zweiten Kopfspalte («Grundgebühr» oder «Gebühr»).
  // threshold2 = threshold1 + 47 (Grundgebühr|Zuschlag-Grenze, empirisch).
  //
  // 3-Spalten-Form: «Grundgebühr» im Kopf → dreiSpalten = true (sicher).
  // Sonst («Gebühr» im Kopf): dreiSpalten = true, WENN in den Datenzeilen nach
  // dem Kopf tatsächlich Stücke bei x ≥ threshold2 vorhanden sind (ZH-215.3 § 4
  // hat «Gebühr» als Kopf, aber Zuschlag-Stücke bei x≈216); SONST 2-Spalten-Form
  // (ZH-211.11 § 3 hat «Gebühr» + keine Stücke rechts von threshold2≈250).
  // §1: nur x-Koordinaten, kein Ziffern-Raten; mehrdeutige Geometrie → null.
  let kopfIdx = -1;
  let threshold1 = 0;
  let dreiSpalten = false;
  for (let i = 0; i < zeilen.length; i++) {
    const [, stueckeRow] = zeilen[i];
    const streitwertSt = stueckeRow.find((s) => s.s.trim() === 'Streitwert');
    if (!streitwertSt) continue;
    // «Grundgebühr» im Kopf → sicher 3-Spalten
    const grundgebuehrSt = stueckeRow.find((s) => s.s.trim() === 'Grundgebühr');
    // «Gebühr» im Kopf → erst Daten prüfen
    const gebuehrSt = stueckeRow.find((s) => s.s.trim() === 'Gebühr');
    if (grundgebuehrSt) {
      kopfIdx = i;
      threshold1 = grundgebuehrSt.x; // x von «Grundgebühr» → Grenze Streitwert|Grundgebühr
      dreiSpalten = true;
      break;
    }
    if (gebuehrSt) {
      kopfIdx = i;
      threshold1 = gebuehrSt.x; // x von «Gebühr» → vorläufige Grenze Streitwert|Gebühr
      // dreiSpalten wird nach dem Daten-Prüfschritt gesetzt (s.u.)
      break;
    }
  }

  if (kopfIdx < 0 || threshold1 === 0) return null;

  // threshold2 = Grundgebühr|Zuschlag-Grenze (empirisch: threshold1 + 47 pt).
  // Zuschlag-Stücke (ZH-215.3 § 4) starten empirisch bei x ≈ 215 (threshold1≈168+47).
  const threshold2 = threshold1 + 47;

  // Daten-Prüfschritt: Falls Kopf nur «Gebühr» (kein «Grundgebühr») → prüfen ob
  // in den Datenzeilen nach dem Kopf Stücke bei x ≥ threshold2 vorhanden (Zuschlag).
  if (!dreiSpalten) {
    for (let i = kopfIdx + 1; i < zeilen.length; i++) {
      const [, stueckeRow] = zeilen[i];
      if (stueckeRow.some((s) => s.s.includes('(in Franken)'))) continue;
      if (stueckeRow.some((s) => s.x >= threshold2)) {
        dreiSpalten = true;
        break;
      }
    }
  }

  // ── Schritt 4: Datenzeilen extrahieren
  // «(in Franken)»-Unterzeile und leere Zeilen überspringen.
  const datenZeilen: string[][] = [];
  for (let i = kopfIdx + 1; i < zeilen.length; i++) {
    const [, stueckeRow] = zeilen[i];
    if (stueckeRow.some((s) => s.s.includes('(in Franken)'))) continue;
    if (stueckeRow.length === 0) continue;

    const sorted = teileAmSpaltenrand(stueckeRow, threshold1).sort((a, b) => a.x - b.x);

    if (dreiSpalten) {
      // 3-Spalten-Form: Streitwert | Grundgebühr | Zuschlag
      const col1: string[] = [];
      const col2: string[] = [];
      const col3: string[] = [];
      for (const st of sorted) {
        if (st.x < threshold1) {
          col1.push(st.s);
        } else if (st.x < threshold2) {
          col2.push(st.s);
        } else {
          col3.push(st.s);
        }
      }

      let c1 = col1.join(' ').replace(/\s+/g, ' ').trim();
      let c2 = col2.join(' ').replace(/\s+/g, ' ').trim();
      let c3 = col3.join(' ').replace(/\s+/g, ' ').trim();

      // Post-Prozess §1-sicher: «über 10 Mio. 106» — «106» (x knapp < threshold1)
      // fälschlich in col1 → an den Anfang von col2 verschieben (kein Ziffern-Raten,
      // nur Fragment-Verschiebung).
      const mioSplit = c1.match(/^(.*\bMio\.)\s+(\d[\d\s]*)$/);
      if (mioSplit) {
        c1 = mioSplit[1].trim();
        const wanderFragment = mioSplit[2].trim();
        c2 = c2 ? `${wanderFragment} ${c2}` : wanderFragment;
      }

      // Post-Prozess: «zuzügl.» am Ende von col2 → Anfang von col3 verschieben.
      if (c2.endsWith(' zuzügl.') || c2 === 'zuzügl.') {
        const stripped = c2.endsWith(' zuzügl.')
          ? c2.slice(0, -' zuzügl.'.length).trim()
          : '';
        c2 = stripped;
        c3 = c3 ? `zuzügl. ${c3}` : 'zuzügl.';
      } else if (c2.includes(' zuzügl.')) {
        const idx = c2.lastIndexOf(' zuzügl.');
        const stripped = c2.slice(0, idx).trim();
        const rest = c2.slice(idx + 1).trim();
        c2 = stripped;
        c3 = rest + (c3 ? ` ${c3}` : '');
      }

      if (!c1 && !c2 && !c3) continue;
      datenZeilen.push([c1, c2, c3]);
    } else {
      // 2-Spalten-Form: Streitwert | Gebühr
      const col1: string[] = [];
      const col2: string[] = [];
      for (const st of sorted) {
        if (st.x < threshold1) {
          col1.push(st.s);
        } else {
          col2.push(st.s);
        }
      }

      const c1 = col1.join(' ').replace(/\s+/g, ' ').trim();
      const c2 = col2.join(' ').replace(/\s+/g, ' ').trim();

      if (!c1 && !c2) continue;
      datenZeilen.push([c1, c2]);
    }
  }

  // Guard: ≥ 2 Datenzeilen erforderlich (§1: mehrdeutige Geometrie → null)
  if (datenZeilen.length < 2) return null;

  // ── Schritt 5: EINLEITUNGSSATZ vor der Tabelle (Befund E1, 31.8.2026)
  // Vorher setzte holeZhPdf den Blocktext dieser Absätze hart auf '' — der
  // Einleitungssatz («Bei vermögensrechtlichen Streitigkeiten beträgt die
  // Gebühr für das Schlichtungsverfahren:») verschwand mit dem Flachtext der
  // Tabelle. Er steht in BODY-Schrift (h ≥ 8.7) oberhalb der Kopfzeile und wird
  // hier aus derselben Region gelesen, ohne die Tabellenwerte zu berühren.
  const [kopfP, kopfY] = zeilen[kopfIdx][0].split('_').map(Number);
  const einleitung = leseVortext(stuecke, kopfP, kopfY);

  // Einheitenzeile «(in Franken)» gehört zum Spaltenkopf, nicht zu den Werten.
  const einheit = tabStuecke.some((s2) => s2.s.includes('(in Franken)'))
    ? ' (in Franken)'
    : '';
  // SPALTENTITEL — nur, was das PDF trägt (A2, Fix-Runde 3).
  // Die Kopfzeile lautet in ZH-211.11 § 4 und ZH-215.3 § 4 wörtlich
  // «Streitwert | Grundgebühr» plus die Einheitenzeile «(in Franken)». Eine
  // DRITTE Spaltenüberschrift gibt es dort NICHT: die Zuschlagsformel («zuzügl.
  // 20% des Fr. 1 000 übersteigenden Streitwertes») steht im Druckbild ohne
  // eigenen Kopf rechts neben der Grundgebühr. Der frühere Titel «Zuschlag» war
  // darum ein Haus-Etikett im Gewand eines Zitats (§7/§8) — er ist jetzt leer,
  // genau wie die Quelle. Die Spalte selbst bleibt: sie trägt echte Daten, und
  // `check:tabellen` beanstandet eine Leerspalte nur, wenn AUCH die Zellen leer
  // sind.
  const titel = dreiSpalten
    ? ['Streitwert', 'Grundgebühr', '']
    : ['Streitwert', 'Gebühr'];
  return {
    kopf: titel.map((t, i) => (i < 2 ? `${t}${einheit}` : t)),
    zeilen: datenZeilen,
    einleitung,
  };
}

/**
 * Body-Text einer §-Region OBERHALB der Tabellenkopfzeile (p/y), als ein Satz
 * zusammengefügt. Rein (§2). Der §-Kopf selbst («§ 3.») wird abgeschnitten —
 * er ist Adresse, nicht Normtext.
 */
function leseVortext(
  stuecke: Array<{ x: number; y: number; h: number; s: string; p: number }>,
  kopfP: number,
  kopfY: number,
): string {
  const nachZeile = new Map<string, Array<{ x: number; w: number; s: string }>>();
  for (const st of stuecke) {
    if (st.h < 8.7) continue; // nur Body-Schrift
    const y = Math.round(st.y);
    if (st.p > kopfP || (st.p === kopfP && y <= kopfY)) continue;
    const key = `${st.p}_${y}`;
    let liste = nachZeile.get(key);
    if (!liste) {
      liste = [];
      nachZeile.set(key, liste);
    }
    liste.push({ x: st.x, w: 0, s: st.s });
  }
  const sortiert = [...nachZeile.entries()].sort((a, b) => {
    const [pa, ya] = a[0].split('_').map(Number);
    const [pb, yb] = b[0].split('_').map(Number);
    return pa - pb || yb - ya;
  });
  const roh = sortiert.map(([, liste]) =>
    liste
      .sort((a, b) => a.x - b.x)
      .map((t) => t.s)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      // Der Silbentrennstrich am Zeilenende ist ein eigenes PDF-Fragment. In
      // der §-Region steht keine Fragmentbreite zur Verfügung, darum wird hier
      // pauschal mit Leerzeichen verbunden — der Trennstrich muss danach wieder
      // ans Wort («Grund -» → «Grund-»), sonst fügt fuegeZeilen die Silben
      // nicht zusammen («Grund - gebühr»).
      .replace(/(\p{L}) -$/u, '$1-'),
  );
  const text = fuegeZeilen(roh);
  return text.replace(/^§+\s*\d+\s*[a-z]?\s*(?:bis|ter|quater|quinquies)?\s*\.\s*/, '').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// x-koordinatenbasierte NotGebV-Anhang-Tarif-Extraktion (ZH-243 «Anhang: Gebührentarif»)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrahiert den gesamten ZH-NotGebV-Anhang-Gebührentarif (ZH-243, «Anhang:
 * Gebührentarif (§ 1)», PDF-Seiten 5–22) x-koordinatenbasiert aus den rohen
 * PDF-Stücken {x,y,h,s,p} der Anhang-Region (alles ab dem «Anhang»-Titel).
 *
 * Spaltenmodell (empirisch verifiziert, Geometrie-Spike 22.6.2026 — §7):
 * Der Anhang ist eine 4-Spalten-Tabelle im Spiegelrand-Buch, deren x-Lage je
 * Seitenparität wechselt (Bundsteg):
 *   - UNGERADE Seiten: Ziffer x≈54 · Beschreibung x≈82 (Unter-«–» x≈91)
 *                      · Ansatz/Fr. x≈252 · «siehe Ziff.» (Verweis) x≈289–295
 *   - GERADE Seiten:   Ziffer x≈88 · Beschreibung x≈116 (Unter-«–» x≈125)
 *                      · Ansatz/Fr. x≈286 · «siehe Ziff.» (Verweis) x≈329
 * Die Schwellen werden RELATIV zur Beschreibungsspalte (descX, linkester
 * Nicht-Ziffer-Cluster der Seite) bestimmt — robust gegen den Bundsteg:
 *   descX+170 ≈ Ansatzspalte · descX+207…213 ≈ Verweisspalte.
 *
 * §1 (Wortlaut-Treue): der Ansatz (0,75‰, «mindestens 50», Rahmen «100–1500»)
 * bleibt INLINE in Lese-Reihenfolge in der Beschreibung — bei mehrzeiligen
 * hierarchischen Einträgen (Unter-«–»-Bänder) steht so jeder Betrag direkt bei
 * seinem Tatbestand (eine flache Betrags-Spalte würde Betrag und Phrase
 * trennen → unlesbar/irreführend). Nur die Verweis-Spalte («siehe Ziff.»,
 * Querverweis-Ziffern wie «2.2.1, 2.2.2,») wird separiert und als
 * «(vgl. Ziff. …)» ans Zeilenende gestellt. Silbentrennung an Zeilengrenzen
 * («Begrün-»+«dung» → «Begründung») wird zusammengefügt (ausser vor
 * Konjunktionen wie «oder/und» = echte Hängestrich-Komposita). Kein Zeichen
 * geändert/erfunden — nur Spalten getrennt, Trennstriche gefügt (§1/§3).
 *
 * Schrift-Trennung (§1): Tarif-/Tatbestand-Stücke sind h≈9.18 (Body). Die
 * Spaltenköpfe «Ansatz/Fr.»/«Grundbuchgebühren siehe Ziff.:» (h≈8.2) und die
 * Fussnoten-Definitionen (h≈8.0) werden über h ≥ 8.7 ausgeschlossen — sie
 * dürfen NIE in eine Tarif-Zelle geraten (Bug 22.6.2026: die Köpfe klebten
 * früher als «… 50 Ansatz/Fr. Beurkundungsgebühren siehe Ziff.:» in den Text).
 *
 * Rückgabe: `{ kopf, zeilen }` — eine N-Spalten-Tabelle des GANZEN Anhangs.
 * Jede Zeile = [Ziffer, Beschreibung (mit Inline-Ansätzen), «siehe Ziff.»].
 * Die hierarchischen Ziffern (2.3.3, 2.3.5.1) bleiben als Strings in Spalte 0.
 * Guard (§1): null, wenn die Geometrie keine Ziffer-Spalte hergibt (mehrdeutig
 * → kein geratenes Resultat). `holeZhPdf` zerlegt die Zeilen anschliessend in
 * die je-Ziffer-Snapshot-Einträge (Token-adressierbar für die Zitat-Auflösung).
 *
 * §2 rein/deterministisch (kein Date.now/Math.random); §3 keine UI.
 */
export function extrahiereZhNotariatsTarif(
  stuecke: Array<{ x: number; y: number; h: number; s: string; p: number }>,
): {
  kopf: string[];
  zeilen: string[][];
  /** Quellgetreues Etikett der VERWEIS-Spalte je Tarif-Ziffer (A2, Fix-Runde 3).
   *
   *  Der ZH-NotGebV-Anhang trägt ZWEI verschiedene Verweis-Spalten, je nach
   *  Abschnitt: «Grundbuchgebühren siehe Ziff.:» (S. 5–7) und
   *  «Beurkundungsgebühren siehe Ziff.:» (S. 8–14). Beide auf ein einziges
   *  «(vgl. Ziff. …)» abzubilden, wirft die Unterscheidung weg — der Leser
   *  erfährt nicht mehr, WELCHE Gebühr gemeint ist. Das Etikett wird darum am
   *  Spaltenkopf der jeweiligen Seite GELESEN, nie gesetzt. */
  verweisEtiketten: Record<string, string>;
} | null {
  if (stuecke.length === 0) return null;

  // Nur Body-/Tarif-Schrift (h≈9.18). Köpfe (h≈8.2) + Fussnoten (h≈8.0) raus.
  const content = stuecke.filter((s) => s.h >= 8.7);
  if (content.length === 0) return null;

  // Nach (Seite, y) zu Tabellenzeilen gruppieren, von oben nach unten lesen.
  type S = { x: number; y: number; h: number; s: string; p: number };
  const byPY = new Map<string, S[]>();
  for (const s of content) {
    const key = `${s.p}_${Math.round(s.y)}`;
    let l = byPY.get(key);
    if (!l) {
      l = [];
      byPY.set(key, l);
    }
    l.push(s);
  }
  const rows = [...byPY.entries()]
    .map(([key, ss]) => {
      const [p, y] = key.split('_').map(Number);
      return { p, y, ss: ss.sort((a, b) => a.x - b.x) };
    })
    .sort((a, b) => a.p - b.p || b.y - a.y);

  // Ziffer-Token am Zeilenanfang in der Ziffer-Spalte. Zwei Formen:
  //   - hierarchisch «N.N…» (1.1.1, 2.3.3, 5.2) — Sektion A/B + 5.x;
  //   - nackt «N» / «NN» (1, 2, …, 14) — Sektions-Gruppenköpfe (1–4: «Beurkundungs-
  //     gebühren», die Halbgebühr-Regel) UND die Sektion-C-Posten (5–14: «Auszüge»,
  //     «Schriftliche Auskunft» …). Beide tragen eigenen Tarif-Wortlaut und sind je
  //     eine Tabellenzeile — nur so endet 5.2 NICHT als Riesen-Blob, der 6–14 mit-
  //     verschluckt. Die x-Lage (Ziffer-Spalte) trennt Kopf von einer nackten
  //     Betrags-Zahl (die in der Ansatz-/Body-Spalte rechts liegt).
  // Verweis-Ziffern (2.2.1 …) matchen das Muster auch, liegen aber rechts
  // (Verweisspalte) → über die x-Schwelle (descX-3) ausgeschlossen.
  const KOPF = /^(\d+(?:\.\d+)*)\s*(.*)$/; // Token (hierarchisch ODER nackt) + Resttext
  const REF = /^\d+\.\d+[\d.,\s]*$/; // reine Verweis-Ziffernkette «2.2.1, 2.2.2,»
  const KONJ = /^(oder|und|bzw|sowie|beziehungsweise)\b/i;
  // Ein Ziffer-Kopf-Stück: «N.N…» (mit/ohne Resttext) ODER nackt «N»/«NN» (1–2
  // Stellen, kein Komma/Punkt → keine Betrags-/Verweis-Zahl).
  const istZifferKopfStueck = (s: string): boolean => {
    const t = s.trim();
    return /^\d+(?:\.\d+)+(?:\s|$)/.test(t) || /^\d{1,2}(?:\s|$)/.test(t);
  };

  // Spalten-x je Seite: tokX = linkester Ziffer-Cluster; descX = linkester
  // Nicht-Ziffer-Cluster rechts davon (Beschreibungsspalte). Relativ dazu die
  // Verweisspalte (descX+195) — der Ansatz bleibt INLINE in der Beschreibung.
  const tokX = new Map<number, number>();
  for (const r of rows) {
    const f = r.ss[0];
    if (istZifferKopfStueck(f.s)) {
      const c = tokX.get(r.p);
      if (c === undefined || f.x < c) tokX.set(r.p, f.x);
    }
  }
  const descX = new Map<number, number>();
  for (const r of rows) {
    for (const s of r.ss) {
      if (s.x > (tokX.get(r.p) ?? 0) + 12) {
        const c = descX.get(r.p);
        if (c === undefined || s.x < c) descX.set(r.p, s.x);
      }
    }
  }

  // Verweis-Spaltenköpfe je Seite (A2): die Schwelle ist dieselbe wie in
  // baueZeile (descX + 195), damit Kopf und Zellen aus DERSELBEN Spalte kommen.
  const verweisSchwelle = new Map<number, number>();
  for (const [p, dX] of descX) verweisSchwelle.set(p, dX + 195);
  const verweisKopfJeSeite = leseVerweisKoepfe(stuecke, verweisSchwelle);

  type E = { token: string; lines: Array<{ main: string; ref: string }>; seiten: Set<number> };
  const eintraege: E[] = [];
  let cur: E | null = null;

  // Eine Tabellenzeile in (Beschreibung+Ansatz inline | Verweis) zerlegen.
  const baueZeile = (pieces: S[], dX: number): { main: string; ref: string } => {
    const bVer = dX + 195; // Schwelle Beschreibung/Ansatz (inline) → Verweisspalte
    const main = pieces
      .filter((s) => s.x < bVer)
      .map((s) => s.s)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const ref = pieces
      .filter((s) => s.x >= bVer && REF.test(s.s.trim()))
      .map((s) => s.s)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { main, ref };
  };

  for (const r of rows) {
    const dX = descX.get(r.p) ?? 82;
    const first = r.ss[0];
    const firstIstZiffer = first.x < dX - 3 && istZifferKopfStueck(first.s);
    if (firstIstZiffer) {
      const m = first.s.trim().match(KOPF)!;
      // Erster Treffer eines Tokens gewinnt (defensiv gegen Wiederholungen).
      if (eintraege.some((e) => e.token === m[1])) {
        cur = eintraege.find((e) => e.token === m[1])!;
        cur.seiten.add(r.p);
        continue;
      }
      cur = { token: m[1], lines: [], seiten: new Set([r.p]) };
      eintraege.push(cur);
      const ln = baueZeile(r.ss.slice(1), dX);
      const main = `${m[2] ? `${m[2]} ` : ''}${ln.main}`.replace(/\s+/g, ' ').trim();
      cur.lines.push({ main, ref: ln.ref });
      continue;
    }
    if (!cur) continue; // vor dem ersten Ziffer-Kopf (Abschnitts-Titel «A.») → ignorieren
    cur.seiten.add(r.p);
    // Fortsetzungszeile: alles ab der Beschreibungsspalte (Abschnitts-Letter
    // «A./B./C.» und nackte Top-Level-Zahlen in der Ziffer-Spalte überspringen).
    const body = r.ss.filter((s) => s.x >= dX - 3);
    if (body.length === 0) continue;
    cur.lines.push(baueZeile(body, dX));
  }

  // Guard (§1): keine Ziffer-Einträge erkannt → mehrdeutige Geometrie → null.
  if (eintraege.length === 0) return null;

  // Zeilen je Eintrag zusammenfügen: Silbentrennung an Zeilengrenzen (nicht vor
  // Konjunktionen); Verweise gesammelt als «(vgl. Ziff. …)»-Suffix.
  const zeilen: string[][] = [];
  const verweisEtiketten: Record<string, string> = {};
  for (const e of eintraege) {
    let desc = '';
    for (const ln of e.lines) {
      const t = ln.main;
      if (!t) continue;
      if (/\p{L}-$/u.test(desc) && /^\p{Ll}/u.test(t) && !KONJ.test(t)) {
        desc = desc.slice(0, -1) + t;
      } else {
        desc = desc ? `${desc} ${t}` : t;
      }
    }
    desc = desc.replace(/\s+/g, ' ').trim();
    const refs = e.lines
      .map((l) => l.ref)
      .filter(Boolean)
      .join(' ')
      .replace(/[,\s]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!desc && !refs) continue;
    zeilen.push([e.token, desc, refs]);
    if (refs) {
      // Etikett von der Seite, auf der die Verweis-ZELLE steht (nicht von der
      // Kopfzeile des Eintrags): ein Eintrag kann über einen Seitenumbruch
      // laufen, und der Abschnittswechsel Grundbuch → Beurkundung fällt mit
      // einem Seitenumbruch zusammen.
      const seiteMitRef = e.lines.findIndex((l) => l.ref !== '');
      const kandidaten = [...e.seiten].sort((a, b) => a - b);
      const etikett =
        kandidaten.map((p) => verweisKopfJeSeite.get(p)).find((v) => v !== undefined) ??
        undefined;
      if (etikett !== undefined && seiteMitRef >= 0) verweisEtiketten[e.token] = etikett;
    }
  }

  if (zeilen.length === 0) return null;
  return { kopf: ['Ziffer', 'Beschreibung', 'siehe Ziff.'], zeilen, verweisEtiketten };
}

/**
 * Liest die Kopfzeile der VERWEIS-Spalte je Seite aus den Kleinsatz-Stücken
 * (h ≈ 8.16; Body ist 9.18) rechts der Verweis-Schwelle.
 *
 * Gemessen an ZH-243 (31.8.2026): der Kopf steht dreizeilig, silbengetrennt —
 * «Grundbuch-» / «gebühren» / «siehe Ziff.:» bzw. «Beurkun-» / «dungs-» /
 * «gebühren» / «siehe Ziff.:». Die Zeilen werden von oben nach unten
 * zusammengefügt und der Trennstrich am Zeilenende getilgt.
 *
 * Liefert für Seiten ohne solchen Kopf keinen Eintrag — dann trägt die Zeile
 * kein Etikett und der Verweis erscheint ohne Spaltennamen (§8: lieber kein
 * Etikett als ein geratenes).
 */
function leseVerweisKoepfe(
  stuecke: Array<{ x: number; y: number; h: number; s: string; p: number }>,
  schwelleJeSeite: Map<number, number>,
): Map<number, string> {
  const jeSeite = new Map<number, Array<{ y: number; x: number; s: string }>>();
  for (const st of stuecke) {
    if (st.h >= 8.7 || st.h < 7.9) continue; // nur der Spaltenkopf-Kleinsatz
    const grenze = schwelleJeSeite.get(st.p);
    if (grenze === undefined || st.x < grenze) continue;
    let l = jeSeite.get(st.p);
    if (!l) { l = []; jeSeite.set(st.p, l); }
    l.push({ y: st.y, x: st.x, s: st.s });
  }
  const raus = new Map<number, string>();
  for (const [p, teile] of jeSeite) {
    teile.sort((a, b) => b.y - a.y || a.x - b.x);
    let t = '';
    for (const teil of teile) {
      const w = teil.s.trim();
      if (!w) continue;
      if (t.endsWith('-')) t = t.slice(0, -1) + w;
      else t = t ? `${t} ${w}` : w;
    }
    t = t.replace(/\s+/g, ' ').trim();
    if (/siehe Ziff/i.test(t)) raus.set(p, t);
  }
  return raus;
}

