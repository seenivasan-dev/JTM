// JTM Mobile - QR Code Component
// NOTE: Install react-native-qrcode-svg: npm install react-native-qrcode-svg
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface QRCodeTemplateProps {
  eventId: string
  userId: string
  userEmail: string
  userName?: string
  eventTitle?: string
  rsvpId?: string
  size?: number
  showText?: boolean
}

export default function QRCodeTemplate({ 
  eventId, 
  userId, 
  userEmail,
  userName,
  eventTitle,
  rsvpId,
  size = 200, 
  showText = true 
}: QRCodeTemplateProps) {
  // TODO: Uncomment when react-native-qrcode-svg is installed
  // import QRCode from 'react-native-qrcode-svg'
  
  // Generate QR code data
  const qrData = JSON.stringify({
    eventId,
    userId,
    userEmail,
    userName,
    eventTitle,
    rsvpId,
    timestamp: new Date().toISOString(),
    version: '1.0',
  })

  return (
    <View style={[styles.container, { width: size + 60, minHeight: size + 80 }]}>
      <View style={styles.qrWrapper}>
        {/* TODO: Replace with actual QR code when package is installed */}
        {/* <QRCode
          value={qrData}
          size={size}
          color="#000000"
          backgroundColor="#ffffff"
          logo={require('../../assets/icon.png')}
          logoSize={size * 0.2}
          logoBackgroundColor="white"
          logoBorderRadius={10}
        /> */}
        
        {/* Temporary placeholder - shows QR icon */}
        <View style={[styles.qrPlaceholder, { width: size, height: size }]}>
          <Ionicons name="qr-code" size={size * 0.6} color="#6366f1" />
          <Text style={styles.placeholderLabel}>QR Code Ready</Text>
        </View>
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>✅ Event Check-In QR Code</Text>
          {eventTitle && (
            <Text style={styles.eventText}>{eventTitle}</Text>
          )}
          {userName && (
            <Text style={styles.nameText}>{userName}</Text>
          )}
          <Text style={styles.instructionText}>
            Show this code at the event entrance
          </Text>
          <Text style={styles.debugText}>
            ID: {rsvpId || eventId}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  qrPlaceholder: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginTop: 8,
  },
  textContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
  },
  eventText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 11,
    color: '#6366f1',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 9,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
})