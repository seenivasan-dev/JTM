// JTM Web - QR Code Generation Utility
import QRCode from 'qrcode'
import crypto from 'crypto'

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || 'default-32-char-encryption-key!!' // 32 chars
const ENCRYPTION_IV_LENGTH = 16

/**
 * Encrypt data for QR code
 */
export function encryptQRData(data: string): string {
  const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  )
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  // Combine IV and encrypted data
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt QR code data
 */
export function decryptQRData(encryptedData: string): string {
  const parts = encryptedData.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  )
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Generate unique QR code data for an RSVP response
 */
export function generateQRCodeData(rsvpResponseId: string, eventId: string, userId: string): string {
  const timestamp = Date.now()
  const randomToken = crypto.randomBytes(16).toString('hex')
  
  // Create payload with all necessary information
  const payload = JSON.stringify({
    rsvpId: rsvpResponseId,
    eventId: eventId,
    userId: userId,
    timestamp: timestamp,
    token: randomToken
  })
  
  // Encrypt the payload
  return encryptQRData(payload)
}

/**
 * Parse and verify QR code data
 */
export function parseQRCodeData(qrData: string): {
  rsvpId: string
  eventId: string
  userId: string
  timestamp: number
  token: string
} | null {
  try {
    const decrypted = decryptQRData(qrData)
    const parsed = JSON.parse(decrypted)
    
    // Validate required fields
    if (!parsed.rsvpId || !parsed.eventId || !parsed.userId || !parsed.timestamp || !parsed.token) {
      return null
    }
    
    return {
      rsvpId: parsed.rsvpId,
      eventId: parsed.eventId,
      userId: parsed.userId,
      timestamp: parsed.timestamp,
      token: parsed.token
    }
  } catch (error) {
    console.error('QR code parsing error:', error)
    return null
  }
}

/**
 * Generate QR code as a data URL (base64 image)
 * Returns a base64 encoded PNG image that can be embedded in emails or displayed in web pages
 */
export async function generateQRCodeDataURL(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const qrOptions = {
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
    }

    // Generate QR code as data URL
    const dataURL = await QRCode.toDataURL(data, qrOptions)
    return dataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code as a buffer (for file storage)
 */
export async function generateQRCodeBuffer(
  data: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  try {
    const qrOptions = {
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
    }

    // Generate QR code as buffer
    const buffer = await QRCode.toBuffer(data, qrOptions)
    return buffer
  } catch (error) {
    console.error('Error generating QR code buffer:', error)
    throw new Error('Failed to generate QR code buffer')
  }
}

/**
 * Generate event check-in QR code data string
 */
export function generateEventQRCodeData(eventId: string, userId: string): string {
  const timestamp = Date.now()
  return `JTM-EVENT:${eventId}:${userId}:${timestamp}`
}
