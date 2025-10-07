// JTM Mobile - QR Code Template Component (Placeholder for future implementation)
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface QRCodeTemplateProps {
  eventId: string
  userId: string
  userEmail: string
  size?: number
  showText?: boolean
}

export default function QRCodeTemplate({ 
  eventId, 
  userId, 
  userEmail, 
  size = 120, 
  showText = true 
}: QRCodeTemplateProps) {
  // TODO: Implement actual QR code generation
  // This will contain:
  // - Event ID
  // - User ID
  // - User Email
  // - Timestamp
  // - Verification hash

  const qrData = {
    eventId,
    userId,
    userEmail,
    timestamp: new Date().toISOString(),
    // TODO: Add verification hash for security
  }

  return (
    <View style={[styles.container, { width: size + 40, height: size + 40 }]}>
      <View style={[styles.qrPlaceholder, { width: size, height: size }]}>
        <Ionicons name="qr-code-outline" size={size * 0.7} color="#666" />
      </View>
      {showText && (
        <Text style={styles.placeholderText}>QR Code Placeholder</Text>
      )}
      {showText && (
        <Text style={styles.dataText}>
          Event: {eventId} | User: {userEmail}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholder: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  dataText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 200,
  },
})

// Export types for future implementation
export interface QRCodeData {
  eventId: string
  userId: string
  userEmail: string
  timestamp: string
  verificationHash?: string
}

export interface QRScanResult {
  valid: boolean
  data?: QRCodeData
  error?: string
}