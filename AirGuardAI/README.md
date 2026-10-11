# AirGuard AI 🌍

### "Know Your Air. Protect Your Health."

**Track:** Air Pollution — Bharat Builds Tour: Environmental Hacks 2026

---

## 1. Executive Summary

Air pollution is a critical daily challenge in urban Indian cities. Residents, commuters, parents, and outdoor workers frequently lack accessible, scientifically accurate information about current air quality, the specific pollutants responsible for poor air, and practical steps to reduce exposure.

**AirGuard AI** is a production-quality, responsive air-quality monitoring and pollution-exposure awareness web application. It transforms verified environmental data from monitoring stations into clear, location-aware insights and actionable public health guidance based on official **CPCB (Central Pollution Control Board) India** National AQI methodology.

---

## 2. Core User Journey & Architecture

1. **Dashboard Overview:** Displays selected Indian city (New Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai, Ahmedabad, Pune, Lucknow), real-time AQI with CPCB category badge, data freshness timestamp, station metadata, and prominent action recommendations.
2. **Station Explorer:** Browse verified monitoring stations across India with geographic coordinates and live status.
3. **Trends Analysis:** Interactive time-series visualizer showing 24h, 48h, and 7d pollutant accumulation patterns and diurnal inversion trends.
4. **Threshold Alerts:** Configure custom AQI warning thresholds for personalized notifications.
5. **Educational Intelligence:** Comprehensive guides on PM2.5, PM10, Nitrogen Dioxide (NO2), Ozone, and personal protection strategies.

---

## 3. CPCB National AQI Methodology

Unlike generic US EPA AQI calculators, AirGuard AI implements the official **CPCB India** breakpoint and sub-index calculation methodology for PM2.5, PM10, and NO2 across 6 distinct categories:
- **Good (0–50):** Minimal impact.
- **Satisfactory (51–100):** Minor breathing discomfort for sensitive individuals.
- **Moderate (101–200):** Breathing discomfort for people with asthma, lung, and heart disease.
- **Poor (201–300):** Breathing discomfort to most people on prolonged exposure.
- **Very Poor (301–400):** Respiratory illness on prolonged exposure.
- **Severe (401–500+):** Emergency health impact.

---

## 4. API Endpoints

- `GET /api/v1/air-quality/current?location=delhi` — Returns live/modeled current readings, CPCB category, pollutant breakdown, and source attribution.
- `GET /api/v1/air-quality/history?location=delhi&range=24h` — Returns historical time-series observations.
- `GET /api/v1/locations/search?q=mumbai` — Searches supported monitoring locations.
- `GET /api/v1/health` — System health check for cloud orchestration.

---

## 5. AWS Deployment Guide

AirGuard AI is fully containerized and optimized for deployment on **AWS App Runner** or **AWS ECS (Fargate)**.

### Deployment via AWS App Runner (Recommended):
1. Connect your GitHub repository to AWS App Runner.
2. Configure runtime: **Node.js 20** (or Docker).
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Environment Variables:
   - `NODE_ENV=production`
   - `PORT=3000`

### Architecture Diagram:
```
[Client Browser / Mobile] 
       │ (HTTPS)
       ▼
[AWS App Runner / Container] 
       │ 
       ├──► Next.js App Router API Routes (/api/v1/...)
       │         │
       │         └──► OpenAQ Verified API / CPCB Model Adapter
       │
       └──► Client UI (Tailwind CSS, Interactive Charts)
```

---

## 6. Automated Testing

Run unit tests verifying CPCB AQI categorization, sub-index formulas, and data normalization:
```bash
npx vitest run
```

---

## 7. 3-Minute Demo Narrative

- **0:00–0:25 (The Problem):** Citizens see abstract numbers without understanding health impacts or necessary precautions.
- **0:25–1:00 (Live Product):** Select New Delhi / Mumbai, showcasing live CPCB AQI, station metadata, and observation timestamp.
- **1:00–1:40 (Air Analysis):** Inspect PM2.5, PM10, and NO2 concentrations alongside 24-hour historical trends.
- **1:40–2:15 (Actionable Guidance):** Review rule-based precautions for sensitive groups and N95 mask guidance.
- **2:15–2:40 (Engineering):** Explain the provider adapter, CPCB breakpoint formulas, Zod validation, and AWS App Runner deployment.
- **2:40–3:00 (Impact):** Summary of target users (schools, commuters, runners) and scalable public health impact.
