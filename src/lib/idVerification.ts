import { supabase } from './supabase'

export interface VerificationData {
  documentType: string
  frontImage: File
  backImage?: File
  selfieImage: File
  personalDetails: {
    fullName: string
    dateOfBirth: string
    address: string
    postcode: string
    phoneNumber: string
  }
}

export interface VerificationResponse {
  success: boolean
  message?: string
  checkId?: string
  status?: string
  error?: string
}

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

export const submitVerification = async (
  userId: string,
  verificationData: VerificationData
): Promise<VerificationResponse> => {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase not configured. Please set up your environment variables.'
    }
  }

  try {
    // Convert images to base64
    const frontImageBase64 = await fileToBase64(verificationData.frontImage)
    const selfieImageBase64 = await fileToBase64(verificationData.selfieImage)
    let backImageBase64: string | undefined

    if (verificationData.backImage) {
      backImageBase64 = await fileToBase64(verificationData.backImage)
    }

    // Split full name into first and last name
    const nameParts = verificationData.personalDetails.fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Call Supabase Edge Function
    const { data, error } = await supabase!.functions.invoke('yoti-id-verification', {
      body: {
        userId,
        documentType: verificationData.documentType,
        frontImageBase64,
        backImageBase64,
        selfieImageBase64,
        personalDetails: {
          firstName,
          lastName,
          dateOfBirth: verificationData.personalDetails.dateOfBirth,
          address: verificationData.personalDetails.address,
          postcode: verificationData.personalDetails.postcode
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return data as VerificationResponse
  } catch (error) {
    console.error('Verification submission error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during verification'
    }
  }
}

export const checkVerificationStatus = async (userId: string) => {
  if (!supabase) {
    console.warn('Supabase not configured - cannot check verification status')
    return null
  }

  try {
    const { data: user, error } = await supabase!
      .from('users')
      .select('verification_status, verification_data, verified')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      status: user.verification_status,
      verified: user.verified,
      data: user.verification_data
    }
  } catch (error) {
    console.error('Error checking verification status:', error)
    return null
  }
}