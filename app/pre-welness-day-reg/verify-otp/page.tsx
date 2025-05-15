'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * Verify OTP page: sends OTP once, tracks via localStorage,
 * allows single manual resend, then directs to call broker.
 */
function VerifyOtpContent() {
  const router = useRouter();
  const mobile = useSearchParams().get('mobile');

  

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const stepCircle = (active: boolean) => cn(
    'w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-sm font-bold',
    active ? 'bg-blue-600' : 'bg-gray-300'
  );
  const stepLabel = (active: boolean) => cn(
    'text-sm leading-tight', // reduced line-height for less gap
    active ? '' : 'text-gray-500'
  );


  useEffect(() => {
    const leadInfo = localStorage.getItem('lead_info');
    if (!leadInfo || !mobile) {
      router.replace('/pre-welness-day-reg/registration');
      return;
    }

   

    // key per mobile
    const sentFlag = `otp_sent_${mobile}`;
    if (!localStorage.getItem(sentFlag)) {
      fetch('/api/send_otp_clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile_number: mobile }),
      }).catch(() => console.error('Failed to send OTP'));
      localStorage.setItem(sentFlag, 'true');
    }
  }, [mobile, router]);

  const resendOtp = async () => {
    setError(null);
    if (resendCount >= 1) {
      setError('Please call the broker directly if you did not receive the code.');
      return;
    }
    setResendCount(1);
    try {
      await fetch('/api/send_otp_clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile_number: mobile }),
      });
      setError('A new code has been sent.');
    } catch {
      setError('Failed to resend. Please call the broker directly.');
    }
  };

  const handleVerify = async () => {
    if (!mobile || otp.length < 6) return;
    setLoading(true);
    setError(null);

    // validate OTP
    const resp = await fetch('/api/validate_otp_clean', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ mobile_number: mobile, otp }),
    });
    const { success, message } = await resp.json();
    if (!success) {
      setError(message || 'Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    // proceed to create lead & final SMS...
    const leadInfo = JSON.parse(localStorage.getItem('lead_info') || '{}');
    const createRes = await fetch('/api/create-pre-event-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: leadInfo.name,
        surname: leadInfo.surname,
        email: leadInfo.email,
        mobile: leadInfo.mobile,
        is_discovery_customer: leadInfo.isDiscoveryCustomer,
        has_vitality: leadInfo.hasVitality,
        products: leadInfo.products,
        consent: leadInfo.consent,
      }),
    });
    const { success: created, data } = await createRes.json();
    if (!created) {
      router.push(`/pre-welness-day-reg/failed?reason=Lead insert failed`);
      return;
    }

    // send final SMS
    const { lead_code } = data[0];
 
    // send final SMS
    // const carlaNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const smsMessage =
      `Hi ${leadInfo.name}, your ref no. is ${lead_code}. ` +
      `See you at the Wellness Day!\n\nCarla Prinsloo (0829215785)\nYour Senior Financial Advisor\nDiscovery LTD.`;

    await fetch('/api/send_sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: mobile, messageContent: smsMessage }),
    });

    //UPDATE leadINFO with lead_code
    localStorage.setItem('lead_code', lead_code);
    
    router.push('/pre-welness-day-reg/thank-you');
  };

  const STEP_LABELS = [
    'Register Details',
    'Verify Your Number',
    'All Set!'
  ];
  const currentStep = 1;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
        <div
          className="bg-white p-8 rounded-xl max-w-md w-full text-center relative pt-16"
          style={{ boxShadow: '0 4px 10px rgba(230, 0, 126, 0.25)' }}
        >
          {/* Vitality Logo at top-left */}
          <Image
            src="/Vitality-Pink-logo.svg"
            alt="Vitality Logo"
            width={100}
            height={35}
            className="absolute top-4 left-4"
            priority
          />
          {/* Progress Bar Wrapper */}
          <div className="w-full max-w-[700px] mx-auto flex justify-between mb-6 pt-3">
            {STEP_LABELS.map((label, idx) => {
              const isActive = idx === currentStep;
              return (
                <div key={label} className="flex-1 text-center px-2"> {/* Added px-2 here */}
                  <div className={stepCircle(isActive)}>{idx + 1}</div>
                  <span
                    className={cn(stepLabel(isActive), 'whitespace-nowrap')}
                    style={{ color: isActive ? '#EB2660' : undefined }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

        <h1 className="text-3xl font-semibold text-[#eb2660] mb-4 uppercase">
          Verify OTP
        </h1>

        <p className="text-base text-[#666666] mb-4">
          Enter the one-time PIN sent to <strong className="font-semibold">{mobile}</strong>
        </p>
        <div className="flex justify-center my-4">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, idx) => <InputOTPSlot key={idx} index={idx} className="w-12 h-12 text-xl" />)}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <Button
          className="w-full mb-2 flex items-center justify-center gap-2"
          disabled={loading || otp.length < 6}
          onClick={handleVerify}>
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Verifying…
            </>
          ) : (
            'Verify'
          )}
        </Button>
        <div className="w-full text-left">
          <Button
            variant="link"
            className="text-xs text-[#eb2660] text"   // <-- added your custom pink
            onClick={resendOtp}
            disabled={resendCount >= 1 || loading}
          >
            {resendCount === 0 ? 'Resend OTP' : 'Call broker for help'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
