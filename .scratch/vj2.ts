import { berechneVerjaehrung } from '../src/lib/verjaehrung';
// stillstand partially before start: start 2015-06-01, stillstand 2015-05-01..2015-06-15 -> only 02.06..15.06 = 14 days count
const r = berechneVerjaehrung({ regime:'ordentlich', beginnRelativ:'2015-06-01', stichtag:'2030-01-01', kanton:'ZH', stillstaende:[{von:'2015-05-01', bis:'2015-06-15'}] } as any);
console.log('stillstand overlapping start:', r.verjaehrungISO, 'gehemmt', r.gehemmtTage, '(expect 14 days, end ~2025-06-16+wd)');
// overlapping stillstand inputs should merge (not double count)
const r2 = berechneVerjaehrung({ regime:'ordentlich', beginnRelativ:'2015-01-01', stichtag:'2030-01-01', kanton:'ZH', stillstaende:[{von:'2018-01-01', bis:'2018-01-31'},{von:'2018-01-15', bis:'2018-02-15'}] } as any);
console.log('overlapping merge gehemmt:', r2.gehemmtTage, '(expect 46 = 01.01-15.02)');
// klage_schlichtung open process -> only absolute frist
const r3 = berechneVerjaehrung({ regime:'delikt', beginnRelativ:'2024-01-01', beginnAbsolut:'2020-01-01', stichtag:'2025-06-01', kanton:'ZH', unterbrechungen:[{typ:'klage_schlichtung', datum:'2025-01-01'}] } as any);
console.log('open process massgeblich:', r3.massgeblicheFrist, r3.verjaehrungISO);
