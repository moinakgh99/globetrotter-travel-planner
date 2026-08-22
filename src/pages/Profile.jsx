import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user, updateProfileState } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Set initial fields from context
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email cannot be empty.');
      setLoading(false);
      return;
    }

    // Prepare body
    const body = { name, email };

    // If attempting password change
    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg('Current password is required to change password.');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New passwords do not match.');
        setLoading(false);
        return;
      }
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    try {
      const response = await api.put('/auth/profile', body);
      const updatedUser = response.data.user;
      updateProfileState(updatedUser);
      setSuccessMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Profile update failed:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-8">
          User Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl font-extrabold text-emerald-400 mb-6">
              {getInitials(user?.name)}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
            <p className="text-sm text-slate-400 mb-6">{user?.email}</p>

            <div className="w-full space-y-4 border-t border-slate-800 pt-6 text-left text-sm text-slate-400">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Role</p>
                  <p className="font-semibold text-white capitalize">{user?.role || 'user'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Member Since</p>
                  <p className="font-semibold text-white">{formatDate(user?.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                <User className="h-5 w-5 text-emerald-400" />
                <span>Personal Information</span>
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {errorMsg && (
                  <div className="flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-sm text-rose-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="flex items-center space-x-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-sm text-emerald-400">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Name</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-3 py-2.5 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">Email Address</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-3 py-2.5 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-6">
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-emerald-400" />
                    <span>Change Password (Optional)</span>
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Required only if changing password"
                        className="mt-1 block w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="mt-1 block w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="mt-1 block w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center space-x-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:bg-emerald-800 disabled:text-slate-400"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
