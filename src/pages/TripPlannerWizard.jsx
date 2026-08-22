import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Users, 
  Wallet, 
  Heart, 
  Gauge, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  Camera,
  Utensils,
  Mountain,
  Moon,
  Coffee,
  Landmark,
  ShoppingBag,
  Pencil
} from 'lucide-react';

// --- CONSTANTS & CONFIG ---
const INTERESTS_OPTIONS = [
  { id: 'sightseeing', label: 'Sightseeing', icon: Camera },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'adventure', label: 'Adventure', icon: Mountain },
  { id: 'nightlife', label: 'Nightlife', icon: Moon },
  { id: 'relaxation', label: 'Relaxation', icon: Coffee },
  { id: 'culture', label: 'Culture & History', icon: Landmark },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
];

const PACE_OPTIONS = [
  { id: 'relaxed', label: 'Relaxed', desc: '2-3 activities/day' },
  { id: 'balanced', label: 'Balanced', desc: '4-5 activities/day' },
  { id: 'packed', label: 'Packed', desc: '6+ activities/day' },
];

const BUDGET_TIERS = [
  { id: 'budget', label: 'Budget' },
  { id: 'mid-range', label: 'Mid-range' },
  { id: 'luxury', label: 'Luxury' },
];

const GENERATION_MESSAGES = [
  "Finding the best spots...",
  "Checking local recommendations...",
  "Balancing your budget...",
  "Packing in the adventure...",
  "Finalizing your perfect itinerary..."
];

export default function TripPlannerWizard({ 
  tripId = 'trip-1', 
  tripName = 'My Trip', 
  startDate, 
  endDate, 
  onItineraryGenerated 
}) {
  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  
  const [formData, setFormData] = useState({
    destinations: '',
    travelers: 2,
    budget: '',
    budgetTier: 'mid-range',
    interests: [],
    pace: 'balanced',
    notes: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMsgIndex, setGenerationMsgIndex] = useState(0);
  const [error, setError] = useState(null);

  // --- GENERATION ANIMATION EFFECT ---
  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationMsgIndex(prev => (prev + 1) % GENERATION_MESSAGES.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // --- HANDLERS ---
  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setDirection('forward');
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const handleBack = () => {
    setDirection('backward');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleJumpToStep = (step) => {
    setDirection(step > currentStep ? 'forward' : 'backward');
    setCurrentStep(step);
  };

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (id) => {
    setFormData(prev => {
      const interests = prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id];
      return { ...prev, interests };
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentStep < 7) {
      e.preventDefault();
      handleNext();
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1: return formData.destinations.trim().length > 0;
      case 2: return formData.travelers > 0;
      case 3: return true; // Budget can be optional or just tier based
      case 4: return formData.interests.length > 0;
      case 5: return !!formData.pace;
      case 6: return true; // Notes optional
      case 7: return true;
      default: return false;
    }
  };

  // --- REAL API CALL ---
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationMsgIndex(0);

    try {
      const payload = {
        destinations: formData.destinations,
        traveler_count: formData.travelers,
        budget: Number(formData.budget) || 100000,
        currency: 'INR',
        budget_tier: formData.budgetTier,
        interests: formData.interests,
        pace: formData.pace,
        start_date: startDate || "2026-12-10",
        duration_days: endDate && startDate ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1) : 8,
        notes: formData.notes
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}/generate-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = errData.error || `Request failed with status ${response.status}`;
        if (errData.errors) {
          errMsg = Object.values(errData.errors).join(' ');
        }
        throw new Error(errMsg);
      }

      const responseData = await response.json();
      
      if (!responseData.stops || !Array.isArray(responseData.stops)) {
         throw new Error("Invalid response format received from server.");
      }

      if (onItineraryGenerated) {
        onItineraryGenerated(responseData);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- SUB-COMPONENTS ---
  const StepDots = () => (
    <div className="flex justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5, 6, 7].map(step => (
        <div 
          key={step} 
          aria-current={currentStep === step ? 'step' : undefined}
          className={`h-2 rounded-full transition-all duration-300 ${
            step === currentStep 
              ? 'w-8 bg-teal-600' 
              : step < currentStep 
                ? 'w-2 bg-teal-300' 
                : 'w-2 bg-slate-200'
          }`} 
        />
      ))}
    </div>
  );

  const ReviewChip = ({ label, value, step }) => (
    <div 
      onClick={() => handleJumpToStep(step)}
      className="group flex flex-col bg-slate-50 border border-slate-100 p-4 rounded-2xl cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors relative"
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600">
        <Pencil className="w-4 h-4" />
      </div>
      <span className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">{label}</span>
      <span className="font-semibold text-slate-800 pr-6">{value || 'None'}</span>
    </div>
  );

  // --- RENDER HELPERS ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-8">
              Where's the adventure taking you?
            </h2>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Jaipur, Goa"
                value={formData.destinations}
                onChange={e => updateForm('destinations', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-lg px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-8">
              Who is coming along?
            </h2>
            <div className="flex items-center justify-center gap-6 bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <button 
                onClick={() => updateForm('travelers', Math.max(1, formData.travelers - 1))}
                className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm text-2xl font-medium"
              >
                -
              </button>
              <div className="text-4xl font-extrabold text-slate-800 w-20 text-center">
                {formData.travelers}
              </div>
              <button 
                onClick={() => updateForm('travelers', formData.travelers + 1)}
                className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm text-2xl font-medium"
              >
                +
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
              <Wallet className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-8">
              What's your spending style?
            </h2>
            
            <div className="flex gap-3 justify-center mb-6">
              {BUDGET_TIERS.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => updateForm('budgetTier', tier.id)}
                  className={`px-5 py-3 rounded-xl font-bold transition-all ${
                    formData.budgetTier === tier.id 
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs mx-auto">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <span className="text-slate-500 font-bold text-lg">₹</span>
              </div>
              <input
                type="number"
                placeholder="Overall budget (optional)"
                value={formData.budget}
                onChange={e => updateForm('budget', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-lg pl-10 pr-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all font-medium text-slate-800"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-2">
              What do you love doing?
            </h2>
            <p className="text-slate-500 text-center mb-8 font-medium">Select at least one interest</p>
            
            <div className="flex flex-wrap gap-3 justify-center max-w-md mx-auto">
              {INTERESTS_OPTIONS.map(interest => {
                const Icon = interest.icon;
                const isSelected = formData.interests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border-2 ${
                      isSelected 
                        ? 'bg-teal-50 border-teal-500 text-teal-700' 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                    {interest.label}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
              <Gauge className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-8">
              How fast do you want to travel?
            </h2>
            
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              {PACE_OPTIONS.map(option => {
                const isSelected = formData.pace === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => updateForm('pace', option.id)}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className={`font-bold text-lg mb-1 ${isSelected ? 'text-teal-800' : 'text-slate-800'}`}>
                        {option.label}
                      </div>
                      <div className={`text-sm font-medium ${isSelected ? 'text-teal-600' : 'text-slate-500'}`}>
                        {option.desc}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-teal-500 bg-teal-500' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-2">
              Any special requests?
            </h2>
            <p className="text-slate-500 text-center mb-8 font-medium">Dietary needs, accessibility, etc.</p>
            
            <textarea
              placeholder="e.g. Vegetarian only, prefer walking over driving, must visit the beach."
              value={formData.notes}
              onChange={e => updateForm('notes', e.target.value)}
              rows={4}
              className="w-full text-lg px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 resize-none shadow-sm"
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-2">
              Ready to create your trip?
            </h2>
            <p className="text-slate-500 text-center mb-8 font-medium">Review your preferences below.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <ReviewChip label="Destinations" value={formData.destinations} step={1} />
              <ReviewChip label="Travelers" value={`${formData.travelers} people`} step={2} />
              <ReviewChip 
                label="Budget" 
                value={`${BUDGET_TIERS.find(t => t.id === formData.budgetTier)?.label} ${formData.budget ? `(₹${formData.budget})` : ''}`} 
                step={3} 
              />
              <ReviewChip label="Pace" value={PACE_OPTIONS.find(p => p.id === formData.pace)?.label} step={5} />
              <div className="col-span-2">
                <ReviewChip 
                  label="Interests" 
                  value={formData.interests.map(i => INTERESTS_OPTIONS.find(opt => opt.id === i)?.label).join(', ')} 
                  step={4} 
                />
              </div>
              {formData.notes && (
                <div className="col-span-2">
                  <ReviewChip label="Notes" value={formData.notes} step={6} />
                </div>
              )}
            </div>

            <div className="pt-6">
              <button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-teal-600 text-white text-xl font-bold py-5 px-8 rounded-2xl transition-all shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 active:translate-y-0"
              >
                <Sparkles className="w-6 h-6" />
                Generate My Itinerary
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // --- RENDER ---
  if (error) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-red-100 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Compass className="w-10 h-10 opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Couldn't generate itinerary</h2>
          <p className="text-slate-500 font-medium mb-8">{error}</p>
          
          <div className="space-y-4">
            <button
              onClick={handleGenerate}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => onItineraryGenerated && onItineraryGenerated({ stops: [] })}
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Build Manually Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-4">
        <div className="max-w-md w-full flex flex-col items-center text-center animate-in fade-in duration-700">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-4 bg-teal-50 rounded-full flex items-center justify-center">
              <Compass className="w-12 h-12 text-teal-600 animate-[spin_3s_linear_infinite]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 h-8 transition-opacity duration-300">
            {GENERATION_MESSAGES[generationMsgIndex]}
          </h2>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            AI is working its magic
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] flex flex-col pt-12 pb-24 px-4 overflow-hidden relative">
      <div className="w-full max-w-lg mx-auto relative z-10">
        
        {/* PROGRESS DOTS */}
        <StepDots />

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 md:p-12 min-h-[420px] relative overflow-hidden">
          <div 
            key={currentStep}
            className={`transition-all duration-300 h-full flex flex-col justify-center animate-in ${
              direction === 'forward' 
                ? 'slide-in-from-right-8 fade-in' 
                : 'slide-in-from-left-8 fade-in'
            }`}
          >
            {renderStepContent()}
          </div>
        </div>

        {/* NAVIGATION CONTROLS */}
        <div className="mt-8 flex items-center justify-between px-2">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold px-4 py-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <div /> // Placeholder to maintain flex layout
          )}

          {currentStep < 7 && (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-full transition-all shadow-md active:scale-95"
            >
              Next Step
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
