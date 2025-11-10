// JTM Mobile - QR Scanner Screen with Camera Integration
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { apiConfig, handleApiResponse, getHeaders } from '../../api/config'

const { width, height } = Dimensions.get('window')

interface CheckinResult {
  success: boolean
  message: string
  attendee?: {
    name: string
    email: string
  }
  alreadyCheckedIn?: boolean
}

interface QRScannerScreenProps {
  navigation: any
  route: {
    params?: {
      eventId?: string
      eventTitle?: string
    }
  }
}

export default function QRScannerScreen({ navigation, route }: QRScannerScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [manualEmailModal, setManualEmailModal] = useState(false)
  const [manualEmail, setManualEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<CheckinResult | null>(null)
  
  const { eventId, eventTitle } = route.params || {}

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true)
    setScanning(false)
    
    await handleQRScan(data)
  }

  const handleQRScan = async (qrData: string) => {
    setLoading(true)
    try {
      // Parse QR code data (format: JTM-EVENT:eventId:userId:timestamp)
      const parts = qrData.split(':')
      if (parts.length !== 4 || parts[0] !== 'JTM-EVENT') {
        setLastScanResult({
          success: false,
          message: 'Invalid QR code format. Please ensure this is a valid JTM event QR code.'
        })
        return
      }

      const [, scannedEventId, userId] = parts

      // If we have a specific event, verify the QR code is for this event
      if (eventId && eventId !== scannedEventId) {
        setLastScanResult({
          success: false,
          message: `This QR code is for a different event. Expected: ${eventTitle || 'Current Event'}`
        })
        return
      }

      // TODO: Replace with your actual API endpoint
      const response = await fetch(`${apiConfig.baseUrl}/api/events/checkin`, {
        method: 'POST',
        headers: getHeaders(/* Add your auth token here */),
        body: JSON.stringify({
          eventId: eventId || scannedEventId,
          qrCode: qrData,
        }),
      })

      const result = await handleApiResponse(response)
      
      if (result.success) {
        setLastScanResult({
          success: true,
          message: result.alreadyCheckedIn ? 'Already checked in!' : 'Check-in successful!',
          attendee: {
            name: `${result.rsvp?.user?.firstName} ${result.rsvp?.user?.lastName}`.trim() || 'Unknown',
            email: result.rsvp?.user?.email || 'unknown@email.com'
          },
          alreadyCheckedIn: result.alreadyCheckedIn
        })
      } else {
        setLastScanResult({
          success: false,
          message: result.error || 'Check-in failed'
        })
      }
    } catch (error) {
      console.error('QR scan error:', error)
      setLastScanResult({
        success: false,
        message: 'Error processing QR code. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheckIn = async () => {
    if (!manualEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address')
      return
    }

    setLoading(true)
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`${apiConfig.baseUrl}/api/events/checkin/manual`, {
        method: 'POST',
        headers: getHeaders(/* Add your auth token here */),
        body: JSON.stringify({
          eventId: eventId,
          email: manualEmail.trim(),
        }),
      })

      const result = await handleApiResponse(response)
      
      if (result.success) {
        setLastScanResult({
          success: true,
          message: result.alreadyCheckedIn ? 'Already checked in!' : 'Manual check-in successful!',
          attendee: {
            name: `${result.rsvp?.user?.firstName} ${result.rsvp?.user?.lastName}`.trim() || 'Unknown',
            email: result.rsvp?.user?.email || manualEmail
          },
          alreadyCheckedIn: result.alreadyCheckedIn
        })
        setManualEmail('')
        setManualEmailModal(false)
      } else {
        Alert.alert('Check-in Failed', result.error || 'Manual check-in failed')
      }
    } catch (error) {
      Alert.alert('Error', 'Error during manual check-in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startScanning = () => {
    setScanning(true)
    setScanned(false)
    setLastScanResult(null)
  }

  const stopScanning = () => {
    setScanning(false)
    setScanned(false)
  }

  const openManualEntry = () => {
    setManualEmailModal(true)
  }

  const showResult = (result: CheckinResult) => {
    const title = result.success ? 'Check-in Successful' : 'Check-in Failed'
    let message = result.message
    
    if (result.attendee) {
      message += `\n\nName: ${result.attendee.name}\nEmail: ${result.attendee.email}`
      
      if (result.alreadyCheckedIn) {
        message += '\n\n⚠️ This attendee was already checked in'
      }
    }
    
    Alert.alert(title, message, [
      { 
        text: 'OK', 
        onPress: () => {
          setLastScanResult(null)
          if (scanning) {
            setScanned(false) // Allow scanning again
          }
        }
      }
    ])
  }

  // Show result when it changes
  useEffect(() => {
    if (lastScanResult && !loading) {
      showResult(lastScanResult)
    }
  }, [lastScanResult, loading])

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera" size={80} color="#dc2626" />
        <Text style={styles.noPermissionTitle}>Camera Permission Required</Text>
        <Text style={styles.noPermissionText}>
          Please allow camera access to scan QR codes for event check-in.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => BarCodeScanner.requestPermissionsAsync()}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
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

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      )}

      {/* Camera Scanner */}
      {scanning ? (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.camera}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scannerInstructions}>
              Position QR code within the frame
            </Text>
          </View>
          <TouchableOpacity
            style={styles.stopScanButton}
            onPress={stopScanning}
          >
            <Ionicons name="close" size={24} color="white" />
            <Text style={styles.stopScanText}>Stop Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Scanner Placeholder */}
          <View style={styles.scannerContainer}>
            <View style={styles.scannerPlaceholder}>
              <Ionicons name="qr-code-outline" size={100} color="#999" />
              <Text style={styles.placeholderText}>
                Ready to scan QR codes
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Event Check-In</Text>
            <Text style={styles.instructionsText}>
              {eventTitle 
                ? `Scan attendee QR codes for ${eventTitle}`
                : 'Scan attendee QR codes to check them in'
              }
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.scanButton]}
              onPress={startScanning}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.actionButtonText}>Start Scanning</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.manualButton]}
              onPress={openManualEntry}
            >
              <Ionicons name="person-add" size={24} color="#dc2626" />
              <Text style={[styles.actionButtonText, styles.manualButtonText]}>
                Manual Check-In
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Manual Check-in Modal */}
      <Modal
        visible={manualEmailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setManualEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manual Check-In</Text>
              <TouchableOpacity
                onPress={() => setManualEmailModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Enter the attendee's email address to check them in manually
            </Text>
            
            <TextInput
              style={styles.emailInput}
              placeholder="Enter email address"
              value={manualEmail}
              onChangeText={setManualEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setManualEmailModal(false)
                  setManualEmail('')
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleManualCheckIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalConfirmText}>Check In</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noPermissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 16,
    textAlign: 'center',
  },
  noPermissionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  scannerContainer: {
    flex: 1,
    margin: 20,
    position: 'relative',
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scannerInstructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stopScanButton: {
    position: 'absolute',
    bottom: 50,
    left: width / 2 - 75,
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopScanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scannerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 20,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})