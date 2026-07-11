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
import type { NormQueryTreffer } from './suche/normQuery';
import type { BgeSprung } from './suche/bgeQuery';

// 'sprung' = deterministischer Norm-Direktsprung (A5), von der Komponente VOR die
// statischen Gruppen gehängt; er entsteht aus dem Parser normQuery.ts, nicht im
// synchronen Aggregator unten (deshalb kein sucheAlles-Zweig dafür).
// 'online' = zusätzliche Edge-Volltextgruppe (QS-DATA E2), von der Komponente
// hinter die statischen Gruppen gehängt; sie entsteht in lib/suche/onlineVolltext.ts,
// nicht im synchronen Aggregator unten (deshalb kein sucheAlles-Zweig dafür).
export type GruppenId = 'sprung' | 'katalog' | 'preset' | 'gesetz' | 'artikel' | 'entscheid' | 'material' | 'online';

export interface SuchTreffer {
  id: string;
  label: string;
  untertitel?: string;
  /** Status-/Zuordnungs-Marke (z. B. «ZPO»). `ton: 'leitentscheid'` rendert das
   *  geteilte StatusBadge-Vokabular (W2·7-VZUI, EIN aria-label an allen Fundorten). */
  marke?: { text: string; ton: 'ok' | 'entwurf' | 'soft' | 'leitentscheid'; redundant?: boolean };
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
  /** Einmalige, dezente §8-Offenlegung unter dem Gruppentitel (z. B. Online-Suche). */
  hinweis?: string;
  /** Externer Amtslink (öffnet in neuem Reiter) — z. B. BGE «nicht im Bestand»
   *  → search.bger.ch. Nicht Teil der Listbox-Optionen (echter `<a target>`). */
  externLink?: { href: string; label: string };
}

const KAPPUNG = 6;

// ── Norm-Sprung (A5) ─────────────────────────────────────────────────────────

/** Baut die eine Sprung-Gruppe aus dem Parser-Treffer (oder null, wenn die
 *  Eingabe keine eindeutige Norm ist → nur Freitext-Suche). Reine Abbildung
 *  (§3): der Parser normQuery.ts hat die Norm bereits deterministisch aufgelöst;
 *  hier wird sie nur als oberster, gruppierter Treffer angezeigt. Der Direkt-
 *  Sprung ist die Primäraktion (Enter springt), Marke «Sprung» + amtlicher
 *  Titel (A5-Wortlaut David). */
export function sprungGruppe(direkt: NormQueryTreffer | null): SuchGruppe | null {
  if (!direkt) return null;
  const artikel = direkt.artikelAnzeige ? ` · Art. ${direkt.artikelAnzeige}` : '';
  return {
    id: 'sprung',
    titel: 'Norm-Sprung',
    gesamt: 1,
    treffer: [{
      id: `${direkt.erlass.key}${direkt.artikelToken ? `-${direkt.artikelToken}` : ''}`,
      label: `${direkt.erlass.kuerzel}${artikel}`,
      untertitel: direkt.erlass.titel,
      marke: { text: 'Sprung', ton: 'ok' as const },
      href: direkt.href,
    }],
  };
}

// ── BGE-Zitat-Sprung (UI-NAV S2) ─────────────────────────────────────────────

/** Baut die eine BGE-Sprung-Gruppe aus dem Parser-Ergebnis (oder null → normale
 *  Suche). Drei Zustände (§8): (a) `laedt` — Manifest noch nicht da, kein
 *  voreiliges «nicht im Bestand»; (b) im Bestand — interner Direkt-Sprung als
 *  oberster Treffer «Direkt öffnen»; (c) NICHT im Bestand — kein Treffer, sondern
 *  eine ehrliche Zeile + amtlicher Bundesgerichts-Link (externLink), statt das
 *  Zitat still unter Freitext-Treffern verschwinden zu lassen. Reine Abbildung
 *  (§3): der Parser bgeQuery.ts hat bereits aufgelöst. Teilt die id 'sprung' mit
 *  dem Norm-Sprung (beide sind exklusiv — eine Query ist Norm ODER BGE). */
export function bgeSprungGruppe(bge: BgeSprung | null): SuchGruppe | null {
  if (!bge) return null;
  if (bge.laedt) return { id: 'sprung', titel: 'Entscheid-Sprung', treffer: [], gesamt: 0, laedt: true };
  if (bge.imBestand && bge.key) {
    return {
      id: 'sprung',
      titel: 'Entscheid-Sprung',
      gesamt: 1,
      treffer: [{
        id: bge.key,
        label: bge.zitat,
        untertitel: 'Leitentscheid im Bestand — direkt öffnen',
        marke: { text: 'Direkt öffnen', ton: 'ok' as const },
        href: `/rechtsprechung/${encodeURIComponent(bge.key)}`,
      }],
    };
  }
  // Nicht im Bestand: ehrliche Auskunft + amtlicher Link (kein interner Treffer).
  return {
    id: 'sprung',
    titel: 'Entscheid-Sprung',
    gesamt: 0,
    treffer: [],
    hinweis: `${bge.zitat} ist nicht im Bestand von LexMetrik.`,
    externLink: { href: bge.amtlichHref, label: `${bge.zitat} beim Bundesgericht öffnen` },
  };
}

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
    marke: { text: k.modus === 'vorlage' ? 'Vorlage' : 'Rechner', ton: 'soft' as const, redundant: true },
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
    marke: e.leitcharakter === 'leitentscheid' ? { text: 'Leitentscheid', ton: 'leitentscheid' as const } : undefined,
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
    marke: { text: 'Material', ton: 'soft' as const, redundant: true },
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

/** Alle Gruppen in fester Reihenfolge nach RELEVANZ (A6, David 5.7.2026): erst
 *  die Rechtsinhalte (Gesetze → Gesetzestext/Artikel → Rechtsprechung →
 *  Materialien), dann die Werkzeuge (Rechner & Vorlagen → Fristen-Vorlagen). Der
 *  Norm-Sprung (A5) wird von der Komponente noch DAVOR gehängt (sprungGruppe),
 *  die Online-Edge-Gruppe DAHINTER — beides ausserhalb dieses synchronen
 *  Aggregators. Leere (aber geladene) Gruppen entfallen, noch ladende Gruppen
 *  bleiben als Platzhalter sichtbar. */
export function sucheAlles(q: string, daten: SuchDaten, kappung = KAPPUNG): SuchGruppe[] {
  if (q.trim() === '') return [];
  const gruppen = [
    gesetzGruppe(daten.gesetze, q, kappung),
    artikelGruppe(daten.artikel, kappung),
    entscheidGruppe(daten.entscheide, q, kappung),
    materialGruppe(daten.materialien, q, kappung),
    katalogGruppe(q, kappung),
    presetGruppe(daten.presets, kappung),
  ];
  return gruppen.filter((g) => g.laedt || g.treffer.length > 0);
}
