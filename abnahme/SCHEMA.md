# Abnahme-Protokolle — Schema und Verbindlichkeit

**Zweck (STRATEGIE-PLATTFORM.md F4):** Die fachliche Abnahme (`status:
'geprüft'`, `verified: true`) ist heute eine Behauptung ohne Beweisspur.
Ab sofort gilt: **Kein Katalog-Eintrag wird «geprüft», keine Norm
`verified: true`, ohne dass hier ein Abnahme-Protokoll liegt.** Der Test
`src/tests/abnahmeGate.test.ts` erzwingt das maschinell (Build-Gate) —
`verified`/«geprüft» ohne Protokoll bricht die Suite.

## Ablage

Eine Datei je Katalog-Eintrag: `abnahme/<karten-id>.md` (Karten-ID aus
`src/lib/startseiteConfig.ts`, z. B. `abnahme/zpo-fristen.md`).
Deckt ein Protokoll mehrere Karten derselben Engine ab, erhält jede Karte
ihre Datei; Querverweise sind erlaubt, Kernfälle nicht kopieren (§5 sinngemäss:
EIN fachlicher Inhalt, mehrere dünne Einstiege).

## Pflichtteile (Vorlage: `VORLAGE.md`)

1. **Kopf:** Karten-ID · Engine-Datei(en) · Prüfer:in + Qualifikation ·
   Datum · Abnahme-Art (Selbstabnahme / Zweitprüfung).
2. **Geprüfte Normgrundlage:** jede tragende Norm mit Konsolidierungsstand
   (ELI + Datum aus `scripts/fedlex-cache.sh` / Quellen-Register) und dem
   Vermerk, ob der WORTLAUT (nicht nur der Anker) gelesen wurde.
3. **Golden-Referenzfälle:** mindestens ein Fall mit **amtlich belegtem**
   Erwartungswert (BGE-Sachverhalt, Behörden-Merkblatt, amtliches Beispiel)
   plus die handgerechneten Kontrollfälle. Jeder Fall: Eingaben → erwartetes
   Ergebnis → Beleg. Diese Fälle MÜSSEN als Akzeptanztests in der Suite
   stehen (Datei nennen).
4. **Edge-Cases abgehakt:** je nach Engine-Typ (Fristen: Feiertag je Kanton,
   Wochenende, Monatsende/30./31., Schaltjahr, Zustellfiktion, Stillstand;
   Beträge: Rundung, Grenzwerte beidseitig, 0/Negativ; Vorlagen: jedes Gate
   beidseitig).
5. **Known Limitations:** was die Engine bewusst NICHT abbildet
   (Ermessen, offene kantonale Verifikationen, Annahmen) — Grundlage für
   die UI-Offenlegung (§8).
6. **Ergebnis:** abgenommen / abgenommen mit Auflagen / zurückgewiesen
   (mit Befund-Liste).

## Regeln

- **Selbstabnahme ist zulässig und wird als solche ausgewiesen** («geprüft
  (Selbstabnahme), Zweitprüfung ausstehend»). Die externe Zweitprüfung wird
  als Zweitsignatur im selben Protokoll nachgetragen.
- Eine **fachliche Änderung** an einer abgenommenen Engine (Norm-Wechsel,
  Schwellen-Update, neuer Pin) macht das Protokoll ungültig → Status fällt
  auf `entwurf`, bis der geänderte Teil nachgeprüft und das Protokoll
  nachgeführt ist (Vorgriff auf §16-Entwurf, STRATEGIE-PLATTFORM.md F5).
- Verfallene Termine des Verfallsregisters (`npm run check:verfall`) und
  überholte Pins (`npm run check:fedlex-versionen`) blockieren die
  «geprüft»-Haltbarkeit der betroffenen Engine.
