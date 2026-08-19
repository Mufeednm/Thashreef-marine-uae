export const marineCatalogSeedVersion = "2026-07-17-nested-marine-catalog-v1";

export interface MarineSeedBrand {
  displayOrder: number;
  id: number;
  logoText: string;
  name: string;
  slug: string;
}
export interface MarineSeedCategory {
  bannerImageUrl: string | null;
  displayOrder: number;
  id: number;
  isFeatured: boolean;
  name: string;
  parentCategoryId: number | null;
  slug: string;
}

export interface MarineSeedProduct {
  brand: string;
  categoryId: number;
  description: string;
  id: string;
  imageUrl: string;
  isFeatured: boolean;
  name: string;
  regularPriceAedCents: number;
  salePriceAedCents: number | null;
  sku: string;
  slug: string;
  stockQuantity: number;
}

export const marineBrands: MarineSeedBrand[] = [
  { displayOrder: 10, id: 1, logoText: "LZ", name: "Lalizas", slug: "lalizas" },
  { displayOrder: 20, id: 2, logoText: "PF", name: "Polyform", slug: "polyform" },
  { displayOrder: 30, id: 3, logoText: "RM", name: "Rule", slug: "rule" },
  { displayOrder: 40, id: 4, logoText: "JB", name: "Jabsco", slug: "jabsco" },
  { displayOrder: 50, id: 5, logoText: "VC", name: "Victron Energy", slug: "victron-energy" },
  { displayOrder: 60, id: 6, logoText: "GP", name: "Garmin", slug: "garmin" },
  { displayOrder: 70, id: 7, logoText: "RF", name: "Ronstan", slug: "ronstan" },
  { displayOrder: 80, id: 8, logoText: "3M", name: "3M Marine", slug: "3m-marine" },
  { displayOrder: 90, id: 9, logoText: "SL", name: "SeaLine", slug: "sealine" },
  { displayOrder: 100, id: 10, logoText: "DM", name: "Deckmate", slug: "deckmate" },
  { displayOrder: 110, id: 11, logoText: "GP", name: "GP Batteries", slug: "gp-batteries" },
  { displayOrder: 120, id: 12, logoText: "MT", name: "Marinco", slug: "marinco" },
];

export const marineCategories: MarineSeedCategory[] = [
  mainCategory(100, "Safety", "safety", 10),
  subCategory(101, "Life Jackets", "life-jackets", 100, 10),
  subCategory(102, "Lifebuoys", "lifebuoys", 100, 20),
  subCategory(103, "EPIRBs & Beacons", "epirbs-beacons", 100, 30),
  subCategory(104, "Fire Extinguishers", "fire-extinguishers", 100, 40),
  subCategory(105, "Safety Accessories", "safety-accessories", 100, 50),
  subCategory(106, "First Aid Kits", "first-aid-kits", 100, 60),

  mainCategory(200, "Electrical", "electrical", 20),
  subCategory(201, "Batteries", "batteries", 200, 10),
  subCategory(202, "Battery Chargers", "battery-chargers", 200, 20),
  subCategory(203, "Battery Switches", "battery-switches", 200, 30),
  subCategory(204, "Circuit Breakers", "circuit-breakers", 200, 40),
  subCategory(205, "Shore Power", "shore-power", 200, 50),
  subCategory(206, "Electrical Accessories", "electrical-accessories", 200, 60),

  mainCategory(300, "Navigation", "navigation", 30),
  subCategory(301, "GPS", "gps", 300, 10),
  subCategory(302, "Fish Finders", "fish-finders", 300, 20),
  subCategory(303, "Compasses", "compasses", 300, 30),
  subCategory(304, "Navigation Lights", "navigation-lights", 300, 40),
  subCategory(305, "Marine Electronics", "marine-electronics", 300, 50),
  subCategory(306, "AIS & Radar", "ais-radar", 300, 60),

  mainCategory(400, "Deck Hardware", "deck-hardware", 40),
  subCategory(401, "Cleats", "cleats", 400, 10),
  subCategory(402, "Winches", "winches", 400, 20),
  subCategory(403, "Hinges", "hinges", 400, 30),
  subCategory(404, "Hatches", "hatches", 400, 40),
  subCategory(405, "Deck Fittings", "deck-fittings", 400, 50),
  subCategory(406, "Ladders & Boarding", "ladders-boarding", 400, 60),

  mainCategory(500, "Anchoring & Mooring", "anchoring-mooring", 50),
  subCategory(501, "Anchors", "anchors", 500, 10),
  subCategory(502, "Anchor Chains", "anchor-chains", 500, 20),
  subCategory(503, "Anchor Ropes", "anchor-ropes", 500, 30),
  subCategory(504, "Fenders", "fenders", 500, 40),
  subCategory(505, "Mooring Accessories", "mooring-accessories", 500, 50),

  mainCategory(600, "Cleaning & Maintenance", "cleaning-maintenance", 60),
  subCategory(601, "Boat Cleaners", "boat-cleaners", 600, 10),
  subCategory(602, "Brushes", "brushes", 600, 20),
  subCategory(603, "Polish", "polish", 600, 30),
  subCategory(604, "Wax", "wax", 600, 40),
  subCategory(605, "Maintenance Tools", "maintenance-tools", 600, 50),

  mainCategory(700, "Plumbing & Pumps", "plumbing-pumps", 70),
  subCategory(701, "Bilge Pumps", "bilge-pumps", 700, 10),
  subCategory(702, "Fresh Water Pumps", "fresh-water-pumps", 700, 20),
  subCategory(703, "Hoses", "hoses", 700, 30),
  subCategory(704, "Valves & Fittings", "valves-fittings", 700, 40),
  subCategory(705, "Toilets & Sanitation", "toilets-sanitation", 700, 50),

  mainCategory(800, "Engine & Fuel", "engine-fuel", 80),
  subCategory(801, "Fuel Tanks", "fuel-tanks", 800, 10),
  subCategory(802, "Fuel Filters", "fuel-filters", 800, 20),
  subCategory(803, "Engine Oils", "engine-oils", 800, 30),
  subCategory(804, "Impellers", "impellers", 800, 40),
  subCategory(805, "Engine Accessories", "engine-accessories", 800, 50),

  mainCategory(900, "Ropes & Rigging", "ropes-rigging", 90),
  subCategory(901, "Dock Lines", "dock-lines", 900, 10),
  subCategory(902, "Sailing Ropes", "sailing-ropes", 900, 20),
  subCategory(903, "Blocks & Pulleys", "blocks-pulleys", 900, 30),
  subCategory(904, "Shackles", "shackles", 900, 40),
  subCategory(905, "Rigging Accessories", "rigging-accessories", 900, 50),

  mainCategory(1000, "Paint & Composites", "paint-composites", 100),
  subCategory(1001, "Antifouling Paint", "antifouling-paint", 1000, 10),
  subCategory(1002, "Primers", "primers", 1000, 20),
  subCategory(1003, "Epoxy & Resin", "epoxy-resin", 1000, 30),
  subCategory(1004, "Sealants", "sealants", 1000, 40),
  subCategory(1005, "Fiberglass Supplies", "fiberglass-supplies", 1000, 50),

  mainCategory(1100, "Comfort & Galley", "comfort-galley", 110),
  subCategory(1101, "Marine Coolers", "marine-coolers", 1100, 10),
  subCategory(1102, "Cabin Accessories", "cabin-accessories", 1100, 20),
  subCategory(1103, "Galley Equipment", "galley-equipment", 1100, 30),
  subCategory(1104, "Seats & Cushions", "seats-cushions", 1100, 40),
  subCategory(1105, "Ventilation", "ventilation", 1100, 50),

  mainCategory(1200, "Trailer & Dock", "trailer-dock", 120),
  subCategory(1201, "Dock Bumpers", "dock-bumpers", 1200, 10),
  subCategory(1202, "Trailer Rollers", "trailer-rollers", 1200, 20),
  subCategory(1203, "Tie Downs", "tie-downs", 1200, 30),
  subCategory(1204, "Dock Ladders", "dock-ladders", 1200, 40),
  subCategory(1205, "Marina Hardware", "marina-hardware", 1200, 50),
];

export const marineProducts: MarineSeedProduct[] = [
  product(1, "Lalizas 100N ISO Life Jacket", "Lalizas", 101, 7800, 6800, 34, true, "/product-images/life-jacket.svg", "SOLAS-inspired foam life jacket with whistle, belt, bright shell and reliable buoyancy for coastal boating."),
  product(2, "Lalizas Lamda Inflatable Lifejacket 275N", "Lalizas", 101, 42500, null, 18, true, "/product-images/life-jacket.svg", "Automatic inflatable lifejacket for offshore use with comfortable fit and high-visibility bladder."),
  product(3, "Ocean 2.5kg Lifebuoy Ring", "SeaLine", 102, 15500, null, 26, false, "/product-images/life-ring.svg", "Durable lifebuoy ring for docks, marina walkways and vessel safety stations."),
  product(4, "Compact EPIRB Safety Beacon", "SeaLine", 103, 189500, 174000, 6, true, "/product-images/marine-essential.svg", "Waterproof emergency position beacon for offshore safety kits and commercial readiness."),
  product(5, "Marine Dry Powder Fire Extinguisher 2kg", "SeaLine", 104, 9500, null, 42, false, "/product-images/marine-essential.svg", "Corrosion-resistant fire extinguisher suitable for engine rooms, cabins and dockside safety cabinets."),
  product(6, "Waterproof First Aid Kit 74 Piece", "SeaLine", 106, 12000, null, 30, false, "/product-images/marine-essential.svg", "Compact first aid kit in a sealed marine case for tenders, boats and service vehicles."),

  product(7, "GP Marine AGM Battery 12V 100Ah", "GP Batteries", 201, 119500, 108000, 14, true, "/product-images/battery.svg", "Deep-cycle AGM battery for marine house power, electronics and auxiliary systems."),
  product(8, "Victron Blue Smart Charger 12V 15A", "Victron Energy", 202, 89500, null, 20, true, "/product-images/battery.svg", "Bluetooth-enabled smart charger for marine batteries with adaptive charging profiles."),
  product(9, "ZeeVolt Heavy Duty Battery Switch", "Marinco", 203, 6500, null, 55, false, "/product-images/battery.svg", "ON-OFF master battery switch with robust housing for marine electrical panels."),
  product(10, "Resettable Marine Circuit Breaker 80A", "Marinco", 204, 5800, null, 64, false, "/product-images/connector.svg", "Panel-mount circuit breaker for DC marine electrical protection and service access."),
  product(11, "Marinco Shore Power Plug 16A", "Marinco", 205, 14500, 13200, 28, false, "/product-images/connector.svg", "Splash-resistant shore power connector for marina charging and dockside AC supply."),
  product(12, "Waterproof Cable Gland Assortment", "Marinco", 206, 3900, null, 80, false, "/product-images/connector.svg", "Marine-grade cable gland kit for clean electrical routing through decks and panels."),

  product(13, "Garmin GPSMAP Compact Chartplotter", "Garmin", 301, 245000, 229000, 8, true, "/product-images/navigation-light.svg", "Compact chartplotter for route planning, marina navigation and small vessel electronics upgrades."),
  product(14, "Garmin Striker Fish Finder 5 Inch", "Garmin", 302, 134000, null, 11, true, "/product-images/navigation-light.svg", "Clear sonar fish finder with GPS marking for fishing boats and weekend crews."),
  product(15, "Bulkhead Marine Compass 100mm", "SeaLine", 303, 18500, null, 22, false, "/product-images/navigation-light.svg", "Easy-read magnetic compass with night lighting and bulkhead mounting."),
  product(16, "LED Port & Starboard Navigation Light Pair", "AAA Marine", 304, 6500, 5900, 48, true, "/product-images/navigation-light.svg", "Low-draw LED navigation side lights for safer night operation and visibility compliance."),
  product(17, "AIS Antenna Splitter Kit", "Garmin", 306, 98500, null, 7, false, "/product-images/marine-essential.svg", "AIS and VHF antenna splitter kit for cleaner electronics installs and better signal routing."),

  product(18, "316 Stainless Steel Mooring Cleat 8 Inch", "Ronstan", 401, 8200, null, 70, false, "/product-images/marine-essential.svg", "Polished stainless cleat for deck, dock and tender hardware upgrades."),
  product(19, "Ronstan Self-Tailing Winch Handle", "Ronstan", 402, 32500, null, 13, false, "/product-images/marine-essential.svg", "Lightweight winch handle with lock-in grip for sailing and deck handling."),
  product(20, "Marine Stainless Strap Hinges Pair", "Ronstan", 403, 4400, null, 96, false, "/product-images/marine-essential.svg", "Corrosion-resistant strap hinges for lockers, hatches and utility panels."),
  product(21, "Low Profile Inspection Hatch 6 Inch", "Deckmate", 404, 5200, null, 44, false, "/product-images/marine-essential.svg", "UV-stable inspection hatch with gasketed lid for deck and console access."),
  product(22, "Telescopic Boarding Ladder 3 Step", "Deckmate", 406, 28500, 25900, 16, true, "/product-images/ladder.svg", "Folding stainless boarding ladder for transoms, docks and swim platforms."),

  product(23, "Hot Dipped Galvanized Danforth Anchor 8kg", "SeaLine", 501, 21500, null, 24, true, "/product-images/anchor.svg", "Reliable fluke anchor for sand and mud seabeds, supplied for small to mid-size vessels."),
  product(24, "Calibrated Anchor Chain 8mm x 10m", "SeaLine", 502, 18500, null, 21, false, "/product-images/anchor.svg", "Galvanized anchor chain length for windlass-ready anchoring systems."),
  product(25, "Nylon Anchor Rope 12mm x 50m", "SeaLine", 503, 17500, 15800, 33, false, "/product-images/anchor.svg", "Three-strand nylon anchor rope with good shock absorption and marine UV resistance."),
  product(26, "Polyform F Series Fender F2", "Polyform", 504, 12000, null, 52, true, "/product-images/fender.svg", "Heavy-duty inflatable fender for docks, rafting and hull protection."),
  product(27, "Stainless Anchor Swivel Connector", "Ronstan", 505, 14500, null, 29, false, "/product-images/anchor.svg", "Smooth swivel connector for anchor chain alignment and easier retrieval."),

  product(28, "Spray Nine Marine Cleaner 946ml", "3M Marine", 601, 4800, null, 64, false, "/product-images/cleaning.svg", "Heavy-duty cleaner for vinyl, decks, lockers and maintenance areas."),
  product(29, "Deckmate Extra Soft Deck Brush", "Deckmate", 602, 5200, null, 72, false, "/product-images/cleaning.svg", "Soft-bristle deck brush for non-skid decks, gelcoat and delicate fittings."),
  product(30, "Autosol Marine Metal Polish", "3M Marine", 603, 3500, null, 47, false, "/product-images/cleaning.svg", "Metal polish for stainless rails, cleats, fittings and brightwork."),
  product(31, "Premium Boat Wax 500ml", "3M Marine", 604, 6900, 6200, 38, false, "/product-images/cleaning.svg", "Protective wax for gelcoat gloss, UV resistance and easier washdowns."),
  product(32, "Marine Maintenance Tool Roll", "Deckmate", 605, 16500, null, 19, false, "/product-images/marine-essential.svg", "Compact stainless-focused tool roll for routine onboard repairs."),

  product(33, "Rule Automatic Bilge Pump 1100GPH", "Rule", 701, 19500, 17900, 30, true, "/product-images/pump.svg", "Automatic bilge pump with reliable float sensing for safety and drainage."),
  product(34, "Jabsco Fresh Water Pump 12V", "Jabsco", 702, 38500, null, 17, true, "/product-images/pump.svg", "Quiet pressure pump for freshwater systems, sinks and showers."),
  product(35, "Reinforced Marine Hose 19mm", "Jabsco", 703, 4200, null, 85, false, "/product-images/pump.svg", "Flexible reinforced hose for bilge, freshwater and general marine plumbing."),
  product(36, "Bronze Seacock Valve 1 Inch", "Jabsco", 704, 24500, null, 12, false, "/product-images/pump.svg", "Robust bronze valve for through-hull plumbing and service reliability."),
  product(37, "Compact Manual Marine Toilet", "Jabsco", 705, 69500, null, 9, false, "/product-images/pump.svg", "Manual marine toilet for compact cabins and refit projects."),

  product(38, "Portable Marine Fuel Tank 24L", "SeaLine", 801, 18500, null, 18, false, "/product-images/marine-essential.svg", "Portable fuel tank with vented cap for outboards and tenders."),
  product(39, "Water Separating Fuel Filter Kit", "SeaLine", 802, 12500, null, 24, false, "/product-images/marine-essential.svg", "Fuel filter and separator kit for cleaner engine operation."),
  product(40, "Marine 4 Stroke Engine Oil 10W-40", "SeaLine", 803, 4200, null, 60, false, "/product-images/marine-essential.svg", "Marine engine oil for four-stroke outboards and service intervals."),
  product(41, "Flexible Neoprene Impeller Kit", "Jabsco", 804, 7800, null, 35, false, "/product-images/pump.svg", "Replacement impeller kit for cooling pumps and routine maintenance."),
  product(42, "Outboard Flush Muffs", "Deckmate", 805, 3600, null, 58, false, "/product-images/marine-essential.svg", "Engine flushing muffs for post-trip freshwater rinsing and service checks."),

  product(43, "Double Braid Dock Line 14mm x 10m", "Ronstan", 901, 8500, null, 44, true, "/product-images/anchor.svg", "Soft-handling dock line with strong UV resistance for marina mooring."),
  product(44, "Low Stretch Sailing Rope 10mm", "Ronstan", 902, 11500, null, 32, false, "/product-images/anchor.svg", "Low-stretch rope for sheets, halyards and sailing control lines."),
  product(45, "Ronstan Ball Bearing Block 40mm", "Ronstan", 903, 9600, null, 26, false, "/product-images/marine-essential.svg", "Smooth-running block for dinghy and small yacht rigging systems."),
  product(46, "Bow Shackle 316 Stainless 10mm", "Ronstan", 904, 2800, null, 140, false, "/product-images/marine-essential.svg", "316 stainless shackle for rigging, anchoring and deck utility use."),

  product(47, "Antifouling Paint Navy Blue 2.5L", "3M Marine", 1001, 26500, null, 14, false, "/product-images/cleaning.svg", "Antifouling coating for hull protection and seasonal maintenance."),
  product(48, "Marine Epoxy Primer 1L", "3M Marine", 1002, 12800, null, 20, false, "/product-images/cleaning.svg", "Primer for metal, fiberglass and repair surfaces before finishing."),
  product(49, "Fast Cure Epoxy Resin Kit", "3M Marine", 1003, 18500, null, 16, false, "/product-images/marine-essential.svg", "Epoxy repair kit for small composite repairs and maintenance work."),
  product(50, "Polyurethane Marine Sealant White", "3M Marine", 1004, 4200, null, 75, false, "/product-images/connector.svg", "Flexible sealant for deck fittings, hatches and hardware bedding."),

  product(51, "Igloo Marine Cooler 48QT", "SeaLine", 1101, 28500, null, 10, false, "/product-images/marine-essential.svg", "UV-resistant marine cooler for day trips, fishing and dock use."),
  product(52, "Cabin LED Reading Light", "Marinco", 1102, 7900, null, 36, false, "/product-images/navigation-light.svg", "Warm LED cabin light with low current draw and compact mounting."),
  product(53, "Stainless Galley Kettle", "SeaLine", 1103, 6500, null, 22, false, "/product-images/marine-essential.svg", "Compact stainless kettle for marine galley and picnic use."),
  product(54, "Foldable Marine Seat Cushion", "Deckmate", 1104, 9500, null, 31, false, "/product-images/marine-essential.svg", "Water-resistant cushion for cockpit seating and tender comfort."),

  product(55, "Dock Edge Corner Bumper", "Deckmate", 1201, 5200, null, 66, false, "/product-images/fender.svg", "Dock corner bumper for marina berths, pontoons and private docks."),
  product(56, "Boat Trailer Roller 8 Inch", "SeaLine", 1202, 6200, null, 44, false, "/product-images/marine-essential.svg", "Durable trailer roller for smoother launch and retrieval."),
  product(57, "Heavy Duty Transom Tie Down Pair", "SeaLine", 1203, 7800, null, 37, false, "/product-images/marine-essential.svg", "Ratchet tie-down pair for safer trailering and transport."),
  product(58, "Aluminium Dock Ladder 4 Step", "Deckmate", 1204, 39500, null, 11, false, "/product-images/ladder.svg", "Corrosion-resistant dock ladder for marinas, pontoons and private berths."),
];

function mainCategory(id: number, name: string, slug: string, displayOrder: number): MarineSeedCategory {
  return {
    bannerImageUrl: null,
    displayOrder,
    id,
    isFeatured: true,
    name,
    parentCategoryId: null,
    slug,
  };
}

function subCategory(
  id: number,
  name: string,
  slug: string,
  parentCategoryId: number,
  displayOrder: number,
): MarineSeedCategory {
  return {
    bannerImageUrl: null,
    displayOrder,
    id,
    isFeatured: displayOrder <= 20,
    name,
    parentCategoryId,
    slug,
  };
}

function product(
  id: number,
  name: string,
  brand: string,
  categoryId: number,
  regularPriceAedCents: number,
  salePriceAedCents: number | null,
  stockQuantity: number,
  isFeatured: boolean,
  imageUrl: string,
  description: string,
): MarineSeedProduct {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    brand,
    categoryId,
    description,
    id: `marine-product-${id.toString().padStart(3, "0")}`,
    imageUrl,
    isFeatured,
    name,
    regularPriceAedCents,
    salePriceAedCents,
    sku: `TMU-${id.toString().padStart(4, "0")}`,
    slug,
    stockQuantity,
  };
}
