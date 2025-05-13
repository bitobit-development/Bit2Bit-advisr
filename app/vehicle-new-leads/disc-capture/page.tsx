'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronsLeftIcon } from 'lucide-react';

export default function ScanDiscPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const steps = ['Sign Up', 'Verify OTP', 'Upload ID', 'Scan Disc'];
  const currentStep = 3;

  const handleReset = () => {
    setBase64Image(null);
    if (isMobileOrTablet) startCamera(); // Restart the camera feed if on mobile/tablet
  };

  // Function to detect mobile/tablet environment
  const checkDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent);
    const isTablet = /ipad|tablet/i.test(userAgent);
    setIsMobileOrTablet(isMobile || isTablet);
  };

  // Function to start camera (only for mobile/tablet)
  const startCamera = async () => {
    if (!isMobileOrTablet) return; // Don't start the camera on web environment

    try {
      // Stop the previous video stream if any
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }

      // Start the camera feed again
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } }, // back camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const handleSubmit = () => {
    if (!base64Image || isSubmitting) return; // Check if image is available and avoid double submission

    setIsSubmitting(true); // Prevent multiple submissions

    const mobile = '0823292438'; // Static mobile number for now
    const requestBody = { mobile, image: base64Image }; // Create request body with mobile and image

    console.log('📤 Submitting base64 to backend...', base64Image);

    fetch('/api/decode_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert('Disc submitted and decoded successfully!');
        // Handle successful submission
        const newInsertedLead = JSON.parse(localStorage.getItem('new_inserted_lead') || '{}');
        newInsertedLead.disc_details = data;
        localStorage.setItem('new_inserted_lead', JSON.stringify(newInsertedLead));

        // make a post call to insert the disc details into car_disc table in supabase together with the image
        //console.log(data);
      } else {
        if (data.message.includes("No barcode detected")) {
          alert('No barcode detected. Please ensure the disc is properly aligned and try again.');
        } else {
          alert(`Failed to submit image. Reason: ${data.message}`);
        }
        console.log('Error:', data.message);
      }
    })
    .catch((error) => {
      alert('An unexpected error occurred. Please try again.');
      console.error('Error:', error);
    })
    .finally(() => {
      setIsSubmitting(false); // Allow new submissions after completion
    });
  };

  useEffect(() => {
    checkDevice(); // Check device type when the page loads
    if (isMobileOrTablet) startCamera(); // Only start the camera if on mobile/tablet

    // Retrieve base64 image from localStorage if available
    const savedBase64Image = localStorage.getItem('scanned_disc_image');
    if (savedBase64Image) {
      setBase64Image(savedBase64Image);
    }
  }, [isMobileOrTablet]);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Full video size
    const fullWidth = video.videoWidth;
    const fullHeight = video.videoHeight;

    canvas.width = fullWidth;
    canvas.height = fullHeight;

    // Draw entire frame first
    ctx.drawImage(video, 0, 0, fullWidth, fullHeight);

    // Define circular crop region: center of video
    const radius = Math.min(fullWidth, fullHeight) * 0.25; // circle = 50% of width or height
    const centerX = fullWidth / 2;
    const centerY = fullHeight / 2;
    const cropX = centerX - radius;
    const cropY = centerY - radius;
    const cropSize = radius * 2;

    // Create a new temp canvas to draw the cropped region
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    cropCtx.drawImage(
      canvas,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      cropSize,
      cropSize
    );

    const base64 = cropCanvas.toDataURL('image/jpeg');
    setBase64Image(base64);
    console.log('🎯 Cropped disc base64:', base64);

    // Store the base64 image in localStorage
    localStorage.setItem('scanned_disc_image', base64);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setBase64Image(base64);

      // Store the base64 image in localStorage
      localStorage.setItem('scanned_disc_image', base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
        {/* Step Progress */}
        <div className="flex justify-between mb-6">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            return (
              <div key={step} className="flex-1 text-center">
                <div
                  className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-sm font-bold
                  ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  {index + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-pink-600 font-medium' : 'text-gray-500'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <h1 className="text-xl font-bold mb-2">Scan Your License Disc</h1>
        <p className="text-sm text-gray-600 mb-4">
          Hold your phone steady and align the disc within the circle. Or upload an existing image below.
        </p>

        {/* Video Camera Feed */}
        {isMobileOrTablet && (
          <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-md border shadow">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border-4 border-white/70" />
            </div>
          </div>
        )}

        {!base64Image ? (
          <Button onClick={captureImage} className="w-full mb-4" disabled={isSubmitting}>
            Capture Disc
          </Button>
        ) : (
          <div className="flex gap-2 mb-4">
            <Button onClick={handleReset} variant="secondary" className="flex-1">
              Try Again
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
              Submit
            </Button>
          </div>
        )}

        <div className="mb-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="text-sm"
            disabled={isSubmitting}
          />
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {base64Image && (
          <div className="mt-4">
            <h3 className="font-medium text-sm mb-2">Preview:</h3>
            <img src={base64Image} alt="Disc preview" className="w-full rounded-md shadow" />
          </div>
        )}
      </div>
    </div>
  );
}
