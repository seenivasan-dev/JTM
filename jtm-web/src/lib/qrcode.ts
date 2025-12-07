// JTM Web - QR Code Generation Utility
import QRCode from 'qrcode'

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
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
