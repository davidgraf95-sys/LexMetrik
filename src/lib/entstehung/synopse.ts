// ─── Synopse alt/neu am Artikel ──────────────────────────────────────────────
//
// E5 von «Entstehung am Artikel» (FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.4/§11.6).
// Zu jeder Fedlex-Konsolidierung ab Stand 1.1.2021 liegt der volle Wortlaut als
// Akoma-Ntoso-XML vor. Der Shard je Erlass hält je Konsolidierungs-SCHRITT die
// **Alt-Fassung** der Artikel, die sich in diesem Schritt geändert haben oder
// entfallen sind — und NUR die Alt-Fassung: die Neu-Fassung ist die Alt-Fassung des
// Folgeschritts bzw. der geltende Snapshot (§5, halbiert das Volumen; Recherche R2).
//
// FENSTER (§8 — die Grenze wird benannt, nicht verschwiegen): HTML/XML alter Stände
// gibt es erst ab 1.1.2021 (R2 §1: korpusweit 1369 html-Stände, davon nur 156 vor
// 2021, fast alle davon geltende Fassungen unveränderter Erlasse). Für ältere
// Fassungen existiert nur `doc`/`pdf-a` — dafür gibt es hier bewusst NICHTS, und die
// Oberfläche sagt «Fassungsvergleich erst für Stände ab 2021 verfügbar».
//
// ZITAT (§7 a–d): der gespeicherte Alt-Block ist gespeicherter Gesetzestext und trägt
// deshalb alle vier Merkmale — (a) `stand` der historischen Konsolidierung, (b) die
// Filestore-URL der ausgewerteten Manifestation (aus `isExemplifiedBy`, NIE
// konstruiert), (c) `liveUrl` auf die amtliche Fassung dieses Stands, (d) zwei
// Prüfsummen je Quelle und je Block als Drift-Erkennung.
//
// NORMALISIERUNGS-PROFIL: `entstehung-norm/1`. Das Profil wird NIE editiert — eine
// Verbesserung heisst `/2` und entsteht daneben. Sonst entwertet jede Parser-Korrektur
// rückwirkend alle Prüfsummen (Muster law.soufien.lu, Bibliothek `soufien-lex.md`).
//
// §3 Schichtentrennung: Typen + Lazy-Loader + reine Auswahl-Helfer. Keine UI, keine
// Rechtslogik, kein Fetch im Lesefluss (der Shard lädt erst auf Klick, §15).

/** Version des Normalisierungs-Profils (nie editieren, nur danebenlegen). */
export const NORM_PROFIL = 'entstehung-norm/1';

/** Frühester Stand mit maschinenlesbarem Volltext (R2 §1, gemessen 6.9.2026). */
export const SYNOPSE_FENSTER_AB = '2021-01-01';

/** Verzeichnis der Shards (öffentliche Auslieferung, lädt erst auf Klick). */
export const SYNOPSE_DIR = 'public/materialien/synopse';

/** Ein Block (Absatz, Ziffer, Buchstabe) der Alt-Fassung — Wortlaut amtlich.
 *  Beide Etiketten sind die LITERALEN `<num>` des AKN-Baums; es wird nie eines
 *  zusammengesetzt oder erfunden (Skill `scraping-swiss-official-sources`: Listen-
 *  Etiketten unterscheiden sich je Sprache und Erlass, `a.` vs. `abis` vs. Gedankenstrich). */
export interface SynopseBlock {
  /** `<num>` des umschliessenden `<paragraph>`, z. B. «1» — null bei absatzlosem Artikel. */
  absatz: string | null;
  /** `<num>` des Blocks selbst, wenn er ein `<item>` ist, z. B. «a. » — null beim Absatz selbst. */
  num: string | null;
  /** Wortlaut, verbatim aus dem AKN-XML (Fussnoten-Apparat entfernt, `<sup>` erhalten). */
  text: string;
}

/** Gültigkeits-Zustand eines Alt-Blocks gegen die Fussnoten-Historie (§8, nie still aufgelöst). */
export type SynopseZustand =
  /** Textänderung UND passendes Fussnoten-Ereignis am selben Stand-Datum. */
  | 'belegt'
  /** Textänderung ohne Fussnoten-Ereignis — der Widerspruch wird ANGEZEIGT (§11.6). */
  | 'ohne_ereignis';

/** Die Alt-Fassung eines Artikels in EINEM Konsolidierungs-Schritt. */
export interface SynopseArtikel {
  /** Amtliche eId der Konsolidierung, z. B. «art_336_c». */
  eId: string;
  /** Kanonischer Artikel-Token der Korpus-Schreibweise, z. B. «336c» — null, wenn nicht ableitbar. */
  token: string | null;
  /** Amtliches Artikel-Etikett der Alt-Fassung, z. B. «Art. 336c». */
  label: string;
  /** Sachüberschrift der Alt-Fassung (amtlich zitiert), null wenn keine. */
  ueberschrift: string | null;
  /** `geaendert` = eId in beiden Ständen, Wortlaut verschieden · `entfallen` = nur im Alt-Stand. */
  art: 'geaendert' | 'entfallen';
  /** Wortlaut der Alt-Fassung. */
  alt: SynopseBlock[];
  /** sha256 über den NORMALISIERTEN Wortlaut (Profil `NORM_PROFIL`) — die Prüfsumme,
   *  an der der Determinismus-Wächter eine echte Textänderung von Parser-Drift trennt.
   *  Die zweite der von `soufien-lex.md` verlangten zwei Prüfsummen (Bytes der Quelle)
   *  sitzt eine Ebene höher, als `sha` je `SynopseStand` — pro Artikel wäre sie 64 Byte
   *  Rauschen je Eintrag und würde den Shard-Deckel ohne Erkenntnisgewinn belasten. */
  shaNorm: string;
  /** Gültigkeits-Zustand gegen die Fussnoten-Historie. */
  zustand: SynopseZustand;
  /** AS-ELIs der Fussnoten-Ereignisse dieses Stands (Ereignis-Schlüssel `datum + oc-ELI`). */
  oc: string[];
}

/** Ein Konsolidierungs-Schritt: von Stand `von` auf Stand `bis`. */
export interface SynopseSchritt {
  /** Stand der ALT-Konsolidierung (ISO). */
  von: string;
  /** Stand der NEU-Konsolidierung (ISO) — das Datum, an dem die Änderung gilt. */
  bis: string;
  /** eIds, die nur im NEUEN Stand vorkommen (neu eingefügt) — nur Liste, kein Text. */
  neuEIds: string[];
  /** Fussnoten-Ereignisse am Stand `bis`, zu denen KEINE Textänderung beobachtet wurde
   *  (Widerspruch, §11.6 `validity_conflict` — angezeigt, nie still aufgelöst). */
  ereignisOhneAenderung: string[];
  artikel: SynopseArtikel[];
}

/** Eine ausgewertete Konsolidierung (Quell-Beleg, §7 a–d). */
export interface SynopseStand {
  /** `dateApplicability` der Konsolidierung (ISO) — amtlicher Stand. */
  datum: string;
  /** Filestore-URL der AKN-XML-Manifestation (aus `isExemplifiedBy`, nie konstruiert). */
  xmlUrl: string;
  /** Live-Link zur amtlichen Fassung dieses Stands (§7c). */
  liveUrl: string;
  /** sha256 über das abgerufene XML (Quell-Hash, §7d). */
  sha: string;
  /** Bytes des abgerufenen XML. */
  bytes: number;
  /** Abrufdatum ISO (§7a). */
  abgerufen: string;
  /** Zahl der Artikel-eIds in diesem Stand (Zähl-Tor gegen stille Extraktionsverluste). */
  artikelZahl: number;
}

/** Shard je Erlass: `public/materialien/synopse/<ERLASS-KEY>.json`. */
export interface SynopseShard {
  /** Erlass-Key des Korpus, z. B. «ZPO» (= Dateiname ohne .json). */
  erlass: string;
  /** ELI-Kurzform des Erlasses, z. B. «cc/2010/262». */
  eli: string;
  /** Normalisierungs-Profil, unter dem `shaNorm` gebildet wurde. */
  normProfil: string;
  /** Erzeugungsdatum ISO (§2: aus der Shell, nie Date.now). */
  erzeugt: string;
  /** Früheste ausgewertete Konsolidierung (= `SYNOPSE_FENSTER_AB` oder später). */
  fensterAb: string;
  staende: SynopseStand[];
  schritte: SynopseSchritt[];
}

const cache = new Map<string, Promise<SynopseShard | null>>();

/**
 * Lädt den Synopse-Shard eines Erlasses — LAZY, erst auf Klick (§15: im Lesefluss
 * null Byte). Fehlt der Shard, ist das ein gültiger Zustand («keine Fassung ab 2021»),
 * kein Fehler.
 */
export function ladeSynopseShard(erlassKey: string): Promise<SynopseShard | null> {
  const vorhanden = cache.get(erlassKey);
  if (vorhanden) return vorhanden;
  const p = fetch(`/materialien/synopse/${encodeURIComponent(erlassKey)}.json`)
    .then((r) => (r.ok ? (r.json() as Promise<SynopseShard>) : null))
    .catch(() => null);
  cache.set(erlassKey, p);
  return p;
}

/** Alle Alt-Fassungen eines Artikels, jüngster Schritt zuerst (leer = keine erfasst). */
export function synopseFuerArtikel(
  s: SynopseShard,
  token: string,
): { schritt: SynopseSchritt; artikel: SynopseArtikel }[] {
  const out: { schritt: SynopseSchritt; artikel: SynopseArtikel }[] = [];
  for (const schritt of s.schritte) {
    for (const artikel of schritt.artikel) {
      if (artikel.token === token) out.push({ schritt, artikel });
    }
  }
  return out.sort((a, b) => (a.schritt.bis < b.schritt.bis ? 1 : -1));
}

/** Quell-Beleg eines Stands (für die Zitat-Angabe am Alt-Block, §7 a–c). */
export function standVon(s: SynopseShard, datum: string): SynopseStand | null {
  return s.staende.find((x) => x.datum === datum) ?? null;
}
