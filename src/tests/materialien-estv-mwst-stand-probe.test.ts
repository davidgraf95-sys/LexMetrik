import { describe, it, expect } from 'vitest';
import {
  planeStandProben, pruefeStandProbe, publiziertAm, type MwstShard,
} from '../../scripts/materialien/estv-mwst-stand-probe';

// §17-Wurzel-Fix 1.9.2026 (QS-MONITOR-ROT): Stand-Probe JE ESTV-MWST-Dokument statt einer
// Stichprobe von drei. Mutationsprobe = eine In-place-Änderung (Publiziert-am gehoben, ToC
// unverändert) an einem Dokument JENSEITS der ersten drei — der alte Detektor (Token +
// zifferStichprobe(3)) liess sie durch, der neue fängt sie.

const ist = (id: string) => id.startsWith('ESTV-MWST-');
const B = 'https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=';

const SHARDS: MwstShard[] = [{
  erlass: 'MWSTG',
  dokumente: {
    'ESTV-MWST-INFO-01': { urlBasis: `${B}11`, stand: '2026-02-01' },
    'ESTV-MWST-INFO-02': { urlBasis: `${B}12`, stand: '2026-03-01' },
    'ESTV-MWST-INFO-03': { urlBasis: `${B}13`, stand: '2026-04-01' },
    'ESTV-MWST-INFO-04': { urlBasis: `${B}14`, stand: '2026-05-01' },
    'ESTV-MWST-INFO-05': { urlBasis: `${B}15`, stand: '2026-06-01' }, // ohne Kante → keine Probe
    'SECO-X': { urlBasis: 'https://x/', stand: '2026-01-01' },
  },
  kanten: [
    { dok: 'ESTV-MWST-INFO-01', stand: '2025-01-01', fundstellen: [{ z: '1', url: '&componentId=101' }] },
    { dok: 'ESTV-MWST-INFO-01', stand: '2026-02-01', fundstellen: [{ z: '2', url: '&componentId=102' }] },
    { dok: 'ESTV-MWST-INFO-02', stand: '2026-03-01', fundstellen: [{ z: '1' }, { z: '2', url: '&componentId=201' }] },
    { dok: 'ESTV-MWST-INFO-03', stand: '2026-04-01', fundstellen: [{ z: '1', url: '&componentId=301' }] },
    // Dokument-Stand 2026-05-01 stammt von einer Ziffer OHNE Anker → jüngste belegte Kante gewinnt
    { dok: 'ESTV-MWST-INFO-04', stand: '2025-11-01', fundstellen: [{ z: '1', url: '&componentId=401' }] },
    { dok: 'ESTV-MWST-INFO-04', stand: '2026-01-15', fundstellen: [{ z: '3', url: '&componentId=403' }] },
    { dok: 'SECO-X', stand: '2026-01-01', fundstellen: [{ z: '1', url: '&x' }] },
  ],
}];

const ziffer = (datum: string) => `<div><label>Publiziert am:</label> <div class="divider"></div>${datum} </div><p>…</p>`;

describe('planeStandProben', () => {
  const proben = planeStandProben(SHARDS, ist);
  it('genau eine Probe je belegtem ESTV-MWST-Dokument, sortiert, fremde Quellen ignoriert', () => {
    expect(proben.map((p) => p.dok)).toEqual([
      'ESTV-MWST-INFO-01', 'ESTV-MWST-INFO-02', 'ESTV-MWST-INFO-03', 'ESTV-MWST-INFO-04',
    ]);
  });
  it('wählt die Ziffer, die den Dokument-Stand trägt (nicht die erste Kante)', () => {
    expect(proben[0]).toEqual({ dok: 'ESTV-MWST-INFO-01', url: `${B}11&componentId=102`, stand: '2026-02-01', traegtDokStand: true });
  });
  it('Fundstelle ohne url übersprungen, erste MIT url genommen', () => {
    expect(proben[1].url).toBe(`${B}12&componentId=201`);
  });
  it('ohne Kante auf Dokument-Stand: jüngste belegte Kante, markiert als nicht-Dokument-Stand', () => {
    expect(proben[3]).toEqual({ dok: 'ESTV-MWST-INFO-04', url: `${B}14&componentId=403`, stand: '2026-01-15', traegtDokStand: false });
  });
  it('deckt Dokumente jenseits der alten Dreier-Stichprobe (Mutationsprobe: INFO-04)', () => {
    // Alter Detektor: zifferStichprobe(3) = INFO-01..03; INFO-04 wurde nie gegen die Quelle gehalten.
    expect(proben.slice(3).map((p) => p.dok)).toContain('ESTV-MWST-INFO-04');
  });
});

describe('pruefeStandProbe (In-place-Änderung ohne ToC-Wechsel)', () => {
  const p4 = planeStandProben(SHARDS, ist)[3];
  it('gleicher Stand ⇒ kein Befund', () => {
    expect(pruefeStandProbe(p4, ziffer('15.01.2026'))).toBeNull();
  });
  it('gehobenes «Publiziert am» ⇒ Befund mit beiden Daten', () => {
    const f = pruefeStandProbe(p4, ziffer('28.08.2026'));
    expect(f).toMatch(/ESTV-MWST-INFO-04/);
    expect(f).toMatch(/2026-08-28 ≠ committeter Stand 2026-01-15/);
  });
  it('Dokument-Stand-Probe wird als solche benannt', () => {
    const p1 = planeStandProben(SHARDS, ist)[0];
    expect(pruefeStandProbe(p1, ziffer('01.03.2026'))).toMatch(/\(Dokument-Stand\)/);
  });
  it('Seite ohne «Publiziert am» ⇒ Struktur-Drift', () => {
    expect(pruefeStandProbe(p4, '<html>Casemates</html>')).toMatch(/Struktur-Drift/);
  });
  it('publiziertAm: DD.MM.YYYY → ISO, sonst null', () => {
    expect(publiziertAm(ziffer('05.07.2024'))).toBe('2024-07-05');
    expect(publiziertAm('nix')).toBeNull();
  });
});
