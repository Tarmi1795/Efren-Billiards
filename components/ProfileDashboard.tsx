import React, { useState, useEffect } from 'react';
import {
    User, Phone, Mail, Shield, Crown, Award, Star,
    ChevronRight, Loader2, CheckCircle, AlertCircle,
    LogOut, ArrowRight, Link2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfileLinking } from '../hooks/useProfile';
import { useToast } from './ui/Toast';
import type { MembershipTier } from '../types/database';

// ============================================================================
// Profile Dashboard — displays membership tier, status, and account linking
// ============================================================================

/** Tier visual configuration */
const TIER_CONFIG: Record<MembershipTier, {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    gradient: string;
}> = {
    Guest: {
        label: 'Guest',
        color: 'text-gray-400',
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/20',
        icon: <User size={20} />,
        gradient: 'from-gray-500/20 to-gray-600/10',
    },
    Player: {
        label: 'Player',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        icon: <Star size={20} />,
        gradient: 'from-blue-500/20 to-blue-600/10',
    },
    Bronze: {
        label: 'Bronze',
        color: 'text-[#B87333]',
        bg: 'bg-[#B87333]/10',
        border: 'border-[#B87333]/20',
        icon: <Award size={20} />,
        gradient: 'from-[#B87333]/20 to-[#8B5E2B]/10',
    },
    Silver: {
        label: 'Silver',
        color: 'text-[#A8A8A8]',
        bg: 'bg-[#A8A8A8]/10',
        border: 'border-[#A8A8A8]/20',
        icon: <Award size={20} />,
        gradient: 'from-[#A8A8A8]/20 to-[#808080]/10',
    },
    Gold: {
        label: 'Gold',
        color: 'text-[#C5A059]',
        bg: 'bg-[#C5A059]/10',
        border: 'border-[#C5A059]/20',
        icon: <Crown size={20} />,
        gradient: 'from-[#C5A059]/20 to-[#9E7E39]/10',
    },
    Admin: {
        label: 'Administrator',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        icon: <Shield size={20} />,
        gradient: 'from-red-500/20 to-red-600/10',
    },
};

const ProfileDashboard: React.FC = () => {
    const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const {
        phoneLinking,
        emailLinking,
        otpSent,
        sendPhoneOtp,
        verifyPhoneOtp,
        linkEmail,
    } = useProfileLinking();

    // Linking form state
    const [newPhone, setNewPhone] = useState('');
    const [phoneOtpCode, setPhoneOtpCode] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [showPhoneLink, setShowPhoneLink] = useState(false);
    const [showEmailLink, setShowEmailLink] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            window.location.hash = '#login';
        }
    }, [user, authLoading]);

    // Show toast for linking results
    useEffect(() => {
        if (phoneLinking.error) showToast(phoneLinking.error, 'error');
        if (phoneLinking.success) showToast(phoneLinking.success, 'success');
    }, [phoneLinking.error, phoneLinking.success]);

    useEffect(() => {
        if (emailLinking.error) showToast(emailLinking.error, 'error');
        if (emailLinking.success) showToast(emailLinking.success, 'success');
    }, [emailLinking.error, emailLinking.success]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0c] via-[#0f1110] to-[#0a0a0c]">
                <Loader2 size={32} className="animate-spin text-brand" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0c] via-[#0f1110] to-[#0a0a0c] px-4">
                <div className="text-center">
                    <Loader2 size={28} className="animate-spin text-brand mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    const tier = TIER_CONFIG[profile.tier] || TIER_CONFIG.Guest;
    const hasPhone = !!profile.phone;
    const hasEmail = !!profile.email;
    // Check verified status from Supabase auth user metadata
    const phoneVerified = !!user?.phone;
    const emailVerified = !!user?.email_confirmed_at;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0c] via-[#0f1110] to-[#0a0a0c] pt-28 pb-16 px-4">
            <ToastContainer />

            {/* Background accents */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand/3 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gold/3 rounded-full blur-3xl" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                {/* ── Header Card ── */}
                <div className={`rounded-2xl border ${tier.border} bg-gradient-to-br ${tier.gradient} p-8 mb-6 backdrop-blur-xl`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className={`w-16 h-16 rounded-2xl ${tier.bg} ${tier.border} border flex items-center justify-center`}>
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                ) : (
                                    <span className={tier.color}>{tier.icon}</span>
                                )}
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {profile.full_name || user?.email?.split('@')[0] || 'Member'}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${tier.bg} ${tier.color} ${tier.border} border`}>
                                        {tier.icon}
                                        {tier.label}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${profile.status === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : profile.status === 'suspended'
                                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'active' ? 'bg-emerald-400' :
                                            profile.status === 'suspended' ? 'bg-red-400' : 'bg-yellow-400'
                                            }`} />
                                        {profile.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sign Out */}
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-400 text-xs font-semibold hover:bg-white/[0.06] hover:text-white transition-all"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>

                    {/* Membership tier value indicator for non-admin tiers */}
                    {profile.tier !== 'Admin' && profile.tier !== 'Guest' && (
                        <div className="mt-6 pt-4 border-t border-white/[0.06]">
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Membership Level</p>
                            <div className="flex items-center gap-1">
                                {['Player', 'Bronze', 'Silver', 'Gold'].map((t) => {
                                    const tierRank = { Player: 1, Bronze: 2, Silver: 3, Gold: 4 };
                                    const current = tierRank[profile.tier as keyof typeof tierRank] || 0;
                                    const level = tierRank[t as keyof typeof tierRank] || 0;
                                    const active = level <= current;

                                    return (
                                        <div
                                            key={t}
                                            className={`flex-1 h-2 rounded-full transition-all duration-500 ${active
                                                ? t === 'Gold' ? 'bg-[#C5A059]'
                                                    : t === 'Silver' ? 'bg-[#A8A8A8]'
                                                        : t === 'Bronze' ? 'bg-[#B87333]'
                                                            : 'bg-brand'
                                                : 'bg-white/[0.05]'
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-1">
                                {['Player', 'Bronze', 'Silver', 'Gold'].map((t) => (
                                    <span key={t} className="text-[10px] text-gray-600 uppercase tracking-wider">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Contact Methods ── */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6 backdrop-blur-xl">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Link2 size={16} className="text-brand" />
                        Linked Accounts
                    </h2>
                    <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                        Link your phone and email to secure your account. Accounts do not auto-merge — link them manually here.
                    </p>

                    {/* Phone */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasPhone ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                                    <Phone size={18} className={hasPhone ? 'text-emerald-400' : 'text-gray-500'} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {hasPhone ? profile.phone : 'No phone linked'}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {hasPhone && phoneVerified ? (
                                            <>
                                                <CheckCircle size={12} className="text-emerald-400" />
                                                <span className="text-xs text-emerald-400 font-medium">Verified</span>
                                            </>
                                        ) : hasPhone ? (
                                            <>
                                                <AlertCircle size={12} className="text-yellow-400" />
                                                <span className="text-xs text-yellow-400 font-medium">Unverified</span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-600">Not configured</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPhoneLink(!showPhoneLink)}
                                className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
                            >
                                {hasPhone ? 'Change' : 'Link'}
                                <ChevronRight size={14} className={`transition-transform ${showPhoneLink ? 'rotate-90' : ''}`} />
                            </button>
                        </div>

                        {/* Phone linking form */}
                        {showPhoneLink && (
                            <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                                {!otpSent ? (
                                    <>
                                        <input
                                            type="tel"
                                            value={newPhone}
                                            onChange={(e) => setNewPhone(e.target.value)}
                                            placeholder="+974 XXXX XXXX"
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                                        />
                                        <button
                                            onClick={() => sendPhoneOtp(newPhone)}
                                            disabled={phoneLinking.loading || !newPhone}
                                            className="w-full py-3 bg-brand/20 border border-brand/30 rounded-xl text-sm font-bold text-brand hover:bg-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {phoneLinking.loading ? <Loader2 size={16} className="animate-spin" /> : <>Send Code <ArrowRight size={14} /></>}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs text-gray-400">Enter the code sent to <span className="text-white font-semibold">{newPhone}</span></p>
                                        <input
                                            type="text"
                                            value={phoneOtpCode}
                                            onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm text-center tracking-[0.3em] font-bold placeholder-gray-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                                        />
                                        <button
                                            onClick={() => verifyPhoneOtp(newPhone, phoneOtpCode)}
                                            disabled={phoneLinking.loading || phoneOtpCode.length < 6}
                                            className="w-full py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {phoneLinking.loading ? <Loader2 size={16} className="animate-spin" /> : <>Verify <CheckCircle size={14} /></>}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasEmail ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                                    <Mail size={18} className={hasEmail ? 'text-emerald-400' : 'text-gray-500'} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {hasEmail ? profile.email : 'No email linked'}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {hasEmail && emailVerified ? (
                                            <>
                                                <CheckCircle size={12} className="text-emerald-400" />
                                                <span className="text-xs text-emerald-400 font-medium">Verified</span>
                                            </>
                                        ) : hasEmail ? (
                                            <>
                                                <AlertCircle size={12} className="text-yellow-400" />
                                                <span className="text-xs text-yellow-400 font-medium">Unverified</span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-600">Not configured</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEmailLink(!showEmailLink)}
                                className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
                            >
                                {hasEmail ? 'Change' : 'Link'}
                                <ChevronRight size={14} className={`transition-transform ${showEmailLink ? 'rotate-90' : ''}`} />
                            </button>
                        </div>

                        {/* Email linking form */}
                        {showEmailLink && (
                            <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                                />
                                <button
                                    onClick={() => linkEmail(newEmail)}
                                    disabled={emailLinking.loading || !newEmail}
                                    className="w-full py-3 bg-brand/20 border border-brand/30 rounded-xl text-sm font-bold text-brand hover:bg-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {emailLinking.loading ? <Loader2 size={16} className="animate-spin" /> : <>Link Email <ArrowRight size={14} /></>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href="#tournaments"
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:bg-brand/20 transition-all">
                                <Award size={18} className="text-brand" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Tournaments</p>
                                <p className="text-xs text-gray-500">View & register</p>
                            </div>
                        </a>

                        <a
                            href="#membership-packages"
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-all">
                                <Crown size={18} className="text-gold" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Upgrade</p>
                                <p className="text-xs text-gray-500">Membership plans</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Admin shortcut */}
                {profile.tier === 'Admin' && (
                    <a
                        href="#admin-cms"
                        className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-red-400" />
                            <div>
                                <p className="text-sm font-bold text-white">Admin Dashboard</p>
                                <p className="text-xs text-gray-500">Manage content, users & tournaments</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </a>
                )}
            </div>
        </div>
    );
};

export default ProfileDashboard;
