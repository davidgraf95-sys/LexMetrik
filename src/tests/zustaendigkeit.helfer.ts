import type { ZustaendigkeitInput } from '../lib/zustaendigkeit';

export const geld = (patch: Partial<ZustaendigkeitInput> = {}): ZustaendigkeitInput => ({
  streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 5_000, ...patch,
});
