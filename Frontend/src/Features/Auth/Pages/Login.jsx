import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useSelector } from 'react-redux'

const Login = () => {

    const { handleLogin } = useAuth();
    const { error, loading, user } = useSelector(state => state.auth)
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate("/")
        }
    }, [user, navigate])

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

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

    return (
        <div className="min-h-screen flex text-white bg-black font-sans">
            {/* Left side - Image & Logo */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-black items-start justify-start overflow-hidden">
                {/* Abstract architecture image */}
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-80"
                    style={{ backgroundImage: "url('/login_bg.png')" }}
                ></div>
                {/* Dark overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                {/* Big subtle logo */}
                <div className="absolute top-12 left-12 z-10">
                    <h1 className="text-7xl xl:text-9xl font-black tracking-tighter text-[#3a3a3a]/80 select-none">
                        VALINA
                    </h1>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#191110]">
                <div className="w-full max-w-[440px] p-8 sm:p-12">
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-16">
                        <h1 className="text-4xl font-black tracking-tighter text-white">VALINA</h1>
                    </div>

                    <h2 className="text-4xl font-bold mb-3 tracking-wide">LOGIN</h2>
                    <p className="text-gray-400 mb-14 text-sm">Enter your credentials to access the exclusive catalog.</p>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-semibold uppercase tracking-wider">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-semibold text-gray-300 uppercase tracking-[0.15em]">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="user@valina.com"
                                className="w-full bg-transparent border-b border-gray-700/80 py-3 text-sm focus:outline-none focus:border-[#ff5a4a] transition-colors placeholder-[#3a3a3a] text-white"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <label className="block text-[10px] font-semibold text-gray-300 uppercase tracking-[0.15em]">Password</label>
                                <Link to="/forgot-password" className="text-[10px] text-gray-500 hover:text-gray-300 uppercase tracking-[0.15em] transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-transparent border-b border-gray-700/80 py-3 text-sm focus:outline-none focus:border-[#ff5a4a] transition-colors placeholder-[#3a3a3a] text-white"
                                required
                            />
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#ff5a4a] hover:bg-[#ff4331] disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 px-4 font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,90,74,0.3)] disabled:hover:shadow-none"
                            >
                                {loading ? 'SIGNING IN...' : 'SIGN IN'}
                                {!loading && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-16 pt-8 border-t border-gray-800/50 text-center">
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2">
                            New to Valina?
                            <Link to="/register" className="text-white border-b border-white hover:text-gray-300 hover:border-gray-300 pb-0.5 transition-colors ml-1">
                                CREATE ACCOUNT
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
