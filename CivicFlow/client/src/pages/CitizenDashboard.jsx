import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, AlertCircle, CheckCircle2, Clock, MapPin, ShieldAlert, ChevronRight, ThumbsUp } from 'lucide-react';

export default function CitizenDashboard({ onOpenReport }) {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/issues', {
      headers: { Authorization: `Bearer ${localStorage.getItem('civicflow_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setIssues(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const myIssues = issues.filter(i => i.reporterId === user?.id);
  const activeIssues = myIssues.filter(i => !['Resolved', 'Community Verified'].includes(i.status));
  const resolvedIssues = myIssues.filter(i => ['Resolved', 'Community Verified'].includes(i.status));
  const awaitingVerification = myIssues.filter(i => i.verificationStatus?.status === 'requested');
  const nearbyIssues = issues.filter(i => i.reporterId !== user?.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold">
            Citizen Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {user?.name}!</h1>
          <p className="text-slate-400 text-sm">Here is the real-time status of your neighborhood reports and community activity.</p>
        </div>
        <button
          onClick={onOpenReport}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> Report New Issue
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Reported</div>
          <div className="text-3xl font-extrabold text-slate-900">{myIssues.length}</div>
          <div className="text-xs text-brand-600 font-semibold">Your personal contributions</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-amber-600 uppercase">Active / In Progress</div>
          <div className="text-3xl font-extrabold text-slate-900">{activeIssues.length}</div>
          <div className="text-xs text-amber-600 font-semibold">Being handled by municipal crews</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-emerald-600 uppercase">Resolved</div>
          <div className="text-3xl font-extrabold text-slate-900">{resolvedIssues.length}</div>
          <div className="text-xs text-emerald-600 font-semibold">Fixed infrastructure</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-purple-600 uppercase">Awaiting Verification</div>
          <div className="text-3xl font-extrabold text-slate-900">{awaitingVerification.length}</div>
          <div className="text-xs text-purple-600 font-semibold">Needs your verification vote</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Recent Reports</h2>
            <Link to="/issues" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {myIssues.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <p className="text-sm text-slate-500">You haven't reported any issues yet.</p>
                <button
                  onClick={onOpenReport}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
                >
                  Report Your First Issue
                </button>
              </div>
            ) : (
              myIssues.map(issue => (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-brand-500 transition-all flex items-center gap-4 group shadow-sm"
                >
                  <img src={issue.imageUrl} alt={issue.title} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">{issue.id}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700">{issue.category}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                        issue.status === 'Community Verified' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>{issue.status}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">{issue.title}</h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{issue.location.address}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Nearby Feed & Community Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" /> Nearby Civic Issues
            </h2>
            <div className="space-y-3">
              {nearbyIssues.map(issue => (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  className="block p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{issue.category}</span>
                    <span className="text-brand-600 font-semibold flex items-center gap-1"><ThumbsUp className="w-3 h-3"/> {issue.upvotesCount}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-900 line-clamp-1">{issue.title}</div>
                  <div className="text-[10px] text-slate-400">{issue.location.neighborhood}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
