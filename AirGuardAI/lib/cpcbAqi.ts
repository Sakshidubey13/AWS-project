import { AQICategory, PollutantMeasurement } from '@/types/airQuality';

export const CPCB_CATEGORIES: AQICategory[] = [
  {
    level: 1,
    name: 'Good',
    range: '0–50',
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    description: 'Minimal impact on health. Air quality is considered satisfactory.',
    actionRecommendation: 'Enjoy your normal outdoor activities. Great day for a run or park visit.',
  },
  {
    level: 2,
    name: 'Satisfactory',
    range: '51–100',
    color: '#14B8A6',
    bgColor: 'bg-teal-500/10',
    textColor: 'text-teal-700 dark:text-teal-400',
    borderColor: 'border-teal-500/30',
    description: 'Minor breathing discomfort to sensitive people.',
    actionRecommendation: 'Sensitive individuals (asthma, heart conditions) should consider reducing prolonged outdoor exertion.',
  },
  {
    level: 3,
    name: 'Moderate',
    range: '101–200',
    color: '#F59E0B',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    description: 'Breathing discomfort to people with lung disease, asthma, and heart disease.',
    actionRecommendation: 'Reduce intense outdoor workouts. Keep rescue inhalers handy if you have respiratory conditions.',
  },
  {
    level: 4,
    name: 'Poor',
    range: '201–300',
    color: '#F97316',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-700 dark:text-orange-400',
    borderColor: 'border-orange-500/30',
    description: 'Breathing discomfort to most people on prolonged exposure.',
    actionRecommendation: 'Avoid outdoor morning exercise. Wear an N95 mask if commuting outdoors. Keep windows closed.',
  },
  {
    level: 5,
    name: 'Very Poor',
    range: '301–400',
    color: '#EF4444',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-500/30',
    description: 'Respiratory illness on prolonged exposure. Significant risk for children and elderly.',
    actionRecommendation: 'Stay indoors where possible. Run indoor air purifiers on high. Avoid all strenuous outdoor physical activity.',
  },
  {
    level: 6,
    name: 'Severe',
    range: '401–500+',
    color: '#991B1B',
    bgColor: 'bg-rose-900/10',
    textColor: 'text-rose-800 dark:text-rose-300',
    borderColor: 'border-rose-900/30',
    description: 'Severe health impact even on healthy people. Emergency health conditions.',
    actionRecommendation: 'Public health emergency. Remain strictly indoors, seal windows, run HEPA purifiers, and avoid all outdoor exposure.',
  },
];

export function getAqiCategory(aqi: number): AQICategory {
  if (aqi <= 50) return CPCB_CATEGORIES[0];
  if (aqi <= 100) return CPCB_CATEGORIES[1];
  if (aqi <= 200) return CPCB_CATEGORIES[2];
  if (aqi <= 300) return CPCB_CATEGORIES[3];
  if (aqi <= 400) return CPCB_CATEGORIES[4];
  return CPCB_CATEGORIES[5];
}

// Sub-index calculation helper for CPCB breakpoints
function calculateSubIndex(concentration: number, breakpoints: [number, number, number, number, number, number, number][]): number {
  for (const [lowC, highC, lowI, highI] of breakpoints) {
    if (concentration >= lowC && concentration <= highC) {
      return Math.round(((highI - lowI) / (highC - lowC)) * (concentration - lowC) + lowI);
    }
  }
  // If above maximum breakpoint, cap or extrapolate
  if (concentration > breakpoints[breakpoints.length - 1][1]) {
    return breakpoints[breakpoints.length - 1][3];
  }
  return 0;
}

// CPCB breakpoints for PM2.5 (24hr)
const PM25_BP: [number, number, number, number][] = [
  [0, 30, 0, 50],
  [31, 60, 51, 100],
  [61, 90, 101, 200],
  [91, 120, 201, 300],
  [121, 250, 301, 400],
  [251, 500, 401, 500],
];

// CPCB breakpoints for PM10 (24hr)
const PM10_BP: [number, number, number, number][] = [
  [0, 50, 0, 50],
  [51, 100, 51, 100],
  [101, 250, 101, 200],
  [251, 350, 201, 300],
  [351, 430, 301, 400],
  [431, 1000, 401, 500],
];

// CPCB breakpoints for NO2 (24hr)
const NO2_BP: [number, number, number, number][] = [
  [0, 40, 0, 50],
  [41, 80, 51, 100],
  [81, 180, 101, 200],
  [181, 280, 201, 300],
  [281, 400, 301, 400],
  [401, 800, 401, 500],
];

export function computeCpcbAqi(pollutants: { pm25?: number; pm10?: number; no2?: number }): { aqi: number; primaryPollutant: string } {
  let maxSubIndex = 0;
  let primary = 'PM2.5';

  if (pollutants.pm25 !== undefined) {
    const si = calculateSubIndex(pollutants.pm25, PM25_BP);
    if (si > maxSubIndex) {
      maxSubIndex = si;
      primary = 'PM2.5';
    }
  }

  if (pollutants.pm10 !== undefined) {
    const si = calculateSubIndex(pollutants.pm10, PM10_BP);
    if (si > maxSubIndex) {
      maxSubIndex = si;
      primary = 'PM10';
    }
  }

  if (pollutants.no2 !== undefined) {
    const si = calculateSubIndex(pollutants.no2, NO2_BP);
    if (si > maxSubIndex) {
      maxSubIndex = si;
      primary = 'NO2';
    }
  }

  return {
    aqi: maxSubIndex > 0 ? maxSubIndex : 125, // default moderate fallback if no numeric concentrations
    primaryPollutant: primary,
  };
}

export function createPollutantRecord(code: 'pm25' | 'pm10' | 'no2' | 'o3' | 'so2' | 'co', concentration: number): PollutantMeasurement {
  const meta: Record<string, { name: string; unit: string; healthLimit: number; description: string }> = {
    pm25: { name: 'PM2.5', unit: 'µg/m³', healthLimit: 60, description: 'Fine inhalable particles (diameter < 2.5 micrometers) that penetrate deep into lungs and bloodstream.' },
    pm10: { name: 'PM10', unit: 'µg/m³', healthLimit: 100, description: 'Inhalable coarse particles (diameter < 10 micrometers) from road dust, construction, and agriculture.' },
    no2: { name: 'Nitrogen Dioxide', unit: 'µg/m³', healthLimit: 80, description: 'Gas primarily emitted from vehicle exhaust and power plants. Irritates airways.' },
    o3: { name: 'Ground-level Ozone', unit: 'µg/m³', healthLimit: 100, description: 'Secondary pollutant formed when sunlight reacts with vehicle and industrial emissions.' },
    so2: { name: 'Sulfur Dioxide', unit: 'µg/m³', healthLimit: 80, description: 'Emitted from fossil fuel combustion in industrial processes and power generation.' },
    co: { name: 'Carbon Monoxide', unit: 'mg/m³', healthLimit: 4, description: 'Colorless, odorless gas from incomplete combustion in vehicle engines.' },
  };

  const info = meta[code] || { name: code.toUpperCase(), unit: 'µg/m³', healthLimit: 50, description: 'Air pollutant concentration.' };
  
  return {
    name: info.name,
    code,
    concentration: Math.round(concentration * 10) / 10,
    unit: info.unit,
    timestamp: new Date().toISOString(),
    description: info.description,
    healthLimit: info.healthLimit,
  };
}
