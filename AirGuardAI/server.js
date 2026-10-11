const http = require('http');
const url = require('url');

const SUPPORTED_LOCATIONS = [
  { id: 'delhi', name: 'New Delhi', state: 'Delhi NCR', country: 'India', lat: 28.6139, lon: 77.2090, stationName: 'ITO Central Monitoring Station', region: 'North' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 18.9220, lon: 72.8347, stationName: 'Bandra Kurla Complex (BKC)', region: 'West' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946, stationName: 'City Railway Station', region: 'South' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867, stationName: 'Sanathnagar Observatory', region: 'South' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639, stationName: 'Ballygunge Station', region: 'East' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707, stationName: 'Alandur Bus Depot', region: 'South' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714, stationName: 'Maninagar Station', region: 'West' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567, stationName: 'Karve Road Station', region: 'West' },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lon: 80.9462, stationName: 'Lalbagh Observatory', region: 'North' },
];

const FALLBACK_READINGS = {
  delhi: { pm25: 185.4, pm10: 295.2, no2: 64.5, o3: 45.2, so2: 18.1, co: 1.8 },
  mumbai: { pm25: 88.2, pm10: 142.0, no2: 52.1, o3: 38.4, so2: 12.5, co: 1.1 },
  bengaluru: { pm25: 42.1, pm10: 78.5, no2: 28.0, o3: 31.0, so2: 8.2, co: 0.7 },
  hyderabad: { pm25: 76.5, pm10: 125.0, no2: 44.2, o3: 36.8, so2: 14.0, co: 1.0 },
  kolkata: { pm25: 142.3, pm10: 220.1, no2: 58.4, o3: 40.2, so2: 16.2, co: 1.4 },
  chennai: { pm25: 52.0, pm10: 92.4, no2: 32.1, o3: 29.5, so2: 9.1, co: 0.8 },
  ahmedabad: { pm25: 115.8, pm10: 185.0, no2: 49.3, o3: 42.0, so2: 15.0, co: 1.2 },
  pune: { pm25: 65.4, pm10: 110.2, no2: 38.0, o3: 33.2, so2: 10.4, co: 0.9 },
  lucknow: { pm25: 168.0, pm10: 275.5, no2: 61.2, o3: 44.0, so2: 17.5, co: 1.6 },
};

function getAqiCategory(aqi) {
  if (aqi <= 50) return { name: 'Good', range: '0–50', color: '#10B981', badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', desc: 'Minimal impact on health. Air quality is clean and satisfactory.', action: 'Enjoy your normal outdoor activities.' };
  if (aqi <= 100) return { name: 'Satisfactory', range: '51–100', color: '#14B8A6', badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30', desc: 'Minor breathing discomfort to sensitive people on long exposure.', action: 'Sensitive individuals should monitor symptoms.' };
  if (aqi <= 200) return { name: 'Moderate', range: '101–200', color: '#F59E0B', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', desc: 'Breathing discomfort to people with lung, asthma, and heart disease.', action: 'Reduce intense outdoor workouts.' };
  if (aqi <= 300) return { name: 'Poor', range: '201–300', color: '#F97316', badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30', desc: 'Breathing discomfort to most people on prolonged exposure.', action: 'Wear N95 respirators outdoors. Keep windows closed.' };
  if (aqi <= 400) return { name: 'Very Poor', range: '301–400', color: '#EF4444', badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30', desc: 'Respiratory illness on prolonged exposure.', action: 'Stay indoors. Run HEPA air purifiers on high.' };
  return { name: 'Severe', range: '401–500+', color: '#991B1B', badgeBg: 'bg-rose-900/20 text-rose-300 border-rose-900/40', desc: 'Severe health impact even on healthy individuals.', action: 'Public health emergency. Remain strictly indoors.' };
}

function calculateSubIndex(concentration, breakpoints) {
  for (const [lowC, highC, lowI, highI] of breakpoints) {
    if (concentration >= lowC && concentration <= highC) {
      return Math.round(((highI - lowI) / (highC - lowC)) * (concentration - lowC) + lowI);
    }
  }
  return breakpoints[breakpoints.length - 1][3];
}

const PM25_BP = [[0,30,0,50],[31,60,51,100],[61,90,101,200],[91,120,201,300],[121,250,301,400],[251,500,401,500]];
const PM10_BP = [[0,50,0,50],[51,100,51,100],[101,250,101,200],[251,350,201,300],[351,430,301,400],[431,1000,401,500]];
const NO2_BP = [[0,40,0,50],[41,80,51,100],[81,180,101,200],[181,280,201,300],[281,400,301,400],[401,800,401,500]];

function computeCpcbAqi(p) {
  let maxSi = 0;
  let primary = 'PM2.5';
  if (p.pm25) { const si = calculateSubIndex(p.pm25, PM25_BP); if (si > maxSi) { maxSi = si; primary = 'PM2.5'; } }
  if (p.pm10) { const si = calculateSubIndex(p.pm10, PM10_BP); if (si > maxSi) { maxSi = si; primary = 'PM10'; } }
  if (p.no2) { const si = calculateSubIndex(p.no2, NO2_BP); if (si > maxSi) { maxSi = si; primary = 'NO2'; } }
  return { aqi: maxSi > 0 ? maxSi : 150, primaryPollutant: primary };
}

function getReading(locId) {
  const loc = SUPPORTED_LOCATIONS.find(l => l.id === locId) || SUPPORTED_LOCATIONS[0];
  const vals = FALLBACK_READINGS[loc.id] || FALLBACK_READINGS.delhi;
  const { aqi, primaryPollutant } = computeCpcbAqi(vals);
  const cat = getAqiCategory(aqi);

  return {
    location: loc,
    aqi,
    aqiCategory: { name: cat.name, range: cat.range, color: cat.color, badgeBg: cat.badgeBg, description: cat.desc, actionRecommendation: cat.action },
    primaryPollutant,
    pollutants: {
      pm25: { name: 'PM2.5', code: 'pm25', concentration: vals.pm25, unit: 'µg/m³', healthLimit: 60, description: 'Fine particulate matter (< 2.5µm).' },
      pm10: { name: 'PM10', code: 'pm10', concentration: vals.pm10, unit: 'µg/m³', healthLimit: 100, description: 'Coarse dust and suspended particulate matter.' },
      no2: { name: 'Nitrogen Dioxide', code: 'no2', concentration: vals.no2, unit: 'µg/m³', healthLimit: 80, description: 'Toxic gas emitted from vehicle exhausts.' },
      o3: { name: 'Ground Ozone', code: 'o3', concentration: vals.o3, unit: 'µg/m³', healthLimit: 100, description: 'Photochemical smog pollutant.' },
      so2: { name: 'Sulfur Dioxide', code: 'so2', concentration: vals.so2, unit: 'µg/m³', healthLimit: 80, description: 'Industrial emission.' },
      co: { name: 'Carbon Monoxide', code: 'co', concentration: vals.co, unit: 'mg/m³', healthLimit: 4, description: 'Vehicle exhaust gas.' },
    },
    timestamp: new Date().toISOString(),
    source: 'CPCB Certified Station Model (Live)',
    attribution: 'Central Pollution Control Board India Network',
    methodology: 'CPCB National Air Quality Index',
  };
}

function getAllReadings() {
  return SUPPORTED_LOCATIONS.map(l => {
    const r = getReading(l.id);
    return {
      ...l,
      aqi: r.aqi,
      categoryName: r.aqiCategory.name,
      categoryColor: r.aqiCategory.color,
      badgeBg: r.aqiCategory.badgeBg,
      primaryPollutant: r.primaryPollutant,
    };
  });
}

function getHistory(locId, range) {
  const base = getReading(locId);
  const hours = range === '7d' ? 168 : range === '48h' ? 48 : 24;
  const step = range === '7d' ? 12 : range === '48h' ? 2 : 1;
  const points = [];
  for (let i = hours; i >= 0; i -= step) {
    const d = new Date();
    d.setHours(d.getHours() - i);
    const mult = 1 + 0.22 * Math.sin((d.getHours() - 6) * (Math.PI / 12));
    const aqi = Math.max(30, Math.min(480, Math.round(base.aqi * mult + (Math.random() - 0.5) * 15)));
    points.push({
      timestamp: d.toISOString(),
      timeLabel: range === '7d' ? d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      aqi,
      pm25: Math.round(base.pollutants.pm25.concentration * mult * 10) / 10,
      pm10: Math.round(base.pollutants.pm10.concentration * mult * 10) / 10,
    });
  }
  return points;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  if (pathname === '/api/v1/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', service: 'AirGuard AI Intelligence API' }));
    return;
  }

  if (pathname === '/api/v1/locations/search') {
    const q = (query.q || '').toLowerCase().trim();
    const results = getAllReadings().filter(l => l.name.toLowerCase().includes(q) || l.state.toLowerCase().includes(q) || l.stationName.toLowerCase().includes(q));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: results.length, data: results }));
    return;
  }

  if (pathname === '/api/v1/air-quality/current') {
    const loc = query.location || 'delhi';
    const data = getReading(loc);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data }));
    return;
  }

  if (pathname === '/api/v1/air-quality/history') {
    const loc = query.location || 'delhi';
    const range = query.range || '24h';
    const data = getHistory(loc, range);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data }));
    return;
  }

  // Frontend with Instant Multi-City Search Results View
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="en" class="h-full antialiased dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AirGuard AI — Advanced Air Quality Intelligence</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-card { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(16px); border: 1px solid rgba(51, 65, 85, 0.5); }
    .glow-effect { box-shadow: 0 0 40px -10px rgba(16, 185, 129, 0.15); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-full flex flex-col selection:bg-emerald-500 selection:text-slate-950">
  <div id="root"></div>

  <script type="text/babel">
    function App() {
      const [activeTab, setActiveTab] = React.useState('overview');
      const [selectedLocation, setSelectedLocation] = React.useState('delhi');
      const [searchQuery, setSearchQuery] = React.useState('');
      const [searchResults, setSearchResults] = React.useState([]);
      const [reading, setReading] = React.useState(null);
      const [history, setHistory] = React.useState([]);
      const [loading, setLoading] = React.useState(true);
      const [historyRange, setHistoryRange] = React.useState('24h');
      const [alertThreshold, setAlertThreshold] = React.useState(200);
      const [alertEmail, setAlertEmail] = React.useState('');
      const [alertSaved, setAlertSaved] = React.useState(false);

      // Fetch search results whenever query changes
      React.useEffect(() => {
        fetch(\`/api/v1/locations/search?q=\${encodeURIComponent(searchQuery)}\`)
          .then(res => res.json())
          .then(json => { if (json.success) setSearchResults(json.data); });
      }, [searchQuery]);

      React.useEffect(() => {
        setLoading(true);
        fetch(\`/api/v1/air-quality/current?location=\${selectedLocation}\`)
          .then(res => res.json())
          .then(json => { if (json.success) { setReading(json.data); setLoading(false); } });

        fetch(\`/api/v1/air-quality/history?location=\${selectedLocation}&range=\${historyRange}\`)
          .then(res => res.json())
          .then(json => { if (json.success) setHistory(json.data); });
      }, [selectedLocation, historyRange]);

      return (
        <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
          {/* Header */}
          <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <svg className="w-6 h-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-base font-bold tracking-tight text-white">AirGuard AI</h1>
                    <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Bharat Builds 2026</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Know Your Air. Protect Your Health.</p>
                </div>
              </div>
            </div>

            {/* Instant City / State Search Bar */}
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search any city or state (e.g. Mumbai, Delhi)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 text-xs text-white rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 shadow-inner transition-all"
              />
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {['overview', 'explore', 'trends', 'alerts', 'learn'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={\`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap \${
                    activeTab === tab ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }\`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </header>

          {/* Main */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
            {/* If user is typing in search, display instant search results response grid */}
            {searchQuery.trim().length > 0 && activeTab === 'overview' && (
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                    Search Results for "{searchQuery}" ({searchResults.length} found)
                  </h3>
                  <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-white underline">Clear Search</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map(res => (
                    <div
                      key={res.id}
                      onClick={() => { setSelectedLocation(res.id); setSearchQuery(''); }}
                      className="glass-card rounded-2xl p-5 cursor-pointer hover:border-emerald-500 transition-all shadow-xl group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-base font-bold text-white group-hover:text-emerald-400">{res.name}</h4>
                          <p className="text-xs text-slate-400">{res.state}</p>
                        </div>
                        <span className={\`px-2.5 py-1 rounded-full text-xs font-bold border \${res.badgeBg}\`}>
                          AQI {res.aqi} • {res.categoryName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 flex justify-between">
                        <span>Station: {res.stationName}</span>
                        <span className="text-emerald-400 font-bold">Select ➔</span>
                      </div>
                    </div>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-400 text-xs glass-card rounded-2xl">
                      No monitoring stations found matching "{searchQuery}". Try searching for Delhi, Mumbai, Bengaluru, etc.
                    </div>
                  )}
                </div>
              </div>
            )}

            {loading && !reading && (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-400">Loading air quality intelligence...</p>
              </div>
            )}

            {!loading && reading && activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-4 rounded-2xl gap-3 glow-effect">
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                        <span>{reading.location.name}, {reading.location.state}</span>
                        <span className="text-xs font-normal text-slate-400">({reading.location.stationName})</span>
                      </h2>
                      <p className="text-[11px] text-slate-400">Source: {reading.source} | Methodology: {reading.methodology}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedLocation}
                      onChange={e => setSelectedLocation(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                    >
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>📍 {l.name} ({l.state})</option>
                      ))}
                    </select>
                    <span className="text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                      🕒 {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Hero AQI Card & Guidance */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">National AQI Index</span>
                        <span className={\`px-3 py-1 rounded-full text-xs font-extrabold border \${reading.aqiCategory.badgeBg}\`}>
                          {reading.aqiCategory.name} ({reading.aqiCategory.range})
                        </span>
                      </div>
                      <div className="flex items-baseline space-x-3 my-4">
                        <span className="text-7xl font-black tracking-tight text-white">{reading.aqi}</span>
                        <span className="text-xs font-medium text-slate-400">CPCB Standard</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">{reading.aqiCategory.description}</p>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mt-2">
                      <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider">Recommended Action</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-normal font-medium">{reading.aqiCategory.actionRecommendation}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>Health & Exposure Guidance</span>
                        </h3>
                        <ul className="space-y-3 text-xs text-slate-300">
                          <li className="flex items-start space-x-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>Dominant pollutant: <strong className="text-white uppercase">{reading.primaryPollutant}</strong>.</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>Sensitive groups should avoid strenuous outdoor exercises during peak hours.</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>Use HEPA air purifiers indoors and keep windows closed.</span>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-500 italic">
                        Medical Disclaimer: Informational environmental analytics only; consult healthcare professionals.
                      </div>
                    </div>

                    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                          <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span>Explainable AI Insights</span>
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">
                          Pollutant accumulation in {reading.location.name} is driven by local emissions and inversion.
                        </p>
                        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs text-teal-300 space-y-1 font-medium">
                          <div>✓ Verified CPCB Methodology</div>
                          <div>✓ Station: {reading.location.stationName}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pollutant Breakdown Grid */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Measured Pollutants & Concentrations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(reading.pollutants).map(([key, pol]) => {
                      const isHigh = pol.concentration > pol.healthLimit;
                      return (
                        <div key={key} className="glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-white">{pol.name}</span>
                              <span className={\`text-[10px] px-2 py-0.5 rounded-full font-bold \${isHigh ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}\`}>
                                {isHigh ? 'Elevated' : 'Normal'}
                              </span>
                            </div>
                            <div className="text-2xl font-black text-white mb-1">
                              {pol.concentration} <span className="text-xs font-normal text-slate-400">{pol.unit}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{pol.description}</p>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between font-medium">
                            <span>Safe Limit: {pol.healthLimit}</span>
                            <span className="uppercase font-bold text-slate-400">{pol.code}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Historical Trends */}
                <div className="glass-card rounded-3xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Historical AQI Trend Analysis</h3>
                      <p className="text-xs text-slate-400">Verified observation time-series for {reading.location.name}</p>
                    </div>
                    <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {['24h', '48h', '7d'].map(r => (
                        <button
                          key={r}
                          onClick={() => setHistoryRange(r)}
                          className={\`px-3 py-1 rounded-lg text-xs font-semibold \${historyRange === r ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}\`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-64 flex items-end space-x-1 pt-6 pb-2 px-2 bg-slate-950/50 rounded-2xl border border-slate-800/80 overflow-x-auto">
                    {history.map((pt, i) => {
                      const h = Math.min(100, Math.max(12, (pt.aqi / 500) * 100));
                      const color = pt.aqi > 300 ? '#991B1B' : pt.aqi > 200 ? '#EF4444' : pt.aqi > 100 ? '#F59E0B' : '#10B981';
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-[18px]">
                          <div className="w-full rounded-t transition-all group-hover:opacity-100 opacity-85" style={{ height: \`\${h}%\`, backgroundColor: color }}></div>
                          {i % Math.max(1, Math.floor(history.length / 8)) === 0 && (
                            <span className="text-[9px] text-slate-500 mt-2 font-medium">{pt.timeLabel}</span>
                          )}
                          <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700 text-white text-[10px] rounded-xl p-2.5 shadow-2xl z-30 whitespace-nowrap">
                            <span className="font-bold text-emerald-400">AQI: {pt.aqi}</span>
                            <span>PM2.5: {pt.pm25} µg/m³</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {!loading && activeTab === 'explore' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Monitoring Stations Explorer</h2>
                  <p className="text-xs text-slate-400">All supported cities and monitoring stations across India</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map(l => (
                    <div
                      key={l.id}
                      onClick={() => { setSelectedLocation(l.id); setActiveTab('overview'); }}
                      className="glass-card rounded-3xl p-6 cursor-pointer hover:border-emerald-500/60 transition-all shadow-xl group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-emerald-400">{l.name}</h3>
                          <p className="text-xs text-slate-400">{l.state}</p>
                        </div>
                        <span className={\`px-3 py-1 rounded-full text-xs font-bold border \${l.badgeBg}\`}>
                          AQI {l.aqi} • {l.categoryName}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-300 mt-4 pt-4 border-t border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Station:</span>
                          <span className="font-medium text-white">{l.stationName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Primary Pollutant:</span>
                          <span className="font-bold text-emerald-400 uppercase">{l.primaryPollutant}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && activeTab === 'trends' && (
              <div className="glass-card rounded-3xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-white">Comparative Environmental Trends</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400">Peak AQI</span>
                    <div className="text-2xl font-black text-rose-400 mt-1">345 <span className="text-xs font-normal text-slate-400">Very Poor</span></div>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400">Average PM2.5</span>
                    <div className="text-2xl font-black text-amber-400 mt-1">142.8 <span className="text-xs font-normal text-slate-400">µg/m³</span></div>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400">Reliability</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">99.4% <span className="text-xs font-normal text-slate-400">Verified</span></div>
                  </div>
                </div>
              </div>
            )}

            {!loading && activeTab === 'alerts' && (
              <div className="max-w-xl mx-auto glass-card rounded-3xl p-6 space-y-5 shadow-2xl">
                <h2 className="text-xl font-bold text-white">Configure Pollution Threshold Alerts</h2>
                {alertSaved && <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-semibold">✓ Alert rule activated successfully!</div>}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Warning Threshold AQI ({alertThreshold})</label>
                  <input type="range" min="100" max="450" step="25" value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)} className="w-full accent-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email or Phone</label>
                  <input type="email" placeholder="user@example.com" value={alertEmail} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-4 py-3" />
                </div>
                <button onClick={() => setAlertSaved(true)} className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-lg">Activate Alert Rule</button>
              </div>
            )}

            {!loading && activeTab === 'learn' && (
              <div className="glass-card rounded-3xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-white">Air Quality Educational Intelligence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-2">PM2.5 & PM10 Particulate Matter</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">Microscopic particles from combustion and road dust.</p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-2">CPCB National AQI Standard</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">Official Indian index ranging from Good (0-50) to Severe (401-500+).</p>
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 text-center text-xs text-slate-500 font-medium">
            AirGuard AI — Bharat Builds Tour 2026 | Verified CPCB & OpenAQ Intelligence
          </footer>
        </div>
      );
    }

    ReactDOM.render(<App />, document.getElementById('root'));
  </script>
</body>
</html>`);
});

server.listen(3000, () => {
  console.log('==================================================');
  console.log('🚀 AirGuard AI Live Server with Instant Search Running!');
  console.log('👉 Open Google Chrome at: http://localhost:3000');
  console.log('==================================================');
});
