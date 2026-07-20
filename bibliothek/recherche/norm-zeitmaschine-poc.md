# Norm-Zeitmaschine & Fassungs-Diff — POC-Rahmen und Kostenschätzung

**Erstellt:** 20.7.2026 (Ideen-Intake §14 der 8 Alleinstellungs-Ideen, Ideen 2+3 — Verortung als
ROADMAP-Schritt `W2·5g-ZEIT`, Status `blocked` auf `zeit-historik-poc`; dieses Dossier hält fest,
**warum** blockiert und **was der POC klären muss**) · **Status:** ERSTRECHERCHE — Bestandsaufnahme
gegen den Repo-Stand vom 20.7.2026; die Aufwandsschätzung in §4 ist eine Grössenordnung, **keine
gemessene Zahl**.

**Quellen:**

| Beleg | Fundort | Rolle |
|---|---|---|
| Geltende Fassung je Artikel (`stand`, `fassungsToken`, `bloecke`) | `public/normtext/` | **das ist alles, was da ist** |
| Änderungs-**Metadaten** (`giltSeit`, `ereignisse[]` mit Datum/Absatz/AS-ELI) | `public/normtext/historie/*.json` (209 Dateien, Stand 20.7.2026) | Timeline-Unterbau |
| SPARQL-Abfrage der Konsolidierungen | `scripts/fedlex-versionen-pruefen.ts` (fragt `jolux:Consolidation` / `dateApplicability` bereits ab) | **Fähigkeit vorhanden** |
| Amtliche Quelle | Fedlex SPARQL-Endpunkt `https://fedlex.data.admin.ch/sparqlendpoint` (Abruf 20.7.2026 nicht neu durchgeführt — Beleg ist der bestehende, laufende Skript-Einsatz) | Datenherkunft |

---

## §1 · Die Frage

Zwei zusammengehörige Wünsche: **(a)** «Zeig mir Art. X so, wie er am Tag Y galt» (verknüpft mit
dem Entscheiddatum) und **(b)** ein **visueller Diff** zweier Fassungen. Sie teilen denselben
Engpass und sind darum **eine** Bau-Einheit (§14.2).

## §2 · Der entscheidende Befund (ehrlich)

**Auf Platte liegt je Norm nur die GELTENDE Fassung.** Die Historie-Dateien liefern
Änderungs-**Metadaten** — wann sich was geänderte hat, mit AS-Fundstelle — **nicht den
historischen Wortlaut**.

Daraus folgt die Zweiteilung, die vor jeder Planung stehen muss:

| Teil | Was es ist | Datenlage | Verdikt |
|---|---|---|---|
| **Metadaten-Timeline** | «gilt seit …», «geändert am …, Abs. 2, AS …» | vollständig vorhanden | 🟢 baubar — **läuft bereits als G-HIST-UI**, hier nicht duplizieren |
| **Alt-Volltext + Wortdiff** | der eigentliche Wunsch | **fehlt vollständig** | 🟠 **braucht einen neuen historischen Extraktions-Durchlauf** |

**Der Diff selbst ist der kleine Teil.** Liegen zwei Fassungstexte vor, ist der Vergleich ein
deterministischer String-Diff (§2) — trivial. **Der gesamte Aufwand steckt in der
Daten-Beschaffung.** Wer die Idee nach der Timeline-Demo für «fast fertig» hält, unterschätzt
sie um die gesamte Extraktions-Arbeit.

## §3 · Was der POC (Etappe Z0) klären MUSS

1. **Holbarkeit:** Liefert die SPARQL-Abfrage je Erlass eine vollständige, lückenlose Liste der
   Konsolidierungen mit Geltungszeitraum — oder gibt es Erlasse mit Löchern? Negativbefunde
   ausdrücklich festhalten (S5).
2. **Extraktions-Treue:** Läuft der bestehende Extraktor über eine **historische**
   Konsolidierung ohne Strukturbruch, oder haben ältere Fassungen abweichendes Markup?
   An mindestens einem alten und einem sehr alten Stand messen.
3. **Speicher-Modell:** Wie werden N Fassungen je Artikel abgelegt, ohne die geltende Fassung
   zu verlangsamen (§15) und ohne das Auslieferungs-Budget zu sprengen? Volltext je Fassung
   oder Delta-Kette? **Diese Frage entscheidet über die Machbarkeit im Auslieferungsrahmen.**
4. **Provenienz (§7 a–d):** Jede Fassung braucht Quelle, Konsolidierungsstand, Abrufdatum und
   Permalink — **je Fassung**, nicht je Erlass.
5. **Umfang:** Wie viele Konsolidierungen je Erlass realistisch (Median/Maximum)? Erst diese
   Zahl macht aus «N Konsolidierungen × 227 Erlasse» eine belastbare Schätzung.

## §4 · Kostenrahmen (Grössenordnung, nicht gemessen)

Der Durchlauf skaliert mit **Erlassen × Fassungen**, nicht mit Erlassen allein. Bei 227 Erlassen
und einem angenommenen Median von einigen Konsolidierungen je Erlass liegt der Extraktions-Umfang
**eine Grössenordnung über** einem gewöhnlichen Volltext-Nachzug — plus neues Speicher-Modell,
plus Provenienz je Fassung, plus Gegenprüfung. Das ist der Grund für Status `blocked`:
**nicht mangelnde Machbarkeit, sondern Aufwand, der eine bewusste Entscheidung verdient.**

## §5 · Entscheidungspunkt David (blocker `zeit-historik-poc`)

Nach dem POC ist zu entscheiden:

- **Bau-GO je Kandidat** — welche Erlasse bekommen Fassungs-Historie? (Alle 227 ist vermutlich
  nicht der beste Einsatz; die praktisch relevanten Erlasse sind wenige.) Dies entspricht dem
  bestehenden G-HIST-Intake-Vorbehalt.
- **Ausbaustufe:** nur Point-in-Time-Anzeige, oder auch der visuelle Diff?
- **Reichweite:** ab welchem Jahr zurück? Je weiter zurück, desto grösser das Struktur-Risiko.

**Bis dahin wird nicht gebaut.** Die Metadaten-Timeline (G-HIST) läuft davon unberührt weiter.

## §6 · Pflegebedarf

Historische Fassungen sind **unveränderlich** und altern nicht — der Pflegepunkt ist allein
die **geltende** Fassung (bestehende Currency-Kette, `check:fedlex-versionen`). Ein einmal
korrekt extrahierter Alt-Stand bleibt gültig; er muss aber seine Provenienz mittragen.

## §7 · Abnahme-Status

ERSTRECHERCHE. Kein Bau vor POC-Verdikt und Bau-GO Davids. Risiko-Pfad (Extraktion) ⇒
`check:gegenpruefung` + golden byte-gleich sind beim Bau Pflicht.
