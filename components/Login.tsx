import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Mail, ArrowRight, Loader2, Shield, Eye, ChevronLeft, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/Toast';

// ============================================================================
// Login Page — Google OAuth + SMS OTP (unified component)
// Props:
//   isAdmin: when true, performs post-login tier check for admin routing
// ============================================================================

interface LoginProps {
    isAdmin?: boolean;
}

type LoginMode = 'select' | 'phone' | 'otp' | 'email';

const Login: React.FC<LoginProps> = ({ isAdmin = false }) => {
    const { session, profile, loading: authLoading } = useAuth();
    const { showToast, ToastContainer } = useToast();

    const [mode, setMode] = useState<LoginMode>('select');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [unauthorized, setUnauthorized] = useState(false);

    // Email/password state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect logic after authentication
    useEffect(() => {
        if (authLoading) return;
        if (!session || !profile) return;

        if (isAdmin) {
            // Admin login: validate tier from DB
            if (profile.tier === 'Admin') {
                window.location.hash = '#admin-cms';
            } else {
                setUnauthorized(true);
            }
        } else {
            // Standard login: redirect to profile
            window.location.hash = '#profile';
        }
    }, [session, profile, isAdmin, authLoading]);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    // ─── Handlers ───────────────────────────────────────────────────────

    /** Email/Password — sign in */
    const handleEmailSignIn = async () => {
        if (!email || !password) {
            showToast('Please enter both email and password.', 'error');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                const msg = error.message.toLowerCase();
                if (msg.includes('invalid login credentials') || msg.includes('invalid')) {
                    showToast('Invalid email or password. Please try again.', 'error');
                } else if (msg.includes('email not confirmed')) {
                    showToast('Please check your email and confirm your account first.', 'error');
                } else {
                    showToast(error.message, 'error');
                }
            }
        } catch (err: any) {
            showToast(err.message || 'Sign in failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    /** Email/Password — sign up */
    const handleEmailSignUp = async () => {
        if (!email || !password) {
            showToast('Please enter both email and password.', 'error');
            return;
        }
        if (password.length < 6) {
            showToast('Password must be at least 6 characters.', 'error');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + (isAdmin ? '/#admin-login' : '/#login'),
                },
            });
            if (error) {
                const msg = error.message.toLowerCase();
                if (msg.includes('already registered') || msg.includes('already exists')) {
                    showToast('This email is already registered. Try signing in instead.', 'error');
                } else {
                    showToast(error.message, 'error');
                }
            } else {
                showToast('Account created! Check your email to confirm, then sign in.', 'success');
                setIsSignUp(false);
            }
        } catch (err: any) {
            showToast(err.message || 'Sign up failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    /** Google OAuth — redirect flow */
    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + (isAdmin ? '/#admin-login' : '/#login'),
                },
            });
            if (error) {
                showToast(error.message, 'error');
            }
        } catch (err: any) {
            showToast(err.message || 'Failed to initiate Google login.', 'error');
        } finally {
            setLoading(false);
        }
    };

    /** Send SMS OTP via Supabase (which dispatches via Twilio) */
    const handleSendOtp = async () => {
        if (!phone || phone.length < 8) {
            showToast('Please enter a valid phone number in international format (e.g., +974XXXXXXXX).', 'error');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({ phone });

            if (error) {
                const msg = error.message.toLowerCase();
                if (msg.includes('rate') || msg.includes('too many')) {
                    showToast('Too many requests. Please wait 60 seconds before trying again.', 'error');
                    setCountdown(60);
                } else {
                    showToast(error.message, 'error');
                }
                setLoading(false);
                return;
            }

            setMode('otp');
            setCountdown(60);
            showToast('Verification code sent to your phone!', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to send verification code.', 'error');
        } finally {
            setLoading(false);
        }
    };

    /** Verify the 6-digit OTP */
    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            showToast('Please enter the complete 6-digit code.', 'error');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone,
                token: code,
                type: 'sms',
            });

            if (error) {
                const msg = error.message.toLowerCase();
                if (msg.includes('expired')) {
                    showToast('Code expired. Please request a new one.', 'error');
                } else if (msg.includes('invalid')) {
                    showToast('Invalid code. Please check and try again.', 'error');
                } else {
                    showToast(error.message, 'error');
                }
                setOtp(['', '', '', '', '', '']);
                otpRefs.current[0]?.focus();
            }
        } catch (err: any) {
            showToast(err.message || 'Verification failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    /** Handle OTP input — auto-advance cursor */
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // digits only

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-advance to next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (index === 5 && value) {
            const code = newOtp.join('');
            if (code.length === 6) {
                setTimeout(() => handleVerifyOtp(), 100);
            }
        }
    };

    /** Handle backspace in OTP inputs */
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    /** Handle paste into OTP inputs */
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pasted.length; i++) {
            newOtp[i] = pasted[i];
        }
        setOtp(newOtp);
        if (pasted.length === 6) {
            setTimeout(() => handleVerifyOtp(), 100);
        }
    };

    // ─── Unauthorized Admin View ────────────────────────────────────────

    if (unauthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0c] via-[#0f1110] to-[#0a0a0c] px-4">
                <ToastContainer />
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <Shield size={36} className="text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Your account does not have administrator privileges.
                        Contact the club management to request admin access.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => { window.location.hash = '#profile'; }}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-all"
                        >
                            Go to Profile
                        </button>
                        <button
                            onClick={() => { window.location.hash = '#home'; }}
                            className="px-6 py-3 bg-brand/20 border border-brand/30 rounded-xl text-sm font-semibold text-brand hover:bg-brand/30 transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Loading ────────────────────────────────────────────────────────

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0c] via-[#0f1110] to-[#0a0a0c]">
                <Loader2 size={32} className="animate-spin text-brand" />
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0c] via-[#0f1110] to-[#0a0a0c] px-4 pt-24 pb-12">
            <ToastContainer />

            {/* Background accents */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand/20 to-gold/20 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                        {isAdmin ? (
                            <Shield size={28} className="text-gold" />
                        ) : (
                            <Shield size={28} className="text-brand" />
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {isAdmin ? 'Admin Portal' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        {isAdmin
                            ? 'Sign in to access the management dashboard'
                            : 'Sign in to your Efren Billiards account'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                    {/* ── Method Selection ── */}
                    {mode === 'select' && (
                        <div className="space-y-4">
                            {/* Google OAuth */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="
                  w-full flex items-center justify-center gap-3
                  px-5 py-4 rounded-xl
                  bg-white/[0.05] border border-white/[0.08]
                  text-white font-semibold text-sm
                  hover:bg-white/[0.08] hover:border-white/[0.12]
                  active:scale-[0.98]
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 48 48" className="flex-shrink-0">
                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                        </svg>
                                        Continue with Google
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-2">
                                <div className="flex-1 h-px bg-white/[0.06]" />
                                <span className="text-xs text-gray-600 uppercase tracking-widest font-medium">or</span>
                                <div className="flex-1 h-px bg-white/[0.06]" />
                            </div>

                            {/* Email/Password */}
                            <button
                                onClick={() => setMode('email')}
                                className="
                  w-full flex items-center justify-center gap-3
                  px-5 py-4 rounded-xl
                  bg-gradient-to-r from-emerald-500/10 to-emerald-500/5
                  border border-emerald-500/20
                  text-white font-semibold text-sm
                  hover:from-emerald-500/15 hover:to-emerald-500/10 hover:border-emerald-500/30
                  active:scale-[0.98]
                  transition-all duration-200
                "
                            >
                                <Mail size={20} className="text-emerald-400" />
                                Sign in with Email
                            </button>

                            {/* Phone OTP */}
                            <button
                                onClick={() => setMode('phone')}
                                className="
                  w-full flex items-center justify-center gap-3
                  px-5 py-4 rounded-xl
                  bg-gradient-to-r from-brand/10 to-brand/5
                  border border-brand/20
                  text-white font-semibold text-sm
                  hover:from-brand/15 hover:to-brand/10 hover:border-brand/30
                  active:scale-[0.98]
                  transition-all duration-200
                "
                            >
                                <Smartphone size={20} className="text-brand" />
                                Sign in with Phone
                            </button>
                        </div>
                    )}

                    {/* ── Email/Password Form ── */}
                    {mode === 'email' && (
                        <div className="space-y-5">
                            <button
                                onClick={() => { setMode('select'); setEmail(''); setPassword(''); }}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={14} /> Back
                            </button>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="
                       w-full pl-12 pr-4 py-4
                       bg-white/[0.03] border border-white/[0.08]
                       rounded-xl text-white text-sm
                       placeholder-gray-600
                       focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20
                       transition-all
                     "
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={isSignUp ? 'Min 6 characters' : '••••••••'}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                isSignUp ? handleEmailSignUp() : handleEmailSignIn();
                                            }
                                        }}
                                        className="
                       w-full pl-12 pr-12 py-4
                       bg-white/[0.03] border border-white/[0.08]
                       rounded-xl text-white text-sm
                       placeholder-gray-600
                       focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20
                       transition-all
                     "
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={isSignUp ? handleEmailSignUp : handleEmailSignIn}
                                disabled={loading}
                                className="
                   w-full flex items-center justify-center gap-2
                   px-5 py-4 rounded-xl
                   bg-gradient-to-r from-emerald-500 to-emerald-600
                   text-white font-bold text-sm
                   hover:from-emerald-400 hover:to-emerald-500
                   active:scale-[0.98]
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-lg shadow-emerald-500/25
                 "
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="text-xs text-emerald-400 hover:underline font-semibold transition-colors"
                                >
                                    {isSignUp
                                        ? 'Already have an account? Sign in'
                                        : "Don't have an account? Create one"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Phone Input ── */}
                    {mode === 'phone' && (
                        <div className="space-y-5">
                            <button
                                onClick={() => setMode('select')}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={14} /> Back
                            </button>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                                    Mobile Number
                                </label>
                                <div className="relative">
                                    <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+974 XXXX XXXX"
                                        className="
                       w-full pl-12 pr-4 py-4
                       bg-white/[0.03] border border-white/[0.08]
                       rounded-xl text-white text-sm
                       placeholder-gray-600
                       focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20
                       transition-all
                     "
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    We'll send a 6-digit code via SMS to verify your number.
                                </p>
                            </div>

                            <button
                                onClick={handleSendOtp}
                                disabled={loading || countdown > 0}
                                className="
                   w-full flex items-center justify-center gap-2
                   px-5 py-4 rounded-xl
                   bg-gradient-to-r from-brand to-blue-600
                   text-white font-bold text-sm
                   hover:from-blue-500 hover:to-blue-700
                   active:scale-[0.98]
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-lg shadow-brand/25
                 "
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : countdown > 0 ? (
                                    `Resend in ${countdown}s`
                                ) : (
                                    <>
                                        Send Code
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* ── OTP Verification ── */}
                    {mode === 'otp' && (
                        <div className="space-y-5">
                            <button
                                onClick={() => { setMode('phone'); setOtp(['', '', '', '', '', '']); }}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={14} /> Change number
                            </button>

                            <div className="text-center">
                                <p className="text-sm text-gray-400">
                                    Code sent to{' '}
                                    <span className="text-white font-semibold">{phone}</span>
                                </p>
                            </div>

                            {/* OTP Inputs */}
                            <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { otpRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className={`
                       w-12 h-14 text-center text-lg font-bold
                       bg-white/[0.03] border rounded-xl
                       text-white
                       focus:outline-none focus:ring-2 focus:ring-brand/40
                       transition-all duration-200
                       ${digit ? 'border-brand/40 bg-brand/5' : 'border-white/[0.08]'}
                     `}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.join('').length < 6}
                                className="
                   w-full flex items-center justify-center gap-2
                   px-5 py-4 rounded-xl
                   bg-gradient-to-r from-brand to-blue-600
                   text-white font-bold text-sm
                   hover:from-blue-500 hover:to-blue-700
                   active:scale-[0.98]
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-lg shadow-brand/25
                 "
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        Verify & Sign In
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            {/* Resend */}
                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p className="text-xs text-gray-600">
                                        Resend available in <span className="text-brand font-semibold">{countdown}s</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={loading}
                                        className="text-xs text-brand hover:underline font-semibold transition-colors"
                                    >
                                        Resend verification code
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer link */}
                <p className="text-center text-xs text-gray-600 mt-6">
                    {isAdmin ? (
                        <>
                            Not an admin?{' '}
                            <a href="#login" className="text-brand hover:underline font-semibold">
                                Standard login
                            </a>
                        </>
                    ) : (
                        <>
                            Club administrator?{' '}
                            <a href="#admin-login" className="text-gold hover:underline font-semibold">
                                Admin portal
                            </a>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Login;
