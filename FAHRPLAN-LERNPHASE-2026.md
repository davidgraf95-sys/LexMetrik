# Fahrplan Lernphase 2026 — Bauen ohne Davids Fachzeit (bis 1.12.2026)

**Auftrag David (22.6.2026):** Bis zur Anwaltsprüfung (**läuft bis 1.12.2026**) hat David **keine
Zeit für die fachliche Detail-Abnahme**. Das ist eine harte Zeitsperre, **keine Vermeidung** —
Abnahme bis dahin NICHT proaktiv vorschlagen/drängen (vgl. Memory `lexmetrik-abnahme-zeitsperre`,
`abnahme-david-selbst`). Erste Kanzleigespräche **G1 = Februar 2027** (nach der Prüfung).

**Herleitung:** Zwei unabhängige Council-Läufe (DMAD, Sonnet- + Opus-Panel, 22.6.2026) kamen auf
denselben Kern: Der einzige verteidigbare Solo-Moat ist die **fachkundige Abnahme** (Moat C+D),
nicht die Breite (Code = ~6 Monate kopierbar). Davids Erst-Abnahme ist die einzige
nicht-delegierbare, nicht-parallelisierbare Ressource — und steht bis 1.12. faktisch bei ~0/Woche.
Daraus folgt: Die Spannung «weiter bauen vs. abnehmen» (STRATEGIE-PLATTFORM §0 Befund 3 vs.
Ausbau-Direktive 14.6.) löst sich auf der **Zeitachse** auf statt durch eine Entweder-oder-Wahl.

```
Jun 2026 ───────────────► 1. Dez 2026 ──────────────► Feb 2027
   Lernphase                  Abnahme-Welle               G1
   (Agenten bauen,            (David, Fristen zuerst,      (geprüfter
    kein Abnahme-Druck)        Infrastruktur steht)         Kern)
```

**Leitsatz der Lernphase:** Bis Dezember nur Arbeit, die (a) **keine** Davids-Fachzeit braucht und
(b) die spätere Abnahme-Welle **billiger/schneller** macht. Jeder Bau bleibt auf `entwurf`-Niveau;
§8-Ehrlichkeit bleibt. Keine neue Engine wird als `verified`/`geprüft` ausgegeben (das geht erst
ab Dezember durch David).

---

## Strang A — Ehrliche Status-Marker (haftungssicher ohne Abnahme)

**Warum zuerst:** Der einzige echte Risikohebel, der ohne David machbar ist. Beide Councils:
130 sichtbare Karten bei 0 geprüften sind nur dann gefährlich, wenn ihr Status **nicht ehrlich
gekennzeichnet** ist. Ehrlich markiert ≠ falsch behauptet → haftungssicher.

- Jede Karte trägt sichtbar einen ehrlichen Status: `verified` / `entwurf` / `geplant` **plus
  Stand-/Gültigkeits-Datum**. Status nie schöner darstellen als er ist.
- Ungeprüfte Engines bekommen einen klaren, nicht übersehbaren «in Entwicklung / noch nicht
  fachlich abgenommen»-Hinweis am Ergebnis (nicht nur im Kleingedruckten).
- Norm-Anker (Artikel/§ + Fedlex-Link + Stand) je Wert sichtbar machen — das ist zugleich der
  spätere Burggraben-Verkaufspunkt (Moat C als Produktmerkmal, nicht nur internes Asset).
- Prüfen: Gibt es bereits ein Status-Feld im Karten-/Engine-Schema? Wenn ja, durchgängig
  befüllen/anzeigen; wenn nein, im Schema ergänzen (vgl. Schema-Registry, Ausbau-Direktive P0).

**Fertig, wenn:** Kein Nutzer kann eine ungeprüfte Engine für geprüft halten; jeder ausgegebene
Wert ist zur Norm rückverfolgbar.

## Strang B — Verifikations-Infrastruktur (der «Multiplikator danach»)

**Warum:** Macht jede einzelne Abnahme ab Dezember drastisch schneller und konserviert sie gegen
Regression. **Wichtige Grenze (beide Councils):** Golden-Tests prüfen **Konsistenz/Regression,
nicht Richtigkeit** — sie ersetzen Davids Erst-Urteil NICHT, sie bewahren es. Also: Infrastruktur
bauen, die Davids spätere Prüfung *vorbereitet und festhält*, nicht eine, die sie vortäuscht.

- Golden-Output-Abdeckung für alle abnahmekritischen Engines vervollständigen (committet + CI-gegated;
  vgl. `golden/`, FAHRPLAN-GRUNDLAGEN G2/A). Lücken schliessen, damit ab Dezember jede Abnahme
  sofort gegen einen Golden-Stand läuft.
- Norm-Anker-Extraktion/-Prüfung automatisieren (Zitate-Prüfer, Fedlex-Caches, Stand-Daten) —
  damit ein veralteter Wert mechanisch auffällt, nicht durch Disziplin.
- Verfallsregister von Disziplin auf Mechanik heben (CI-getaktet) — STRATEGIE §0 Befund 4
  (Pflegelast wird sonst zur Solo-Grenze). Terminierte Verfälle nicht in die Lernphase fallen lassen.
- Eine «Abnahme-Checkliste je Engine» vorbereiten (was David im Dezember pro Karte beurteilt) —
  standardisiert die Welle.

**Fertig, wenn:** Eine Engine im Dezember in Minuten statt Stunden abgenommen werden kann, weil
Recherche, Golden, Norm-Anker und Checkliste schon bereitliegen.

## Strang C — Fristen-Engines abnahmefertig aufreihen (Dezember-Welle vorbereiten)

**Warum Fristen zuerst:** Höchstes Haftungsrisiko (falsche Frist = direkter Haftungsfall der
Kanzlei) → in der Dezember-Welle als Erstes abzunehmen. Priorisierung nach **Haftungsrisiko**,
nicht nach Reihenfolge.

- Die haftungskritischen Fristen-Engines identifizieren und in eine priorisierte
  **Abnahme-Warteschlange** bringen (Rangfolge: Fristen → Tarife/Kosten → Form-Vorlagen).
- Je Engine das Abnahme-Material vorbereiten: Norm-Anker gesetzt, Sollwerte doppelt recherchiert
  (Recherche + unabhängige Gegenprüfung, Memory `immer-doppelt-verifizieren`), strittige Punkte
  (Auslöseereignis, Ermessensanteil) ausdrücklich markiert — sodass David im Dezember nur noch
  **beurteilt**, nicht mehr recherchiert.
- `verified` nicht binär behandeln: bei Karten mit Ermessens-/Schätzanteil einen Status
  «deterministischer Teil prüfbar, Ermessensteil gekennzeichnet» vorsehen statt falschem `verified`.

**Fertig, wenn:** Am 1. Dezember liegt eine fertige, nach Haftungsrisiko sortierte Abnahme-Liste
mit vollständig aufbereitetem Material bereit.

---

## Erster Schritt am 1. Dezember 2026

**Eine repräsentative Fristen-Engine vollständig bis `verified:true` durchziehen — und die reine
Abnahme-Zeit stoppen.** Diese eine gemessene Zahl (Zeit pro Engine) macht erst entscheidbar, wie
gross der geprüfte «G1-Demo-Korridor» bis Februar realistisch wird. Reicht der ~2–3-Monats-Runway
nicht für den geplanten G1-Umfang, wird der **Demo-Umfang gekürzt**, nicht der Termin verschoben.

## Tabu / Leitplanken (Lernphase)

- Keine Abnahme erzwingen, kein `geprüft`/`verified` ohne David.
- Markt-Themen (Hosting/Zahlung/Login) bleiben draussen (unverändert).
- Push/Deploy nur auf Davids frisches Ja (§9).
- Nie zwei 26×-Datenassets parallel; keine Rechtslogik in UI/Adapter (Ausbau-Direktive-Tabu).

---

*Quelle der Synthese: zwei DMAD-Council-Läufe 22.6.2026 (Workflow `council-lexmetrik-strategie`).
Dieses Dokument ist Planung; noch nicht committet/gepusht.*
