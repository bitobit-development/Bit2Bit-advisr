// lib/routes.ts

// 1. Define your “app folder” in one place:
const APP_FOLDER = 'pre-wellness-day-reg';

// 2. Sanitize and encode parameters in helpers:
function sanitizeMobile(raw: string): string {
  return encodeURIComponent(raw.replace(/\s|-/g, ''));
}

function sanitizeReason(reason: string): string {
  return encodeURIComponent(reason);
}

// 3. Utility to get an absolute URL (client-only; SSR-safe):
export function absolute(path: string): string {
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

// 4. Export all your URL-builders here:
export const ROUTES = {
  /**
   * Landing page for the pre-wellness-day registration flow
   */
  landing: () => `/${APP_FOLDER}/`,

  /**
   * Registration page (start of flow)
   */
  registration: () => `/${APP_FOLDER}/registration`,

  /**
   * OTP verification page
   * @param mobile Raw mobile number entered by user
   */
  verifyOtp: (mobile: string) =>
    `/${APP_FOLDER}/verify-otp?mobile=${sanitizeMobile(mobile)}`,

  /**
   * Thank-you page after successful registration
   */
  thankYou: () => `/${APP_FOLDER}/thank-you`,

  /**
   * Failed flow page
   * @param reason Error message or failure reason
   */
  failed: (reason: string) =>
    `/${APP_FOLDER}/failed?reason=${sanitizeReason(reason)}`,
};

// 5. Absolute URLs for use in <a href="..."> or email templates:
export const ABSOLUTE_URLS = {
  /** href for <a> tags: */
  registration: () => absolute(ROUTES.registration()),
  verifyOtp: (mobile: string) => absolute(ROUTES.verifyOtp(mobile)),
  thankYou: () => absolute(ROUTES.thankYou()),
  failed: (reason: string) => absolute(ROUTES.failed(reason)),
};

/*
Usage in JSX:
  import { ABSOLUTE_URLS } from '@/lib/routes';

  // In an <a> tag:
  <a href={ABSOLUTE_URLS.registration()}>Register</a>
*/
