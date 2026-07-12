# Davids Anmerkungen zur Gesetzesdarstellung (Sammlung 12.7.2026)

Status: A28 GEBAUT 12.7.2026 (reine Reader-CSS/TS — Auto-Linien-Default korpusweit
zurückgezogen). Spec-/Einordnungs-Heimat: `FAHRPLAN-GESETZES-UX.md §10.9` (A28).
Muster wie `ANMERKUNGEN-DAVID-2026-07-11.md`.

## A28 · Auto-Linien-Default funktioniert nicht — korpusweit zurückgezogen (Live-Feedback auf L-3/#207)

Wortlaut David (12.7.2026, Chat — wörtlich, nichts geglättet):

> «das mit den linien funktioniert überhaupt nicht»
>
> «also ist überhaupt nicht fördernd für die übersicht»

Betroffen: die gestern (11.7.) gemergte L-3-Einheit (#207) — sie hatte den Auto-
Gliederungs-Guide für dichte Erlasse AN geschaltet (Umkehr der #161-Politik),
inklusive der tiefen Kodifikationen ZGB/OR. Der Reader zeigte damit im Default-
Zustand («auto») einen vertikalen Guide auf `guideEbene`, ohne dass der Nutzer ihn
angefordert hatte.

**Einordnung.** L-3 beruhte auf einer THEORIE über Übersicht: ein einzelner Guide
auf der inneren Gruppierungsebene sei — anders als der frühere «Barcode» aus
gestapelten Linien — die hilfreiche Gliederungshilfe. David hat das an seinen
eigenen Leit-Erlassen live gegengeprüft und die Prämisse als Ganzes verworfen:
nicht «zu viel/zu wenig» (das war A8, per Aufbau-Regel geheilt), sondern
«funktioniert überhaupt nicht» und «überhaupt nicht fördernd für die übersicht».
Das ist ein Total-Urteil über den aufgedrängten Guide als Übersichts-Mittel.

**Entscheid A28 (gebaut 12.7.):** Der Auto-Default wird **korpusweit AUS** gesetzt.
`linienProfil().autoGuide = false` für JEDEN Erlass (SSoT
`src/pages/gesetz-leser/linienAufbau.ts`); `data-guide-auto` am `.lc-leser`-Root ist
stets `"aus"`. Kein Erlass drängt die Gliederungslinie mehr auf.

Begründung der Wahl «korpusweit AUS» statt weiterer Feinjustage: Davids Urteil ist
kein Schwellwert-Feedback, sondern ein Grundsatz-Nein zum aufgedrängten Guide. Jede
verbleibende Auto-Heuristik (Dichte/Tiefe/Kategorie) bliebe eine Wette gegen dieses
Urteil. Der konservative, ehrliche Zustand ist: nicht aufdrängen. Weitere Justage
nur auf neues, positives David-Signal.

**Das FEATURE bleibt — nur das AUFDRÄNGEN endet.** Der K11-Tri-State-NUTZER-Schalter
«Linien» (`data-linien` an/aus/auto, global, `LeserAnsichtMenu`) ist voll
funktionsfähig: wer die Gliederungslinie will, klickt «Linien AN» und bekommt den
EINEN Guide auf genau `guideEbene`. `strukturTiefe`/`guideEbene`/`dichteAmGuide`
bleiben voll berechnet (sie steuern, WO der Guide sitzt und OB der Schalter
überhaupt erscheint — `zeigeLinien = guideEbene !== null`). Nur der Auto-Default
ist aus.

Bau (A28, umgesetzt):
- `linienAufbau.ts`: `autoGuide = false` korpusweit (Kommentarblock + Schwellen-
  Doku auf A28 nachgeführt; `strukturTiefe`/`guideEbene`/`dichteAmGuide` unverändert).
- `check:linien-kanon`: B1-Invariante auf `!autoGuide` korpusweit; B2-Referenz-
  Verdikte ZGB/OR/ArG/BVV3/HKUE auf `autoGuide=false` gedreht (`guideEbene`/
  `strukturTiefe` weiter gegated als Verdrahtungs-Nachweis). GRÜN über 1144
  Sidecars (Auto-Guide AN: 0).
- e2e nachgezogen (Quelle = Davids Verdikt): `leser-linien-kanon` (Auto-Default 0
  sichtbare Guides ZGB/STG/ArG + neuer Override-Positiv-Fall «Linien AN» ⇒ genau 1
  Guide, R4 ≤1 hält), `gesetze-ux-g3a` (STG/ArG Auto-Default transparent +
  ArG-Override-Positiv), `leser-optionen` (BGBM Linien-Default `aus`; BV
  Toggle-Zyklus auf A28 umgestellt).
- Kommentar-Nachzug `index.css`/`leserOptionen.ts` (Linien-Kanon-Block auf
  «Auto-Guide korpusweit aus, Feature via K11»).

Golden byte-gleich (reine Reader-CSS/TS, kein Datenpfad), CLS 0, A9-DoD erfüllt.
Gegenprüfung n/a (keine Rechen-/Extraktions-/Norm-Tarif-Berührung).

**Alternativen für echte Struktur-Übersicht (NUR Skizze, kein Bau):** Typo-Hierarchie
der Zwischentitel · Sticky-Mini-Kontext · TOC-Scroll-Spy-Ausbau · Abschnitts-Rhythmus.
Vollständig hergeleitet in `FAHRPLAN-GESETZES-UX.md §10.9`; jede erst nach separatem
David-Entscheid.

## (weitere Anmerkungen folgen)
