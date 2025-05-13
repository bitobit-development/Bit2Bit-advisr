'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Phone, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Lead data shape stored in localStorage
 */
interface LeadData {
  name: string;
  surname: string;
  email?: string;
  mobile: string;
  isDiscoveryCustomer: boolean;
  hasVitality: boolean;
  products: string[];
  lead_code: string;
  consent: boolean;
}

export default function ThankYouPage() {
  const router = useRouter();
  const [lead, setLead] = useState<LeadData | null>(null);

  // Secrets
  const BROKER_EMAIL = process.env.NEXT_PUBLIC_BROKER_EMAIL!;
  const BROKER_WEB = process.env.NEXT_PUBLIC_BROKER_WEB!;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!;

  // Progress steps
  const steps = ['Sign Up', 'Verify OTP', 'Complete'];
  const currentStep = 2;

  // Helpers for progress
  const stepCircle = (active: boolean) =>
    cn(
      'w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-sm font-bold',
      active ? 'bg-blue-600' : 'bg-gray-300'
    );
  const stepLabel = (active: boolean) =>
    cn('text-sm', active ? 'text-pink-600 font-medium' : 'text-gray-500');

  // Build WhatsApp link with proper line breaks
  const whatsappMessage = lead
    ? `Hi Carla,\nMy name is ${lead.name} ${lead.surname}.\nMy contact details are as follows:\nEmail: ${lead.email || 'N/A'}\nMobile: ${lead.mobile}\nReference Number: ${lead.lead_code}\nDiscovery customer: ${lead.isDiscoveryCustomer ? 'Yes' : 'No'}\n${lead.products.length ? `Products: ${lead.products.join(', ')}` : 'No products selected.'}\nThank You.`
    : '';

  const whatsappLink = lead
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        whatsappMessage
      )}`
    : '#';

  // Load lead data and guard
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const infoStr = localStorage.getItem('lead_info');
    const code = localStorage.getItem('lead_code') || '';
    if (!infoStr || !code) {
      router.replace('/pre-welness-day-reg/registration');
      return;
    }
    try {
      const info = JSON.parse(infoStr);
      setLead({
        name: info.name,
        surname: info.surname,
        email: info.email,
        mobile: info.mobile,
        isDiscoveryCustomer: info.isDiscoveryCustomer,
        hasVitality: info.hasVitality,
        products: info.products || [],
        lead_code: code,
        consent: info.consent,
      });
    } catch {
      router.replace('/pre-welness-day-reg/registration');
    }
  }, [router]);

  // Workflow: vCard/email/delete/confirm
  useEffect(() => {
    if (!lead) return;
    (async () => {
      const filename = `${lead.name}_${lead.surname}.vcf`;
      const vcardPath = `app/vcards/${filename}`;
      try {
        const createResp = await fetch('/api/create-contact-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: lead.name,
            surname: lead.surname,
            email: lead.email,
            mobile: lead.mobile,
            isDiscoveryCustomer: lead.isDiscoveryCustomer,
            hasVitality: lead.hasVitality,
            products: lead.products,
            consent: lead.consent,
            phoneType: 'iphone',
          }),
        });
        if (!createResp.ok) throw new Error('vCard generation failed');
        console.log('vCard generated:', filename);

        const emailResp = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: BROKER_EMAIL,
            subject: `Contact Card for ${lead.name} ${lead.surname}`,
            text: `Hi Carla, please find attached the contact card for ${lead.name} ${lead.surname}.`,
            attachmentPath: vcardPath,
          }),
        });
        const emailJson = await emailResp.json();
        if (!emailResp.ok || !emailJson.success) {
          console.error('Email vCard failed:', emailJson.error || emailJson);
          throw new Error('Emailing vCard failed');
        }
        console.log('Email vCard sent successfully');

        const deleteResp = await fetch('/api/empty-vcard-lib', { method: 'POST' });
        const deleteJson = await deleteResp.json();
        if (!deleteResp.ok || !deleteJson.success) {
          console.error('Deleting vCards failed:', deleteJson.error || deleteJson);
          throw new Error('Deleting vCards failed');
        }
        console.log('Deleted vCard files count:', deleteJson.deleted);

        const confirmResp = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: BROKER_EMAIL,
            subject: `vCard Removed: ${lead.name} ${lead.surname}`,
            text: `The contact card file ${filename} for ${lead.name} ${lead.surname} (code ${lead.lead_code}) was sent and ${deleteJson.deleted} files deleted from server.`,
          }),
        });
        const confirmJson = await confirmResp.json();
        if (!confirmResp.ok || !confirmJson.success) {
          console.error('Confirmation email failed:', confirmJson.error || confirmJson);
        } else {
          console.log('Confirmation email sent');
        }
      } catch (err: any) {
        console.error('Error in vCard/email workflow:', err.message || err);
      }
    })();
  }, [lead]);

  // Clear storage on unload
  const clearAll = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('lead_info');
    localStorage.removeItem('lead_code');
    Object.keys(localStorage)
      .filter((k) => k.startsWith('otp_sent_'))
      .forEach((k) => localStorage.removeItem(k));
  };
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('beforeunload', clearAll);
    return () => window.removeEventListener('beforeunload', clearAll);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        {/* Progress */}
        <div className="flex justify-between mb-6">
          {steps.map((step, idx) => {
            const active = idx === currentStep;
            return (
              <div key={idx} className="flex-1 text-center">
                <div className={stepCircle(active)}>{idx + 1}</div>
                <span className={stepLabel(active)}>{step}</span>
              </div>
            );
          })}
        </div>

        {/* Success */}
        <CheckCircle2 className="mx-auto text-green-600 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Thank you!</h1>
        <p className="text-gray-600 text-sm mb-6 whitespace-pre-line text-center">
          Congratulations—your spot is secured!<br />
          Look out for our message with all the details.
        </p>

        <Button onClick={() => { clearAll(); router.push(BROKER_WEB); }} className="w-full mb-4 flex items-center justify-center gap-2">
          <HomeIcon className="w-5 h-5" />
          Explore Our Services
        </Button>

        {lead && (
          <Button onClick={() => window.open(whatsappLink, '_blank')} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700">
            <Phone className="w-5 h-5" />
            WhatsApp Carla
          </Button>
        )}
      </div>
    </div>
  );
}
