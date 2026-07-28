/* CARDEX — static reference data
   Types, rarity tiers, colours, and a make/model catalogue used purely for
   fast autocomplete. The dex itself grows organically from what you spot. */

export const TYPES = [
  { id: 'hatch',    label: 'Hatchback',    colour: '#5bbd63' },
  { id: 'saloon',   label: 'Saloon',       colour: '#4a90d9' },
  { id: 'estate',   label: 'Estate',       colour: '#2fa8a0' },
  { id: 'suv',      label: 'SUV',          colour: '#a1743b' },
  { id: 'crossover',label: 'Crossover',    colour: '#c08a4a' },
  { id: 'coupe',    label: 'Coupé',        colour: '#8b5cf6' },
  { id: 'convert',  label: 'Convertible',  colour: '#38bdf8' },
  { id: 'sports',   label: 'Sports',       colour: '#ef4444' },
  { id: 'super',    label: 'Supercar',     colour: '#d10f4a' },
  { id: 'hyper',    label: 'Hypercar',     colour: '#7f1d3f' },
  { id: 'hothatch', label: 'Hot Hatch',    colour: '#f97316' },
  { id: 'luxury',   label: 'Luxury',       colour: '#caa24a' },
  { id: 'classic',  label: 'Classic',      colour: '#b98c5a' },
  { id: 'jdm',      label: 'JDM',          colour: '#ec4899' },
  { id: 'usdm',     label: 'American',     colour: '#3b6fd4' },
  { id: 'ev',       label: 'Electric',     colour: '#eab308' },
  { id: 'hybrid',   label: 'Hybrid',       colour: '#84cc16' },
  { id: 'diesel',   label: 'Diesel',       colour: '#64748b' },
  { id: 'offroad',  label: 'Off-road',     colour: '#6b7f3a' },
  { id: 'van',      label: 'Van',          colour: '#78716c' },
  { id: 'pickup',   label: 'Pickup',       colour: '#8a5a2b' },
  { id: 'mpv',      label: 'MPV',          colour: '#6366f1' },
  { id: 'city',     label: 'City Car',     colour: '#22c55e' },
  { id: 'modified', label: 'Modified',     colour: '#d946ef' },
  { id: 'track',    label: 'Track',        colour: '#94a3b8' },
  { id: 'rally',    label: 'Rally',        colour: '#0ea5e9' },
  { id: 'emergency',label: 'Emergency',    colour: '#1d6fe0' },
  { id: 'commercial',label:'Commercial',   colour: '#57534e' },
  { id: 'barnfind', label: 'Barn Find',    colour: '#a16207' },
  { id: 'concept',  label: 'Concept',      colour: '#14b8a6' }
];

export const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.id, t]));

/* Spot XP. Kept on a gentle curve — a Legendary is worth ~12 commons, not 40,
   so a big day of ordinary spotting still competes with one lucky find.
   Mythic sits above Legendary: one-offs, works race cars, museum pieces. */
export const RARITIES = [
  { id: 'common',    label: 'Common',    colour: '#8a93a3', xp: 10,  blurb: 'Every street, every day.' },
  { id: 'uncommon',  label: 'Uncommon',  colour: '#4ade80', xp: 20,  blurb: 'You notice when one goes past.' },
  { id: 'rare',      label: 'Rare',      colour: '#38bdf8', xp: 40,  blurb: 'A proper find.' },
  { id: 'epic',      label: 'Epic',      colour: '#a855f7', xp: 75,  blurb: 'Stop and stare material.' },
  { id: 'legendary', label: 'Legendary', colour: '#f5c542', xp: 120, blurb: 'Once-in-a-year sighting.' },
  { id: 'mythic',    label: 'Mythic',    colour: '#ff5ecd', xp: 200, blurb: 'One-offs and works race cars. Pinch yourself.' }
];

export const RARITY_MAP = Object.fromEntries(RARITIES.map(r => [r.id, r]));

export const COLOURS = [
  { id: 'black',  label: 'Black',      hex: '#15181d' },
  { id: 'white',  label: 'White',      hex: '#f2f4f7' },
  { id: 'silver', label: 'Silver',     hex: '#c3c8d0' },
  { id: 'grey',   label: 'Grey',       hex: '#7b828d' },
  { id: 'blue',   label: 'Blue',       hex: '#2f6fd0' },
  { id: 'red',    label: 'Red',        hex: '#d32f34' },
  { id: 'green',  label: 'Green',      hex: '#2f8f52' },
  { id: 'yellow', label: 'Yellow',     hex: '#e8c33a' },
  { id: 'orange', label: 'Orange',     hex: '#e8802f' },
  { id: 'brown',  label: 'Brown',      hex: '#7a5230' },
  { id: 'beige',  label: 'Beige',      hex: '#cbbfa4' },
  { id: 'purple', label: 'Purple',     hex: '#7a45c2' },
  { id: 'pink',   label: 'Pink',       hex: '#e06a9e' },
  { id: 'gold',   label: 'Gold',       hex: '#c9a227' },
  { id: 'bronze', label: 'Bronze',     hex: '#a8722c' },
  { id: 'multi',  label: 'Multi / Wrap', hex: 'linear-gradient(135deg,#e11d33,#f5c542,#4ade80,#38bdf8,#a855f7)' }
];

export const COLOUR_MAP = Object.fromEntries(COLOURS.map(c => [c.id, c]));

/* Stat sliders — the "vibe check" for each entry. */
export const STATS = [
  { id: 'presence',  label: 'Presence',  hint: 'Road presence / menace' },
  { id: 'style',     label: 'Style',     hint: 'How good does it look' },
  { id: 'sound',     label: 'Sound',     hint: 'Exhaust note / silence' },
  { id: 'condition', label: 'Condition', hint: 'Showroom vs shed' }
];

/* Makes — global list, UK-weighted. */
export const MAKES = [
  'Abarth','AC','Alfa Romeo','Alpina','Alpine','Aston Martin','Audi','Austin','Bentley','BMW',
  'Bugatti','Buick','BYD','Cadillac','Caterham','Chevrolet','Chrysler','Citroën','Cupra','Dacia',
  'Daewoo','Daihatsu','Datsun','DeLorean','Dodge','DS','Ferrari','Fiat','Fisker','Ford',
  'Genesis','GMC','Great Wall','Honda','Hummer','Hyundai','Infiniti','Isuzu','Iveco','JAC',
  'Jaguar','Jeep','Kia','Koenigsegg','KTM','Lada','Lamborghini','Lancia','Land Rover','Lexus',
  'Ligier','Lincoln','Lotus','LEVC','Mahindra','MAN','Maserati','Maxus','Maybach','Mazda',
  'McLaren','Mercedes-Benz','MG','Mini','Mitsubishi','Morgan','Morris','Nissan','Noble','Omoda',
  'Opel','Pagani','Perodua','Peugeot','Pininfarina','Polestar','Pontiac','Porsche','Proton','Radical',
  'RAM','Reliant','Renault','Rimac','Rolls-Royce','Rover','Saab','Scania','SEAT','Škoda',
  'Smart','SsangYong','Subaru','Suzuki','Talbot','Tesla','Toyota','Triumph','TVR','Vauxhall',
  'Volkswagen','Volvo','Westfield','Wiesmann','Xpeng','Zenos','Other'
];

/* Models for the makes you are most likely to meet in the UK.
   Not exhaustive — you can always type anything you like. */
export const MODELS = {
  'Abarth': ['595','595 Competizione','695','124 Spider','500e','Punto Evo'],
  'Alfa Romeo': ['145','147','156','159','166','4C','8C Competizione','Brera','Giulia','Giulia Quadrifoglio','Giulietta','GT','GTV','Junior','MiTo','Spider','Stelvio','Tonale'],
  'Alpine': ['A110','A110 S','A290'],
  'Aston Martin': ['DB7','DB9','DB11','DB12','DBS','DBX','Rapide','V8 Vantage','Vanquish','Vantage','Virage','Valkyrie','Valour','Cygnet'],
  'Audi': ['A1','A2','A3','A4','A4 Allroad','A5','A6','A7','A8','Q2','Q3','Q4 e-tron','Q5','Q7','Q8','e-tron GT','R8','RS3','RS4','RS5','RS6','RS7','RSQ3','RSQ8','S1','S3','S4','S5','S6','S8','TT','TT RS','TTS'],
  'Bentley': ['Arnage','Azure','Bentayga','Brooklands','Continental GT','Continental GTC','Flying Spur','Mulsanne','Turbo R'],
  'BMW': ['1 Series','2 Series','2 Series Active Tourer','3 Series','3 Series Touring','4 Series','5 Series','6 Series','7 Series','8 Series','i3','i4','i5','i7','i8','iX','iX1','iX3','M2','M3','M4','M5','M8','X1','X2','X3','X3 M','X4','X5','X5 M','X6','X7','XM','Z3','Z4','1M','E30','E36','E46','E60','E92'],
  'Bugatti': ['Veyron','Chiron','Divo','Tourbillon','EB110'],
  'BYD': ['Atto 3','Dolphin','Seal','Seal U','Sealion 7'],
  'Caterham': ['Seven 170','Seven 270','Seven 360','Seven 420','Seven 620','Project V'],
  'Chevrolet': ['Aveo','Camaro','Captiva','Corvette','Cruze','Matiz','Spark','Silverado','Tahoe','Suburban'],
  'Chrysler': ['300C','Grand Voyager','PT Cruiser','Ypsilon'],
  'Citroën': ['2CV','AX','Ami','BX','Berlingo','C1','C2','C3','C3 Aircross','C4','C4 Cactus','C4 Picasso','C5','C5 Aircross','C5 X','C6','C8','DS3','DS4','Dispatch','Nemo','Relay','Saxo','Xantia','XM','Xsara','ZX','e-C4'],
  'Cupra': ['Ateca','Born','Formentor','Leon','Tavascan','Terramar'],
  'Dacia': ['Bigster','Duster','Jogger','Logan','Sandero','Sandero Stepway','Spring'],
  'Dodge': ['Challenger','Charger','Durango','Journey','RAM 1500','Viper'],
  'DS': ['DS 3','DS 3 Crossback','DS 4','DS 5','DS 7','DS 9'],
  'Ferrari': ['296 GTB','360 Modena','430 Scuderia','458 Italia','488 GTB','512 TR','550 Maranello','575M','599 GTB','612 Scaglietti','812 Superfast','California','Daytona SP3','Dino','Enzo','F8 Tributo','F12','F40','F50','F355','FF','GTC4Lusso','LaFerrari','Portofino','Purosangue','Roma','SF90','Testarossa','Mondial'],
  'Fiat': ['124 Spider','500','500e','500L','500X','600e','Barchetta','Bravo','Coupé','Doblò','Ducato','Panda','Punto','Qubo','Seicento','Tipo','Uno'],
  'Ford': ['B-Max','C-Max','Capri','Consul','Cortina','Cougar','Escort','Escort RS Cosworth','Explorer','F-150','Fiesta','Fiesta ST','Focus','Focus RS','Focus ST','Fusion','Galaxy','GT','GT40','Grand C-Max','Ka','Kuga','Maverick','Mondeo','Mustang','Mustang Mach-E','Puma','Ranger','Ranger Raptor','S-Max','Sierra','Sierra RS Cosworth','Tourneo','Transit','Transit Connect','Transit Custom'],
  'Genesis': ['G70','G80','GV60','GV70','GV80'],
  'Honda': ['Accord','Accord Type R','Beat','Civic','Civic Type R','CR-V','CR-Z','e','e:Ny1','FR-V','HR-V','Insight','Integra','Integra Type R','Jazz','Legend','NSX','Prelude','S2000','S660','Stream','ZR-V'],
  'Hyundai': ['Bayon','i10','i20','i20 N','i30','i30 N','i40','i800','Inster','Ioniq','Ioniq 5','Ioniq 5 N','Ioniq 6','ix20','ix35','Kona','Kona Electric','Santa Fe','Tucson','Veloster'],
  'Infiniti': ['Q30','Q50','Q60','QX70'],
  'Jaguar': ['E-Pace','E-Type','F-Pace','F-Type','I-Pace','Mark 2','S-Type','X-Type','XE','XF','XJ','XJ220','XJS','XK','XK8','XKR','XJ6'],
  'Jeep': ['Avenger','Cherokee','Compass','Gladiator','Grand Cherokee','Renegade','Wrangler'],
  'Kia': ['Ceed','EV3','EV6','EV9','Niro','Optima','Picanto','ProCeed','Rio','Sorento','Soul','Sportage','Stinger','Stonic','Venga','XCeed'],
  'Koenigsegg': ['Agera','CC8S','Gemera','Jesko','Regera'],
  'Lamborghini': ['Aventador','Countach','Diablo','Espada','Gallardo','Huracán','Jalpa','Miura','Murciélago','Revuelto','Temerario','Urus','Urraco'],
  'Lancia': ['Delta','Delta Integrale','Fulvia','Stratos','Thema','Ypsilon'],
  'Land Rover': ['Defender','Defender 90','Defender 110','Discovery','Discovery Sport','Freelander','Range Rover','Range Rover Evoque','Range Rover Sport','Range Rover Velar','Series I','Series II','Series III'],
  'Lexus': ['CT','ES','GS','IS','IS-F','LBX','LC','LFA','LS','NX','RC','RC F','RX','RZ','SC','UX'],
  'Lotus': ['Eletre','Elise','Elan','Emeya','Emira','Esprit','Europa','Evija','Evora','Exige','Seven'],
  'Maserati': ['3200 GT','Ghibli','GranCabrio','GranTurismo','Grecale','Levante','MC20','Quattroporte'],
  'Mazda': ['2','3','5','6','323','626','BT-50','CX-3','CX-30','CX-5','CX-60','CX-80','MX-3','MX-5','MX-30','RX-7','RX-8','Xedos'],
  'McLaren': ['540C','570S','600LT','650S','675LT','720S','750S','765LT','Artura','Elva','F1','GT','MP4-12C','P1','Senna','Speedtail','W1'],
  'Mercedes-Benz': ['190E','A-Class','A45 AMG','AMG GT','AMG ONE','B-Class','C-Class','C63 AMG','CL','CLA','CLK','CLS','E-Class','E63 AMG','EQA','EQB','EQC','EQE','EQS','G-Class','G63 AMG','GLA','GLB','GLC','GLE','GLS','ML','R-Class','S-Class','SL','SLK','SLR McLaren','SLS AMG','Sprinter','V-Class','Vito','W123','W124'],
  'MG': ['3','4','5','HS','MGB','MGF','Midget','MG3 Hybrid+','Cyberster','ZR','ZS','ZS EV','ZT'],
  'Mini': ['Clubman','Convertible','Cooper','Cooper S','Countryman','Electric','GP','John Cooper Works','Classic Mini','Paceman','Roadster'],
  'Mitsubishi': ['3000GT','ASX','Colt','Eclipse','Evo VI','Evo VIII','Evo IX','Evo X','FTO','Galant','L200','Lancer','Outlander','Outlander PHEV','Shogun','Space Star'],
  'Morgan': ['3 Wheeler','4/4','Aero 8','Plus Four','Plus Six','Super 3'],
  'Nissan': ['200SX','350Z','370Z','Ariya','Cube','Figaro','GT-R','Juke','Leaf','Micra','Navara','Note','NV200','Pathfinder','Pixo','Primera','Pulsar','Qashqai','Silvia','Skyline','Skyline R32','Skyline R33','Skyline R34','Sunny','Terrano','X-Trail','Z'],
  'Pagani': ['Huayra','Utopia','Zonda'],
  'Peugeot': ['106','107','108','205','205 GTI','206','207','208','306','307','308','309','405','406','407','408','508','2008','3008','5008','Boxer','Expert','Partner','RCZ','Rifter','e-208','e-2008'],
  'Polestar': ['1','2','3','4'],
  'Porsche': ['356','718 Boxster','718 Cayman','911','911 GT2 RS','911 GT3','911 GT3 RS','911 Turbo','918 Spyder','924','928','944','968','Boxster','Carrera GT','Cayenne','Cayman','Macan','Panamera','Taycan','930','964','993','996','997','991','992'],
  'Renault': ['4','5','5 E-Tech','Austral','Captur','Clio','Clio Williams','Espace','Kadjar','Kangoo','Koleos','Laguna','Master','Megane','Megane R.S.','Megane E-Tech','Modus','Scenic','Traffic','Twingo','Twizy','Zoe','Alpine A110'],
  'Rolls-Royce': ['Cullinan','Dawn','Ghost','Phantom','Silver Shadow','Silver Spirit','Spectre','Wraith','Corniche'],
  'Rover': ['25','45','75','100','200','400','600','800','Metro','Mini','SD1','P5','P6'],
  'Saab': ['9-3','9-5','900','9000','99'],
  'SEAT': ['Alhambra','Altea','Arona','Ateca','Cordoba','Ibiza','Leon','Leon Cupra','Mii','Tarraco','Toledo'],
  'Škoda': ['Citigo','Elroq','Enyaq','Fabia','Fabia vRS','Favorit','Felicia','Kamiq','Karoq','Kodiaq','Octavia','Octavia vRS','Rapid','Roomster','Scala','Superb','Yeti'],
  'Smart': ['#1','#3','ForFour','ForTwo','Roadster'],
  'Subaru': ['BRZ','Forester','Impreza','Impreza WRX','Impreza WRX STI','Justy','Legacy','Levorg','Outback','Solterra','SVX','XV'],
  'Suzuki': ['Alto','Baleno','Cappuccino','Celerio','Grand Vitara','Ignis','Jimny','Liana','S-Cross','Splash','Swift','Swift Sport','SX4','Vitara','Wagon R'],
  'Tesla': ['Cybertruck','Model 3','Model S','Model S Plaid','Model X','Model Y','Roadster'],
  'Toyota': ['4Runner','86','Auris','Avensis','Aygo','Aygo X','bZ4X','C-HR','Camry','Carina','Celica','Corolla','Corolla GR Sport','Crown','GR86','GR Corolla','GR Supra','GR Yaris','Hilux','iQ','Land Cruiser','MR2','Prius','Previa','Proace','RAV4','Starlet','Supra','Urban Cruiser','Verso','Yaris','Yaris Cross'],
  'TVR': ['Cerbera','Chimaera','Griffith','Sagaris','Tamora','Tuscan'],
  'Vauxhall': ['Adam','Agila','Ampera','Antara','Astra','Astra VXR','Calibra','Cascada','Combo','Corsa','Corsa VXR','Crossland','Frontera','Grandland','Insignia','Meriva','Mokka','Monaro','Nova','Omega','Signum','Tigra','Vectra','Vivaro','VX220','Zafira'],
  'Volkswagen': ['Amarok','Arteon','Beetle','Bora','Caddy','California','Caravelle','Corrado','Crafter','Eos','Fox','Golf','Golf GTI','Golf R','Golf Mk1','Golf Mk2','Golf Mk3','ID.3','ID.4','ID.5','ID.7','ID. Buzz','Jetta','Lupo','Passat','Phaeton','Polo','Polo GTI','Scirocco','Sharan','T-Cross','T-Roc','Taigo','Tiguan','Touareg','Touran','Transporter','Up!','Vento','Camper T2','Camper T25'],
  'Volvo': ['240','740','850','940','C30','C40','C70','EX30','EX90','S40','S60','S80','S90','V40','V50','V60','V70','V90','XC40','XC60','XC70','XC90','P1800'],
  'Lincoln': ['Continental','Navigator'],
  'Maybach': ['57','62','S-Class','GLS'],
  'Alpina': ['B3','B5','B7','D3','XD3'],
  'Isuzu': ['D-Max','Trooper'],
  'Mahindra': ['Pik Up'],
  'SsangYong': ['Korando','Musso','Rexton','Tivoli'],
  'Perodua': ['Kelisa','Myvi'],
  'Proton': ['Impian','Satria','Savvy'],
  'Daihatsu': ['Charade','Copen','Materia','Sirion','Terios'],
  'Lada': ['Niva','Riva','Samara'],
  'Reliant': ['Robin','Scimitar','Rialto'],
  'Triumph': ['Dolomite','Herald','Spitfire','Stag','TR4','TR6','TR7'],
  'Morris': ['Marina','Minor','Oxford','Ital'],
  'Austin': ['Allegro','Healey','Maestro','Metro','Mini','Montego','Princess'],
  'Talbot': ['Horizon','Samba','Sunbeam'],
  'DeLorean': ['DMC-12'],
  'Hummer': ['H1','H2','H3','EV'],
  'Cadillac': ['ATS','CTS','Escalade','Eldorado','Lyriq'],
  'RAM': ['1500','2500','TRX'],
  'GMC': ['Sierra','Yukon','Hummer EV'],
  'Buick': ['Regal','Riviera'],
  'Pontiac': ['Firebird','GTO','Trans Am'],
  'Rimac': ['Nevera','Concept One'],
  'Fisker': ['Karma','Ocean'],
  'Xpeng': ['G6','G9','P7'],
  'Omoda': ['5','7','9'],
  'Maxus': ['Deliver 9','eDeliver 3','T90','Euniq'],
  'LEVC': ['TX','VN5'],
  'Noble': ['M12','M400','M600'],
  'Radical': ['SR3','SR8','RXC'],
  'Westfield': ['Sport 250','XI'],
  'Wiesmann': ['GT MF4','Project Thunderball'],
  'Zenos': ['E10','E10 S'],
  'Ligier': ['JS50'],
  'Datsun': ['240Z','260Z','280Z','Cherry','Sunny'],
  'Opel': ['Astra','Corsa','Kadett','Manta','Speedster'],
  'Daewoo': ['Lanos','Matiz','Nubira'],
  'Great Wall': ['Steed'],
  'Iveco': ['Daily','Eurocargo'],
  'MAN': ['TGE','TGX'],
  'Scania': ['R Series','S Series'],
  'AC': ['Cobra','Ace'],
  'KTM': ['X-Bow'],
  'Pininfarina': ['Battista'],
  'JAC': ['iEV7S'],
  'Lancia ': []
};

/* Makes that are exotic enough to deserve a rarity nudge on entry. */
export const EXOTIC_MAKES = new Set([
  'Ferrari','Lamborghini','McLaren','Bugatti','Koenigsegg','Pagani','Rimac','Aston Martin',
  'Maserati','Lotus','Morgan','TVR','Noble','Radical',
  'DeLorean','Wiesmann','Pininfarina','Zenos','Caterham','Alpine','Hummer','AC','KTM'
]);

/* Exotic, but limousine-exotic rather than supercar-exotic. */
export const LUXURY_MAKES = new Set(['Rolls-Royce','Bentley','Maybach']);

/* JDM heroes that are a genuine event to see in the UK. */
export const JDM_HERO_RE = /\b(skyline|gt-?r|supra|rx-7|nsx|evo\s?[ivx]+|impreza wrx|integra type r|s2000|lancer evo|silvia|180sx|200sx|300zx|mr2|celica gt-?four|cappuccino|beat|figaro|autozam|chaser|soarer|stagea)\b/i;

export const PREMIUM_MAKES = new Set([
  'Porsche','Jaguar','Land Rover','Lexus','Tesla','Alfa Romeo','Polestar','Genesis','Alpina','Abarth','Cupra'
]);

/* Keyword hints — used to pre-tick types and rarity when you pick a model. */
export const MODEL_HINTS = [
  { re: /\b(gti|type r|st|rs|vxr|cupra|n line|\bn\b|gt line|abarth|jcw|vrs|sti|wrx|williams)\b/i, types: ['hothatch'], rarity: 'uncommon' },
  { re: /\b(estate|touring|avant|sportbrake|variant|tourer|sw)\b/i, types: ['estate'] },
  { re: /\b(convertible|cabrio|roadster|spider|spyder|volante|cabriolet|drophead)\b/i, types: ['convert'] },
  { re: /\b(coupe|coupé)\b/i, types: ['coupe'] },
  { re: /\b(van|transit|sprinter|ducato|transporter|vivaro|boxer|relay|crafter|caddy|combo|partner|berlingo|traffic|master|daily)\b/i, types: ['van','commercial'] },
  { re: /\b(hilux|ranger|navara|d-max|l200|amarok|f-150|silverado|1500|pik up|musso|gladiator)\b/i, types: ['pickup'] },
  { re: /\b(defender|wrangler|jimny|land cruiser|g-class|niva|series i{1,3}|troller|shogun)\b/i, types: ['offroad','suv'] },
  { re: /\b(e-tron|ioniq|leaf|zoe|id\.|model [3sxy]|taycan|ev6|ev9|born|enyaq|ariya|bz4x|spring|dolphin|seal|i[3457x]\b|eqa|eqb|eqc|eqe|eqs|mach-e|cybertruck|nevera|evija)\b/i, types: ['ev'] },
  { re: /\b(prius|hybrid|phev|e-tech|e:hev|niro|insight|ampera|karma)\b/i, types: ['hybrid'] },
  { re: /\b(tdi|hdi|cdti|dci|bluemotion|blue efficiency|d4d)\b/i, types: ['diesel'] },
  /* trailing-d BMW/Merc/Audi diesel badges: 320d, 520d, 220d, 30d … */
  { re: /\b\d{3}d\b/i, types: ['diesel','saloon'] }
];

export const EXOTIC_MODEL_RE = /\b(f40|f50|enzo|laferrari|p1|senna|918|carrera gt|veyron|chiron|zonda|huayra|utopia|agera|jesko|regera|valkyrie|xj220|mclaren f1|gt40|stratos|miura|countach|delorean|evija|nevera|battista|amg one|speedtail|elva|w1|daytona sp3|sf90|revuelto|tourbillon)\b/i;

/* Body-shape fallbacks so an entry never gets mislabelled as a hatchback
   just because nothing else matched. Checked in order. */
export const SHAPE_HINTS = [
  { re: /\b(911|718|cayman|boxster|corvette|supra|gt-?r|nsx|z4|tt|rcz|brz|gr86|\b86\b|mx-5|s2000|elise|exige|emira|evora|f-type|mr2|rx-7|rx-8|350z|370z|silvia|200sx|celica|integra|prelude|scirocco|corrado|calibra|tuscan|griffith|cerbera|sagaris|vantage|db\d|continental gt|amg gt|sls|slr|4c|8c|artura|emira)\b/i, type: 'sports' },
  { re: /\b(suv|x[1-7]\b|q[2-8]\b|gl[abces]\b|gle|gls|macan|cayenne|urus|bentayga|dbx|purosangue|levante|grecale|stelvio|tiguan|touareg|kuga|qashqai|sportage|tucson|rav4|cr-v|hr-v|zr-v|xc\d0|discovery|range rover|evoque|velar|defender|wrangler|cherokee|compass|renegade|kodiaq|karoq|ateca|tarraco|3008|5008|2008|captur|kadjar|austral|juke|x-trail|outlander|ix35|santa fe|sorento|niro|stonic|kamiq|arona|puma|mokka|crossland|grandland|yeti|c5 aircross|c3 aircross|escalade|navigator|tahoe|suburban|yukon|durango|explorer|4runner|land cruiser|shogun|trooper|rexton|terios|duster|bigster|jimny|vitara|s-cross|ignis)\b/i, type: 'suv' },
  { re: /\b(saloon|sedan|[3-8] series|\ba[3-8]\b|\bc-class|e-class|s-class|passat|jetta|vento|bora|mondeo|insignia|vectra|avensis|camry|accord|legend|primera|laguna|mégane saloon|superb|octavia|rapid|toledo|xe\b|xf\b|xj\b|s-type|x-type|ghibli|quattroporte|panamera|model 3|model s|\bes\b|\bgs\b|\bis\b|\bls\b|g70|g80|q50|q70|charger|300c|omega|signum|volvo s\d0|s[46-9]0)\b/i, type: 'saloon' },
  { re: /\b(fiesta|corsa|polo|clio|micra|yaris|jazz|swift|i10|i20|i30|picanto|rio|aygo|107|108|c1|up!|mii|citigo|panda|500|twingo|adam|ka|lupo|fox|matiz|spark|sandero|logan|ibiza|fabia|golf|astra|focus|civic|megane|leon|ceed|auris|corolla|30\d\b|20[6-9]\b|208|308|note|verso|scala)\b/i, type: 'hatch' }
];

export function guessShape(make, model) {
  const text = `${make} ${model}`;
  for (const h of SHAPE_HINTS) if (h.re.test(text)) return h.type;
  return null;
}

export const CLASSIC_YEAR = 1995;

/* Set by app.js once the catalogue module has loaded, so data.js stays
   dependency-free and the catalogue can be lazy-loaded. */
let _catLookup = null;
export function setCatalogueLookup(fn) { _catLookup = fn; }

export function guessMeta(make, model, year) {
  /* The catalogue is authoritative when it recognises the car — it carries
     hand-checked type and rarity, including the Mythic one-offs. */
  if (_catLookup) {
    const hit = _catLookup(make, model);
    if (hit) {
      const types = [hit.type];
      const y = Number(year);
      if (y && y < CLASSIC_YEAR && !types.includes('classic')) types.push('classic');
      return { types, rarity: hit.rarity, cat: hit };
    }
  }
  const text = `${make} ${model}`;
  const types = new Set();
  let rarity = 'common';
  const bump = (r) => {
    const order = ['common','uncommon','rare','epic','legendary','mythic'];
    if (order.indexOf(r) > order.indexOf(rarity)) rarity = r;
  };

  for (const hint of MODEL_HINTS) {
    if (hint.re.test(text)) {
      (hint.types || []).forEach(t => types.add(t));
      if (hint.rarity) bump(hint.rarity);
    }
  }
  if (EXOTIC_MAKES.has(make)) { types.add('super'); bump('epic'); }
  else if (LUXURY_MAKES.has(make)) { types.add('luxury'); bump('epic'); }
  else if (PREMIUM_MAKES.has(make)) bump('uncommon');
  if (EXOTIC_MODEL_RE.test(text)) { types.add('hyper'); bump('legendary'); }
  if (JDM_HERO_RE.test(text)) { types.add('jdm'); bump('rare'); }
  if (year && Number(year) < CLASSIC_YEAR) { types.add('classic'); bump('rare'); }
  if (['Toyota','Nissan','Honda','Mazda','Subaru','Mitsubishi','Suzuki','Daihatsu','Lexus','Infiniti','Datsun'].includes(make)) {
    if (year && Number(year) < 2005) types.add('jdm');
  }
  if (['Ford','Chevrolet','Dodge','Cadillac','Chrysler','GMC','RAM','Buick','Pontiac','Lincoln','Jeep','Hummer','Tesla'].includes(make)) {
    if (/mustang|camaro|challenger|charger|corvette|viper|firebird|trans am|gto|escalade|f-150|silverado/i.test(model)) types.add('usdm');
  }
  // fall back to a body shape rather than leaving it blank
  if (!types.size) {
    const shape = guessShape(make, model);
    if (shape) types.add(shape);
  }
  return { types: [...types].slice(0, 3), rarity };
}

/* Rank titles by total XP (spot XP + achievement XP).
   Thresholds are set from simulated dexes of a realistic UK spotter, so each
   rank lands at a meaningful milestone rather than an arbitrary round number:

     ~1 car     Kerb Crawler        ~350 cars   Marque Specialist
     ~5 cars    Spotter             ~600 cars   Dex Master
     ~15 cars   Trainspotter        ~1,000      Grand Archivist
     ~40 cars   Car Nerd            ~1,700      Living Encyclopaedia
     ~85 cars   Lay-by Legend       ~2,800      Tarmac Historian
     ~160 cars  Bonnet Botherer     ~4,500      The Completionist
     ~250 cars  Concours Judge      ~7,000      Immortal

   Early ranks come quickly to build momentum; the last few are a long haul
   but remain reachable, unlike the old 600,000 XP ceiling. */
export const RANKS = [
  { min: 0,      title: 'Kerb Crawler' },
  { min: 1200,   title: 'Spotter' },
  { min: 2800,   title: 'Trainspotter of Tarmac' },
  { min: 5500,   title: 'Car Nerd' },
  { min: 9500,   title: 'Lay-by Legend' },
  { min: 14500,  title: 'Bonnet Botherer' },
  { min: 21000,  title: 'Concours Judge' },
  { min: 28000,  title: 'Marque Specialist' },
  { min: 38000,  title: 'Dex Master' },
  { min: 52000,  title: 'Grand Archivist' },
  { min: 72000,  title: 'Living Encyclopaedia' },
  { min: 100000, title: 'Tarmac Historian' },
  { min: 135000, title: 'The Completionist' },
  { min: 185000, title: 'Immortal of the Hard Shoulder' }
];

export function rankFor(xp) {
  let r = RANKS[0];
  for (const rank of RANKS) if (xp >= rank.min) r = rank;
  return r;
}
