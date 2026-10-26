export const COUNTRIES = [
  ['Albania', 'AL'],
  ['Austria', 'AT'],
  ['Belgium', 'BE'],
  ['Bosnia and Herzegovina', 'BA', 'Bosnia and Herz.'],
  ['Bulgaria', 'BG'],
  ['Croatia', 'HR'],
  ['Cyprus', 'CY'],
  ['Czech Republic', 'CZ', 'Czechia'],
  ['Denmark', 'DK'],
  ['Estonia', 'EE'],
  ['Finland', 'FI'],
  ['France', 'FR'],
  ['Germany', 'DE'],
  ['Greece', 'GR'],
  ['Hungary', 'HU'],
  ['Iceland', 'IS'],
  ['Ireland', 'IE'],
  ['Italy', 'IT'],
  ['Kosovo', 'XK'],
  ['Latvia', 'LV'],
  ['Lithuania', 'LT'],
  ['Luxembourg', 'LU'],
  ['Malta', 'MT'],
  ['Moldova', 'MD'],
  ['Montenegro', 'ME'],
  ['Netherlands', 'NL'],
  ['North Macedonia', 'MK', 'Macedonia'],
  ['Norway', 'NO'],
  ['Poland', 'PL'],
  ['Portugal', 'PT'],
  ['Romania', 'RO'],
  ['Serbia', 'RS'],
  ['Slovakia', 'SK'],
  ['Slovenia', 'SI'],
  ['Spain', 'ES'],
  ['Sweden', 'SE'],
  ['Switzerland', 'CH'],
  ['Türkiye', 'TR', 'Turkey'],
  ['Ukraine', 'UA'],
  ['United Kingdom', 'GB']
].map(([name, code, mapName]) => ({ name, code, mapName: mapName || name }));

export const AMBASSADORS = [
  {
    country: 'Italy',
    name: 'Federico Fassio',
    role: 'Co-Founder | YET · 16',
    bio: 'CubeSat PM at Space Eagle. At 16, his team won the ESA EO Makerspace Hackathon at ESA-ESRIN with on-orbit AI that tracks Arctic ice in hours instead of days.'
  },
  {
    country: 'Moldova',
    name: 'Alexandrina Luca',
    role: 'CMO & Startup Founder · 15',
    bio: '15-year-old startup founder and CMO. Content creator who leads marketing and sales, bringing Moldova’s young builders into the community.'
  },
  {
    country: 'France',
    name: 'Léopold Faure',
    role: 'Startups, Growth & VC · 15',
    bio: 'All-in on startups, growth and VC. Spending a month in San Francisco this summer to learn the ecosystem from the inside and share it with other young founders.'
  },
  {
    country: 'Greece',
    name: 'Nikolaos Korakianitis',
    role: 'Founder | KAR AI · 17',
    bio: 'Building KAR AI, an AI automotive research platform for car matching, comparisons, safety insights and cost of ownership. Freelance writer at GOCAR.gr and ENGin volunteer.'
  }
];

export const AMBASSADOR_COUNTRIES = AMBASSADORS.map(a => a.country);

export const ambassadorOf = country => AMBASSADORS.find(a => a.country === country)?.name;

export const flag = code =>
  code === 'XK' ? '🇽🇰' : String.fromCodePoint(...[...code].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));

export const ambassadorBatches = (count = 3, from = new Date(), offset = 1) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const start = Math.floor(from.getMonth() / 3) + offset;
  return Array.from({ length: count }, (_, i) => {
    const q = start + i;
    const year = from.getFullYear() + Math.floor(q / 4);
    const m = (q % 4) * 3;
    return `${months[m]}–${months[m + 2]} ${year}`;
  });
};

export const currentBatch = () => ambassadorBatches(1, new Date(), 0)[0];
