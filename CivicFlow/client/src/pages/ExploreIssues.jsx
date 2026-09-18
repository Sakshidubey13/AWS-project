import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, ThumbsUp, ChevronRight, Sparkles } from 'lucide-react';

export default function ExploreIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [severity, setSeverity] = useState('All');

  useEffect(() => {
    fetchIssues();
  }, [category, status, severity, search]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (status !== 'All') params.append('status', status);
      if (severity !== 'All') params.append('severity', severity);
      if (search) params.append('search', search);

      const res = await fetch(`/api/issues?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Explore Civic Issues</h1>
        <p className="text-slate-600 text-sm">Browse, search, and support infrastructure reports across the city.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm bg-white font-medium text-slate-700"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Pothole</option>
            <option value="Street Light">Street Light</option>
            <option value="Garbage">Garbage</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Drainage">Drainage</option>
            <option value="Public Safety">Public Safety</option>
          </select>
        </div>

        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm bg-white font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Community Verified">Community Verified</option>
          </select>
        </div>

        <div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm bg-white font-medium text-slate-700"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading civic issues...</div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-2">
          <p className="text-lg font-bold text-slate-800">No issues found</p>
          <p className="text-sm text-slate-500">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map(issue => (
            <Link
              key={issue.id}
              to={`/issues/${issue.id}`}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-brand-500 transition-all hover:shadow-lg flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-mono text-xs font-bold">{issue.id}</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold">{issue.category}</span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                    issue.status === 'Resolved' ? 'bg-emerald-500 text-white' :
                    issue.status === 'Community Verified' ? 'bg-purple-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors line-clamp-1">{issue.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{issue.description}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="truncate">{issue.location.address}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      🏛️ {issue.assignedDepartment || 'General'}
                    </span>
                    <span className="flex items-center gap-1 text-brand-600 font-bold">
                      <ThumbsUp className="w-3.5 h-3.5" /> {issue.upvotesCount}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
