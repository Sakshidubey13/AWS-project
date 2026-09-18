import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Sparkles, CheckCircle2, ArrowRight, MapPin, BarChart3, Users, Clock, AlertTriangle, CheckSquare } from 'lucide-react';

export default function LandingPage({ onOpenAuth, onOpenReport }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-20 pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> Powered by Amazon Bedrock AI & EventBridge Workflows
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Make Your <span className="bg-gradient-to-r from-brand-400 to-emerald-300 bg-clip-text text-transparent">Neighborhood Heard.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal">
            Report local problems, track their progress in real-time, and help build better smart communities — all from one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenReport}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-xl shadow-brand-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Report an Issue <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/issues"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              Explore Issues
            </Link>
          </div>

          {/* Dashboard Preview Graphic */}
          <div className="pt-12 max-w-5xl mx-auto">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-xl relative">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Total Municipal Reports</div>
                  <div className="text-2xl font-bold text-white">1,428</div>
                  <div className="text-xs text-brand-400 font-semibold flex items-center gap-1">↑ 18% resolution efficiency</div>
                </div>
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Active AI Classifications</div>
                  <div className="text-2xl font-bold text-purple-400">99.4%</div>
                  <div className="text-xs text-purple-300 font-semibold">Amazon Bedrock Claude 3</div>
                </div>
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Community Verified Fixed</div>
                  <div className="text-2xl font-bold text-emerald-400">89.2%</div>
                  <div className="text-xs text-emerald-300 font-semibold">Peer-reviewed resolution</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How CivicFlow Works */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How CivicFlow Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">A seamless lifecycle designed to turn citizen reports into resolved community infrastructure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[
            { step: '01', title: 'Report', desc: 'Snap a photo and submit issue in seconds.', color: 'from-blue-500 to-cyan-500' },
            { step: '02', title: 'Analyze', desc: 'Bedrock AI auto-categorizes severity and department.', color: 'from-purple-500 to-indigo-500' },
            { step: '03', title: 'Prioritize', desc: 'Admin dashboard ranks issues by safety & impact.', color: 'from-amber-500 to-orange-500' },
            { step: '04', title: 'Assign', desc: 'Routed instantly to municipal field operators.', color: 'from-emerald-500 to-teal-500' },
            { step: '05', title: 'Resolve', desc: 'Crews fix infrastructure and update status.', color: 'from-brand-600 to-emerald-400' },
            { step: '06', title: 'Verify', desc: 'Nearby citizens verify if the fix is real.', color: 'from-violet-600 to-purple-500' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} text-white font-bold flex items-center justify-center text-sm mb-4 shadow-md`}>
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features & AI Intelligence */}
      <section className="bg-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" /> Intelligent Automation
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Meaningful AI & Community Verification
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                CivicFlow avoids gimmicky features. Every tool is built to solve real municipal friction points:
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 font-bold">✓</div>
                  <div>
                    <h3 className="font-semibold text-white">Amazon Bedrock Classification</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Automatically parses citizen descriptions to assign category, severity, and department routing.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 font-bold">✓</div>
                  <div>
                    <h3 className="font-semibold text-white">Community Duplicate Detection</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Prevents redundant work by detecting nearby reports and offering upvote support.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 font-bold">✓</div>
                  <div>
                    <h3 className="font-semibold text-white">Citizen Resolution Verification</h3>
                    <p className="text-xs text-slate-400 mt-0.5">When admin marks resolved, nearby citizens verify if the problem is fixed. If not, it auto-reopens.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <span className="text-xs font-mono text-purple-400">BEDROCK_AI_RESPONSE.json</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto p-4 bg-slate-900 rounded-2xl border border-slate-800">
{`{
  "category": "Street Light",
  "severity": "High",
  "department": "Electrical",
  "confidence": 0.96,
  "reason": "Public safety risk near school",
  "summary": "Broken street light creating nighttime hazard near school."
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 max-w-5xl mx-auto px-4 text-center space-y-8">
        <div className="bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-3xl p-12 text-white shadow-2xl space-y-6 relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to Transform Your Community?</h2>
          <p className="text-brand-100 max-w-xl mx-auto text-sm">
            Join thousands of citizens and municipal operators building cleaner, safer, and smarter cities with CivicFlow.
          </p>
          <button
            onClick={onOpenReport}
            className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-base hover:bg-brand-50 transition-all shadow-lg"
          >
            Report an Issue Now
          </button>
        </div>
      </section>
    </div>
  );
}
