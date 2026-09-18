import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, Calendar, User, ThumbsUp, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

const TIMELINE_STEPS = ['Reported', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Community Verified'];

export default function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [verifyVote, setVerifyVote] = useState('');
  const [verifyComment, setVerifyComment] = useState('');
  const [submittingVerify, setSubmittingVerify] = useState(false);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const res = await fetch(`/api/issues/${id}`);
      const data = await res.json();
      if (res.ok) {
        setIssue(data);
        if (user && data.upvotedBy?.includes(user.id)) {
          setUpvoted(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      alert('Please sign in to upvote issues.');
      return;
    }
    try {
      const res = await fetch(`/api/issues/${id}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('civicflow_token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setIssue(data);
        setUpvoted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyVote) return;
    setSubmittingVerify(true);
    try {
      const res = await fetch(`/api/issues/${id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('civicflow_token')}`
        },
        body: JSON.stringify({ vote: verifyVote, comment: verifyComment })
      });
      const data = await res.json();
      if (res.ok) {
        setIssue(data.issue);
        alert('Thank you! Community verification recorded.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingVerify(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-400">Loading issue details...</div>;
  if (!issue) return <div className="py-20 text-center text-slate-500">Issue not found.</div>;

  const currentStepIndex = TIMELINE_STEPS.findIndex(s => s.toLowerCase() === issue.status.toLowerCase()) !== -1
    ? TIMELINE_STEPS.findIndex(s => s.toLowerCase() === issue.status.toLowerCase())
    : (issue.status === 'Reopened' ? 1 : 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Issues
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-72 md:h-full bg-slate-100">
          <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-mono text-xs font-bold">{issue.id}</span>
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold">{issue.category}</span>
          </div>
        </div>

        <div className="p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                issue.status === 'Community Verified' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Status: {issue.status}
              </span>
              <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> {issue.severity} Severity
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">{issue.title}</h1>
            <p className="text-slate-600 text-sm leading-relaxed">{issue.description}</p>

            <div className="space-y-2 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>{issue.location.address} ({issue.location.neighborhood})</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Reported on {new Date(issue.createdAt).toLocaleDateString()} by {issue.reporterName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="text-xs">
              <span className="text-slate-400 block">Assigned Department</span>
              <span className="font-bold text-slate-800">🏛️ {issue.assignedDepartment}</span>
            </div>

            <button
              onClick={handleUpvote}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                upvoted ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <ThumbsUp className="w-4 h-4" /> {upvoted ? 'Supported' : 'Support Issue'} ({issue.upvotesCount})
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Lifecycle Timeline */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900">Issue Lifecycle & Progress</h2>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step} className="space-y-2">
                <div className={`h-2 rounded-full transition-all ${isCompleted ? 'bg-brand-600' : 'bg-slate-200'}`}></div>
                <div className="text-xs">
                  <span className={`font-bold block ${isCurrent ? 'text-brand-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Reasoning Box */}
      {issue.aiAnalysis && (
        <div className="bg-gradient-to-br from-purple-50 to-brand-50 rounded-3xl p-6 border border-purple-100 space-y-3">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-purple-600" /> Amazon Bedrock AI Intelligence Insight
          </div>
          <p className="text-xs text-purple-800 leading-relaxed">
            "{issue.aiAnalysis.reason}" — Classified under <strong className="text-purple-900">{issue.aiAnalysis.category}</strong> with {issue.aiAnalysis.confidence * 100}% confidence. Routed to <strong className="text-purple-900">{issue.aiAnalysis.department}</strong> department.
          </p>
        </div>
      )}

      {/* Community Verification Section (Differentiating Feature) */}
      {issue.verificationStatus?.status === 'requested' && (
        <div className="bg-white rounded-3xl p-8 border-2 border-brand-500 shadow-lg space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xl">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Community Verification Required</h2>
              <p className="text-xs text-slate-600">Administrator has marked this issue as resolved. Has this issue actually been fixed?</p>
            </div>
          </div>

          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setVerifyVote('resolved')}
                className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all ${verifyVote === 'resolved' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                ✅ Yes, Resolved & Fixed
              </button>
              <button
                type="button"
                onClick={() => setVerifyVote('unresolved')}
                className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all ${verifyVote === 'unresolved' ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                ❌ No, Still Exists
              </button>
            </div>

            <div>
              <input
                type="text"
                value={verifyComment}
                onChange={(e) => setVerifyComment(e.target.value)}
                placeholder="Optional verification comment or observations..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={!verifyVote || submittingVerify}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md text-sm transition-all disabled:opacity-50"
            >
              {submittingVerify ? 'Submitting Verification...' : 'Submit Verification Vote'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
