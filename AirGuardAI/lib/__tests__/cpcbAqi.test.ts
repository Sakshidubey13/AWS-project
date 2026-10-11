import { describe, it, expect } from 'vitest';
import { getAqiCategory, computeCpcbAqi, createPollutantRecord } from '../cpcbAqi';

describe('CPCB AQI Calculations and Categories', () => {
  it('correctly maps AQI values to CPCB categories', () => {
    expect(getAqiCategory(30).name).toBe('Good');
    expect(getAqiCategory(75).name).toBe('Satisfactory');
    expect(getAqiCategory(150).name).toBe('Moderate');
    expect(getAqiCategory(250).name).toBe('Poor');
    expect(getAqiCategory(350).name).toBe('Very Poor');
    expect(getAqiCategory(450).name).toBe('Severe');
  });

  it('computes correct sub-index and primary pollutant for given concentrations', () => {
    const result = computeCpcbAqi({ pm25: 45, pm10: 80, no2: 30 });
    expect(result.aqi).toBeGreaterThan(0);
    expect(result.primaryPollutant).toBeDefined();
  });

  it('creates valid pollutant measurement structure', () => {
    const p = createPollutantRecord('pm25', 120.5);
    expect(p.name).toBe('PM2.5');
    expect(p.concentration).toBe(120.5);
    expect(p.unit).toBe('µg/m³');
    expect(p.healthLimit).toBe(60);
  });
});
