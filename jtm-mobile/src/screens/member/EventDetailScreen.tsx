// JTM Mobile - Event Detail Screen with RSVP
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../../context/UserContext'
import { apiConfig, getHeaders } from '../../api/config'
import { QRCodeTemplate } from '../../components'

interface EventDetailScreenProps {
  navigation: any
  route: {
    params: {
      event: {
        id: string
        title: string
        description: string
        date: string
        location: string
        rsvpRequired: boolean
        rsvpDeadline?: string
        maxParticipants?: number
        currentAttendees: number
        flyer?: string
        rsvpForm?: {
          fields: Array<{
            id: string
            type: 'text' | 'number' | 'select' | 'checkbox' | 'radio'
            label: string
            required: boolean
            options?: string[]
          }>
        }
      }
    }
  }
}

export default function EventDetailScreen({ navigation, route }: EventDetailScreenProps) {
  const { user } = useUser()
  const { event } = route.params
  
  const [rsvpResponses, setRsvpResponses] = useState<Record<string, any>>({})
  const [userRsvp, setUserRsvp] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (event.rsvpRequired && user) {
      checkExistingRSVP()
    }
  }, [])

  const checkExistingRSVP = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${apiConfig.baseUrl}/events/rsvp?eventId=${event.id}&userEmail=${encodeURIComponent(user?.email || '')}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.rsvp) {
          setUserRsvp(data.rsvp)
          setRsvpResponses(data.rsvp.responses || {})
        }
      }
    } catch (error) {
      console.error('Error checking existing RSVP:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isRSVPDeadlinePassed = () => {
    if (!event.rsvpDeadline) return false
    return new Date() > new Date(event.rsvpDeadline)
  }

  const isEventFull = () => {
    return event.maxParticipants ? event.currentAttendees >= event.maxParticipants : false
  }

  const handleRSVPResponse = (fieldId: string, value: any) => {
    setRsvpResponses(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const validateRSVPForm = () => {
    if (!event.rsvpForm?.fields) return true

    for (const field of event.rsvpForm.fields) {
      if (field.required && !rsvpResponses[field.id]) {
        Alert.alert('Validation Error', `${field.label} is required`)
        return false
      }
    }
    return true
  }

  const submitRSVP = async () => {
    if (!validateRSVPForm()) return

    setSubmitting(true)
    try {
      const rsvpData = {
        eventId: event.id,
        userEmail: user?.email,
        responses: rsvpResponses,
      }

      const response = await fetch(`${apiConfig.baseUrl}/events/rsvp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(rsvpData),
      })

      if (response.ok) {
        const data = await response.json()
        setUserRsvp(data.rsvp)
        Alert.alert(
          'Success',
          userRsvp ? 'RSVP updated successfully!' : 'RSVP submitted successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        )
      } else {
        const error = await response.json()
        Alert.alert('Error', error.error || 'Failed to submit RSVP')
      }
    } catch (error) {
      console.error('RSVP submission error:', error)
      Alert.alert('Error', 'Failed to submit RSVP. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderRSVPField = (field: any) => {
    const value = rsvpResponses[field.id] || ''

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            style={styles.input}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            value={value}
            onChangeText={(text) => handleRSVPResponse(field.id, text)}
          />
        )

      case 'number':
        return (
          <TextInput
            style={styles.input}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            value={value.toString()}
            onChangeText={(text) => handleRSVPResponse(field.id, text)}
            keyboardType="numeric"
          />
        )

      case 'select':
        return (
          <View style={styles.selectContainer}>
            {field.options?.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.selectOption,
                  value === option && styles.selectOptionSelected
                ]}
                onPress={() => handleRSVPResponse(field.id, option)}
              >
                <Text style={[
                  styles.selectOptionText,
                  value === option && styles.selectOptionTextSelected
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )

      case 'radio':
        return (
          <View style={styles.radioContainer}>
            {field.options?.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.radioOption}
                onPress={() => handleRSVPResponse(field.id, option)}
              >
                <View style={[
                  styles.radioCircle,
                  value === option && styles.radioCircleSelected
                ]}>
                  {value === option && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )

      case 'checkbox':
        return (
          <TouchableOpacity
            style={styles.checkboxOption}
            onPress={() => handleRSVPResponse(field.id, !value)}
          >
            <View style={[
              styles.checkbox,
              value && styles.checkboxSelected
            ]}>
              {value && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxText}>{field.label}</Text>
          </TouchableOpacity>
        )

      default:
        return null
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Event Image */}
      {event.flyer && (
        <Image source={{ uri: event.flyer }} style={styles.eventImage} />
      )}

      {/* Event Information */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
        <Text style={styles.eventLocation}>📍 {event.location}</Text>
        
        <Text style={styles.eventDescription}>{event.description}</Text>

        {/* Event Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{event.currentAttendees}</Text>
            <Text style={styles.statLabel}>Attending</Text>
          </View>
          {event.maxParticipants && (
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{event.maxParticipants}</Text>
              <Text style={styles.statLabel}>Max Capacity</Text>
            </View>
          )}
        </View>

        {/* QR Code Template - Placeholder for now */}
        {userRsvp && userRsvp.paymentConfirmed && (
          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Your Event QR Code</Text>
            <QRCodeTemplate
              eventId={event.id}
              userId={user?.id || ''}
              userEmail={user?.email || ''}
              size={120}
              showText={true}
            />
            <Text style={styles.qrSubtext}>Show this at the event for check-in</Text>
          </View>
        )}

        {/* RSVP Section */}
        {event.rsvpRequired && user && (
          <View style={styles.rsvpSection}>
            <Text style={styles.sectionTitle}>RSVP</Text>
            
            {/* RSVP Status */}
            {userRsvp ? (
              <View style={styles.rsvpStatus}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.rsvpStatusText}>You have RSVPed to this event</Text>
              </View>
            ) : (
              <Text style={styles.rsvpPrompt}>Please RSVP to attend this event</Text>
            )}

            {/* RSVP Deadline Warning */}
            {event.rsvpDeadline && (
              <Text style={styles.rsvpDeadline}>
                RSVP Deadline: {formatDate(event.rsvpDeadline)}
              </Text>
            )}

            {/* RSVP Form */}
            {!isRSVPDeadlinePassed() && !isEventFull() && event.rsvpForm?.fields && (
              <View style={styles.rsvpForm}>
                {loading ? (
                  <ActivityIndicator size="large" color="#dc2626" />
                ) : (
                  <>
                    {event.rsvpForm.fields.map((field) => (
                      <View key={field.id} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                          {field.label}
                          {field.required && <Text style={styles.required}> *</Text>}
                        </Text>
                        {renderRSVPField(field)}
                      </View>
                    ))}

                    <TouchableOpacity
                      style={[styles.rsvpButton, submitting && styles.buttonDisabled]}
                      onPress={submitRSVP}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.rsvpButtonText}>
                          {userRsvp ? 'Update RSVP' : 'Submit RSVP'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* RSVP Closed Messages */}
            {isRSVPDeadlinePassed() && (
              <View style={styles.closedMessage}>
                <Text style={styles.closedMessageText}>RSVP deadline has passed</Text>
              </View>
            )}

            {isEventFull() && (
              <View style={styles.closedMessage}>
                <Text style={styles.closedMessageText}>This event is full</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
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
  eventImage: {
    width: '100%',
    height: 250,
  },
  eventInfo: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  eventDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  qrSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  qrSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  rsvpSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  rsvpStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rsvpStatusText: {
    fontSize: 16,
    color: '#10b981',
    marginLeft: 8,
    fontWeight: '500',
  },
  rsvpPrompt: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  rsvpDeadline: {
    fontSize: 14,
    color: '#f59e0b',
    marginBottom: 16,
    fontWeight: '500',
  },
  rsvpForm: {
    marginTop: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectOptionSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectOptionTextSelected: {
    color: 'white',
  },
  radioContainer: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#dc2626',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  radioText: {
    fontSize: 16,
    color: '#374151',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  checkboxText: {
    fontSize: 16,
    color: '#374151',
  },
  rsvpButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  rsvpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closedMessage: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  closedMessageText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
})