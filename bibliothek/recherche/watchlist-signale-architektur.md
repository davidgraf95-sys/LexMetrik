# Watchlist & Änderungs-Signale — Architektur-Optionen (B1 / B2 / Push)

**Erstellt:** 20.7.2026 (Ideen-Intake §14 der 8 Alleinstellungs-Ideen, Idee 5 — Verortung als
ROADMAP-Schritt `W2·14-SIGNAL`; dieses Dossier trennt die zwei zustandslos baubaren Stufen von
der Variante, die einen Architektur-Entscheid Davids verlangt) · **Status:** ERSTRECHERCHE —
Optionen-Vergleich gegen den Repo-Stand vom 20.7.2026, kein adversarialer Zweitdurchgang.

**Quellen:**

| Beleg | Fundort | Rolle |
|---|---|---|
| Currency-Stand je Erlass | `public/normtext/currency.json` | Datenquelle für Signale |
| Wiedervorlage-Generator (Bau-Muster) | `scripts/fedlex-wiedervorlage-generieren.ts` | Vorbild B1 |
| Currency-/Drift-Tore | `check:fedlex-versionen`, `check:rss-oc` | Erkennung |
| Verfallsregister | `bibliothek/register/parameter-verfall.md` | datierte Parameter |
| Client-Persistenz-Muster | `src/lib/zuletztVerwendet.ts` | Vorbild B2 |
| Zustandslosigkeits-Regel | CLAUDE.md §5 | **die Leitplanke** |

---

## §1 · Die Frage

«Benachrichtige mich, wenn sich Norm Y ändert oder Gericht X neu entscheidet.» Das klingt nach
**einem** Feature, ist aber **drei** — mit sehr unterschiedlichen architektonischen Kosten.

## §2 · Die drei Optionen im Vergleich

| | **B1 — statischer Feed** | **B2 — Client-Watchlist** | **Push/E-Mail-Abo** |
|---|---|---|---|
| **Was der Nutzer bekommt** | abonnierbarer RSS/Atom/JSON-Feed «was hat sich geändert» | gemerkte Normen/Gerichte, beim Besuch «seit deinem letzten Besuch geändert» | aktive Zustellung ohne Besuch |
| **Wo lebt der Zustand** | nirgends (Build-Artefakt) | ausschliesslich im Browser (localStorage) | **Server** |
| **Braucht Nutzeridentität** | nein | nein | **ja** |
| **Braucht Sendedienst** | nein (der Feed-Leser holt) | nein | **ja** |
| **Zustandslos (§5)** | ✅ | ✅ | ❌ **Bruch** |
| **Aus Bestand baubar** | 🟢 ja — Muster `fedlex-wiedervorlage-generieren.ts` | 🟢 ja — Muster `zuletztVerwendet.ts` | 🟠 nein |
| **Verdikt** | **bauen** | **bauen** | **nur nach Architektur-Entscheid Davids** |

## §3 · Regel deterministisch

**B1 — Feed (Build-Zeit):**
```
Eingang:  currency.json (Fassungsstände) + parameter-verfall.md (datierte Parameter)
Regel:    je Erlass E: wenn stand(E, heute) != stand(E, letzter Build) → Eintrag
          Eintrag = { Erlass, alter Stand, neuer Stand, amtliche Fundstelle, Datum }
Ausgang:  Feed-Datei, stabil sortiert (Determinismus §2 → zwei Läufe byte-gleich)
```

**B2 — Watchlist (Client):**
```
Eingang:  localStorage: [{ id, gesehenerStand, gemerktAm }]   — NUR Kennungen
Regel:    beim Besuch je Eintrag: currency.json[id].stand != gesehenerStand → Flag
Ausgang:  «geändert seit deinem letzten Besuch» + Sprung zur amtlichen Fundstelle
```

## §4 · Harte Auflagen (Berufsgeheimnis, §8)

1. **In localStorage gehören ausschliesslich Kennungen** (Erlass-/Gerichts-IDs, Stände).
   **Keine** Mandatsbezüge, keine Parteinamen, keine Aktenzeichen, keine Freitextnotizen —
   der Browser eines Anwalts ist kein sicherer Ort für Mandatsdaten.
2. **Kein Anschein von Fristenüberwachung.** Ein Änderungs-Signal ist **keine** Zusicherung,
   dass der Nutzer rechtzeitig erfährt, was er wissen muss. Das gehört ausdrücklich an die
   Fläche (§8) — sonst entsteht ein Verlass, den das Werkzeug nicht tragen kann.
3. **Signal zeigt auf die amtliche Fundstelle**, nie nur auf die eigene Darstellung (§7).
4. **Lücken sichtbar:** überwacht wird nur, was im Korpus ist. Die Abdeckung wird benannt.

## §5 · Warum Push ein Architektur-Bruch ist (und nicht nur «mehr Arbeit»)

Push verlangt drei Dinge, die es heute bewusst **nicht** gibt: eine **Nutzeridentität**, einen
**serverseitig gehaltenen Abonnement-Zustand** und einen **Sendedienst**. Damit fallen zugleich
Datenschutz-Pflichten, Zustellbarkeit, Abmeldung und Betriebslast an. Das ist keine Erweiterung
der bestehenden Architektur, sondern ihr **Gegenteil** (CLAUDE.md §5 «Werkzeuge zustandslos»).

**Empfehlung:** B1 + B2 bauen und in der Praxis messen, ob sie den Bedarf tatsächlich decken.
Sehr oft tut ein Feed genau das, was der Wunsch «benachrichtige mich» meinte — ohne einen
einzigen der obigen Folgekosten. Push erst danach neu bewerten, wenn überhaupt.

## §6 · Pflegebedarf

B1/B2 führen **keine neuen datierten Rechts-Parameter** ein; sie lesen die bestehende
Currency-Kette. Pflegepunkt ist allein, dass `currency.json` aktuell bleibt — das leisten die
vorhandenen Tore (`check:fedlex-versionen`, `check:rss-oc`), hier entsteht keine zweite Wahrheit (§5).

## §7 · Abnahme-Status

ERSTRECHERCHE. B1/B2 sind ohne weitere Freigabe baubar (zustandslos-konform).
**Push bleibt gesperrt** bis zu einem ausdrücklichen Architektur-Entscheid Davids.
