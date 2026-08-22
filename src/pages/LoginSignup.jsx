import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, User, Lock, Mail, Phone, MapPin, Globe, Eye, EyeOff, Info, UserCheck, AlertCircle } from "lucide-react";
import api, { setAuthSession, isAuthenticated } from "../lib/api";

const LoginSignup = () => {
  const [activeTab, setActiveTab] = useState("login"); // "login" | "register"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState({});

  // Registration form state
  const [registerData, setRegisterData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    username: "",
    password: "",
    confirm_password: "",
    additional_info: "",
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [usernameTouched, setUsernameTouched] = useState(false);

  // Auto-generate a suggested username when email or names change (unless user manually edited it)
  // Auto-generated username suggestion based on email/name, as registration collects Email/Name while Login requires Username (wireframe design resolution).
  useEffect(() => {
    if (!usernameTouched) {
      if (registerData.first_name || registerData.last_name || registerData.email) {
        let suggested = "";
        if (registerData.email && registerData.email.includes("@")) {
          suggested = registerData.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_.]/g, "");
        } else if (registerData.first_name || registerData.last_name) {
          suggested = `${registerData.first_name}.${registerData.last_name}`.toLowerCase().replace(/[^a-z0-9_.]/g, "");
        }
        setRegisterData((prev) => ({ ...prev, username: suggested }));
      }
    }
  }, [registerData.first_name, registerData.last_name, registerData.email, usernameTouched]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (loginErrors[name]) {
      setLoginErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUsernameTouched(true);
    }
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (registerErrors[name]) {
      setRegisterErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const validateLoginForm = () => {
    const errors = {};
    if (!loginData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!loginData.password) {
      errors.password = "Password is required";
    }
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};
    if (!registerData.first_name.trim()) {
      errors.first_name = "First name is required";
    }
    if (!registerData.last_name.trim()) {
      errors.last_name = "Last name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registerData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(registerData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!registerData.username.trim() || registerData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!registerData.password || registerData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (registerData.password !== registerData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    if (registerData.phone && registerData.phone.trim()) {
      const phoneRegex = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
      if (!phoneRegex.test(registerData.phone.trim())) {
        errors.phone = "Invalid phone number format";
      }
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await api.post("/api/auth/login", {
        username: loginData.username.trim(),
        password: loginData.password,
      });

      const { token, user } = res.data;
      setAuthSession(token, user);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.username || "Failed to log in. Please check your credentials.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await api.post("/api/auth/signup", {
        username: registerData.username.trim(),
        first_name: registerData.first_name.trim(),
        last_name: registerData.last_name.trim(),
        email: registerData.email.trim(),
        phone: registerData.phone.trim(),
        city: registerData.city.trim(),
        country: registerData.country.trim(),
        additional_info: registerData.additional_info.trim(),
        password: registerData.password,
      });

      const { token, user } = res.data;
      setAuthSession(token, user);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed. Username or email may already be in use.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-xl shadow-sky-500/25 mb-3">
          <Compass className="w-8 h-8 text-white animate-spin-slow" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          GlobeTrotter
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Plan, explore, and map multi-city travel adventures
        </p>
      </div>

      {/* Main Container Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Tab Navigation Controls */}
          <div className="flex bg-slate-800/80 p-1.5 rounded-2xl mb-8 border border-slate-700/60">
            <button
              id="tab-login-btn"
              onClick={() => {
                setActiveTab("login");
                setServerError("");
              }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "login"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              id="tab-register-btn"
              onClick={() => {
                setActiveTab("register");
                setServerError("");
              }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "register"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Server Error Alert Banner */}
          {serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* SCREEN 1: LOGIN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-6" noValidate>
              {/* Circular Avatar Placeholder */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-sky-500/40 flex items-center justify-center shadow-inner group cursor-pointer hover:border-sky-400 transition-colors">
                  <User className="w-12 h-12 text-sky-400/80 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs text-slate-400 mt-2 font-medium">User Avatar</span>
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    placeholder="Enter your username"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-950 border ${
                      loginErrors.username ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:ring-sky-500"
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm`}
                  />
                </div>
                {loginErrors.username && (
                  <p className="mt-1 text-xs text-rose-400">{loginErrors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 bg-slate-950 border ${
                      loginErrors.password ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:ring-sky-500"
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-xs text-rose-400">{loginErrors.password}</p>
                )}
              </div>

              {/* Login Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* SCREEN 2: REGISTRATION FORM */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-5" noValidate>
              {/* Circular Avatar Placeholder */}
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-sky-500/40 flex items-center justify-center shadow-inner group cursor-pointer hover:border-sky-400 transition-colors">
                  <User className="w-10 h-10 text-sky-400/80 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs text-slate-400 mt-1 font-medium">Profile Avatar (Optional)</span>
              </div>

              {/* Row 1: First Name | Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    First Name *
                  </label>
                  <input
                    id="register-firstname"
                    name="first_name"
                    type="text"
                    value={registerData.first_name}
                    onChange={handleRegisterChange}
                    placeholder="John"
                    className={`w-full px-3.5 py-2.5 bg-slate-950 border ${
                      registerErrors.first_name ? "border-rose-500" : "border-slate-800 focus:ring-sky-500"
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm`}
                  />
                  {registerErrors.first_name && (
                    <p className="mt-1 text-xs text-rose-400">{registerErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Last Name *
                  </label>
                  <input
                    id="register-lastname"
                    name="last_name"
                    type="text"
                    value={registerData.last_name}
                    onChange={handleRegisterChange}
                    placeholder="Doe"
                    className={`w-full px-3.5 py-2.5 bg-slate-950 border ${
                      registerErrors.last_name ? "border-rose-500" : "border-slate-800 focus:ring-sky-500"
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm`}
                  />
                  {registerErrors.last_name && (
                    <p className="mt-1 text-xs text-rose-400">{registerErrors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Email Address | Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="john@example.com"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-950 border ${
                        registerErrors.email ? "border-rose-500" : "border-slate-800 focus:ring-sky-500"
                      } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm`}
                    />
                  </div>
                  {registerErrors.email && (
                    <p className="mt-1 text-xs text-rose-400">{registerErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="register-phone"
                      name="phone"
                      type="text"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      placeholder="+1 (555) 000-0000"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-950 border ${
                        registerErrors.phone ? "border-rose-500" : "border-slate-800 focus:ring-sky-500"
                      } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm`}
                    />
                  </div>
                  {registerErrors.phone && (
                    <p className="mt-1 text-xs text-rose-400">{registerErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Row 3: City | Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      id="register-city"
                      name="city"
                      type="text"
                      value={registerData.city}
                      onChange={handleRegisterChange}
                      placeholder="San Francisco"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      id="register-country"
                      name="country"
                      type="text"
                      value={registerData.country}
                      onChange={handleRegisterChange}
                      placeholder="United States"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Username Field (Auto-Suggested & Editable) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Username *</span>
                  <span className="text-[10px] text-sky-400 font-normal lowercase">(Auto-generated, editable)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="register-username"
                    name="username"
                    type="text"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    placeholder="john.doe"
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-950 border ${
                      registerErrors.username ? "border-rose-500" : "border-slate-800 focus:ring-sky-500"
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm`}
                  />
                </div>
                {registerErrors.username && (
                  <p className="mt-1 text-xs text-rose-400">{registerErrors.username}</p>
                )}
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="••••••••"
                      className={`w-full px-3.5 py-2.5 bg-slate-950 border ${
                        registerErrors.password ? "border-rose-500" : "border-slate-800 focus:ring-sky-500"
                      } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm`}
                    />
                  </div>
                  {registerErrors.password && (
                    <p className="mt-1 text-xs text-rose-400">{registerErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      name="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirm_password}
                      onChange={handleRegisterChange}
                      placeholder="••••••••"
                      className={`w-full px-3.5 py-2.5 bg-slate-950 border ${
                        registerErrors.confirm_password ? "border-rose-500" : "border-slate-800 focus:ring-sky-500"
                      } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm`}
                    />
                  </div>
                  {registerErrors.confirm_password && (
                    <p className="mt-1 text-xs text-rose-400">{registerErrors.confirm_password}</p>
                  )}
                </div>
              </div>

              {/* Additional Information (Optional bio/notes) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Additional Information (Bio / Travel Preferences)
                </label>
                <textarea
                  id="register-additional-info"
                  name="additional_info"
                  rows={2}
                  value={registerData.additional_info}
                  onChange={handleRegisterChange}
                  placeholder="Passionate backpacker into hiking, paragliding, and local food..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm resize-none"
                />
              </div>

              {/* Register Users Button */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Register Users</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
