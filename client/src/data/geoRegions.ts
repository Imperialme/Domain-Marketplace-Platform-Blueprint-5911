/**
 * Geographic supply regions for Procure.parts brand pages.
 * Structured as continent → anchor countries, with a note that more are served.
 */

export interface GeoContinent {
  continent: string;
  emoji: string;
  countries: string[];
}

export const GEO_REGIONS: GeoContinent[] = [
  {
    continent: "Middle East",
    emoji: "🌍",
    countries: ["UAE", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman", "Jordan", "Iraq"],
  },
  {
    continent: "Africa",
    emoji: "🌍",
    countries: [
      "Egypt", "Nigeria", "Kenya", "South Africa", "Ghana", "Tanzania",
      "Ethiopia", "Mozambique", "Zambia", "Côte d'Ivoire", "Senegal", "Cameroon",
    ],
  },
  {
    continent: "Southeast Asia",
    emoji: "🌏",
    countries: ["Indonesia", "Malaysia", "Philippines", "Vietnam", "Thailand", "Myanmar"],
  },
  {
    continent: "Europe",
    emoji: "🌍",
    countries: ["Germany", "Netherlands", "France", "Poland", "Spain", "Italy"],
  },
  {
    continent: "South Asia",
    emoji: "🌏",
    countries: ["Pakistan", "Bangladesh", "Sri Lanka", "Nepal"],
  },
  {
    continent: "Oceania",
    emoji: "🌏",
    countries: ["Australia", "New Zealand"],
  },
];

/**
 * Filter continents relevant to a brand's declared regions array.
 * A brand's regions field contains continent names like "Africa", "Middle East", etc.
 */
export function getRelevantContinents(brandRegions: string[]): GeoContinent[] {
  if (!brandRegions || brandRegions.length === 0) return GEO_REGIONS.slice(0, 3);
  return GEO_REGIONS.filter(g =>
    brandRegions.some(r =>
      r.toLowerCase().includes(g.continent.toLowerCase()) ||
      g.continent.toLowerCase().includes(r.toLowerCase())
    )
  );
}
