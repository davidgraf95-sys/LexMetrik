import { berechneGewaehrleistung } from '../src/lib/gewaehrleistung';
const r = berechneGewaehrleistung({ vertragstyp:'grundstueckkauf', vertragsdatum:'2026-03-01', objekt:'unbeweglich', uebergabe:'2026-03-01', eigentumserwerb:'2026-03-01', mangelTyp:'offen', kanton:'ZH', stichtag:'2027-01-01' } as any);
console.log('Grundstück NEU rüge:', r.ruege.art, r.ruege.endeISO, '| verj', r.verjaehrung.jahre, r.verjaehrung.endeISO);
const r2 = berechneGewaehrleistung({ vertragstyp:'grundstueckkauf', vertragsdatum:'2025-03-01', objekt:'unbeweglich', uebergabe:'2025-03-01', eigentumserwerb:'2025-03-01', mangelTyp:'offen', kanton:'ZH', stichtag:'2027-01-01' } as any);
console.log('Grundstück ALT rüge:', r2.ruege.art, '| verj', r2.verjaehrung.jahre, r2.verjaehrung.endeISO);
const r3 = berechneGewaehrleistung({ vertragstyp:'fahrniskauf', vertragsdatum:'2026-03-01', objekt:'beweglich', uebergabe:'2026-03-01', mangelTyp:'offen', kanton:'ZH', stichtag:'2027-01-01', konsumentenkauf:true, gebraucht:true, vereinbarteVerjaehrungJahre:0.5 } as any);
console.log('Konsument gebraucht 0.5y:', r3.verjaehrung.jahre, 'unwirksam', r3.verjaehrung.vereinbartUnwirksam);
const r4 = berechneGewaehrleistung({ vertragstyp:'fahrniskauf', vertragsdatum:'2026-01-01', objekt:'integriert', uebergabe:'2026-01-02', mangelTyp:'offen', kanton:'ZH', stichtag:'2026-06-01' } as any);
console.log('integriert fahrnis NEU 60d from 02.01.2026:', r4.ruege.art, r4.ruege.endeISO);
// konsument NEU but vereinbart 1.5y (>=mindest 2? gebraucht=false so mindest 2) -> unwirksam
const r5 = berechneGewaehrleistung({ vertragstyp:'fahrniskauf', vertragsdatum:'2026-03-01', objekt:'beweglich', uebergabe:'2026-03-01', mangelTyp:'offen', kanton:'ZH', stichtag:'2027-01-01', konsumentenkauf:true, gebraucht:false, vereinbarteVerjaehrungJahre:1.5 } as any);
console.log('Konsument neu 1.5y (mindest 2):', r5.verjaehrung.jahre, 'unwirksam', r5.verjaehrung.vereinbartUnwirksam);
