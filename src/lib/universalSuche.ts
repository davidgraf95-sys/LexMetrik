// ─── Universal-Suche: reiner Aggregator über alle Inhaltsarten ──────────────
//
// Bündelt die BESTEHENDEN, je eigenen Such-/Filter-Funktionen zu EINER
// gruppierten Trefferliste (§5: kein neues Ranking, keine eigene Rechtslogik
// §3). Die Funktion ist rein und synchron — die schweren Daten (Gesetzes-/
// Entscheid-Manifest, Preset-Index) werden von der Komponente lazy geladen und
// hier nur als Argument übergeben (so bleibt der Start-Chunk schlank).
//
//   Katalog       ← sucheRang (katalogSuche) über KATALOG_KARTEN
//   Fristen-Preset← presetSuche (presetIndex), als Eintrag übergeben
//   Gesetze       ← filtern (normtext/browse) über das Browse-Manifest
//   Rechtsprechung← filterEntscheide (rechtsprechung/browse) über das Manifest

import { KATALOG_KARTEN, istVerfuegbar } from './startseiteConfig';
import { sucheRang } from './katalogSuche';
import type { BrowseErlass } from './normtext/browse-typen';
import { filtern } from './normtext/browse';
import type { BrowseEntscheid } from './rechtsprechung/register';
import { filterEntscheide, nachDatum } from './rechtsprechung/browse';
import type { PresetIndexEintrag } from './presetIndex';
import type { BrowseMaterial } from './materialien/typen';
import { filtere as filtereMaterialien, vergleicheGlobal } from './materialien/browse';

export type GruppenId = 'katalog' | 'preset' | 'gesetz' | 'artikel' | 'entscheid' | 'material';

export interface SuchTreffer {
  id: string;
  label: string;
  untertitel?: string;
  /** Status-/Zuordnungs-Marke (z. B. «geprüft», «ZPO»). */
  marke?: { text: string; ton: 'ok' | 'entwurf' | 'soft' };
  href: string;
}

export interface SuchGruppe {
  id: GruppenId;
  titel: string;
  treffer: SuchTreffer[];
  /** Gesamtzahl vor der Kappung (für «alle N zeigen»). */
  gesamt: number;
  /** Ziel des «alle zeigen»-Links (oder undefined). */
  mehrHref?: string;
  /** true, solange die zugrundeliegenden Daten noch nicht geladen sind. */
  laedt?: boolean;
}

const KAPPUNG = 6;

// ── Einzelgruppen (rein) ─────────────────────────────────────────────────────

export function katalogGruppe(q: string, kappung = KAPPUNG): SuchGruppe {
  const getroffen = KATALOG_KARTEN
    .map((k) => ({ k, rang: sucheRang(k, q) }))
    .filter((x): x is { k: typeof KATALOG_KARTEN[number]; rang: number } =>
      x.rang !== null && !!x.k.href && istVerfuegbar(x.k))
    .sort((a, b) => a.rang - b.rang);

  const treffer: SuchTreffer[] = getroffen.slice(0, kappung).map(({ k }) => ({
    id: k.id,
    label: k.title,
    untertitel: k.rechtsgebiet,
    marke: { text: k.modus === 'vorlage' ? 'Vorlage' : 'Rechner', ton: 'soft' as const },
    href: k.href!,
  }));

  // Kein «alle N»-Link mehr: /recherche ist aufgelöst, Rechner und Vorlagen
  // liegen in getrennten Übersichten (/rechner, /vorlagen) — eine kombinierte
  // Katalog-Trefferseite gibt es nicht. Bei >Kappung verfeinert man die Suche.
  return { id: 'katalog', titel: 'Rechner & Vorlagen', treffer, gesamt: getroffen.length };
}

export function presetGruppe(eintraege: PresetIndexEintrag[] | null, kappung = KAPPUNG): SuchGruppe {
  if (eintraege === null) return { id: 'preset', titel: 'Fristen-Vorlagen', treffer: [], gesamt: 0, laedt: true };
  const treffer: SuchTreffer[] = eintraege.slice(0, kappung).map((e) => ({
    id: e.key,
    label: e.label,
    untertitel: e.norm || e.regimeLabel,
    marke: { text: e.regimeLabel, ton: 'soft' as const },
    href: `/rechner/tagerechner${e.query}${e.hash}`,
  }));
  // Kein «alle N zeigen»-Link: der Tagerechner kennt keine ?q=-Listenansicht,
  // ein Link dorthin verlöre die Suche (§8). Die Zählung muss EHRLICH sein —
  // darum übergibt die Komponente die Presets ungekappt (kein 12er-Limit), so
  // dass `gesamt` die echte Trefferzahl ist. Bei >Kappung verfeinert man die Suche.
  return { id: 'preset', titel: 'Fristen-Vorlagen', treffer, gesamt: eintraege.length };
}

export function gesetzGruppe(erlasse: BrowseErlass[] | null, q: string, kappung = KAPPUNG): SuchGruppe {
  if (erlasse === null) return { id: 'gesetz', titel: 'Gesetze', treffer: [], gesamt: 0, laedt: true };
  const getroffen = filtern(erlasse, q);
  const treffer: SuchTreffer[] = getroffen.slice(0, kappung).map((e) => ({
    id: e.key,
    label: e.kuerzel ? `${e.kuerzel} · ${e.titel}` : e.titel,
    untertitel: [e.ebene === 'kanton' ? e.kanton : 'Bund', e.sr ? `SR ${e.sr}` : null].filter(Boolean).join(' · '),
    marke: e.ebene === 'kanton' && e.kanton ? { text: e.kanton, ton: 'soft' as const } : undefined,
    href: `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`,
  }));
  return {
    id: 'gesetz', titel: 'Gesetze', treffer, gesamt: getroffen.length,
    mehrHref: getroffen.length > kappung ? '/gesetze' : undefined,
  };
}

export function entscheidGruppe(liste: BrowseEntscheid[] | null, q: string, kappung = KAPPUNG): SuchGruppe {
  if (liste === null) return { id: 'entscheid', titel: 'Rechtsprechung', treffer: [], gesamt: 0, laedt: true };
  const getroffen = nachDatum(filterEntscheide(liste, { q }));
  const treffer: SuchTreffer[] = getroffen.slice(0, kappung).map((e) => ({
    id: e.key,
    label: e.zitierung,
    untertitel: [e.gerichtName, e.regesteKurz].filter(Boolean).join(' — ') || e.gerichtName,
    marke: e.leitcharakter === 'leitentscheid' ? { text: 'Leitentscheid', ton: 'ok' as const } : undefined,
    href: `/rechtsprechung/${encodeURIComponent(e.key)}`,
  }));
  return {
    id: 'entscheid', titel: 'Rechtsprechung', treffer, gesamt: getroffen.length,
    mehrHref: getroffen.length > kappung ? '/rechtsprechung' : undefined,
  };
}

export function materialGruppe(liste: BrowseMaterial[] | null, q: string, kappung = KAPPUNG): SuchGruppe {
  if (liste === null) return { id: 'material', titel: 'Materialien', treffer: [], gesamt: 0, laedt: true };
  const getroffen = filtereMaterialien(liste, { suche: q }).sort(vergleicheGlobal);
  const treffer: SuchTreffer[] = getroffen.slice(0, kappung).map((m) => ({
    id: m.key,
    label: m.nummer ? `${m.behoerdeKuerzel} ${m.nummer} · ${m.titel}` : `${m.behoerdeKuerzel} · ${m.titel}`,
    untertitel: [m.behoerdeName, m.doktypLabel].filter(Boolean).join(' — '),
    marke: { text: 'Material', ton: 'soft' as const },
    href: `/materialien/${encodeURIComponent(m.key)}`,
  }));
  return {
    id: 'material', titel: 'Materialien', treffer, gesamt: getroffen.length,
    mehrHref: getroffen.length > kappung ? '/materialien' : undefined,
  };
}

// ── Aggregation ──────────────────────────────────────────────────────────────

/** Gesetzestext-/Artikel-Volltext-Gruppe. `treffer === null` ⇒ Index noch nicht
 *  geladen (Platzhalter); sonst die bereits via FlexSearch gefundenen Treffer. */
export function artikelGruppe(treffer: SuchTreffer[] | null, kappung = KAPPUNG): SuchGruppe {
  if (treffer === null) return { id: 'artikel', titel: 'Gesetzestext', treffer: [], gesamt: 0, laedt: true };
  return { id: 'artikel', titel: 'Gesetzestext', treffer: treffer.slice(0, kappung), gesamt: treffer.length };
}

export interface SuchDaten {
  presets: PresetIndexEintrag[] | null;
  gesetze: BrowseErlass[] | null;
  /** Bereits gefundene Artikel-Volltext-Treffer (lazy FlexSearch); null = lädt. */
  artikel: SuchTreffer[] | null;
  entscheide: BrowseEntscheid[] | null;
  materialien: BrowseMaterial[] | null;
}

/** Alle Gruppen in fester Reihenfolge; leere (aber geladene) Gruppen entfallen,
 *  noch ladende Gruppen bleiben als Platzhalter sichtbar. */
export function sucheAlles(q: string, daten: SuchDaten, kappung = KAPPUNG): SuchGruppe[] {
  if (q.trim() === '') return [];
  const gruppen = [
    katalogGruppe(q, kappung),
    presetGruppe(daten.presets, kappung),
    gesetzGruppe(daten.gesetze, q, kappung),
    artikelGruppe(daten.artikel, kappung),
    entscheidGruppe(daten.entscheide, q, kappung),
    materialGruppe(daten.materialien, q, kappung),
  ];
  return gruppen.filter((g) => g.laedt || g.treffer.length > 0);
}
