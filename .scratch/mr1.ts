import { berechneMietkuendigung } from '../src/lib/mietrecht';
// Wohnung, ortsüblich ZH, zugang 15.03.2025. 3 months. spätester für 30.06 = 31.03. zugang 15.03 <= 31.03 -> endtermin 30.06.2025
const r = berechneMietkuendigung({ objekt:'wohnung', kuendigungsart:'ordentlich', partei:'mieter', kanton:'ZH', zugang:'2025-03-15', terminQuelle:'ortsueblich' } as any);
console.log('Wohnung ZH 15.03:', r.endterminISO, 'spätZugang', r.spaetesterZugang);
// zugang 01.04 -> spätester für 30.06 = 31.03 missed -> next term
const r2 = berechneMietkuendigung({ objekt:'wohnung', kuendigungsart:'ordentlich', partei:'mieter', kanton:'ZH', zugang:'2025-04-01', terminQuelle:'ortsueblich' } as any);
console.log('Wohnung ZH 01.04 (missed 30.06):', r2.endterminISO, 'verfehlt', r2.verfehlterTermin);
// Zahlungsverzug: zugang 15.01.2025 +30 = 14.02 -> month end 28.02
const r3 = berechneMietkuendigung({ objekt:'wohnung', kuendigungsart:'zahlungsverzug', partei:'vermieter', kanton:'ZH', zugang:'2025-01-15', amtlichesFormular:true } as any);
console.log('Zahlungsverzug 15.01:', r3.endterminISO, '(expect 28.02.2025)');
// gesetzliche Auffangregel: mietbeginn 31.01.2024, wohnung period 3 mo. periodenEnde month-end
const r4 = berechneMietkuendigung({ objekt:'wohnung', kuendigungsart:'ordentlich', partei:'mieter', kanton:'ZH', zugang:'2025-02-01', terminQuelle:'gesetzlich', mietbeginn:'2024-01-31' } as any);
console.log('Auffang mietbeginn 31.01.2024:', r4.endterminISO);
// moebliertes zimmer: 14 days notice on end of 1-month period
const r5 = berechneMietkuendigung({ objekt:'moebliertes_zimmer', kuendigungsart:'ordentlich', partei:'mieter', kanton:'ZH', zugang:'2025-03-10', mietbeginn:'2025-01-15' } as any);
console.log('moebl. Zimmer mietbeginn 15.01, zugang 10.03:', r5.endterminISO);
