import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, MapPin, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Layers, ShieldAlert } from 'lucide-react';

const CATEGORIES = [
  { id: 'Pothole', label: 'Pothole', icon: '🕳️', desc: 'Road holes & asphalt damage' },
  { id: 'Street Light', label: 'Street Light', icon: '💡', desc: 'Broken lamps & dark poles' },
  { id: 'Garbage', label: 'Garbage', icon: '🗑️', desc: 'Overflowing bins & illegal dumping' },
  { id: 'Water Leakage', label: 'Water Leakage', icon: '🚰', desc: 'Burst pipes & bubbling water' },
  { id: 'Road Damage', label: 'Road Damage', icon: '🚧', desc: 'Cracks, erosion & barriers' },
  { id: 'Drainage', label: 'Drainage', icon: '🌊', desc: 'Blocked drains & stormwater floods' },
  { id: 'Public Safety', label: 'Public Safety', icon: '⚠️', desc: 'Hazards & unsafe structures' },
  { id: 'Other', label: 'Other', icon: '📌', desc: 'General civic infrastructure issues' }
];

export default function ReportIssueModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('Pothole');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('452 Lincoln Ave, Sector 4');
  const [neighborhood, setNeighborhood] = useState('Downtown Sector 4');
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);

  // AI analysis state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Duplicate detection state
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRunAiAnalysis = async () => {
    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/issues/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('civicflow_token')}`
        },
        body: JSON.stringify({ title, description })
      });
      const data = await res.json();
      setAiAnalysis(data);
      if (data.category && CATEGORIES.some(c => c.id === data.category)) {
        setCategory(data.category);
      }
      if (!title && data.summary) setTitle(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzing(false);
      setStep(5);
    }
  };

  const handleCheckDuplicate = async () => {
    setCheckingDuplicate(true);
    try {
      const res = await fetch('/api/issues/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('civicflow_token')}`
        },
        body: JSON.stringify({ category, location: { address, neighborhood } })
      });
      const data = await res.json();
      setDuplicateResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingDuplicate(false);
      setStep(6);
    }
  };

  const handleSubmitFinal = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('severity', aiAnalysis?.severity || 'Medium');
      formData.append('address', address);
      formData.append('neighborhood', neighborhood);
      formData.append('lat', lat);
      formData.append('lng', lng);
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('civicflow_token')}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to report issue');
      setSubmittedIssue(data);
      setStep(7); // Confirmation screen
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvoteExisting = async (existingId) => {
    try {
      await fetch(`/api/issues/${existingId}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('civicflow_token')}` }
      });
      alert('Successfully supported existing report!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Report Community Issue</h2>
              <p className="text-xs text-slate-400">Step {step} of 7 — AI-Assisted Reporting Workflow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div className="bg-brand-500 h-1.5 transition-all duration-300" style={{ width: `${(step / 7) * 100}%` }}></div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-base font-bold text-slate-900">Select Issue Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${category === cat.id ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <span className="text-2xl mb-2">{cat.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{cat.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{cat.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: IMAGE UPLOAD */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-base font-bold text-slate-900">Upload Issue Photo</h3>
              <p className="text-xs text-slate-500">Attach clear photographic evidence for accurate AI classification and faster department dispatch.</p>

              <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-3xl p-8 text-center bg-slate-50 relative transition-colors">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover shadow-md" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setImageFile(null); }}
                      className="text-xs text-rose-600 font-semibold hover:underline"
                    >
                      Remove / Replace Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <label className="cursor-pointer text-sm font-semibold text-brand-600 hover:underline">
                        <span>Click to upload</span>
                        <input type="file" accept="image/*" onChange={image => handleImageChange(image)} className="hidden" />
                      </label>
                      <span className="text-slate-500 text-sm"> or drag and drop</span>
                    </div>
                    <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: TITLE & DESCRIPTION */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-base font-bold text-slate-900">Describe the Issue</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Issue Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Broken street light near school entrance"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what is wrong, how long it has been an issue, and any safety hazards..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: LOCATION */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-base font-bold text-slate-900">Confirm Location</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Street Address or Landmark</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Neighborhood / District</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Coordinates (GPS)</label>
                    <input
                      type="text"
                      value={`${lat}, ${lng}`}
                      onChange={(e) => {
                        const parts = e.target.value.split(',');
                        if (parts.length === 2) {
                          setLat(parseFloat(parts[0]) || 37.7749);
                          setLng(parseFloat(parts[1]) || -122.4194);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Map Preview Simulation */}
                <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">📍</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{address}</div>
                      <div className="text-[10px] text-slate-500">{neighborhood} (Lat: {lat}, Lng: {lng})</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white rounded-lg text-xs font-semibold text-brand-700 border border-brand-200">GPS Locked</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: AI ANALYSIS PREVIEW */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Amazon Bedrock AI Analysis Preview</h3>
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Model v3.0
                </span>
              </div>
              <p className="text-xs text-slate-500">AI-generated suggestion — you can review and edit this before submitting.</p>

              {aiAnalyzing ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-semibold text-slate-600">Analyzing issue category, severity, and routing department...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="bg-gradient-to-br from-purple-50/50 to-brand-50/50 rounded-2xl p-5 border border-purple-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Suggested Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800"
                      >
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Suggested Severity</label>
                      <div className="mt-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-rose-600 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> {aiAnalysis.severity}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Responsible Department</label>
                    <div className="mt-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-800">
                      🏛️ {aiAnalysis.department}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">AI Reasoning & Summary</label>
                    <p className="mt-1 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      "{aiAnalysis.reason}" — <span className="font-semibold text-slate-900">{aiAnalysis.summary}</span>
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 6: DUPLICATE DETECTION & REVIEW */}
          {step === 6 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-base font-bold text-slate-900">Community Duplicate Detection</h3>
              <p className="text-xs text-slate-500">CivicFlow analyzes geographic proximity and category to prevent duplicate work.</p>

              {checkingDuplicate ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500">Checking nearby active reports...</p>
                </div>
              ) : duplicateResult?.hasDuplicate ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600" /> Possible duplicate issue detected!
                  </div>
                  <p className="text-xs text-amber-700">
                    This issue may already have been reported by {duplicateResult.duplicateCount} citizen(s) in this neighborhood.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900">{duplicateResult.existingIssue.title}</div>
                    <div className="text-slate-500">Status: {duplicateResult.existingIssue.status} | Upvotes: {duplicateResult.existingIssue.upvotesCount}</div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleUpvoteExisting(duplicateResult.existingIssue.id)}
                      className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm"
                    >
                      👍 Support Existing Issue ({duplicateResult.existingIssue.upvotesCount} upvotes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(7)}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                    >
                      Report Anyway
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900">No duplicate issues found nearby</div>
                    <div className="text-[10px] text-emerald-700">Your report is unique and ready for submission.</div>
                  </div>
                </div>
              )}

              {/* Review summary box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 text-sm">Final Submission Review</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><strong className="text-slate-800">Title:</strong> {title}</div>
                  <div><strong className="text-slate-800">Category:</strong> {category}</div>
                  <div><strong className="text-slate-800">Location:</strong> {address}</div>
                  <div><strong className="text-slate-800">Department:</strong> {aiAnalysis?.department}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: CONFIRMATION SCREEN */}
          {step === 7 && submittedIssue && (
            <div className="py-8 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                ✓
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">Issue Successfully Reported!</h3>
                <p className="text-xs text-slate-500">Your report has been registered into the municipal system and routed via Amazon EventBridge.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Issue ID:</span> <span className="font-mono font-bold text-slate-900">{submittedIssue.id}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Category:</span> <span className="font-semibold text-slate-900">{submittedIssue.category}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Severity:</span> <span className="font-semibold text-rose-600">{submittedIssue.severity}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Assigned Dept:</span> <span className="font-semibold text-slate-900">{submittedIssue.assignedDepartment}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Current Status:</span> <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">{submittedIssue.status}</span></div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => { onSuccess(); onClose(); }}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md"
                >
                  View My Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Navigation */}
        {step < 7 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 4 && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4" /> Run AI Analysis <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={handleCheckDuplicate}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                Check Duplicates <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 6 && (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitFinal}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold flex items-center gap-2 shadow-md"
              >
                {submitting ? 'Submitting...' : 'Confirm & Submit Report'}
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
