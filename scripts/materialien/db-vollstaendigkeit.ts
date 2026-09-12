// scripts/materialien/db-vollstaendigkeit.ts — reine Prüf-Logik für check-materialien.ts,
// getrennt vom vite-node-Entry, damit Unit-Tests sie ohne den ganzen Lauf importieren
// können (dasselbe Muster wie vernehmlassungen-tor.ts / wortfeld.ts — siehe deren
// Schlusskommentare bzw. Dateikopf).
//
// Befund (FAHRPLAN-OFFENE-BEFUNDE.md, PR #703-Nachzug, «check:materialien lokal 7 falsche
// Shard-Abweichungen»): eine lokale `daten/soft-law.db`, die nur EINE gecrawlte Quelle trägt
// (z. B. ein `soft-law-snapshot.ts --quelle=X`-Zwischenstand ohne den vorgelagerten
// Seed-Schritt aus `seedSoftLawDb`, oder ein manuell zusammengesetzter Debug-Stand), liefert
// `norm_referenzen`/`soft_law` nur für einen Teil der laut Zustandsträger
// (`bibliothek/register/soft-law-zustand.jsonl`) gelisteten Dokumente. Der bisherige
// `reprojektionsfaehig`-Schalter in check-materialien.ts prüfte nur "hat die DB überhaupt
// Kanten?" (kanten.length > 0) — eine DB mit EINIGEN, aber nicht ALLEN Kanten besteht diesen
// Schalter trotzdem und nimmt den Byte-Reprojektions-Pfad (`pruefeShardDrift`): die aus der
// unvollständigen DB projizierten Shards werden dann gegen die VOLLSTÄNDIGEN committeten
// Shards verglichen — jedes in der DB fehlende Dokument erzeugt eine falsche
// Abweichungs-/Orphan-Meldung. §6.7: ein Tor, das bei jedem lokalen Teilstand rot färbt, ohne
// dass ein echter Fehler vorliegt, wird irgendwann übersteuert/ignoriert — das ist gefährlicher
// als ein Tor, das den Teilstand ehrlich als "übersprungen" ausweist.
//
// Vollständigkeits-Marker: jede im Zustandsträger 'gelistet' geführte id MUSS in der aus der
// DB geladenen Dokument-Meta auftauchen (dokMeta, aus der `soft_law`-Tabelle). Fehlt auch nur
// eine, ist die DB nicht reprojektionsfähig — der Aufrufer muss auf die Direktvalidierung der
// committeten Dateien ausweichen (wie schon beim hohlen-DB-Fall) und dies als HINWEIS
// protokollieren (nie rot wegen lokalem Teilstand, nie still, §6 Ziff. 7 lit. b).

export interface VollstaendigkeitsErgebnis {
  vollstaendig: boolean;
  /** ids, die im Zustandsträger 'gelistet' sind, aber in der DB-Dokument-Meta fehlen. */
  fehlendeIds: string[];
}

/**
 * Prüft, ob die aus der lokalen DB geladene Dokument-Meta (`dokMetaIds`) jede im
 * Zustandsträger 'gelistet' geführte id (`gelistetIds`) trägt. Nur bei voller Deckung ist die
 * DB reprojektionsfähig — sonst würde der Byte-Vergleich fehlende Dokumente als falsche
 * Shard-Abweichung/Orphan melden (§6.7).
 */
export function pruefeDbVollstaendigkeit(
  gelistetIds: Iterable<string>,
  dokMetaIds: ReadonlySet<string>,
): VollstaendigkeitsErgebnis {
  const fehlendeIds = [...gelistetIds].filter((id) => !dokMetaIds.has(id));
  return { vollstaendig: fehlendeIds.length === 0, fehlendeIds };
}

/**
 * Zählt Kanten und Downgrade-Verstösse EINES Shard-Objekts. Quelle der Tor-Zusammenfassung
 * («N Kanten · M Downgrades») in check-materialien.ts, IMMER aus dem tatsächlich validierten,
 * committeten Bestand — nie aus der (u. U. unvollständigen oder in CI fehlenden) lokalen DB,
 * die vorher in den SKIP-/hohle-DB-Zweigen strukturell 0 lieferte, auch wenn der committete
 * Bestand tausende Kanten trägt (§6.7). `braucheDowngradeFn` wird injiziert, damit dieser reine
 * Zähler ohne DB/Dateisystem testbar bleibt.
 *
 * HINWEIS zur Semantik: gezählt werden Kanten, die HEUTE gegen den Revisions-Cutoff verstossen
 * würden (Artikel-Kante mit Stand vor dem Cutoff, aber noch nicht auf Erlass-Ebene
 * herabgestuft) — nicht die Zahl der während einer Live-Projektion angewandten Downgrades (die
 * ist kein committetes Artefakt, sondern ein Nebenprodukt des Generator-Laufs, siehe
 * soft-law-projektion-run.ts). In einem gesunden, bereits korrekt herabgestuften Bestand ist
 * dieser Wert 0 — ein ECHTER Befund, kein struktureller Blindwert.
 */
export function zaehleShardKanten(
  kanten: ReadonlyArray<{ artikel?: string; stand: string }> | undefined,
  erlass: string,
  braucheDowngradeFn: (erlass: string, artikel: string, stand: string) => boolean,
): { kanten: number; downgrades: number } {
  const liste = kanten ?? [];
  let downgrades = 0;
  for (const k of liste) {
    if (k.artikel !== undefined && k.artikel !== '' && braucheDowngradeFn(erlass, k.artikel, k.stand)) downgrades++;
  }
  return { kanten: liste.length, downgrades };
}
