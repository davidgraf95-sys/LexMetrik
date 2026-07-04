// scripts/materialien/estv-mwst-ids.ts
// E6a Stufe 1 · Etappe M1 (FAHRPLAN-MATERIALIEN-VERZAHNUNG §2.6, §3 Q1): ID-Systematik + Doktyp +
// Key-Abgleich der ESTV-MWST-Webpublikationen. Rein, deterministisch, ohne Netz (offline verifizierbar).
//
// STABILE IDs AUS DER NUMMERN-SYSTEMATIK, NIE aus der volatilen publicationId (§2.6, POC-Risiko 6):
//   MWST-Info N          → ESTV-MWST-INFO-<NN>            (z. B. «MWST-Info 09» → ESTV-MWST-INFO-09)
//   MWST-Branchen-Info N  → ESTV-MWST-BRANCHEN-INFO-<NN>  (z. B. «MWST-Branchen-Info 27» → …-27)
// Der Nummernblock ist zweistellig null-gepolstert — deckungsgleich mit dem bereits KURATIERTEN
// Registerkey `ESTV-MWST-INFO-09` (bestehender Key gewinnt, §2.6). Die publicationId/componentId
// wandern in quell_ids.url_basis (Kante trägt das componentId-Suffix, Projektion setzt zusammen) —
// NIE in die ID.
//
// KEY-ABGLEICH (§2.6, «bestehender Key gewinnt»): MWST-Info 09 liegt bereits als kuratierter
// Eintrag `ESTV-MWST-INFO-09` im MATERIAL_REGISTER. Der Adapter ÜBERSPRINGT ihn (kuratierter Eintrag
// bleibt massgeblich; Migration + artikelscharfe Kanten = M5-Folge-Posten, gleiche Begründung wie
// M3/M4: die Norm-Kontext-Brücke liest bis M5 nur das in-Bundle-Register, §15). Kommt live eine
// weitere Kollision hinzu (neue kuratierte MWST-Info), wird sie hier nachgetragen (das Tor fängt
// Dubletten via quelle_url/behoerde+nummer zusätzlich ab).

import type { DoktypId } from '../../src/lib/materialien/typen.ts';

/** Publikationsart der MWST-Webpublikationen (M1-Scope). */
export type MwstPubArt = 'MI' | 'BI'; // MWST-Info | MWST-Branchen-Info

/** Alle ESTV-MWST-DB-IDs beginnen so (Entlistungs-/Netz-Scope). Der kuratierte ESTV-MWST-INFO-09
 *  bleibt im in-Bundle-Register und ist NIE im Zustands-Manifest (übersprungen). */
export const ESTV_MWST_ID_PREFIX = 'ESTV-MWST-';

/** Kuratiert-bekannte MWST-Publikationen (§2.6 «bestehender Key gewinnt» → skip; M5-Migrations-Posten). */
export const ESTV_MWST_KURIERT_BEKANNT: ReadonlySet<string> = new Set([
  'ESTV-MWST-INFO-09',
]);

/** Zweistellig null-gepolsterter Nummernblock (deckungsgleich mit dem kuratierten `…-09`). */
function nrBlock(nummer: number | string): string {
  const s = String(nummer).trim();
  return /^\d$/.test(s) ? `0${s}` : s;
}

/** Dokument-ID aus Art + Nummer (pfadsicher GROSS, §2.6). */
export function mwstDokId(art: MwstPubArt, nummer: number | string): string {
  const block = nrBlock(nummer);
  return art === 'MI'
    ? `${ESTV_MWST_ID_PREFIX}INFO-${block}`
    : `${ESTV_MWST_ID_PREFIX}BRANCHEN-INFO-${block}`;
}

/** Doktyp je Publikationsart (nur registrierte DoktypIds, §0/B6). */
export function mwstDoktyp(art: MwstPubArt): DoktypId {
  return art === 'MI' ? 'mwst-info' : 'mwst-branchen-info';
}

/** Anzeige-Nummer je Publikationsart («MWST-Info 09» | «MWST-Branchen-Info 27»). Verbatim-nah zur
 *  amtlichen Bezeichnung; der Nummernblock hier OHNE Null-Polsterung (Anzeige, nicht Key). */
export function mwstAnzeigeNummer(art: MwstPubArt, nummer: number | string): string {
  const n = String(nummer).trim().replace(/^0+(?=\d)/, '');
  return art === 'MI' ? `MWST-Info ${n}` : `MWST-Branchen-Info ${n}`;
}

/** true, wenn die Publikation bereits kuratiert im MATERIAL_REGISTER liegt (⇒ Adapter überspringt sie). */
export function istKuriertBekannt(art: MwstPubArt, nummer: number | string): boolean {
  return ESTV_MWST_KURIERT_BEKANNT.has(mwstDokId(art, nummer));
}
