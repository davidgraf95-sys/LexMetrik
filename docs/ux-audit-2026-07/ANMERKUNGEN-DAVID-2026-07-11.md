# Davids Anmerkungen zur Gesetzesdarstellung (Sammlung 11.7.2026)

Status: A26 GEBAUT 11.7.2026 (reines UI, Reader-Kopf). Spec-/Einordnungs-Heimat:
`FAHRPLAN-GESETZES-UX.md §10.8` (A26). Muster wie
`ANMERKUNGEN-DAVID-2026-07-05.md`.

## A26 · «Ansicht»-Dropdown in die immer sichtbare Positionsleiste + Fussnoten-Auswahl ins Menü

Wortlaut David (11.7.2026, Chat — wörtlich, nichts geglättet):

> «kannst du überigends ansichtsdropdown menu in bspw. diese leiste integrieren
> Gesetze › Bund › ZPO   Art. 1 ZPO   Stand 01.07.2026 ✕   sodass es immer
> sichtbar ist wenn man im gesetz ist»
>
> «und fussnotenauswahl ebenfalls in dropdownmenu einfügen.»

Betroffen: der Gesetzes-Reader-Kopf (nach #165/#188/#189/#194) — das «Ansicht»-
Dropdown (U-KOPF/A4 + V2·B-1/B-2, Toggles Linien/Fussnoten/Verweise/Entscheide +
Zeitraum), der separate Fussnoten-Chip (V2·K-2) und die immer sichtbare
Positions-/Kontextleiste.

**Präzisierung der «Leiste» (im Bau bestätigt):** Davids Beispielzeile
«Gesetze › Bund › ZPO … Art. 1 ZPO … Stand 01.07.2026 ✕» ist wörtlich der
**Inhalts-Kopf** (`src/components/layout/InhaltsKopf.tsx`, sticky `top-16`) —
NICHT der 2-Spalten-`SektionKontextKopf` (den die Orchestrator-Lesart zunächst
als Ziel nannte). Nur der Inhalts-Kopf erfüllt Davids «immer sichtbar wenn man im
gesetz ist»: er klebt in JEDER Layout-Variante (Desktop 1-/2-spaltig, Mobil @390,
flache Artikelliste), während der `SektionKontextKopf` nur im ≥1024px-2-Spalten-
Lesemodus rendert. Darum ist der Inhalts-Kopf das Ziel.

Bau (A26, umgesetzt):
- (1) Das «Ansicht»-Dropdown ist aus dem weggescrollenden Erlass-Kopf
  (`ErlassLeserKopf`) **in den immer sichtbaren Inhalts-Kopf** gewandert
  (Einzelansicht). Kanal: der Reader meldet ein fertiges `ansichtSlot`-Element
  über den vorhandenen `meldeInhaltsKopf`-Kontext (`KopfDaten.ansichtSlot`); der
  Kopf in `components/layout` rendert es opak (Layer-Trennung, keine Reader-
  Interna dort). Der globale Options-Store (`leserOptionen.ts`) bleibt unverändert
  darunter → EINE Zustandsquelle (§5), kein zweites divergierendes Menü.
- (2) Der frühere separate **Fussnoten-Chip** (V2·K-2) ist als **Eintrag in das
  Dropdown** aufgegangen: der `Fussnoten`-Schalter trägt jetzt den Zähler N
  (Sidecar) als dezentes Badge + im Accessible-Name («Fussnoten (N)»). Der
  Chip-Sprung-zum-Apparat entfällt bewusst (das Menü ist jetzt DAUERHAFT
  erreichbar → der Klick kann von überall im Erlass kommen, ein Sprung an den
  ersten Marker wäre desorientierend; Ein-/Ausblenden geschieht an Ort). Der
  Kopf-Slot wird dadurch schlanker.

Platzierungs-Entscheid (nur Sticky vs. beide Orte):
- **Einzelansicht:** Dropdown NUR im Inhalts-Kopf; aus `ErlassLeserKopf` entfernt.
- **Split-View (`imPane`):** Dropdown bleibt im `ErlassLeserKopf` des Panes (der
  `PaneKopf` trägt keine Optionen; ihn umzubauen hieße Stacking-Risiko in der
  Pane-Chrome — bewusst NICHT in diesem UI-PR). Der Store ist global, also keine
  Divergenz. Nie zwei Menüs gleichzeitig sichtbar (per `imPane`-Gate).

Mobil @390: der Trigger ist **Icon-only** (◧) mit `aria-label="Ansicht"`; das Wort
«Ansicht» erst ≥sm. Kein horizontaler Seiten-Overflow (visuell + smoke-e2e
belegt). Das Panel ist `absolute` (out-of-flow) → CLS 0 beim Öffnen; der
Inhalts-Kopf trägt `z-30`, damit das Panel ÜBER die Inhalts-Sticky-Leisten
(Suche z-16 / Sektions-Kontextkopf z-15) legt statt dahinter zu verschwinden.

A9-DoD: e2e `leser-kopf-a9` (CPU-Throttle CI 4×/lokal 6×, CLS 0, 0 Konsolenfehler)
grün; Tastatur/aria (Disclosure, Fokus-Falle/Escape/Fokus-Rückgabe) über
`leser-kopf-g2b` grün; `a11y` (axe) grün. Golden IDENTISCH (Reader-Chrome nicht
in Golden-Scope). Gegenprüfung n/a (reines UI, keine Rechtsregel/Extraktion).

## (weitere Anmerkungen folgen)
