import React from 'react';
import { Shield, Sparkles, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">CivicFlow</span>
            </div>
            <p className="text-sm text-slate-400">
              AI-powered civic issue reporting, prioritization, tracking, and community verification platform for modern smart cities.
            </p>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/issues" className="hover:text-white transition-colors">Explore Issues</a></li>
              <li><a href="/map" className="hover:text-white transition-colors">Live Civic Map</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">AI Intelligence</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Municipal Gov</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/admin" className="hover:text-white transition-colors">Admin Dashboard</a></li>
              <li><a href="/admin" className="hover:text-white transition-colors">Department Routing</a></li>
              <li><a href="/admin" className="hover:text-white transition-colors">Analytics & Insights</a></li>
              <li><a href="/admin" className="hover:text-white transition-colors">Community Verification</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Cloud Architecture</h3>
            <p className="text-xs text-slate-400 mb-3">
              Powered by Amazon S3, AWS Bedrock AI, Amazon EventBridge, and DynamoDB-ready storage.
            </p>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-slate-800 text-[10px] text-brand-400 font-mono">AWS Lambda Ready</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[10px] text-brand-400 font-mono">Bedrock Claude</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; 2026 CivicFlow Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Security & Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
