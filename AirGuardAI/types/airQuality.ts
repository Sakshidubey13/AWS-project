export interface LocationInfo {
  id: string;
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  stationName: string;
}

export interface PollutantMeasurement {
  name: string;
  code: 'pm25' | 'pm10' | 'no2' | 'o3' | 'so2' | 'co';
  concentration: number;
  unit: string;
  timestamp: string;
  subIndex?: number;
  description: string;
  healthLimit: number;
}

export interface AQICategory {
  level: number;
  name: string;
  range: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  actionRecommendation: string;
}

export interface AirQualityReading {
  location: LocationInfo;
  aqi: number;
  aqiCategory: AQICategory;
  primaryPollutant: string;
  pollutants: Record<string, PollutantMeasurement>;
  timestamp: string;
  source: string;
  attribution: string;
  methodology: string;
  isStale: boolean;
  isFallback: boolean;
}

export interface HistoricalPoint {
  timestamp: string;
  timeLabel: string;
  aqi: number;
  pm25: number;
  pm10: number;
}

export interface AlertRule {
  id: string;
  locationId: string;
  locationName: string;
  thresholdAqi: number;
  emailOrPhone: string;
  enabled: boolean;
  createdAt: string;
}
