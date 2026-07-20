# Richter-/Spruchkörper-Analytik — ethische Leitplanken und deskriptiver Scope

**Erstellt:** 20.7.2026 (Ideen-Intake §14 der 8 Alleinstellungs-Ideen, Idee 7 — Verortung als
ROADMAP-Schritt `W3·15-RICHTER`, Status `blocked` auf `richter-analytik-gate`. Dieses Dossier
existiert, damit die Leitplanken **vor** einer allfälligen Freigabe schriftlich stehen und nicht
erst beim Bau verhandelt werden) · **Status:** ERSTRECHERCHE — Scope- und Grenzbestimmung,
keine Datenerhebung, kein Bau.

**Quellen:** Entscheid-Metadaten des eigenen Korpus (`public/rechtsprechung/`, amtliche
Entscheid-Publikationen als Herkunft) · Richter-Filter-Fundament auf Branch
`feat/richter-fundament` (Auftrag David 20.7.2026) · CLAUDE.md §2 (Determinismus), §8
(Ehrlichkeit gegenüber Nutzern). **Keine amtliche Norm** wird hier ausgelegt — die
standesrechtliche Beurteilung ist ausdrücklich Davids Sache (`[D]`).

---

## §1 · Warum dieses Dossier vor dem Bau steht

Die Idee ist technisch die einfachste der acht und **rechtlich-ethisch die heikelste**. Genau
diese Kombination ist gefährlich: Was leicht zu bauen ist, wird leicht gebaut — und eine
Auswertung über namentlich bestimmbare Amtsträger lässt sich nachträglich nicht mehr
zurücknehmen. Darum ist der Schritt **bewusst gesperrt** und nicht bloss «noch nicht dran».

## §2 · Was zulässig sein könnte (deskriptiver Kern)

Ausschliesslich **beschreibende Aussagen über die Geschäftstätigkeit von Spruchkörpern**, die
sich unmittelbar aus amtlichen Metadaten ergeben und einer Kammer, nicht einer Person, zuzurechnen sind:

- Verteilung der **Sachgebiete** je Kammer und Zeitraum,
- **Verfahrensdauer** und Geschäftslast der Form nach (soweit amtlich ausgewiesen),
- **Publikationsquote** (welcher Anteil wird amtlich publiziert).

**Bewusst NICHT im Erst-Scope — Korrektur 20.7.2026:** ursprünglich stand hier «Häufigkeit von
**Verfahrensausgängen der Form nach** (z. B. Nichteintreten vs. materielle Beurteilung)». Das ist
gestrichen. Begründung: eine Ausgangs-Verteilung je Kammer ist das unmittelbare Rohmaterial der in
§3 verbotenen Erfolgs-/Trefferquote — es fehlt nur ein Aggregationsschritt, und die
Kammer→Personen-Zuordnung liefert das Richter-Filter-Fundament separat. Die Unterscheidung
«formal vs. materiell» klingt harmlos, ist aber genau die Achse, aus der eine Quote gebildet wird.
Eine Aufnahme wäre ein **eigener, ausdrücklich zu begründender David-Entscheid** — mit der Freigabe
des Schritts `W3·15-RICHTER` ist sie **nicht** mitgegeben.

Jede Zahl trägt Grundgesamtheit, Zeitraum und Korpus-Abdeckung — ohne diese drei Angaben wird
sie nicht ausgegeben (§8).

## §3 · Was ausgeschlossen bleibt — auch nach einer Freigabe

Diese Liste ist **nicht verhandelbarer Teil des Scopes**, nicht eine Empfehlung:

1. **Kein Erfolgs-/Trefferquoten-Ranking** einzelner Richterinnen und Richter — in keiner Form,
   auch nicht als «neutral» etikettierte Rangliste.
2. **Keine Prognose** («wie wird Richter X entscheiden», «Erfolgsaussicht vor Kammer Y»).
   Das wäre zugleich ein §2-Bruch: eine Vorhersage ist kein deterministisch belegbarer Wert.
3. **Keine Bewertung von Personen** — keine Attribute wie «streng», «klägerfreundlich»,
   keine impliziten Wertungen über Farbskalen oder Sortierung nach «gut/schlecht».
4. **Kein Profil auf Einzelpersonen**, wo die Kammer die richtige Bezugsgrösse ist.
5. **Keine Ableitung prozesstaktischer Empfehlungen** — das wäre Rechtsberatung
   (Grundsatzgrenze des Projekts) auf statistisch untauglicher Basis.

**Warum so streng:** Richterliche Unabhängigkeit ist kein Feature-Flag. Eine Erfolgsquote über
einen unvollständigen, publikationsverzerrten Korpus misst nicht die Qualität eines Gerichts,
sondern die Auswahl der publizierten Entscheide — sie wäre **sachlich falsch und zugleich
persönlichkeitsrelevant**. Das ist die schlechteste denkbare Kombination.

## §4 · Der methodische Kernfehler, den man erwarten muss

Der Korpus ist **nicht die Grundgesamtheit**. Publiziert wird ein Ausschnitt, und die Auswahl
ist selbst nicht zufällig. Jede Quote, die so tut, als beschreibe sie «das Gericht», ist ein
Fehlschluss. Wenn eine Kennzahl diesen Vorbehalt nicht neben sich tragen kann, gehört sie nicht
ins Produkt (§8).

## §5 · Verhältnis zum Richter-Filter-Fundament

Das laufende **Richter-Filter-Fundament** (Branch `feat/richter-fundament`) ist etwas anderes
und hier **nicht mitgemeint**: Es macht Entscheide **auffindbar** (Filterung nach
Spruchkörper) — eine Navigations-Funktion auf amtlichen Metadaten. Dieses Dossier betrifft
allein die **darauf aufsetzende Auswertungs-Schicht**. Die Trennung ist Absicht: das Fundament
ist unbedenklich und läuft weiter, die Analytik ist gesperrt.

## §6 · Entscheidungspunkt David (blocker `richter-analytik-gate`)

Zu entscheiden ist **nicht** «bauen ja/nein» als Technikfrage, sondern:

1. Soll eine Auswertungs-Schicht über Spruchkörper überhaupt existieren?
2. Falls ja: Kammer-Ebene als kleinste Einheit — oder gar keine Personen-Zurechnung?
3. Welche der §2-Kennzahlen sind standesrechtlich unbedenklich (Beurteilung David, `[D]`)?
4. Wie wird die Publikationsverzerrung (§4) an der Fläche offengelegt?

**Ohne diese Entscheide wird nicht gebaut.** Eine `FAHRPLAN-RICHTER-ANALYTIK.md` entsteht erst
nach einer Freigabe — vorher wäre sie ein Plan für etwas, das es nicht geben soll.

## §7 · Abnahme-Status

ERSTRECHERCHE, **gesperrt**. Bei einer allfälligen Freigabe zusätzlich Pflicht: adversariale
Prüfung «enthält die Darstellung ein verstecktes Ranking?» und §8-Offenlegung der Aussagegrenzen.
