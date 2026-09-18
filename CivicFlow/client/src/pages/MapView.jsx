import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldAlert, Sparkles, Filter, ChevronRight } from 'lucide-react';

export default function MapView() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetch('/api/issues')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setIssues(data);
          if (data.length > 0) setSelectedIssue(data[0]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const filteredIssues = filterCategory === 'All' ? issues : issues.filter(i => i.category === filterCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Live Civic Issue Map</h1>
          <p className="text-slate-600 text-sm">Interactive geographic visualization of community infrastructure reports.</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Pothole</option>
            <option value="Street Light">Street Light</option>
            <option value="Garbage">Garbage</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Drainage">Drainage</option>
          </select>
        </div>
      </div>

      {/* Simulated Map Container with Interactive Pins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl h-[600px] relative overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
          {/* Map Grid Background Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40"></div>

          {/* Map Center Coordinates Badge */}
          <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 text-white text-xs font-mono flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-400" /> Downtown Sector 4 (Lat: 37.7749, Lng: -122.4194)
          </div>

          {/* Interactive Pins placed across map canvas */}
          {filteredIssues.map((issue, idx) => {
            // Calculate pseudo random offset for map display
            const top = 20 + (idx * 18) % 65;
            const left = 15 + (idx * 25) % 70;
            const isSelected = selectedIssue?.id === issue.id;

            return (
              <div
                key={issue.id}
                style={{ top: `${top}%`, left: `${left}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                onClick={() => setSelectedIssue(issue)}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl transition-transform hover:scale-125 ${
                  isSelected ? 'ring-4 ring-brand-400 scale-110 bg-brand-600' :
                  issue.severity === 'Critical' ? 'bg-rose-600' :
                  issue.severity === 'High' ? 'bg-orange-500' : 'bg-brand-500'
                }`}>
                  📍
                </div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap z-10">
                  {issue.id}: {issue.category}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Issue Preview Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          {selectedIssue ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold">{selectedIssue.id}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedIssue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>{selectedIssue.status}</span>
              </div>

              <img src={selectedIssue.imageUrl} alt={selectedIssue.title} className="w-full h-40 object-cover rounded-2xl shadow-sm" />

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">{selectedIssue.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3">{selectedIssue.description}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div><strong>Location:</strong> {selectedIssue.location.address}</div>
                <div><strong>Department:</strong> {selectedIssue.assignedDepartment}</div>
                <div><strong>Severity:</strong> <span className="text-rose-600 font-bold">{selectedIssue.severity}</span></div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-sm">Select a marker on the map to inspect issue details.</div>
          )}

          {selectedIssue && (
            <Link
              to={`/issues/${selectedIssue.id}`}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-center text-xs shadow-md block"
            >
              View Full Issue Details →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
