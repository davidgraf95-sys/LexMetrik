// ─── Beschriftungen, die BEIDE Leser-Hüllen führen (Säuberungs-Nachzug 18.8.) ─
//
// WOZU DIESE DATEI. Das Benennungs-Glossar (`docs/ux-audit-2026-07/reader/
// leser-v3-design-grundlage.md`, Kap. 11) ist die eine Wahrheit über die
// WÖRTER; sein Wächter (`src/tests/leser-benennung.test.ts`) deckt aber
// bewusst nur die V3-Fläche. Für Wörter, die auch die eingefrorene Ist-Hülle
// führt, ist das zu wenig: dort kann derselbe Link anders heissen, ohne dass
// eine Sonde anschlägt — genau so ist P1-4 entstanden (V3-Kopf «Amtliche
// Fassung ↗», V1-Übersicht drei Zentimeter daneben «↗ geltende Fassung»).
//
// Hier stehen darum GENAU die Beschriftungen, die über die Hüllen-Grenze
// laufen. Nicht mehr: Wörter, die nur V3 führt, bleiben als Literal an ihrem
// Bauteil, wo ihre Herleitung steht, und werden vom Glossar-Wächter gedeckt.
// Eine Datei, die alle Beschriftungen einsammelte, verlöre genau das (§1: die
// Herleitung gehört zum Bauteil, nicht in ein Wörterbuch).
//
// FL-4 BLEIB GEWAHRT, bis H5 die Ist-Hülle löschte (PR #560, 21.8.2026): bis
// dahin war V1 eingefroren, hier wurde nichts an ihrer Mechanik geändert, nur
// EIN Wort geteilt, das in beiden Hüllen dasselbe Ziel benannte.
//
// KORRIGIERT 21.8.2026 (H5-Nachlese): die hier vorausgesagte Regel «fällt die
// Ist-Hülle, fällt diese Datei mit ihr» hat sich NICHT bewahrheitet — die
// Datei blieb, weil ihre Importer (`AmtlichesPdf.tsx`, `ArtikelLeser.tsx`,
// `ErlassUebersicht.tsx`, `SektionKopf.tsx`, `v3/uebersichtAngaben.ts`)
// durchweg V3 sind. Ihr Zweck ist seither nicht mehr «über die Hüllen-Grenze
// laufen» (es gibt nur noch eine Hülle), sondern schlicht: geteilte
// Beschriftungen mehrerer V3-Bauteile an einem Ort. §17-Rückbau bleibt
// offen — zu prüfen, ob die Datei aufzulösen ist (Wörter an ihre einzigen
// Verwender zurückverschieben) oder als geteilte Quelle sinnvoll bleibt.
//
// ─── HOCHZUG 31.8.2026 (W2·19-DESIGN-KONSISTENZ, Befunde B-1/B-2/B-6) ────────
// Die 21.8. offen gelassene §17-Frage ist damit BEANTWORTET, und zwar gegen den
// Rückbau: die Datei bleibt als geteilte Quelle — aber nicht mehr unter
// `src/pages/gesetz-leser/`. Zwei Gründe, beide gemessen:
//   · REICHWEITE. Dieselben Wörter führen seit B-1 auch `pages/MaterialLeser`
//     (Materialien), `components/vorlagen/NormChip` und `components/NormPopover`
//     (Vorlagen/Verweise) sowie der neue geteilte Baustein
//     `components/ui/QuellLink`. Eine Heimat unter `pages/gesetz-leser/` hätte
//     drei fremde Domänen an einen Seitenordner gebunden und den Geltungsbereich
//     der Wörter falsch etikettiert.
//   · LIB BRAUCHT SIE SELBST. `MASSGEBLICH_HALBSATZ` (B-6) steht auch in
//     `lib/normtext/erlassKopfText.ts` — die Bibliotheks-Schicht darf nicht auf
//     die Seiten-Schicht zeigen (§3). Genau diese Herleitung steht schon im Kopf
//     von `erlassKopfText.ts`; hier gilt sie unverändert.
// Die Mechanik ist unverändert: dieselben Zeichenketten, dieselben Verwender,
// nur der Ort und die drei B-6-Konstanten sind neu.

/** Ä110 · der Live-Link auf die amtliche Fassung — Pfeil «↗» steht HINTEN. */
export const AMTLICHE_FASSUNG = 'Amtliche Fassung';

/** §8: bei aufgehobenem Erlass führt derselbe Link auf die aufgehobene
 *  Konsolidierung — das gehört in den Namen, nicht in eine Fussnote. */
export const AMTLICHE_FASSUNG_AUFGEHOBEN = 'Amtliche (aufgehobene) Fassung';

/**
 * Ä127 · der Zusatz im ZUGÄNGLICHEN NAMEN eines Links, der auswärts öffnet.
 *
 * GEMESSEN am Live-Stand 18.8.2026: dieselbe Tatsache stand in drei Wortlauten
 * da — «(neues Fenster)» am Artikel- und am Sektionskopf-Link, «(öffnet in
 * neuem Tab)» am amtlichen PDF. Das erste kollidiert zusätzlich mit dem
 * Glossar: «Fenster» ist im Leser die ZWEITE LESEFLÄCHE (Split, Ä118) — ein
 * Screenreader-Nutzer hört «neues Fenster» und erwartet die Split-Fläche, nicht
 * den Browser. «Neuer Tab» ist frei von dieser Doppelbelegung und beschreibt,
 * was `target="_blank"` in jedem heutigen Browser tut.
 */
export const NEUER_TAB = '(neuer Tab)';

// ═══ B-6 (31.8.2026) · EIN NAME FÜR DAS MASSGEBLICHE ════════════════════════
//
// BEFUND (Finder-Welle B, Runde 1): derselbe Vorbehalt stand in zwei
// Substantiven da — «amtliche FASSUNG» neben «amtliche QUELLE», teils im
// selben Kopf (`ErlassLeserKopf` sagte im Aufhebungs-Banner «Quelle», im
// Link darüber «Fassung»). KORREKTUR (Gegenprüfung 31.8.2026, N1 + Delta):
// die ursprüngliche «10:5»-Zählung ist NICHT REKONSTRUIERBAR (site-weit war
// es 16:14 für «Quelle», in den Kopf-Flächen 1:3 für «Quelle» — keine
// bekannte Fläche ergibt 10:5); das Mehrheits-Argument trägt den Entscheid
// in keiner Lesart. Tragend ist das
// Präzisions-Argument: massgeblich ist nicht die Website und nicht «eine
// Quelle», sondern der amtlich publizierte Text in seiner Fassung.
// GELTUNGSBEREICH heute: die im Wächter (`leser-benennung.test.ts`,
// APP_DATEIEN) genannten Flächen; ~11 sichtbare «Quelle»-Stellen ausserhalb
// (EntscheidLeser, seo-detail, KontextPanel …) wandern wellenweise nach —
// Register: FAHRPLAN-DESIGN-KONSISTENZ §3.
//
// EINE Wahrheit ist das NOMEN, nicht der Satz: die Stellen brauchen zwei
// Grammatiken (Halbsatz nach Gedankenstrich bzw. eigener Satz), und ein
// zweites Literal für den Satz wäre wieder eine zweite Wahrheit (§5). Darum
// wird der Satz aus dem Nomen GEBAUT.
//
// §8: «stets» im Satzform-Fall bleibt erhalten — es ist Nachdruck, keine
// Floskel; ein Vereinheitlichen darf einen Ehrlichkeits-Satz nie abschwächen.

/** Das Bezugsobjekt des Vorbehalts — das eine Wort (B-6). */
export const AMTLICHE_FASSUNG_NOMEN = 'die amtliche Fassung';

/** Halbsatz nach Gedankenstrich: «… — massgeblich ist die amtliche Fassung». */
export const MASSGEBLICH_HALBSATZ = `massgeblich ist ${AMTLICHE_FASSUNG_NOMEN}`;

/** Eigenständiger Satz: «Massgeblich ist stets die amtliche Fassung.» */
export const MASSGEBLICH_SATZ = `Massgeblich ist stets ${AMTLICHE_FASSUNG_NOMEN}.`;
