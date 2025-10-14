import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, User, CreditCard, FileText, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { submitVerification, VerificationData } from '../lib/idVerification';
import { useApp } from '../context/AppContext';

interface IDVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (verificationData: any) => void;
  userName: string;
}

const IDVerification = ({ isOpen, onClose, onComplete, userName }: IDVerificationProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationData, setVerificationData] = useState({
    documentType: '',
    frontImage: null as File | null,
    backImage: null as File | null,
    selfieImage: null as File | null,
    personalDetails: {
      fullName: '',
      dateOfBirth: '',
      address: '',
      postcode: '',
      phoneNumber: ''
    }
  });
  const [dragOver, setDragOver] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state } = useApp();

  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const selfieFileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const documentTypes = [
    { id: 'passport', name: 'Passport', icon: '🛂', description: 'UK or EU passport' },
    { id: 'driving_license', name: 'Driving License', icon: '🚗', description: 'UK driving license' },
    { id: 'national_id', name: 'National ID', icon: '🆔', description: 'National identity card' }
  ];

  const handleFileUpload = (file: File, type: 'front' | 'back' | 'selfie') => {
    if (file && file.type.startsWith('image/')) {
      setVerificationData(prev => ({
        ...prev,
        [`${type}Image`]: file
      }));
      
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'front' | 'back' | 'selfie') => {
    e.preventDefault();
    setDragOver('');
    const file = e.dataTransfer.files[0];
    handleFileUpload(file, type);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'selfie') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    
    if (!state.currentUser) {
      setIsProcessing(false);
      setError('User not found. Please log in and try again.');
      return;
    }

    if (!verificationData.frontImage || !verificationData.selfieImage) {
      setIsProcessing(false);
      setError('Please upload all required images.');
      return;
    }

    if (!verificationData.personalDetails.fullName || !verificationData.personalDetails.dateOfBirth) {
      setIsProcessing(false);
      setError('Please fill in all required personal details.');
      return;
    }

    try {
      const verificationPayload: VerificationData = {
        documentType: verificationData.documentType,
        frontImage: verificationData.frontImage,
        backImage: verificationData.backImage || undefined,
        selfieImage: verificationData.selfieImage,
        personalDetails: verificationData.personalDetails
      };

      const result = await submitVerification(state.currentUser.id, verificationPayload);

      if (result.success) {
        onComplete({
          ...verificationData,
          checkId: result.checkId,
          status: result.status // This will be Yoti's session status
        });
        alert('ID Verification submitted successfully! You will receive confirmation within 24 hours.');
        onClose();
      } else {
        setError(result.error || 'Verification submission failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceedStep1 = verificationData.documentType !== '';
  const canProceedStep2 = verificationData.frontImage && (verificationData.documentType === 'passport' || verificationData.backImage);
  const canProceedStep3 = verificationData.selfieImage;
  const canProceedStep4 = verificationData.personalDetails.fullName && 
                          verificationData.personalDetails.dateOfBirth && 
                          verificationData.personalDetails.address && 
                          verificationData.personalDetails.postcode;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">ID Verification</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep} of 4</span>
              <span>Verifying {userName}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span className={currentStep >= 1 ? 'text-green-600' : ''}>Document Type</span>
              <span className={currentStep >= 2 ? 'text-green-600' : ''}>Upload ID</span>
              <span className={currentStep >= 3 ? 'text-green-600' : ''}>Selfie</span>
              <span className={currentStep >= 4 ? 'text-green-600' : ''}>Details</span>
            </div>
          </div>

          {/* Step 1: Document Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your ID Document</h3>
                <p className="text-gray-600">Select the type of identification you'd like to use for verification</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documentTypes.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setVerificationData(prev => ({ ...prev, documentType: doc.id }))}
                    className={`p-6 border-2 rounded-xl text-center transition-all ${
                      verificationData.documentType === doc.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{doc.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-1">{doc.name}</h4>
                    <p className="text-sm text-gray-600">{doc.description}</p>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Why do we need this?</h4>
                    <p className="text-sm text-blue-600">
                      Your information is secure and encrypted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Document Upload */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your {documentTypes.find(d => d.id === verificationData.documentType)?.name}</h3>
                <p className="text-gray-600">Take clear photos of your identity document. Ensure all text is readable and the image is well-lit.</p>
              </div>

              {/* Front Side Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {verificationData.documentType === 'passport' ? 'Passport Photo Page' : 'Front Side'}
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver === 'front' ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  } ${verificationData.frontImage ? 'border-green-400 bg-green-50' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver('front'); }}
                  onDragLeave={() => setDragOver('')}
                  onDrop={(e) => handleDrop(e, 'front')}
                >
                  {verificationData.frontImage ? (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
                      <span className="text-green-600 font-medium">{verificationData.frontImage.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Drag and drop your image here, or</p>
                      <button
                        type="button"
                        onClick={() => frontFileRef.current?.click()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </button>
                    </>
                  )}
                  <input
                    ref={frontFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'front')}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Back Side Upload (if not passport) */}
              {verificationData.documentType !== 'passport' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Back Side</label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragOver === 'back' ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                    } ${verificationData.backImage ? 'border-green-400 bg-green-50' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver('back'); }}
                    onDragLeave={() => setDragOver('')}
                    onDrop={(e) => handleDrop(e, 'back')}
                  >
                    {verificationData.backImage ? (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
                        <span className="text-green-600 font-medium">{verificationData.backImage.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Drag and drop your image here, or</p>
                        <button
                          type="button"
                          onClick={() => backFileRef.current?.click()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Choose File
                        </button>
                      </>
                    )}
                    <input
                      ref={backFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'back')}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Photo Tips</h4>
                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                      <li>Ensure good lighting and avoid shadows</li>
                      <li>Keep the document flat and fully visible</li>
                      <li>Avoid glare and reflections</li>
                      <li>Make sure all text is clear and readable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Selfie Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Take a Selfie</h3>
                <p className="text-gray-600">We need a clear photo of your face to match with your identity document</p>
              </div>

              <div>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver === 'selfie' ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  } ${verificationData.selfieImage ? 'border-green-400 bg-green-50' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver('selfie'); }}
                  onDragLeave={() => setDragOver('')}
                  onDrop={(e) => handleDrop(e, 'selfie')}
                >
                  {verificationData.selfieImage ? (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
                      <span className="text-green-600 font-medium">{verificationData.selfieImage.name}</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Take a selfie or upload a photo</p>
                      <button
                        type="button"
                        onClick={() => selfieFileRef.current?.click()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Choose Photo
                      </button>
                    </>
                  )}
                  <input
                    ref={selfieFileRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => handleFileSelect(e, 'selfie')}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <User className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Selfie Guidelines</h4>
                    <ul className="text-sm text-blue-600 mt-1 list-disc list-inside">
                      <li>Look directly at the camera</li>
                      <li>Remove sunglasses and hats</li>
                      <li>Ensure your face is well-lit</li>
                      <li>Keep a neutral expression</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Personal Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Your Details</h3>
                <p className="text-gray-600">Please enter your personal information as it appears on your identity document</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={verificationData.personalDetails.fullName}
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, fullName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="As shown on ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={verificationData.personalDetails.dateOfBirth}
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, dateOfBirth: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={verificationData.personalDetails.address}
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, address: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={verificationData.personalDetails.postcode}
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, postcode: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. SW1A 1AA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={verificationData.personalDetails.phoneNumber}
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, phoneNumber: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="07xxx xxx xxx"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Almost Done!</h4>
                    <p className="text-sm text-green-600">
                      Once submitted, our identity confirmation partner will review your documents within 24 hours. You'll receive an email confirmation.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Submission Error</h4>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            <div className="flex space-x-3">
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2) ||
                    (currentStep === 3 && !canProceedStep3)
                  }
                  className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceedStep4 || isProcessing}
                  className="flex items-center bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting to verification service...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Identity Details
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDVerification;