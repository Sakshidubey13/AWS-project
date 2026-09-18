import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Bell, PlusCircle, MapPin, User, LogOut, Menu, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Navbar({ onOpenAuth, onOpenReport }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('civicflow_token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotifRead = async (id, issueId) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('civicflow_token')}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      if (issueId) {
        navigate(`/issues/${issueId}`);
        setShowNotifs(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              CivicFlow <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200 flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className={`hover:text-brand-600 transition-colors ${location.pathname === '/' ? 'text-brand-600 font-semibold' : ''}`}>
            Home
          </Link>
          <Link to="/issues" className={`hover:text-brand-600 transition-colors ${location.pathname === '/issues' ? 'text-brand-600 font-semibold' : ''}`}>
            Explore Issues
          </Link>
          <Link to="/map" className={`hover:text-brand-600 transition-colors ${location.pathname === '/map' ? 'text-brand-600 font-semibold' : ''} flex items-center gap-1`}>
            <MapPin className="w-4 h-4" /> Live Map
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={`hover:text-brand-600 transition-colors text-purple-600 font-semibold flex items-center gap-1`}>
              <Shield className="w-4 h-4" /> Admin Console
            </Link>
          )}
        </nav>

        {/* Right side CTAs */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={onOpenReport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm shadow-brand-500/20 transition-all hover:shadow-md"
              >
                <PlusCircle className="w-4 h-4" /> Report Issue
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-800">Notifications</span>
                      <span className="text-xs text-slate-500">{notifications.length} total</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markNotifRead(n.id, n.issueId)}
                            className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-brand-50/50' : ''}`}
                          >
                            <div className="text-xs font-semibold text-slate-900">{n.title}</div>
                            <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{user.role}</div>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm shadow-brand-500/20 transition-all hover:shadow-md"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold"
            >
              Report
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Home</Link>
          <Link to="/issues" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Explore Issues</Link>
          <Link to="/map" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Live Map</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-purple-600">Admin Console</Link>
          )}
          {user ? (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">{user.name}</span>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-sm text-rose-600 font-semibold">Logout</button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }} className="flex-1 py-2 text-center text-sm font-semibold border border-slate-300 rounded-lg">Sign In</button>
              <button onClick={() => { onOpenAuth('signup'); setMobileMenuOpen(false); }} className="flex-1 py-2 text-center text-sm font-semibold bg-brand-600 text-white rounded-lg">Sign Up</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
