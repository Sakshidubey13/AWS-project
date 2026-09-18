import React, { useState, useEffect } from 'react';
import { Shield, BarChart3, Layers, MapPin, Users, Settings, Search, CheckCircle, AlertTriangle, ChevronRight, Plus, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, issuesRes] = await Promise.all([
        fetch('/api/analytics', { headers: { Authorization: `Bearer ${localStorage.getItem('civicflow_token')}` } }),
        fetch('/api/issues')
      ]);
      const analyticsData = await analyticsRes.json();
      const issuesData = await issuesRes.json();
      setAnalytics(analyticsData);
      if (Array.isArray(issuesData)) setIssues(issuesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (issueId, newStatus) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('civicflow_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      if (res.ok) {
        setIssues(issues.map(i => i.id === updated.id ? updated : i));
        if (selectedIssue?.id === updated.id) setSelectedIssue(updated);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote || !selectedIssue) return;
    try {
      const res = await fetch(`/api/issues/${selectedIssue.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('civicflow_token')}`
        },
        body: JSON.stringify({ note: newNote })
      });
      const updated = await res.json();
      if (res.ok) {
        setSelectedIssue(updated);
        setIssues(issues.map(i => i.id === updated.id ? updated : i));
        setNewNote('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col justify-between border-r border-slate-800">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
              🛡️
            </div>
            <div>
              <span className="text-base font-extrabold text-white">Admin Console</span>
              <span className="text-[10px] block text-purple-400 font-mono">CivicFlow Municipal</span>
            </div>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            {[
              { id: 'overview', label: 'Overview & Metrics', icon: BarChart3 },
              { id: 'issues', label: 'Issue Management', icon: Layers },
              { id: 'map', label: 'Geographic Map', icon: MapPin },
              { id: 'users', label: 'Citizens & Operators', icon: Users },
              { id: 'settings', label: 'System Settings', icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === item.id ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
          <div>CivicFlow v2.4 Enterprise</div>
          <div className="text-emerald-400 mt-1">● AWS Cloud Connected</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 capitalize">{activeTab} Dashboard</h1>
            <p className="text-xs text-slate-500">Real-time database metrics and municipal issue triage.</p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">Total Reports</div>
                <div className="text-3xl font-extrabold text-slate-900">{analytics.metrics.totalReports}</div>
                <div className="text-xs text-brand-600 font-semibold">{analytics.metrics.resolutionRate}% resolution efficiency</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-xs font-bold text-amber-600 uppercase">Pending Review</div>
                <div className="text-3xl font-extrabold text-slate-900">{analytics.metrics.pendingReview}</div>
                <div className="text-xs text-amber-600 font-semibold">Awaiting department routing</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-xs font-bold text-purple-600 uppercase">In Progress</div>
                <div className="text-3xl font-extrabold text-slate-900">{analytics.metrics.inProgress}</div>
                <div className="text-xs text-purple-600 font-semibold">Crews dispatched</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-xs font-bold text-rose-600 uppercase">High Priority</div>
                <div className="text-3xl font-extrabold text-slate-900">{analytics.metrics.highPriority}</div>
                <div className="text-xs text-rose-600 font-semibold">Critical safety hazards</div>
              </div>
            </div>

            {/* Category & Status Breakdown Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Issues by Category</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.categoryCounts).map(([cat, count]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{cat}</span>
                        <span className="text-slate-900">{count} issues</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(count / analytics.metrics.totalReports) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Priority Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.priorityCounts).map(([priority, count]) => (
                    <div key={priority} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{priority} Priority</span>
                        <span className="text-slate-900">{count} reports</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full ${
                          priority === 'Critical' ? 'bg-rose-600' :
                          priority === 'High' ? 'bg-orange-500' :
                          priority === 'Medium' ? 'bg-amber-500' : 'bg-brand-500'
                        }`} style={{ width: `${(count / (analytics.metrics.totalReports || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ISSUES MANAGEMENT TAB */}
        {activeTab === 'issues' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Issues Table */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 font-bold text-slate-900">Issue Triage & Management</div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {issues.map(issue => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between ${selectedIssue?.id === issue.id ? 'bg-purple-50/50 border-l-4 border-purple-600' : ''}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">{issue.id}</span>
                        <span className="text-xs font-bold text-slate-900">{issue.title}</span>
                      </div>
                      <div className="text-xs text-slate-500">Dept: {issue.assignedDepartment} | Location: {issue.location.address}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>{issue.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Issue Detail & Actions Panel */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              {selectedIssue ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-600">{selectedIssue.id}</span>
                    <span className="text-xs text-rose-600 font-bold">{selectedIssue.severity}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{selectedIssue.title}</h3>
                  <p className="text-xs text-slate-600">{selectedIssue.description}</p>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Change Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Under Review', 'Assigned', 'In Progress', 'Resolved'].map(st => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(selectedIssue.id, st)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${selectedIssue.status === st ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Internal Notes Section */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase">Internal Staff Notes</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedIssue.internalNotes.map((note, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="font-bold text-slate-800">{note.author}</div>
                          <p className="text-slate-600 mt-0.5">{note.note}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleAddNote} className="flex gap-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add internal note..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold">Add</button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs">Select an issue from the list to manage status, department routing, and internal notes.</div>
              )}
            </div>
          </div>
        )}

        {/* MAP TAB */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900">Municipal Geographic Command Center</h3>
            <p className="text-sm text-slate-500">Real-time spatial visualization and pin clustering.</p>
            <a href="/map" className="inline-block px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-md">
              Open Full Interactive Map →
            </a>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900">Registered Citizens & Municipal Operators</h3>
            <p className="text-sm text-slate-500">Role-based access control and verification permissions.</p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                <span>Name</span><span>Email</span><span>Role</span><span>Department</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sarah Jenkins</span><span>admin@civicflow.org</span><span className="text-purple-600 font-bold">Admin</span><span>City Operations</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Alex Rivera</span><span>alex@example.com</span><span className="text-brand-600 font-bold">Citizen</span><span>-</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Marcus Vance</span><span>electrical@civicflow.org</span><span className="text-blue-600 font-bold">Operator</span><span>Electrical</span>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900">System Integration & AWS Cloud Settings</h3>
            <p className="text-sm text-slate-500">Manage Amazon S3 bucket permissions, Bedrock AI endpoints, and EventBridge hooks.</p>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div><strong>Amazon Bedrock Claude 3 AI</strong><div className="text-slate-500">Auto-classification & summarization</div></div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">Connected</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div><strong>Amazon S3 Image Bucket</strong><div className="text-slate-500">civicflow-production-evidence-bucket</div></div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">Connected</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div><strong>Amazon EventBridge</strong><div className="text-slate-500">Event-driven notification dispatcher</div></div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">Active</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
