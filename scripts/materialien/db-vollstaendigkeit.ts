// scripts/materialien/db-vollstaendigkeit.ts — reine Prüf-Logik für check-materialien.ts
// (+ soft-law-projektion-run.ts), getrennt vom vite-node-Entry, damit Unit-Tests sie ohne
// den ganzen Lauf importieren können (dasselbe Muster wie vernehmlassungen-tor.ts /
// wortfeld.ts — siehe deren Schlusskommentare bzw. Dateikopf).
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
//
// PRÄZISIERUNG nach Gegenprüfung PR #815, Auflagen A1/A2a/A2b (12.9.2026, §2b: ergänzt, der
// obige Befund-Wortlaut bleibt unverändert stehen):
//
// (A1) Die ursprüngliche Diagnose bündelte zwei UNABHÄNGIGE Fehlerquellen unter einer Ursache.
// Nachprüfung mit einer VOLLSTÄNDIGEN, inhaltsgleichen DB (kein Teilstand, alle 4 Quellen
// geseedet) zeigt: die 7 Orphan-Rots (ARG…VSTG) sind tatsächlich Folge des Teilstands (siehe
// oben) — aber die 4 "weicht von der Projektion ab"-Meldungen bestehen SO NICHT, sondern das
// Tor meldet dann ALLE 11 committeten Shards als Byte-Abweichung, weil `projiziereShards` den
// `erzeugt`-Stempel aus dem GERADE gelesenen `register.json` übernimmt (z. B. "2026-09-12"),
// während jeder committete Shard seinen EIGENEN, historischen Erzeugungs-Stempel trägt (z. B.
// "2026-08-30" — Shards werden nicht bei jedem Register-Lauf neu geschrieben). Einzeldiff je
// Datei: ausschliesslich Zeile 2 (`"erzeugt": …`), sonst byte-gleich. Das ist eine zweite,
// vom Vollständigkeits-Befund unabhängige Falsch-Rot-Klasse (§6.7) — behoben unten durch
// `shardInhaltGleich` (Vergleich ohne den Erzeugt-Stempel).
//
// (A2a) Der Vollständigkeits-Marker prüfte bisher NUR die Dokument-Meta (`soft_law`-Tabelle),
// nicht die Kanten selbst (`norm_referenzen`). Gegenprobe: `seedSoftLawDb` befüllt `soft_law`
// IMMER vollständig (298/298) — eine DB, deren `norm_referenzen` NACHTRÄGLICH auf eine Quelle
// getrimmt wird (Dok-Meta bleibt unangetastet), besteht `pruefeDbVollstaendigkeit` trotzdem,
// obwohl exakt dieselben 7 Orphan-Rots entstehen. Der Marker braucht daher eine ZWEITE
// Dimension: `pruefeKantenVollstaendigkeit` unten, die verlangt, dass jedes Dokument, das in
// den COMMITTETEN Shards mindestens eine Kante hat, auch in der DB-Kantenmenge auftaucht.

export interface VollstaendigkeitsErgebnis {
  vollstaendig: boolean;
  /** ids, die auf der Soll-Seite stehen, aber auf der Ist-Seite fehlen. */
  fehlendeIds: string[];
}

/**
 * Generische Mengendeckung: jede `sollIds`-id muss in `istIds` auftauchen. Basis für beide
 * Vollständigkeits-Dimensionen (Dokument-Meta UND Kanten) — siehe die beiden benannten
 * Wrapper unten, die jeweils Soll-/Ist-Menge dokumentieren.
 */
function pruefeMengenDeckung(sollIds: Iterable<string>, istIds: ReadonlySet<string>): VollstaendigkeitsErgebnis {
  const fehlendeIds = [...sollIds].filter((id) => !istIds.has(id));
  return { vollstaendig: fehlendeIds.length === 0, fehlendeIds };
}

/**
 * Dimension 1 (Dokument-Meta): prüft, ob die aus der lokalen DB geladene Dokument-Meta
 * (`dokMetaIds`, aus `soft_law`) jede im Zustandsträger 'gelistet' geführte id (`gelistetIds`)
 * trägt. Allein NICHT hinreichend für Reprojektionsfähigkeit (A2a) — `seedSoftLawDb` befüllt
 * `soft_law` immer vollständig, auch wenn `norm_referenzen` (die Kanten) nachträglich
 * beschnitten wurden. Siehe `pruefeKantenVollstaendigkeit` für die zweite, notwendige
 * Dimension.
 */
export function pruefeDbVollstaendigkeit(
  gelistetIds: Iterable<string>,
  dokMetaIds: ReadonlySet<string>,
): VollstaendigkeitsErgebnis {
  return pruefeMengenDeckung(gelistetIds, dokMetaIds);
}

/**
 * Dimension 2 (Kanten, A2a-Nachzug): jedes Dokument, das im COMMITTETEN Shard-Bestand
 * mindestens eine Kante hat (`committeteDokIds` — aus den Shard-Dateien selbst, nicht aus dem
 * Zustandsträger, der keine Kanten-Zahl je Dokument führt), muss auch in der aus der lokalen
 * DB geladenen Kantenmenge (`dbKantenDokIds`, distinkte `quelldok_id` aus `norm_referenzen`)
 * auftauchen. Nur BEIDE Dimensionen zusammen (Dokument-Meta UND Kanten) machen eine DB
 * reprojektionsfähig — die Gegenprobe der Gegenprüfung (volle Dok-Meta, auf eine Quelle
 * getrimmte Kanten) besteht Dimension 1, aber nicht Dimension 2.
 */
export function pruefeKantenVollstaendigkeit(
  committeteDokIds: Iterable<string>,
  dbKantenDokIds: ReadonlySet<string>,
): VollstaendigkeitsErgebnis {
  return pruefeMengenDeckung(committeteDokIds, dbKantenDokIds);
}

/**
 * (A2b) Vergleicht zwei serialisierte Shard-Dateien auf Inhaltsgleichheit OHNE den
 * `erzeugt`-Stempel (siehe Präzisierung A1 oben): der Stempel ist der Erzeugungszeitpunkt DES
 * SHARDS, nicht Teil seines fachlichen Inhalts (Kanten/Dokumente/Buckets) — ein frisch
 * projizierter Shard trägt IMMER den `erzeugt`-Wert des gerade gelesenen `register.json`,
 * während ein länger nicht neu geschriebener committeter Shard seinen eigenen, älteren Stempel
 * behält (das ist erwünscht, siehe `schreibeShardsUndBereinige`: nur bei Byte-Abweichung NEU
 * geschrieben). Ein reiner Stempel-Unterschied ist daher kein fachlicher Drift und darf nicht
 * rot werden; ein inhaltlicher Unterschied (Kanten/Dokumente/Buckets) bleibt rot. Bei
 * ungültigem JSON auf einer Seite: nicht gleich (die "kein gültiges JSON"-Meldung kommt separat
 * aus `pruefeShardDatei`, Defense-in-depth).
 */
export function shardInhaltGleich(a: string, b: string): boolean {
  if (a === b) return true; // schneller Pfad (deckt auch den Normalfall ab: Stempel gleich).
  try {
    const ra = JSON.parse(a) as Record<string, unknown>;
    const rb = JSON.parse(b) as Record<string, unknown>;
    delete ra.erzeugt;
    delete rb.erzeugt;
    return JSON.stringify(ra) === JSON.stringify(rb);
  } catch {
    return false;
  }
}

/**
 * Zählt die Kanten EINES Shard-Objekts. Quelle der Tor-Zusammenfassung («N Kanten») in
 * check-materialien.ts, IMMER aus dem tatsächlich validierten, committeten Bestand — nie aus
 * der (u. U. unvollständigen oder in CI fehlenden) lokalen DB, die vorher in den
 * SKIP-/hohle-DB-Zweigen strukturell 0 lieferte, auch wenn der committete Bestand tausende
 * Kanten trägt (§6.7).
 *
 * (A3, §17-Gegengewicht) Eine frühere Fassung zählte zusätzlich "Downgrades" (Kanten, die
 * gegen den Revisions-Cutoff verstossen). Gestrichen, nicht nur umformuliert: dieser Wert ist
 * in JEDEM erfolgreichen (grünen) Lauf strukturell 0 — dieselbe Bedingung
 * (`braucheDowngrade(...)`), die eine Kante als Verstoss zählen würde, lässt `pruefeShardDatei`
 * IMMER gleichzeitig einen `fehler.push(...)` auslösen (siehe dort), der Lauf also rot machen.
 * Ein Zähler, der im einzigen Zustand, in dem er überhaupt angezeigt wird (grün), nie einen
 * anderen Wert als 0 tragen kann, ist kein Befund, sondern ein struktureller Blindwert — §17-
 * Gegengewicht («was nicht scheitern kann, wird gestrichen statt bewacht») zieht das durch,
 * statt den Blindwert nur ehrlicher zu beschriften. Die eigentliche Prüfung (Downgrade-
 * Verstoss ⇒ rot) bleibt unverändert in `pruefeShardDatei` bestehen — nur die redundante
 * Anzeigezahl fällt weg.
 */
export function zaehleKanten(kanten: ReadonlyArray<unknown> | undefined): number {
  return (kanten ?? []).length;
}
