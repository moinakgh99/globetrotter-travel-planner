import React, { useState } from 'react';
import { Calendar, Image as ImageIcon, Globe, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateTrip({ onTripCreated, onCancel }) {
  const navigate = useNavigate();
  // --- STATE ---
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    coverPhotoUrl: '',
    isPublic: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    validateField(name, formData[name]);
  };

  // --- VALIDATION ---
  const validateField = (name, value) => {
    let errorMsg = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) errorMsg = 'Trip name is required';
        break;
      case 'startDate':
        if (!value) errorMsg = 'Start date is required';
        break;
      case 'endDate':
        if (!value) {
          errorMsg = 'End date is required';
        } else if (formData.startDate && new Date(value) < new Date(formData.startDate)) {
          errorMsg = 'End date must be after start date';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const validateForm = () => {
    const isNameValid = validateField('name', formData.name);
    const isStartDateValid = validateField('startDate', formData.startDate);
    const isEndDateValid = validateField('endDate', formData.endDate);
    
    return isNameValid && isStartDateValid && isEndDateValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: Added a mock test token. In production, get this from localStorage/context
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          start_date: formData.startDate,
          end_date: formData.endDate,
          cover_photo_url: formData.coverPhotoUrl,
          is_public: formData.isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create trip. Please try again.');
      }

      const data = await response.json();
      
      if (onTripCreated) {
        onTripCreated(data);
      } else {
        // Redirect to the wizard
        navigate(`/trips/${data.id}/plan`, { 
          state: { 
            tripName: data.name, 
            startDate: data.start_date, 
            endDate: data.end_date 
          } 
        });
      }
    } catch (err) {
      setApiError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.startDate && formData.endDate && !errors.endDate;

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-orange-50 p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Plan Your Next Adventure</h1>
          <p className="text-slate-500">Capture the details of your upcoming journey and start building your itinerary.</p>
        </div>

        {/* Error Banner */}
        {apiError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">{apiError}</p>
            </div>
            <button 
              onClick={() => setApiError('')}
              className="text-red-600 hover:text-red-800 focus:outline-none"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Trip Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Trip Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              maxLength={150}
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Rajasthan & Goa Trip"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
              } focus:outline-none focus:ring-2 bg-slate-50 transition-colors`}
            />
            <div className="flex justify-between items-start mt-1 h-5">
              {errors.name ? (
                <p id="name-error" className="text-sm text-red-600 font-medium">{errors.name}</p>
              ) : (
                <div /> 
              )}
              <span className="text-xs text-slate-400 font-medium">
                {formData.name.length}/150
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.startDate}
                  aria-describedby={errors.startDate ? "startDate-error" : undefined}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.startDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                  } focus:outline-none focus:ring-2 bg-slate-50 transition-colors appearance-none`}
                />
                <Calendar className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
              {errors.startDate && (
                <p id="startDate-error" className="text-sm text-red-600 font-medium mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={formData.startDate}
                  aria-invalid={!!errors.endDate}
                  aria-describedby={errors.endDate ? "endDate-error" : undefined}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.endDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                  } focus:outline-none focus:ring-2 bg-slate-50 transition-colors appearance-none`}
                />
                <Calendar className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
              {errors.endDate && (
                <p id="endDate-error" className="text-sm text-red-600 font-medium mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="What's this trip about? e.g. A two-week exploration of historic forts, vibrant markets, and relaxing beaches."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-teal-500 focus:border-teal-500 focus:outline-none focus:ring-2 bg-slate-50 transition-colors resize-none"
            />
          </div>

          {/* Cover Photo URL */}
          <div>
            <label htmlFor="coverPhotoUrl" className="block text-sm font-medium text-slate-700 mb-1">
              Cover Photo URL <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  id="coverPhotoUrl"
                  name="coverPhotoUrl"
                  value={formData.coverPhotoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/beautiful-sunset.jpg"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-teal-500 focus:border-teal-500 focus:outline-none focus:ring-2 bg-slate-50 transition-colors"
                />
              </div>
              {formData.coverPhotoUrl && (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-100 flex-shrink-0 bg-slate-100 shadow-sm">
                  <img 
                    src={formData.coverPhotoUrl} 
                    alt="Cover preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="pr-4">
              <label htmlFor="isPublic" className="font-medium text-slate-900 flex items-center gap-2 cursor-pointer">
                <Globe className="w-4 h-4 text-teal-600" />
                Make this trip public
              </label>
              <p className="text-sm text-slate-500 mt-1">
                Others can view a read-only version via a shareable link.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <button
                type="button"
                id="isPublic"
                role="switch"
                aria-checked={formData.isPublic}
                onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  formData.isPublic ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col-reverse md:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 rounded-lg font-medium text-slate-700 bg-transparent hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Trip'
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
