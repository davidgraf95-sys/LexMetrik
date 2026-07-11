/**
 * Browse-Manifest-Generator (Rubrik «Materialien»): baut aus dem
 * MATERIAL_REGISTER das deterministisch sortierte public/materialien/register.json.
 *
 * §5 SSoT: Identität/Taxonomie kommt aus dem Register; die Anzeige-Labels
 * (Behörde/Doktyp) werden hier aufgelöst, ein sha über die Identitätsfelder als
 * Provenienz-/Drift-Token gesetzt (§7). §2: kein Date.now() in der Logik (das
 * erzeugt-Datum kommt via Argument). §6/§7: schreibt NUR register.json, nie in
 * den Gesetzes-/Rechtsprechungs-Baum — Golden unberührt. Eigener Namespace,
 * berührt scripts/normtext/* nicht.
 *
 * Aufruf: npm run materialien -- --datum=$(date +%F)
 */
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import {
  MATERIAL_REGISTER, behoerdeVon, DOKTYP_LABEL, BEHOERDE_RANG,
} from '../../src/lib/materialien/register.ts';
import type {
  BrowseMaterial, MaterialManifest, MaterialRegistereintrag,
} from '../../src/lib/materialien/typen.ts';
// Botschaften (Paket 2, W2·6): NICHT im in-Bundle MATERIAL_REGISTER (§15 Bundle-Kosten:
// ~400 Einträge × 3 Titel), sondern nur als Build-Zeit-Quelle hier gemerged → sie fliessen
// in die lazy register.json-Projektion (Browse + Kontext-Panel), ohne den App-Bundle zu
// belasten. Diese Datei ist ein scripts/-Modul (kein src-Import → kein Bundling).
import { BOTSCHAFTEN } from '../../src/lib/materialien/botschaften.generated.ts';
// Vernehmlassungen (Paket 3, W3·11): analog zu den Botschaften nur hier gemerged (Build-Zeit),
// nie im App-Bundle (§15). Fliessen in die lazy register.json-Projektion.
import { VERNEHMLASSUNGEN } from '../../src/lib/materialien/vernehmlassungen.generated.ts';

/** Alle kuratierten + generierten Materialien-Register-Einträge (Build-Zeit-SSoT der
 *  Projektion). Botschaften + Vernehmlassungen nur hier, nie im App-Bundle (§15). */
export const ALLE_MATERIALIEN: ReadonlyArray<MaterialRegistereintrag> = [
  ...MATERIAL_REGISTER, ...BOTSCHAFTEN, ...VERNEHMLASSUNGEN,
];

export const REGISTER_PFAD = join('public', 'materialien', 'register.json');

/** sha256 über die Identitätsfelder (stabile, sortierte Repräsentation). Ändert
 *  sich, sobald sich Titel/Nummer/Quelle/Stand/Status/Verzahnung ändern → Drift-
 *  Token, das ein check gegen die committete Fassung prüft. */
export function shaEintrag(r: MaterialRegistereintrag): string {
  const norm = [
    r.key, r.behoerde, r.doktyp, r.titel, r.nummer ?? '', r.rechtsgebiet,
    r.sprache, r.status, r.quelleUrl, r.stand, String(r.rang),
    (r.normKeys ?? []).join(','), r.hinweis ?? '',
    // Botschaften-Zusatzfelder NUR für BR anhängen → bestehende Einträge byte-identisch
    // (Drift-Token deckt titel_fr/it + Paket-5-Join-Felder mit ab).
    ...(r.behoerde === 'BR'
      ? [r.titelFr ?? '', r.titelIt ?? '', r.projEli ?? '', (r.ocUris ?? []).join(',')]
      : []),
    // Vernehmlassungen (Paket 3, BUND): Titel FR/IT + Verfahrens-Zustand (Status/Frist/projEli)
    // im Drift-Token — Currency-Token für den mutablen Status. NUR für BUND anhängen →
    // bestehende Einträge (kuratiert/BR) byte-identisch.
    ...(r.behoerde === 'BUND'
      ? [r.titelFr ?? '', r.titelIt ?? '', r.vernehmlassung?.status ?? '',
         r.vernehmlassung?.fristStart ?? '', r.vernehmlassung?.fristEnde ?? '', r.vernehmlassung?.projEli ?? '']
      : []),
  ].join('');
  return createHash('sha256').update(norm, 'utf8').digest('hex');
}

function browseEintrag(r: MaterialRegistereintrag): BrowseMaterial {
  const b = behoerdeVon(r.behoerde);
  // Botschaften-Zusatzfelder NUR für BR emittieren → bestehende Einträge byte-identisch
  // (keine neuen null-Keys in den kuratierten register.json-Zeilen).
  const botschaftsFelder = r.behoerde === 'BR'
    ? {
        ...(r.titelFr ? { titelFr: r.titelFr } : {}),
        ...(r.titelIt ? { titelIt: r.titelIt } : {}),
        ...(r.projEli ? { projEli: r.projEli } : {}),
        ...(r.ocUris ? { ocUris: r.ocUris } : {}),
        ...(r.botschaftDate ? { botschaftDate: r.botschaftDate } : {}),
        ...(r.artAnker ? { artAnker: r.artAnker } : {}),
      }
    : {};
  // Vernehmlassungs-Zusatzfelder NUR für BUND emittieren (Paket 3) → bestehende Einträge
  // byte-identisch (keine neuen Keys in kuratierten/BR-register.json-Zeilen).
  const vernehmlassungsFelder = r.behoerde === 'BUND'
    ? {
        ...(r.titelFr ? { titelFr: r.titelFr } : {}),
        ...(r.titelIt ? { titelIt: r.titelIt } : {}),
        ...(r.vernehmlassung ? { vernehmlassung: r.vernehmlassung } : {}),
      }
    : {};
  return {
    key: r.key,
    behoerde: r.behoerde,
    behoerdeName: b.name,
    behoerdeKuerzel: b.kuerzel,
    doktyp: r.doktyp,
    doktypLabel: DOKTYP_LABEL[r.doktyp],
    titel: r.titel,
    nummer: r.nummer ?? null,
    rechtsgebiet: r.rechtsgebiet,
    sprache: r.sprache,
    status: r.status,
    quelleUrl: r.quelleUrl,
    stand: r.stand,
    rang: r.rang,
    normKeys: r.normKeys ?? [],
    hinweis: r.hinweis ?? null,
    ...botschaftsFelder,
    ...vernehmlassungsFelder,
    sha: shaEintrag(r),
  };
}

/** Deterministische Sortierung: Behörde-rang → eigener rang → key. */
function vergleiche(a: BrowseMaterial, b: BrowseMaterial): number {
  return (BEHOERDE_RANG[a.behoerde] - BEHOERDE_RANG[b.behoerde])
    || a.rang - b.rang
    || a.key.localeCompare(b.key);
}

/** Baut das Browse-Manifest aus dem Register (rein, testbar). */
export function baueMaterialManifest(erzeugt: string): MaterialManifest {
  const materialien = ALLE_MATERIALIEN.map(browseEintrag).sort(vergleiche);
  return { erzeugt, materialien };
}
