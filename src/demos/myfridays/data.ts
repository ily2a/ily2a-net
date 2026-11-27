import type { CauseIconName, CharityLogoName, CharityLogoSrc, SplitCause } from './assets'

// Copy as it is in the Figma frames (landing, Causes and Charities tabs).

export interface Cause { id: CauseIconName; name: string; description: string }

export const CAUSES: Cause[] = [
  { id: 'community', name: 'Community', description: 'A mosque is a community’s heart. Join us in preserving and enhancing our spiritual haven.' },
  { id: 'disaster', name: 'Disaster relief', description: 'Providing quick and practical help to people affected by disasters and emergencies.' },
  { id: 'education', name: 'Education', description: 'Supporting access to education so that everyone has the chance to learn and grow.' },
  { id: 'elderly', name: 'Elderly care', description: 'Help us ensure our elderly receive the care and support they deserve.' },
  { id: 'food', name: 'Food', description: 'Helping to feed families and individuals who are struggling with hunger.' },
  { id: 'healthcare', name: 'Healthcare aid', description: 'Helping provide essential healthcare and treatment to those who need it most.' },
  { id: 'local', name: 'Local Development', description: 'Support local projects that benefit the communities, such as youth centers, and housing.' },
  { id: 'medical', name: 'Medical Emergency', description: 'Provide immediate care to save lives, prioritize well-being, and ensure optimal outcomes.' },
  { id: 'orphans', name: 'Orphans', description: 'Offering care and support to orphaned children, ensuring they are not alone.' },
  { id: 'refugee', name: 'Refugee assistance', description: 'Providing aid and support to refugees in need of safety and security.' },
  { id: 'sadaqah', name: 'Sadaqah', description: 'Help the most vulnerable around the World to live a more dignified life.' },
  { id: 'zakat', name: 'Zakat', description: 'Zakat is a way to create social change. Help Muslims out of poverty.' },
]

// The mobile frame lists the causes in its own order, Zakat first.
export const MOBILE_CAUSE_ORDER: CauseIconName[] = [
  'zakat', 'food', 'education', 'sadaqah', 'orphans', 'healthcare',
  'medical', 'disaster', 'local', 'refugee', 'elderly', 'community',
]

export interface Charity { id: string; name: string; description: string; logo: CharityLogoSrc }

const file = (name: CharityLogoName): CharityLogoSrc => ({ kind: 'file', name })
const web = (src: string): CharityLogoSrc => ({ kind: 'web', src })

// Each country lists charities registered there, so "All Donations are
// tax-deductible" holds. Titles use a charity's own short name where the
// full one won't fit on the card; the description spells it out.

// UK: the 12 logos from the file (its cards all read "islamic relief UK"
// as a placeholder; these are the real charities behind each logo).
const UK: Charity[] = [
  { id: 'ehsaas', name: 'Ehsaas Trust', description: 'Food, water and shelter for low-income families in need.', logo: file('ehsaas') },
  { id: 'nzf', name: 'NZF', description: 'National Zakat Foundation: UK zakat for local Muslims in need.', logo: file('nzf') },
  { id: 'penny', name: 'Penny Appeal', description: 'Small change, big difference: aid in 30 crisis-hit countries.', logo: file('penny') },
  { id: 'map', name: 'MAP', description: 'Medical Aid for Palestinians: health care for Palestinians.', logo: file('map') },
  { id: 'water', name: 'charity: water', description: 'Clean, safe drinking water for people in developing countries.', logo: file('water') },
  { id: 'baznas', name: 'BAZNAS', description: 'Indonesia’s national agency for collecting and giving zakat.', logo: file('baznas') },
  { id: 'hidaya', name: 'Hidaya Foundation', description: 'Education, health care and clean water in Asia and Africa.', logo: file('hidaya') },
  { id: 'hrf', name: 'HRF', description: 'Human Relief Foundation: emergency and long-term aid.', logo: file('hrf') },
  { id: 'muslimaid', name: 'Muslim Aid', description: 'Relief and development for the world’s poorest communities.', logo: file('muslimaid') },
  { id: 'nisa', name: 'NISA Foundation', description: 'Safe homes and a helpline for Muslim women and children.', logo: file('nisa') },
  { id: 'oin', name: 'Orphans in Need', description: 'Sponsorship, food and health care for orphans and widows.', logo: file('oin') },
  { id: 'gosh', name: 'GOSH Charity', description: 'Great Ormond Street Hospital Charity: care for sick children.', logo: file('gosh') },
]

// US (12): Penny Appeal USA, Hidaya and charity: water share the file's logos.
const US: Charity[] = [
  { id: 'icna', name: 'ICNA Relief', description: 'Food pantries, shelters and disaster relief across the US.', logo: web('icna.png') },
  { id: 'zakatfoundation', name: 'Zakat Foundation', description: 'Zakat Foundation of America: relief and development.', logo: web('zakatfoundation.png') },
  { id: 'umr', name: 'UMR', description: 'United Mission for Relief & Development: emergency aid.', logo: web('umr.png') },
  { id: 'mercyusa', name: 'Mercy-USA', description: 'Health, nutrition and safe water for communities abroad.', logo: web('mercyusa.png') },
  { id: 'penny-us', name: 'Penny Appeal USA', description: 'Small change, big difference: Penny Appeal in the US.', logo: file('penny') },
  { id: 'hidaya-us', name: 'Hidaya Foundation', description: 'Education, health care and clean water in Asia and Africa.', logo: file('hidaya') },
  { id: 'water-us', name: 'charity: water', description: 'Clean, safe drinking water for people in developing countries.', logo: file('water') },
  { id: 'stjude', name: 'St. Jude', description: 'St. Jude Children’s Research Hospital: free care for kids.', logo: web('stjude.png') },
  { id: 'life', name: 'LIFE', description: 'Food, water, health care and emergency aid in 55 countries.', logo: web('life.png') },
  { id: 'feedingamerica', name: 'Feeding America', description: 'A nationwide network of food banks fighting hunger.', logo: web('feedingamerica.png') },
  { id: 'msfusa', name: 'MSF USA', description: 'Doctors Without Borders: emergency medical aid.', logo: web('msfusa.png') },
  { id: 'savethechildren', name: 'Save the Children', description: 'Health, education and safety for children in need.', logo: web('savethechildren.png') },
]

// Australia (12): Penny Appeal Australia shares the file's Penny Appeal logo.
const AU: Charity[] = [
  { id: 'irau', name: 'Islamic Relief', description: 'Emergency relief overseas and community programs at home.', logo: web('irau.png') },
  { id: 'penny-au', name: 'Penny Appeal', description: 'Small change, big difference: Penny Appeal in Australia.', logo: file('penny') },
  { id: 'nzfau', name: 'NZF Australia', description: 'National Zakat Foundation: Australian zakat for local need.', logo: web('nzfau.png') },
  { id: 'mwa', name: 'MWA', description: 'Muslim Women Australia: family violence and housing support.', logo: web('mwa.png') },
  { id: 'uma', name: 'UMA', description: 'United Muslims of Australia: youth and community services.', logo: web('uma.png') },
  { id: 'fredhollows', name: 'Fred Hollows', description: 'The Fred Hollows Foundation: restoring sight worldwide.', logo: web('fredhollows.png') },
  { id: 'ozharvest', name: 'OzHarvest', description: 'Rescues surplus food and delivers it to people in need.', logo: web('ozharvest.png') },
  { id: 'orangesky', name: 'Orange Sky', description: 'Free laundry and showers for people without a home.', logo: web('orangesky.png') },
  { id: 'rfds', name: 'Flying Doctor', description: 'Royal Flying Doctor Service: care for remote Australia.', logo: web('rfds.png') },
  { id: 'smithfamily', name: 'The Smith Family', description: 'Helps children in need stay in school and keep learning.', logo: web('smithfamily.png') },
  { id: 'msfau', name: 'MSF Australia', description: 'Doctors Without Borders: emergency medical aid.', logo: web('msfau.png') },
  { id: 'starlight', name: 'Starlight', description: 'Brings joy to seriously ill children and their families.', logo: web('starlight.png') },
]

export const CHARITIES: Record<'gb' | 'us' | 'au', Charity[]> = { gb: UK, us: US, au: AU }

// ── Payment ──────────────────────────────────────────────────────────

/** A charity donation splits across these causes, as in the file's frame. */
export const SPLIT_CAUSES: SplitCause[] = ['food', 'education', 'sadaqah']

/** "Where do you live ?" suggests cities in the country picked on the landing. */
export const CITIES: Record<'gb' | 'us' | 'au', string[]> = {
  gb: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Bradford', 'Leicester', 'Glasgow', 'Liverpool', 'Sheffield', 'Bristol', 'Edinburgh', 'Cardiff'],
  us: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Dearborn', 'Philadelphia', 'Washington', 'Dallas', 'Detroit', 'San Francisco', 'Atlanta', 'Minneapolis'],
  au: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Gold Coast', 'Hobart', 'Darwin', 'Newcastle', 'Wollongong', 'Geelong'],
}
