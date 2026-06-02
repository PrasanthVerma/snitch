import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useSelector } from 'react-redux'

const Login = () => {
    const { handleLogin, handleGoogleAuth } = useAuth();
    const { error, loading, user } = useSelector(state => state.auth)
    const navigate = useNavigate()

    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    useEffect(() => {
        if (user) {
            navigate("/")
        }
    }, [user, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loggedInUser = await handleLogin(formData);
        if (loggedInUser) {
            navigate("/");
        }
    };

    const handleGoogle = async () => {
        const success = await handleGoogleAuth();
        if (success) {
            navigate("/");
        }
    };

    return (
        <div className={`min-h-screen flex flex-col lg:flex-row font-luxury-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#111111]'}`}>
            {/* Left side - Brand Slogan & Premium Fashion Image */}
            <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative h-screen sticky top-0 overflow-hidden bg-[#0A0A0A] select-none">
                {/* Background image of custom fashion model */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out hover:scale-105"
                    style={{ backgroundImage: "url('/luxora_login_bg.png')" }}
                ></div>
                
                {/* Gradient overlay for text readability and cinematic ambient feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/40 to-[#0A0A0A]/45"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/30 to-[#0A0A0A]/10"></div>
                
                {/* Elegant Brand Logo at top left */}
                <div className="absolute top-12 left-12 z-10 flex flex-col">
                    <h1 className="text-3xl xl:text-4xl font-luxury-serif font-light tracking-[0.18em] text-white uppercase">
                        LUXORA
                    </h1>
                    <span className="text-[9px] font-medium tracking-[0.32em] text-[#C5A880] uppercase mt-1">
                        PREMIUM CLOTHING
                    </span>
                </div>

                {/* Slogan and Badges at bottom left */}
                <div className="absolute bottom-12 left-12 right-12 z-10 flex flex-col">
                    <h2 className="text-4xl xl:text-5xl font-luxury-serif font-light leading-[1.2] text-white">
                        Elevate Your Style.
                    </h2>
                    <h2 className="text-4xl xl:text-5xl font-luxury-serif font-light leading-[1.2] text-[#C5A880] mt-1.5">
                        Every Day.
                    </h2>
                    <p className="text-xs xl:text-sm text-[#E5E5EA] font-light mt-4 max-w-[360px] leading-relaxed opacity-85">
                        Discover premium clothing crafted for comfort, style and confidence.
                    </p>

                    {/* Trust badges footer */}
                    <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/10">
                        {/* Premium Quality */}
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-white/5 border border-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-[#C5A880]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <span className="text-[10px] tracking-[0.06em] uppercase text-white font-light">Premium Quality</span>
                        </div>
                        {/* Secure Shopping */}
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-white/5 border border-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-[#C5A880]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span className="text-[10px] tracking-[0.06em] uppercase text-white font-light">Secure Shopping</span>
                        </div>
                        {/* Fast Delivery */}
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-white/5 border border-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-[#C5A880]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                            </div>
                            <span className="text-[10px] tracking-[0.06em] uppercase text-white font-light">Fast Delivery</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Premium Login Form */}
            <div className="w-full lg:flex-1 flex flex-col justify-between min-h-screen relative p-6 sm:p-12 md:p-16">
                {/* Header Actions (Language Dropdown & Light/Dark Theme Switcher) */}
                <div className="w-full flex justify-between items-center z-10">
                    {/* Mobile Branding (only visible on mobile/tablet) */}
                    <div className="lg:hidden flex flex-col">
                        <span className="text-xl font-luxury-serif tracking-[0.15em] text-[#C5A880] uppercase">LUXORA</span>
                        <span className="text-[8px] tracking-[0.2em] opacity-60 uppercase">Premium Clothing</span>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* Theme Toggler */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-full border transition-all duration-300 ${
                                isDarkMode
                                    ? 'bg-[#151515] border-[#2C2C2E] text-yellow-500 hover:bg-[#1E1E1E] hover:border-[#3A3A3C]'
                                    : 'bg-white border-[#E5E5EA] text-[#636366] hover:bg-[#F2F2F7] hover:border-[#D1D1D6]'
                            }`}
                            aria-label="Toggle Theme"
                            title="Toggle Light/Dark Theme"
                        >
                            {isDarkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium tracking-wide transition-all duration-300 ${
                                    isDarkMode
                                        ? 'bg-[#151515] border-[#2C2C2E] text-white hover:bg-[#1E1E1E]'
                                        : 'bg-white border-[#E5E5EA] text-[#3A3A3C] hover:bg-[#F2F2F7]'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                English
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form Wrap Center */}
                <div className="w-full max-w-[420px] mx-auto my-auto py-12 flex flex-col justify-center">
                    {/* Header Texts */}
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className={`text-4xl xl:text-5xl font-luxury-serif font-light tracking-wide ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                            Welcome back
                        </h2>
                        <p className={`text-xs xl:text-sm mt-2 font-light ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                            Login to your account
                        </p>
                    </div>

                    {/* Standard Authentication Errors */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium tracking-wide flex items-center gap-2.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Core Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Address Input */}
                        <div className="space-y-2">
                            <label className={`block text-[11px] font-semibold tracking-[0.08em] uppercase ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E93]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`w-full text-sm py-3.5 pl-10 pr-4 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-300 font-light ${
                                        isDarkMode
                                            ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-[#555558] focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                                            : 'bg-white border-[#E5E5EA] text-[#111111] placeholder-[#AEAEB2] focus:border-black focus:ring-black/5'
                                    }`}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className={`block text-[11px] font-semibold tracking-[0.08em] uppercase ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className={`text-[10px] tracking-wide font-medium transition-colors duration-200 ${
                                        isDarkMode ? 'text-[#C5A880] hover:text-[#D9C3A5]' : 'text-[#B89467] hover:text-[#9A744C]'
                                    }`}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E93]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={`w-full text-sm py-3.5 pl-10 pr-11 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-300 font-light ${
                                        isDarkMode
                                            ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-[#555558] focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                                            : 'bg-white border-[#E5E5EA] text-[#111111] placeholder-[#AEAEB2] focus:border-black focus:ring-black/5'
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E8E93] hover:text-[#AEAEB2] transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm flex justify-center items-center gap-2.5 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed select-none ${
                                    isDarkMode
                                        ? 'bg-[#C5A880] text-[#0A0A0A] hover:bg-[#D9C3A5] disabled:bg-[#48484A] disabled:text-[#8E8E93] shadow-[0_4px_16px_rgba(197,168,128,0.2)] hover:shadow-[0_4px_22px_rgba(197,168,128,0.35)] disabled:hover:shadow-none'
                                        : 'bg-black text-white hover:bg-[#1C1C1E] disabled:bg-[#AEAEB2] disabled:text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_22px_rgba(0,0,0,0.22)] disabled:hover:shadow-none'
                                }`}
                            >
                                <span>{loading ? 'Logging in...' : 'Login'}</span>
                                {!loading && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* OR Separator */}
                    <div className="my-8 flex items-center justify-center gap-4">
                        <div className={`h-px flex-1 ${isDarkMode ? 'bg-[#2C2C2E]' : 'bg-[#E5E5EA]'}`}></div>
                        <span className={`text-[11px] font-semibold tracking-widest uppercase ${isDarkMode ? 'text-[#555558]' : 'text-[#8E8E93]'}`}>or</span>
                        <div className={`h-px flex-1 ${isDarkMode ? 'bg-[#2C2C2E]' : 'bg-[#E5E5EA]'}`}></div>
                    </div>

                    {/* Google Button */}
                    <div>
                        <button
                            type="button"
                            onClick={handleGoogle}
                            disabled={loading}
                            className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm flex justify-center items-center gap-2.5 transition-all duration-300 border cursor-pointer disabled:cursor-not-allowed select-none ${
                                isDarkMode
                                    ? 'bg-[#151515] border-[#2C2C2E] text-white hover:bg-[#1E1E1E] hover:border-[#3A3A3C] disabled:bg-transparent disabled:text-[#48484A]'
                                    : 'bg-white border-[#E5E5EA] text-[#333333] hover:bg-[#F2F2F7] disabled:bg-[#F2F2F7] disabled:text-[#AEAEB2]'
                            }`}
                        >
                            <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.43 21.35,11.1z" fill="#4285F4" />
                                    <path d="M12,20.68c2.61,0 4.81,-0.87 6.41,-2.37l-3.3,-2.57c-0.91,0.61 -2.08,0.97 -3.11,0.97 -2.39,0 -4.42,-1.62 -5.14,-3.8H3.45v2.66C5.05,18.75 8.3,20.68 12,20.68z" fill="#34A853" />
                                    <path d="M6.86,12.91c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V6.85H3.45c-0.6,1.21 -0.95,2.58 -0.95,4.03s0.35,2.82 0.95,4.03L6.86,12.91z" fill="#FBBC05" />
                                    <path d="M12,5.72c1.42,0 2.7,0.49 3.7,1.44l2.77,-2.77C16.8,2.83 14.6,1.93 12,1.93c-3.7,0 -6.95,1.93 -8.55,5.12L6.86,9.5c0.72,-2.18 2.75,-3.78 5.14,-3.78z" fill="#EA4335" />
                                </g>
                            </svg>
                            <span>Continue with Google</span>
                        </button>
                    </div>
                </div>

                {/* Footer text */}
                <div className="w-full text-center mt-auto pt-6">
                    <p className={`text-xs ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className={`font-semibold inline-flex items-center gap-1 transition-colors duration-200 group ${
                                isDarkMode ? 'text-[#C5A880] hover:text-[#D9C3A5]' : 'text-[#B89467] hover:text-[#9A744C]'
                            }`}
                        >
                            <span>Create account</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transform transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
