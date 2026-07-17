// A31 (David 16.7.2026): Wort-Verbinder (U+2060 WORD JOINER — zero-width, KEIN
// Leerzeichen). Vor einen Fussnoten-Marker gesetzt klebt er ihn an das
// vorausgehende Wort, sodass der Marker nie allein auf eine neue Zeile umbricht
// (Fedlex-treu; behob den «grossen Abstand zum nächsten Absatz», wenn der Marker
// auf schmalem Viewport allein umbrach). Reine Darstellung (§3).
//
// Eigene .ts-Datei (nicht in ArtikelBody.tsx: react-refresh/only-export-components
// verbietet Nicht-Komponenten-Exporte neben Komponenten; nicht in
// lib/normtext/darstellung.ts: das ist ein Gegenprüfungs-Risiko-Pfad, dieser
// Reader-Fix ist reine Darstellung). So bleiben BEIDE Tore grün.
export const WJ = String.fromCharCode(0x2060);
