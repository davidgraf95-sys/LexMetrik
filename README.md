# Swiss Legal Calc – Modul 1: Arbeitsrecht

Produktionsnahe Berechnungsplattform für Schweizer Arbeitsrecht.
Modul 1 umfasst drei Teilberechnungen mit gemeinsamer Datumslogik:
- **A** – Lohnfortzahlung bei unverschuldeter Verhinderung (Art. 324a OR)
- **B** – Ordentliche Kündigungsfristen (Art. 335c OR, Probezeit Art. 335b OR)
- **C** – Sperrfristen / Kündigung zur Unzeit (Art. 336c OR)

## Schnellstart

```bash
npm install
npm run dev     # Entwicklungsserver auf http://localhost:5173
npm test        # Vitest-Testsuite (muss grün sein)
npm run build   # Produktions-Build
```

## Architektur

```
src/
├── types/legal.ts                 # Kerntypen: Normverweis, Rechenschritt,
│                                  #   Berechnungsergebnis, Rechner<T>
├── data/
│   └── lohnfortzahlungSkalen.ts  # Editierbare Skalentabellen (Gerichtspraxis)
├── lib/
│   ├── datumsUtils.ts            # Shared: Dienstjahr, Monatsende, Intervall-Schnitt
│   ├── lohnfortzahlung.ts        # Modul A – Art. 324a OR
│   ├── kuendigungsfrist.ts       # Modul B – Art. 335c OR
│   ├── sperrfristen.ts           # Modul C – Art. 336c OR
│   └── registry.ts               # Rechner-Registry (Erweiterungspunkt)
├── components/
│   ├── ErgebnisAnzeige.tsx       # Generischer Ergebnis-Renderer
│   ├── PdfExport.tsx             # PDF-Rechenbericht (clientseitig)
│   └── forms/                    # Formulare A / B+C / Kombiniert
└── tests/                        # Vitest-Referenztestfälle
```

### Drei unterschiedliche Stichtage

| Modul | Stichtag |
|-------|----------|
| A – Lohnfortzahlung | Beginn der Arbeitsverhinderung |
| B – Kündigungsfrist | Zugang der Kündigung beim Empfänger |
| C – Sperrfristdauer | Zeitpunkt der Verhinderung |

## Lohnfortzahlungsskalen pflegen

Die Skalenwerte in `src/data/lohnfortzahlungSkalen.ts` sind **Gerichtspraxis**,
keine Gesetzesnormen (Art. 324a Abs. 2 OR «angemessen länger»). Vor Produktiveinsatz:

1. Aktuelle Entscheide der zuständigen kantonalen Gerichte prüfen.
2. Die `eintraege`-Arrays in `SKALA_BASEL`, `SKALA_BERN`, `SKALA_ZUERICH` aktualisieren.
3. `quellenhinweis` mit Stand und Quelle ergänzen.
4. `npm test` ausführen – Referenztestfälle prüfen die Kernannahmen.

## Ein weiteres Modul andocken

Am Beispiel **Verzugszins (Art. 104 OR)**:

**1. Eingabetyp in `src/types/legal.ts` ergänzen:**
```typescript
export type VerzugszinsInput = {
  hauptforderungBetrag: number;
  faelligkeitsdatum: string;   // yyyy-MM-dd
  zahlungsdatum: string;
  zinssatz?: number;           // Default 5 % (Art. 104 Abs. 1 OR)
};
```

**2. Reine Berechnungsfunktion in `src/lib/verzugszins.ts`:**
```typescript
import type { Rechner, VerzugszinsInput } from '../types/legal';

function berechneVerzugszins(input: VerzugszinsInput): Berechnungsergebnis {
  // Reine Funktion: kein Netzwerk, kein State
}

export const VerzugszinsRechner: Rechner<VerzugszinsInput> = {
  id: 'verzugszins',
  titel: 'Verzugszins (Art. 104 OR)',
  beschreibung: 'Gesetzlicher Verzugszins 5 % p.a.',
  berechne: berechneVerzugszins,
};
```

**3. In Registry anmelden und Tab in `App.tsx` hinzufügen.**
`ErgebnisAnzeige` und `PdfExportButton` funktionieren ohne Anpassungen.

## ZPO-Fristen-Modul (Vormerken)

**Wichtig:** Basel-Stadt (BS) und Basel-Landschaft (BL) kennen
**keine Gerichtsferien** nach Art. 145 ZPO. Das ZPO-Fristen-Modul
muss diesen Sonderfall explizit abbilden.

## Normentreue

- Nur geprüfte OR-Artikel sind fest verdrahtet.
- BGE-Aktenzeichen tragen immer `verifiziert: false` und erscheinen
  im UI mit Badge «Aktenzeichen zu verifizieren».

## Disclaimer

Automatisierte Orientierungsberechnung, keine Rechtsberatung.
Abweichende GAV-/Vertrags-/Versicherungslösungen, der genaue Sachverhalt
sowie alle Norm- und Rechtsprechungsverweise sind im Einzelfall zu prüfen.
Die Lohnfortzahlungsskalen sind Gerichtspraxis und vor Produktiveinsatz
gegen die aktuelle kantonale Praxis abzugleichen.
