'use client';

import React, { useActionState, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { updateProfile, requestPhoneCode, verifyPhoneCode } from '@/lib/settings-actions';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface SettingsFormProps {
  user: {
    name: string | null;
    email: string | null;
    language: string;
    phoneNumber: string | null;
  };
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [state, dispatch] = useActionState(updateProfile, null);
  const [phone, setPhone] = useState(user.phoneNumber || '');
  const [code, setCode] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'code_sent' | 'verified'>(user.phoneNumber ? 'verified' : 'idle');
  const [phoneError, setPhoneError] = useState('');

  const handleSendCode = async () => {
    setIsRequesting(true);
    setPhoneError('');
    try {
      const res = await requestPhoneCode(phone);
      if (res.error) {
        setPhoneError(res.error);
      } else {
        setVerificationStep('code_sent');
      }
    } catch (e) {
      setPhoneError("Erreur lors de l'envoi.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsVerifying(true);
    setPhoneError('');
    try {
      const res = await verifyPhoneCode(phone, code);
      if (res.error) {
        setPhoneError(res.error);
      } else {
        setVerificationStep('verified');
      }
    } catch (e) {
      setPhoneError("Erreur de vérification.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <form action={dispatch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Nom complet</label>
          <input
            name="name"
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"
            defaultValue={user.name || ''}
          />
        </div>

        {/* Phone Verification Section */}
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
          <label className="block text-sm font-medium text-slate-400">Numéro de téléphone (Vérification obligatoire)</label>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <PhoneInput
                  placeholder="Entrez votre numéro"
                  value={phone}
                  onChange={(val) => setPhone(val as string)}
                  defaultCountry="FR"
                  className="bg-slate-950 rounded-lg px-4 py-2 text-white border border-slate-800 phone-input-dark"
                  disabled={verificationStep === 'verified'}
                />
              </div>
              {verificationStep === 'idle' && (
                <Button
                  type="button"
                  onClick={handleSendCode}
                  disabled={!phone || isRequesting}
                  className="whitespace-nowrap"
                >
                  {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vérifier'}
                </Button>
              )}
              {verificationStep === 'verified' && (
                <div className="flex items-center gap-2 text-green-400 px-3 py-2 bg-green-400/10 rounded-lg border border-green-400/20">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-medium">Vérifié</span>
                </div>
              )}
            </div>

            {verificationStep === 'code_sent' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-xs text-slate-400 mb-1 block">Code reçu par SMS</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-center tracking-widest"
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={!code || isVerifying}
                  >
                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Valider'}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Code envoyé au {phone}. <button type="button" onClick={() => setVerificationStep('idle')} className="text-blue-400 hover:underline">Modifier le numéro</button>
                </p>
              </div>
            )}

            {phoneError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-2 rounded-lg">
                <AlertCircle size={16} />
                {phoneError}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
          <input
            type="email"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white opacity-50 cursor-not-allowed"
            defaultValue={user.email || ''}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Langue</label>
          <select
            name="language"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"
            defaultValue={user.language}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
        <Button type="submit" className="w-full sm:w-auto">Enregistrer les modifications</Button>
        {state?.success && <p className="text-green-400 text-sm">{state.message}</p>}
        {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
      </form>
    </div>
  );
}
