'use client';

import React, { useActionState, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, ArrowLeft, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { register, sendRegistrationOTP } from '@/lib/actions';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

function RegisterButton({ disabled }: { disabled?: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full h-12 mt-6" disabled={pending || disabled} type="submit">
            {pending ? 'Création...' : 'Créer mon compte'}
        </Button>
    );
}

// Password validation rules
interface PasswordRule {
    label: string;
    test: (password: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
    { label: 'Minimum 12 caractères', test: (p) => p.length >= 12 },
    { label: 'Au moins une majuscule', test: (p) => /[A-Z]/.test(p) },
    { label: 'Au moins un chiffre', test: (p) => /[0-9]/.test(p) },
    { label: 'Au moins un caractère spécial', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function RegisterPage() {
    const [errorMessage, dispatch] = useActionState(register, undefined);
    const [phoneValue, setPhoneValue] = useState<string | undefined>();
    const [password, setPassword] = useState('');

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    const handleSendCode = async () => {
        if (!phoneValue) return;
        setIsSendingCode(true);
        setPhoneError('');
        try {
            const res = await sendRegistrationOTP(phoneValue);
            if (res.error) {
                setPhoneError(res.error);
            } else {
                setOtpSent(true);
            }
        } catch (e) {
            setPhoneError("Erreur lors de l'envoi.");
        } finally {
            setIsSendingCode(false);
        }
    };

    // Real-time password validation
    const passwordChecks = useMemo(() => {
        return PASSWORD_RULES.map(rule => ({
            ...rule,
            passed: rule.test(password)
        }));
    }, [password]);

    const allRulesPassed = passwordChecks.every(check => check.passed);
    const passedCount = passwordChecks.filter(check => check.passed).length;

    // Calculate strength percentage
    const strengthPercent = (passedCount / PASSWORD_RULES.length) * 100;
    const strengthColor = strengthPercent === 100 ? 'bg-green-500' :
        strengthPercent >= 75 ? 'bg-yellow-500' :
            strengthPercent >= 50 ? 'bg-orange-500' : 'bg-red-500';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1c] relative overflow-hidden font-sans">
            {/* Modern Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,_var(--tw-gradient-stops))] from-blue-600/10 via-[#0a0f1c] to-[#0a0f1c]"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/5 via-transparent to-transparent blur-3xl"></div>

            <Card className="w-full max-w-md p-8 relative z-10 border border-[rgba(0,139,255,0.2)] bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8 group cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                            <TrendingUp className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">DropTrend</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Créer un compte</h1>
                    <p className="text-slate-400 text-sm">Accédez à la suite d'outils DropTrend.</p>
                </div>

                <form action={dispatch} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nom complet</label>
                        <input
                            name="name"
                            type="text"
                            className="w-full bg-slate-950/50 border border-[rgba(0,139,255,0.2)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-600"
                            placeholder="Jean Dupont"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</label>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <div className="phone-input-dark-theme flex-1">
                                    <PhoneInput
                                        placeholder="Numéro de téléphone"
                                        value={phoneValue}
                                        onChange={setPhoneValue}
                                        defaultCountry="FR"
                                        className="flex gap-2"
                                        numberInputProps={{
                                            className: "w-full bg-slate-950/50 border border-[rgba(0,139,255,0.2)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-600"
                                        }}
                                        disabled={otpSent}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={!phoneValue || isSendingCode || otpSent}
                                    className="px-4 py-3 h-[46px]"
                                    variant="outline"
                                >
                                    {isSendingCode ? <Loader2 className="animate-spin w-4 h-4" /> : otpSent ? <Check className="w-4 h-4 text-green-500" /> : 'Rejoindre'}
                                </Button>
                            </div>

                            {otpSent && (
                                <div className="animate-in fade-in slide-in-from-top-2 space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code de vérification</label>
                                    <input
                                        name="otpCode"
                                        type="text"
                                        className="w-full bg-slate-950/50 border border-blue-500/50 rounded-lg px-4 py-3 text-white text-center tracking-widest font-mono text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="123456"
                                        required
                                        maxLength={6}
                                    />
                                    <p className="text-[10px] text-green-400">Code envoyé au {phoneValue}</p>
                                </div>
                            )}

                            {phoneError && (
                                <p className="text-[10px] text-red-400">{phoneError}</p>
                            )}
                        </div>
                        <input type="hidden" name="phoneNumber" value={phoneValue || ''} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                        <input
                            name="email"
                            type="email"
                            className="w-full bg-slate-950/50 border border-[rgba(0,139,255,0.2)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-600"
                            placeholder="jean@exemple.com"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mot de passe</label>
                            <span className={`text-[10px] font-bold ${allRulesPassed ? 'text-green-400' : 'text-blue-400/80'}`}>
                                {allRulesPassed ? '✓ Sécurisé' : `${passedCount}/${PASSWORD_RULES.length} critères`}
                            </span>
                        </div>
                        <input
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-slate-950/50 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all text-sm placeholder:text-slate-600 ${password.length === 0 ? 'border-[rgba(0,139,255,0.2)] focus:border-blue-500/50 focus:ring-blue-500/50' :
                                allRulesPassed ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/50' :
                                    'border-orange-500/50 focus:border-orange-500/50 focus:ring-orange-500/50'
                                }`}
                            placeholder="••••••••••••"
                            required
                            minLength={12}
                        />

                        {/* Password Strength Bar */}
                        {password.length > 0 && (
                            <div className="mt-2 space-y-2">
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${strengthColor}`}
                                        style={{ width: `${strengthPercent}%` }}
                                    />
                                </div>

                                {/* Password Rules Checklist */}
                                <div className="grid grid-cols-2 gap-1">
                                    {passwordChecks.map((check, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-1.5 text-[10px] transition-colors ${check.passed ? 'text-green-400' : 'text-slate-500'
                                                }`}
                                        >
                                            {check.passed ? (
                                                <Check size={10} className="shrink-0" />
                                            ) : (
                                                <X size={10} className="shrink-0" />
                                            )}
                                            <span>{check.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="flex min-h-[20px] items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {errorMessage && (
                            <div className="flex items-center gap-2 p-3 w-full bg-red-500/10 border border-red-500/20 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                <p className="text-xs text-red-300 font-medium">{errorMessage}</p>
                            </div>
                        )}
                    </div>

                    <RegisterButton disabled={!otpSent} />
                </form>

                <div className="mt-8 pt-6 border-t border-[rgba(0,139,255,0.2)] text-center">
                    <p className="text-slate-500 text-xs mb-4">
                        Déjà membre ? <Link href="/login" className="text-white hover:text-blue-400 font-semibold transition-colors">Connexion</Link>
                    </p>
                    <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-xs font-medium transition-colors">
                        <ArrowLeft size={12} /> Retour à l'accueil
                    </Link>
                </div>
            </Card>
        </div>
    );
}
