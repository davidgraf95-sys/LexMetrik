# FAHRPLAN — UI-Welle (Shell · Rubriken · Startseite · Responsive)

**Auftrag David (23./24.6.2026), Branch `feat/ui-shell-ueberarbeitung`.**
Sammlung von 10 UI-Kommentaren + Präzisierungen, hier geordnet zu vier Wellen.
Grundprinzipien CLAUDE.md (§1 Logik vor allem; §3 SSoT; §5 Wiederverwendung;
§6 deklarierte Änderungen; §9 Tore/Bug-Check). Lesbarkeit/mobil ist fester
Schluss-Prüfpunkt. Rechtslogik (Tarife/Fristen/Gesetzes-Snapshots) bleibt
byte-gleich — diese Welle ist reine Darstellung/Navigation.

## Entscheidungen (von David bestätigt)
- **Tabs/Multi-View** (#9 urspr.) → NICHT jetzt, erst im abschliessenden
  Ultracode-Schritt konzipieren/bauen.
- **News-Quelle** → Register (build-time, neueste zuerst) als Basis **+ live
  nachladen** wenn erreichbar; Quellen erweiterbar anlegen.
- **`/recherche`** → ersatzlos auflösen; eigene Übersicht für **Rechner UND
  Vorlagen** (Gesetze-Muster).
- **Header-Suche** bleibt, zeigt Resultate **überall im Dropdown** (auch `/`);
  Such-Schnellaktion **aus der Seitenleiste** entfernen.
- **Hero-Suche** auf Startseite bleibt prominent, nutzt **dasselbe Dropdown**.
- **Notariatsrechner** bleibt eigene Seite — nur aus Startseiten-Schnellrechner
  raus, dort stattdessen darauf **verlinken**.
- Offener Worktree `de1b62e` (Rechtsprechungs-Übersicht) bleibt **separat**.

## Welle 1 — App-Shell
1. **Sidebar: Anzahl-Badges entfernen** (`Sidebar.tsx` `.num` / `navigation.ts`
   `anzahl`) — kein Nutzen, bei Gesetzen irreführend.
2. **Sidebar: Suchknopf entfernen** (`SucheKnopf`, Event `lexmetrik:fokus-suche`).
3. **Sidebar: einklappbar + breitenverstellbar** zur Laufzeit, Zustand persistent
   (localStorage). Mobil-Schublade unberührt/sinnvoll.
4. **Header neu + Dropdown-Suche überall** (`Topbar.tsx`/`HeaderSuche.tsx`):
   Live-Resultate aus dem bestehenden `universalSuche`-Aggregator, gruppiert,
   gekappt, Klick → Ziel. Kein `?q=`-Umweg mehr als einziger Pfad.

## Welle 2 — Rubriken / Routing
5. **`/recherche` auflösen**: Route + `Recherche.tsx` entfernen; Sidebar-Titel
   „Rechner"/„Vorlagen" auf neue Übersichten; Alt-Links/Redirect sauber.
6. **Rechner-Übersicht** (`/rechner`) im Gesetze-Muster: `KATALOG_KARTEN` (nur
   Rechner), gruppiert nach Oberkategorie, Karten → Einzelrechner.
7. **Vorlagen-Übersicht** (`/vorlagen`) analog (nur Vorlagen-Karten).

## Welle 3 — Startseite
8. **News-Header**: BGer aus `rechtsprechung/register.json` (neueste zuerst) +
   live nachladen (entscheidsuche/OCL, CORS offen); Quellen-Abstraktion für
   spätere Erweiterung (neue Gesetze/Initiativen/amtliche Meldungen).
9. **Hero-Suche** → nutzt dasselbe Dropdown wie der Header (ein Suchweg).
10. **Gebühren-Tab schlank**: Notariatsrechner raus → nur **Grundstückkauf**,
    weniger Klicks bis Resultat, Formatierung überarbeiten, **Verweis** auf
    vollen Beurkundungs-/Notariatsrechner.
11. **Fristen-Kalender** auf einer Hälfte des Schnellrechners, der die
    `fristenEngine.ts` wiederverwendet (kein Parallel-Code).

## Welle 4 — Abschluss (eigener Ultracode-Lauf)
12. **Responsive-Optimierung** über alle Bildschirmgrössen — erst Handlungsplan,
    dann Umsetzung.
13. **In-App-Tabs / Splitscreen** konzipieren + bauen (mehrere Engines/Gesetze
    nebeneinander, ohne Browser-Tab).

## Tore je Welle
- `npm run` Lint/Typecheck/Tests grün (gate), golden byte-gleich (keine
  Rechtslogik berührt), §9 Bug-Check über das Delta, Playwright hell/dunkel/mobil
  375px. Deploy erst nach Davids Sichtung (skill `deploy-check`).
