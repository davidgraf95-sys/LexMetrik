# Fahrplan: Token-Disziplin bei Bau & Prüfung (11.6.2026)

**Auftrag David (11.6.2026, freie Fahrt):** «ich will einfach dass weniger
tokens benötigt werden … solange qualität gewahrt bleibt.» Aufbauend auf dem
Quiet-on-Green-Gate-Wrapper (`ab1fdd6`): die verbleibenden grossen
Token-Posten angehen. **Qualitäts-Leitplanke für jeden Schritt:** Es wird nur
*Ausgabe-Menge auf dem grünen Pfad* bzw. *Kontext-Ballast* reduziert — kein
Tor wird abgeschwächt, kein Inhalt gelöscht (Rotation = byte-genaues
Verschieben ins Archiv), Fehler behalten volle Fidelity (§6-Sinn).

## Token-Posten und Massnahmen

| # | Posten | Massnahme | Status |
|---|---|---|---|
| T-1 | Golden-Diagnose: bei Abweichung liest jemand das 11'900-Zeilen-JSON | `npm run golden:diff -- <id>`: zeigt NUR den Alt/Neu-Diff eines Falls (ohne id: kompakte Abweichungsliste). Dazu Schutz: `golden` schreibt die Basis nur noch OHNE Argument — Tippfehler-Argumente brechen ab statt still die Basis zu überschreiben | umgesetzt |
| T-2 | Tore werden manuell/wiederholt mit voller Ausgabe gefahren oder vergessen | Stop-Hook `gate-stopp.py`: fährt `gate:schnell` NATIV nach jeder Antwort, wenn Quelldateien geändert sind. Grün → 0 Tokens im Kontext (nicht einmal die 5 Zeilen des Wrappers). Rot → blockiert das Stoppen EINMAL mit voller Tor-Ausgabe (`stop_hook_active`-Guard verhindert Endlosschleifen; §12-Hinweis für fremde Brüche) | **OFFEN: braucht Davids explizites Ja** (Permission-Classifier blockiert Hook-Anlage als Self-Modification; Entwurf liegt im Sessionprotokoll 11.6.) |
| T-3 | Rote Diagnose läuft Suite-weit; Agents lesen Grossdateien | CLAUDE.md §6 Ziff. 5: rote Datei gezielt nachfahren, Golden über `golden:diff`, `golden/*.json` · `dist/` · `package-lock.json` nie direkt lesen | umgesetzt |
| T-4 | STRUKTUR.md (50 KB) wird in jeder Session + jedem Subagenten gelesen; 40 % davon sind Session-Karten ≤ 10.6. | Rotation: Karten älter als die letzten ~2 Arbeitstage wandern BYTE-GENAU nach `archiv/STRUKTUR-SESSIONKARTEN.md` (ein Verweis-Einzeiler bleibt); Pflegeregel im Kopf von STRUKTUR.md verankert | umgesetzt |

## Bewusst NICHT gemacht (geprüft und verworfen)

- **Hinweis-Sektionen der check-Skripte kürzen** (110 «related-Einbahnen»-
  Zeilen der Inventur, Verfallsregister-Vollausgabe): der Wrapper schluckt
  Grün-Ausgabe bereits; bei Direktläufen haben die Hinweise Informationswert
  für David. Nutzen klein, Restrisiko (versteckte Information) > 0.
- **Tore selbst beschleunigen/ausdünnen:** Suite (5 s) und Sweep sind schnell
  und das Qualitätsfundament — unangetastet.
- **Kürzere Commit-Messages:** sie SIND die Detail-Chronik (ersetzen
  Berichte); Kürzung wäre Qualitätsverlust.

## Wartungsregeln

1. STRUKTUR.md-Rotation wiederholen, sobald wieder > ~3 Session-Karten
   aufgelaufen sind (Anhängen an `archiv/STRUKTUR-SESSIONKARTEN.md`,
   chronologisch absteigend, byte-genau).
2. Der Stop-Hook prüft nur `src/ scripts/ package.json vite.config.ts
   tsconfig*.json` — neue tor-relevante Pfade dort nachtragen.
3. `golden:diff` ist reine Diagnose; das Gate bleibt `golden:vergleich`.
