// app/pre-welness-day-reg/thank-you/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Phone, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FaWhatsapp } from 'react-icons/fa';
import  Image from 'next/image';

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
  const STEP_LABELS = [
    'Register Details',
    'Verify Your Number',
    'All Set!'
  ];
  const currentStep = 2;

  // Helpers for progress
  const stepCircle = (active: boolean) => cn(
    'w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-sm font-bold',
    active ? 'bg-blue-600' : 'bg-gray-300'
  );
  const stepLabel = (active: boolean) => cn(
    'text-sm leading-tight', // reduced line-height for less gap
    active ? '' : 'text-gray-500'
  );

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
        // Generate vCard
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

        // Send email with details (includes VCF deletion note)
        const response = await fetch('/api/send-email-with-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: BROKER_EMAIL,
            subject: `Message from Advisr - New Customer Information: ${lead.name} ${lead.surname}`,
            templateData: {
              name: lead.name,
              surname: lead.surname,
              email: lead.email || 'N/A',
              mobile: lead.mobile,
              isDiscoveryCustomer: lead.isDiscoveryCustomer ? 'Yes' : 'No',
              hasVitality: lead.hasVitality ? 'Yes' : 'No',
              products: lead.products.join(', ') || 'None',
              consent: lead.consent ? 'Yes' : 'No',
              lead_code: lead.lead_code,
              note: "**The attached vCard file has been permanently deleted from the server.**"
            },
            attachmentPath: vcardPath,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Email send error');
        }

        console.log('Detailed email sent successfully.');

        // 4) send the client their Vitality email
        const custResp = await fetch('/api/send-vitality-email', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            to: lead.email,
            name: lead.name,
            DiscoveryCustomer: lead.isDiscoveryCustomer,
            hasVitality: lead.hasVitality,
            leadNumber: lead.lead_code,
          }),
        });
        const custResult = await custResp.json();
        if (!custResp.ok || !custResult.success) {
          console.error('Customer Vitality email failed:', custResult.error);
        } else {
          console.log('Vitality email sent to client');
        }

        // Delete vCards from server
        const deleteResp = await fetch('/api/empty-vcard-lib', { method: 'POST' });
        const deleteJson = await deleteResp.json();
        if (!deleteResp.ok || !deleteJson.success) {
          throw new Error(deleteJson.error || 'Deleting vCards failed');
        }

        console.log('Deleted vCard files count:', deleteJson.deleted);

      } catch (err: any) {
        console.error('Error in vCard/email workflow:', err.message || err);
      }
    })();
  }, [lead, BROKER_EMAIL]);


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
        {/* Progress */}
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

        {/* Success */}
        <CheckCircle2 className="mx-auto text-green-600 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-semibold text-[#eb2660] mb-4 text-center">
          Thank You!
        </h1>

        <p className="text-base text-[#666666] mb-6 whitespace-pre-line text-center">
          Congratulations—your spot is secured!<br />
          Look out for our message with all the details.
        </p>

        <Button
          onClick={() => { clearAll(); router.push(BROKER_WEB); }}
          className="w-full h-10 rounded-md flex items-center justify-center gap-2 bg-[#eb2660] hover:bg-[#D81B60] text-white font-semibold transition-colors duration-300 mb-4"
        >
          <HomeIcon className="w-5 h-5" />
          Explore Our Services
        </Button>

        {lead && (
      <Button
        onClick={() => window.open(whatsappLink, '_blank')}
        className="w-full h-10 rounded-md flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors duration-300"
      >
        <FaWhatsapp className="w-5 h-5" />
        WhatsApp Carla
      </Button>
        )}
      </div>
    </div>
  );
}
