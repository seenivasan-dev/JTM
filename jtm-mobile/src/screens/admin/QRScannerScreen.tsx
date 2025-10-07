// JTM Mobile - QR Scanner Screen (Placeholder for future implementation)
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface QRScannerScreenProps {
  navigation: any
  route: {
    params?: {
      eventId?: string
    }
  }
}

export default function QRScannerScreen({ navigation, route }: QRScannerScreenProps) {
  const [scanning, setScanning] = useState(false)
  const { eventId } = route.params || {}

  const handleScanPress = () => {
    // TODO: Implement camera QR scanning
    // This will use react-native-camera or expo-camera
    setScanning(true)
    
    // Simulate scan for now
    setTimeout(() => {
      setScanning(false)
      Alert.alert(
        'QR Scan Result',
        'QR scanning functionality will be implemented here.\n\nThis will scan attendee QR codes for event check-in.',
        [{ text: 'OK' }]
      )
    }, 2000)
  }

  const handleManualEntry = () => {
    Alert.alert(
      'Manual Entry',
      'Manual attendee check-in will be implemented here.\n\nAdmins can manually mark attendance.',
      [{ text: 'OK' }]
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Scanner</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Scanner Area */}
      <View style={styles.scannerContainer}>
        <View style={styles.scannerFrame}>
          {scanning ? (
            <View style={styles.scanningIndicator}>
              <Ionicons name="scan" size={100} color="#dc2626" />
              <Text style={styles.scanningText}>Scanning...</Text>
            </View>
          ) : (
            <View style={styles.scannerPlaceholder}>
              <Ionicons name="qr-code-outline" size={100} color="#999" />
              <Text style={styles.placeholderText}>
                Position QR code within the frame
              </Text>
            </View>
          )}
        </View>

        {/* Corner indicators */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Event Check-In</Text>
        <Text style={styles.instructionsText}>
          {eventId 
            ? `Scan attendee QR codes for Event ${eventId}`
            : 'Scan attendee QR codes to check them in'
          }
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.scanButton]}
          onPress={handleScanPress}
          disabled={scanning}
        >
          <Ionicons 
            name={scanning ? "stop" : "scan"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.actionButtonText}>
            {scanning ? 'Stop Scanning' : 'Start Scanning'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.manualButton]}
          onPress={handleManualEntry}
        >
          <Ionicons name="person-add" size={24} color="#dc2626" />
          <Text style={[styles.actionButtonText, styles.manualButtonText]}>
            Manual Check-In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Future Implementation Notes */}
      <View style={styles.notesContainer}>
        <Text style={styles.notesTitle}>Implementation Notes:</Text>
        <Text style={styles.notesText}>
          • Camera permissions will be requested{'\n'}
          • QR codes will contain encrypted event/user data{'\n'}
          • Offline scanning support with sync{'\n'}
          • Attendance tracking and reporting{'\n'}
          • Duplicate scan prevention
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scannerContainer: {
    flex: 1,
    margin: 40,
    position: 'relative',
  },
  scannerFrame: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scannerPlaceholder: {
    alignItems: 'center',
  },
  scanningIndicator: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  scanningText: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#dc2626',
    borderWidth: 3,
  },
  topLeft: {
    top: -15,
    left: -15,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -15,
    right: -15,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -15,
    left: -15,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -15,
    right: -15,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  instructionsContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  scanButton: {
    backgroundColor: '#dc2626',
  },
  manualButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  manualButtonText: {
    color: '#dc2626',
  },
  notesContainer: {
    padding: 20,
    backgroundColor: '#f9fafb',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
})