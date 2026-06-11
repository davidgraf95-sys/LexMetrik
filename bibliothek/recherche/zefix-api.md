# Zefix-REST-API (Zentraler Firmenindex) für den UID-Lookup

**Erstellt:** 11.6.2026 (Zefix-UID-Etappe, Entscheid David: Auto-Lookup) ·
**Abrufdatum: 11.6.2026** · **Status: Erstrecherche, empirisch verifiziert
(curl-Proben); Abnahme David ausstehend.**

## Quelle + Stand

- Endpoint (öffentlich, ohne Auth): `POST
  https://www.zefix.ch/ZefixREST/api/v1/firm/search.json`,
  Body `{"name": "<Suchbegriff>", "activeOnly": true}`.
- **CORS: offen** (`Access-Control-Allow-Origin: *`, empirisch 11.6.2026
  mit Origin lexmetrik.vercel.app) → Browser-Direktaufruf möglich, kein
  Proxy nötig. CSP-Erweiterung: `connect-src 'self' https://www.zefix.ch`.
- Antwortfelder (genutzt): `list[].name` (Firma wörtlich gemäss HR),
  `list[].ehraid`, `list[].uidFormatted` («CHE-105.829.940»),
  `list[].legalSeat` (Sitzgemeinde), `list[].status` («EXISTIEREND»).
- Suche akzeptiert auch die **UID direkt als `name`** (empirisch 11.6.2026:
  `{"name":"CHE-105.829.940"}` → Treffer Migros).
- **Detail** (für die Domiziladresse, Z1b): `GET
  https://www.zefix.ch/ZefixREST/api/v1/firm/{ehraid}.json` → `address`
  mit `street`, `houseNumber`, `swissZipCode`, `town`; CORS ebenfalls
  offen (empirisch 11.6.2026, Migros: Limmatstrasse 152, 8005 Zürich).

## Regel deterministisch (Eingabe → Ausgabe)

- UID-Format: `CHE-` + 9 Ziffern, Anzeige `CHE-xxx.xxx.xxx`.
- Prüfziffer eCH-0097: Mod 11 über die ersten 8 Ziffern mit Gewichten
  5,4,3,2,7,6,5,4; Prüfziffer = 11 − (Summe mod 11); Rest 10 → keine
  gültige UID; Rest 11 → 0. Handprobe: CHE-105.829.940 → Summe 165 →
  Prüfziffer 0 ✓ (Migros-Genossenschafts-Bund, Zefix-verifiziert).
- Umsetzung: `src/lib/uid.ts` (rein, §2) + `components/vorlagen/
  ZefixSuche.tsx` (Netz NUR auf Klick, §3/§8).

## Geltungsbereich und Ausnahmen

- Lookup ist KOMFORT (Vorbefüllung) — massgeblich bleibt die Eingabe der
  Nutzerin; keine Rechtslogik hängt an der API (§2 unberührt).
- Datenschutz: Übermittlung des Firmennamens an zefix.ch nur auf Klick;
  Offenlegung in /datenschutz Abschnitt 2 (Wortlaut-Abnahme David offen).

## Pflegebedarf

- API ist inoffiziell-stabil (von zefix.ch selbst genutzt), kein
  Versionsvertrag → bei Ausfall greift der Fehlertext im UI
  («UID von Hand eintragen»); kein Verfallsregister-Eintrag nötig,
  da kein fachlicher Parameter.

## Abnahme-Status

Erstrecherche, empirisch belegt; fachliche/Datenschutz-Abnahme David offen.
