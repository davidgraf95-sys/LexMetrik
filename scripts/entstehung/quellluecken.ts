// scripts/entstehung/quellluecken.ts
// Quelllücken über die ganze Stände-Kette (W2·6c-ENTSTEHUNG-QUELLLUECKE) — aus
// `synopse.ts` ausgelagert (§6.6-Split, PR #801-Nachzug), Fassaden-Muster: `synopse.ts`
// re-exportiert dieses Modul unverändert, kein Konsumenten-Importpfad ändert sich.
// REIN wie der Rest der Synopse-Bausteine — kein Fetch, kein Schreiben, kein Date.now (§2).
import type { StandProfil } from './synopse.ts';
import { tokenAusEId } from './synopse.ts';

/** Eine erkannte Lücke der Quelle — Indizes in die Stände-Liste des Erlasses. */
export interface QuellLuecke {
  eId: string;
  /** Index des ERSTEN Stands ohne die eId (= `bis` des Schritts, der sie «entfallen» buchte). */
  vonIdx: number;
  /** Index des Stands, der die eId wieder führt (= erster Stand NACH der Lücke). */
  zurueckIdx: number;
  /** Der Artikel steht in JEDEM Lücken-Stand im Änderungsanhang derselben Datei.
   *  In `luecken` ist das Feld IMMER `true` — es ist Bedingung, nicht Vermerk (siehe
   *  `findeQuellLuecken`); in `ohneBeleg` immer `false`. */
  imAnhang: boolean;
}

/** Was die Kette hergibt: gebuchte Lücken — und die Fälle, die den Beleg schuldig bleiben. */
export interface QuellLueckenBefund {
  /** Erfüllen ALLE vier Bedingungen ⇒ `zustand: 'quelle_unvollstaendig'`. */
  luecken: QuellLuecke[];
  /** Wortgleiche Rückkehr OHNE Anhang-Beleg: bleibt «entfallen» + «neu eingefügt» und
   *  wird gemeldet, nie stillschweigend umgebucht (Auflage Gegenprüfung PR #801). */
  ohneBeleg: QuellLuecke[];
}

/**
 * Wie viele Stände eine Lücke höchstens überspannen darf.
 *
 * SIE IST EIN SICHERHEITSGURT, KEINE MESSGRÖSSE: gemessen 12.9.2026 über alle 186 Shards
 * und 1193 Stände ist die längste Lücke ZWEI Stände (CHEMRRV @2022-05-01 + @2022-10-01).
 * Je länger eine Lücke, desto eher ist sie keine Konversions-Panne, sondern eine echte
 * Aufhebung mit späterem, zufällig wortgleichem Wiedererlass — und die als «Quelle
 * unvollständig» zu buchen wäre die schlimmere Falschaussage (§1). Bei Überschreitung
 * bleibt es darum beim bisherigen «entfallen»; die Zahl steht im Lauf-Protokoll.
 */
export const QUELLLUECKE_STAENDE_MAX = 3;

/**
 * REIN: alle Quelllücken eines Erlasses aus den Stand-Profilen seiner Kette.
 *
 * DIE REGEL (und warum sie genau so eng ist):
 *  (1) Die eId steht im Stand davor, fehlt in einem LÜCKENLOSEN Lauf von Ständen und
 *      steht danach wieder da. Fehlt sie bis zum Ende der Kette, ist sie entfallen —
 *      Punkt; hier wird nichts vermutet.
 *  (2) Der Wortlaut bei der Rückkehr ist Zeichen für Zeichen derselbe wie davor (dieselbe
 *      Vergleichsform, unter der auch «geändert ja/nein» entschieden wird). Kehrt ein
 *      GEÄNDERTER Text zurück, kann das ebenso gut eine Aufhebung mit Neuerlass sein —
 *      dann bleibt es bei «entfallen» + «neu».
 *  (3) Der Lauf ist höchstens `QUELLLUECKE_STAENDE_MAX` Stände lang (Begründung dort).
 *  (4) DER ANHANG-BELEG (Auflage der Gegenprüfung zu PR #801, 12.9.2026): der Artikel
 *      steht in JEDEM Lücken-Stand als `<mod>`/`<quotedStructure>` derselben Datei, über
 *      die amtliche `modification-reference` dem Korpus-Token zugeordnet. Das ist der
 *      einzige POSITIVE Beweis, dass die Quelle den Artikel noch führt — ohne ihn ist
 *      (1)–(3) von einer echten Aufhebung mit späterer, wortgleicher Wiedereinführung
 *      nicht zu unterscheiden, und die als «Quelle unvollständig» zu tarnen wäre die
 *      schwerere Falschaussage (§1: lieber eine Aufhebung zu viel zeigen als eine
 *      verstecken). Solche Fälle kommen in `ohneBeleg` und bleiben «entfallen» + «neu»
 *      — gemeldet vom Lauf, als Warnung wiederholt von `check:entstehung`.
 *
 * AUFGEHOBENE ARTIKEL SIND NICHT BETROFFEN: eine echte Aufhebung lässt die eId als
 * «Aufgehoben»-Platzhalter stehen (`extrahiereArtikel` behält sie). Erst das vollständige
 * VERSCHWINDEN einer eId aus dem Artikelbaum ist die Anomalie, die hier gesucht wird.
 */
export function findeQuellLuecken(
  profile: readonly StandProfil[],
  tokenFuerEId: (eId: string) => string | null = tokenAusEId,
): QuellLueckenBefund {
  const out: QuellLuecke[] = [];
  const ohneBeleg: QuellLuecke[] = [];
  for (let i = 1; i < profile.length; i += 1) {
    for (const eId of profile[i - 1].eIds) {
      if (profile[i].eIds.has(eId)) continue;
      let j = i + 1;
      while (j < profile.length && !profile[j].eIds.has(eId)) j += 1;
      if (j >= profile.length) continue; // (1) kehrt nie zurück = echt entfallen
      if (j - i > QUELLLUECKE_STAENDE_MAX) continue; // (3)
      const vorher = profile[i - 1].norm.get(eId);
      if (!vorher || vorher !== profile[j].norm.get(eId)) continue; // (2)
      const token = tokenFuerEId(eId);
      const imAnhang = token !== null
        && Array.from({ length: j - i }, (_, k) => profile[i + k]).every((p) => p.anhangTokens.has(token));
      (imAnhang ? out : ohneBeleg).push({ eId, vonIdx: i, zurueckIdx: j, imAnhang });
    }
  }
  const nachLage = (a: QuellLuecke, b: QuellLuecke): number => (
    a.vonIdx !== b.vonIdx ? a.vonIdx - b.vonIdx : a.eId < b.eId ? -1 : 1
  );
  return { luecken: out.sort(nachLage), ohneBeleg: ohneBeleg.sort(nachLage) };
}
