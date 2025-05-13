'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { User, UserPlus, Mail, Smartphone } from 'lucide-react';

// ── Product options ──
const PRODUCT_OPTIONS = [
  { label: 'Health Coverage', value: 'health' },
  { label: 'Life Insurance', value: 'life' },
  { label: 'Short-Term Insurance', value: 'short_term' },
  { label: 'Banking', value: 'banking' },
  { label: 'Investments', value: 'investments' },
  { label: 'Wellness & Rewards Platforms', value: 'wellness', requiresVitality: true },
  { label: 'Corporate & Group Solutions', value: 'corporate' },
]

/**
 * Form state shape
 */
interface FormState {
  name: string;
  surname: string;
  email: string;
  mobile: string;
  isDiscoveryCustomer: boolean | null;
  hasVitality: boolean | null;
  products: string[];
  consent: boolean;
}

export default function Page() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: '',
    surname: '',
    email: '',
    mobile: '',
    isDiscoveryCustomer: null,
    hasVitality: null,
    products: [],
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);

  // Clean any previous storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lead_info');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('otp_sent_')) localStorage.removeItem(key);
      });
    }
  }, []);

  // Validation
  const validate = () => {
    const err: Record<string, string> = {};
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) err.email = 'Enter a valid email address';
    if (!form.name.trim()) err.name = 'First name is required';
    if (!form.surname.trim()) err.surname = 'Surname is required';
    const cleaned = form.mobile.replace(/\s|-/g, '');
    const mobileRegex = /^(0[6-8]\d{8}|\+27[6-8]\d{8})$/;
    if (!mobileRegex.test(cleaned)) err.mobile = 'Enter a valid SA mobile';
    // require a choice
    if (form.isDiscoveryCustomer === null) {
      err.isDiscoveryCustomer = 'Please indicate if you are a Discovery client';
    }
    if (form.isDiscoveryCustomer) {
      if (form.hasVitality === null) err.hasVitality = 'Please indicate Vitality status';
      if (form.products.length === 0) err.products = 'Please select at least one product';
    }
    if (
      form.products.includes('wellness') &&
      !(form.isDiscoveryCustomer && form.hasVitality)
    ) {
      err.products = '“Wellness & Rewards Platforms” requires Vitality membership';
    }
    if (!form.consent) err.consent = 'Please accept consent to proceed';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    localStorage.setItem('lead_info', JSON.stringify(form));
    router.push(
      `/pre-welness-day-reg/verify-otp?mobile=${encodeURIComponent(
        form.mobile.replace(/\s|-/g, '')
      )}`
    );
  };

  // Discovery "No" handler shows fee modal
  const handleDiscoveryNo = () => {
    setForm(f => ({ ...f, isDiscoveryCustomer: false, hasVitality: null, products: [] }));
    setShowFeeModal(true);
  };

  const handleModalProceed = () => setShowFeeModal(false);
  const handleModalCancel = () => {
    setShowFeeModal(false);
    setForm({
      name: '', surname: '', email: '', mobile: '',
      isDiscoveryCustomer: false, hasVitality: null, products: [], consent: false
    });
  };

  // Toggle product
  const toggleProduct = (value: string) => {
    setForm(prev => {
      let products = prev.products.includes(value)
        ? prev.products.filter(p => p !== value)
        : [...prev.products, value];
      let hasVitality = prev.hasVitality;
      if (value === 'wellness') {
        hasVitality = !prev.products.includes('wellness');
      }
      return { ...prev, products, hasVitality };
    });
  };

  // Helpers
  const yesNoBtn = (active: boolean) => cn(
    'px-4 py-1 rounded font-medium transition-colors',
    active ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black hover:bg-blue-500 hover:text-white'
  );
  const stepCircle = (active: boolean) => cn(
    'w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-sm font-bold',
    active ? 'bg-blue-600' : 'bg-gray-300'
  );
  const stepLabel = (active: boolean) => cn(
    'text-sm', active ? 'text-pink-600 font-medium' : 'text-gray-500'
  );

  const STEP_LABELS = ['Registration', 'OTP Verification', 'Success'];
  const currentStep = 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      {/* Fee Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Additional Fee Notice</h2>
            <p className="mb-6 text-gray-700">
              You’re not currently a Discovery client, so joining our Wellness Day check-up
              will incur a nominal fee payable by you. Would you like to proceed at your own cost?
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleModalCancel}>Cancel</Button>
              <Button onClick={handleModalProceed}>Proceed</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        {/* Progress */}
        <div className="flex justify-between mb-6">
          {STEP_LABELS.map((label, idx) => (
            <div key={label} className="flex-1 text-center">
              <div className={stepCircle(idx === currentStep)}>{idx + 1}</div>
              <span className={stepLabel(idx === currentStep)}>{label}</span>
            </div>
          ))}
        </div>

        <h1 className="text-2xl font-bold mb-2">Get Ready for Discovery Wellness Day: Register Now!</h1>
        <p className="text-sm text-gray-600 mb-6">
          Don’t miss out on those Vitality points! Enter your details now to reserve your spot.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <Label htmlFor="name">Name</Label>
            <User className="absolute left-2 top-8 text-[#db2777]" />
            <Input
              id="name"
              type="text"
              inputMode="text"
              pattern="[A-Za-z\s]+"
              placeholder="e.g. John"
              title="Letters and spaces only"
              className="pl-10"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Surname */}
          <div className="relative">
            <Label htmlFor="surname">Surname</Label>
            <UserPlus className="absolute left-2 top-8 text-[#db2777]" />
            <Input
              id="surname"
              type="text"
              inputMode="text"
              pattern="[A-Za-z\s]+"
              placeholder="e.g. Smith"
              title="Letters and spaces only"
              className="pl-10"
              value={form.surname}
              onChange={e => setForm({ ...form, surname: e.target.value })}
              required
            />
            {errors.surname && <p className="text-xs text-red-600 mt-1">{errors.surname}</p>}
          </div>

          {/* Email */}
          <div className="relative">
            <Label htmlFor="email">Email Address</Label>
            <Mail className="absolute left-2 top-8 text-[#db2777]" />
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="my@wellness.co.za"
              title="Please enter a valid email address"
              className="pl-10"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Mobile */}
          <div className="relative">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Smartphone className="absolute left-2 top-8 text-[#db2777]" />
            <Input
              id="mobile"
              type="tel"
              inputMode="numeric"
              className="pl-10"
              placeholder="e.g. +27 71 234 5678"
              value={form.mobile}
              onChange={e => setForm({ ...form, mobile: e.target.value })}
              required
            />
            {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
          </div>

          {/* Discovery Client? */}
          <div className="flex items-center gap-4">
            <Label>Discovery Client?</Label>
            <button
              type="button"
              className={yesNoBtn(form.isDiscoveryCustomer === true)}
              onClick={() => setForm({ ...form, isDiscoveryCustomer: true, hasVitality: null })}
            >Yes</button>
            <button
              type="button"
              className={yesNoBtn(form.isDiscoveryCustomer === false)}
              onClick={handleDiscoveryNo}
            >No</button>
          </div>
          {errors.isDiscoveryCustomer && (
            <p className="text-xs text-red-600 mt-1">{errors.isDiscoveryCustomer}</p>
          )}

          {/* Vitality & products… */}
          {form.isDiscoveryCustomer && (
            <div className="flex items-center gap-4">
              <Label>Have Vitality?</Label>
              <button
                type="button"
                className={yesNoBtn(form.hasVitality === true)}
                onClick={() => setForm(f => ({
                  ...f,
                  hasVitality: true,
                  products: f.products.includes('wellness')
                    ? f.products
                    : [...f.products, 'wellness']
                }))}
              >Yes</button>
              <button
                type="button"
                className={yesNoBtn(form.hasVitality === false)}
                onClick={() => setForm(f => ({
                  ...f,
                  hasVitality: false,
                  products: f.products.filter(p => p !== 'wellness')
                }))}
              >No</button>
              {errors.hasVitality && <p className="text-xs text-red-600 mt-1">{errors.hasVitality}</p>}
            </div>
          )}

          {/* Products */}
          {form.isDiscoveryCustomer && form.hasVitality !== null && (
            <div>
              <Label className="mb-1 block">My Discovery Products</Label>
              <div className="grid gap-3">
                {PRODUCT_OPTIONS.filter(o => (!o.requiresVitality || form.hasVitality)).map(o => {
                  const checked = form.products.includes(o.value);
                  return (
                    <label key={o.value} htmlFor={`prod-${o.value}`} className={cn(
                      'flex items-center space-x-2 rounded-md p-2 cursor-pointer border',
                      checked ? 'bg-white border-pink-600' : 'border-gray-300'
                    )}>
                      <Checkbox
                        id={`prod-${o.value}`} checked={checked}
                        onCheckedChange={() => toggleProduct(o.value)}
                        className="rounded-sm data-[state=checked]:bg-pink-600 data-[state=checked]:text-white"
                      />
                      <span className={cn('select-none text-sm', checked ? 'text-pink-600 font-medium' : 'text-black')}>
                        {o.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.products && <p className="text-xs text-red-600 mt-1">{errors.products}</p>}
            </div>
          )}

          {/* Consent */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent" checked={form.consent}
              onCheckedChange={v => setForm({ ...form, consent: Boolean(v) })}
            />
            <Label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed">
              By registering you consent to Discovery’s broker contacting you. You may opt‑out anytime.
            </Label>
          </div>
          {errors.consent && <p className="text-xs text-red-600 -mt-2">{errors.consent}</p>}

          <Button type="submit" className="w-full mt-2 flex items-center justify-center gap-2" disabled={submitting}>
            {submitting ? 'Processing…' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
