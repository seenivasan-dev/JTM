// JTM Mobile - Modern Event Details Screen
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
  Share,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../../context/UserContext'
import { apiConfig, getHeaders } from '../../api/config'

const { width, height } = Dimensions.get('window')

// Modern Detail Card Component
const DetailCard = ({ icon, label, value, color = '#6366f1' }: {
  icon: string
  label: string
  value: string
  color?: string
}) => (
  <View style={styles.detailCard}>
    <LinearGradient
      colors={['#ffffff', '#f8fafc']}
      style={styles.detailCardGradient}
    >
      <View style={[styles.detailIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </LinearGradient>
  </View>
)

// Modern RSVP Status Badge
const RSVPStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'yes':
        return { color: '#10b981', backgroundColor: '#d1fae5', icon: 'checkmark-circle' }
      case 'no':
        return { color: '#ef4444', backgroundColor: '#fee2e2', icon: 'close-circle' }
      case 'maybe':
        return { color: '#f59e0b', backgroundColor: '#fef3c7', icon: 'help-circle' }
      default:
        return { color: '#6b7280', backgroundColor: '#f3f4f6', icon: 'time' }
    }
  }

  const config = getStatusConfig(status)

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.backgroundColor }]}>
      <Ionicons name={config.icon as any} size={16} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>
        {status || 'No Response'}
      </Text>
    </View>
  )
}

interface EventDetailsScreenProps {
  route: {
    params: {
      eventId: string
    }
  }
  navigation: any
}

export default function ModernEventDetailsScreen({ route, navigation }: EventDetailsScreenProps) {
  const { eventId } = route.params
  const { user } = useUser()
  const [event, setEvent] = useState<any>(null)
  const [rsvpStatus, setRsvpStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  useEffect(() => {
    fetchEventDetails()
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${apiConfig.baseUrl}/api/mobile/events/${eventId}`, {
        headers: await getHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
        setRsvpStatus(data.rsvpStatus || '')
      } else {
        Alert.alert('Error', 'Failed to fetch event details')
      }
    } catch (error) {
      console.error('Error fetching event details:', error)
      Alert.alert('Error', 'Failed to fetch event details')
    } finally {
      setLoading(false)
    }
  }

  const handleRSVP = async (status: string) => {
    if (!user) return

    try {
      setRsvpLoading(true)
      const response = await fetch(`${apiConfig.baseUrl}/api/mobile/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({
          userId: user.id,
          response: status,
        }),
      })

      if (response.ok) {
        setRsvpStatus(status)
        Alert.alert('Success', `RSVP updated to "${status}"`)
      } else {
        const errorData = await response.json()
        Alert.alert('Error', errorData.error || 'Failed to update RSVP')
      }
    } catch (error) {
      console.error('Error updating RSVP:', error)
      Alert.alert('Error', 'Failed to update RSVP')
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleShare = async () => {
    if (!event) return

    try {
      await Share.share({
        message: `Check out this event: ${event.title}\n\nDate: ${formatDate(event.date)}\nTime: ${event.time}\nLocation: ${event.location}\n\n${event.description}`,
        title: event.title,
      })
    } catch (error) {
      console.error('Error sharing event:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'meeting':
        return '#3b82f6'
      case 'social':
        return '#10b981'
      case 'cultural':
        return '#8b5cf6'
      case 'religious':
        return '#f59e0b'
      default:
        return '#6366f1'
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    )
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerContent}>
          <View style={[
            styles.eventTypeBadge,
            { backgroundColor: getEventTypeColor(event.type) + '20' }
          ]}>
            <Text style={[
              styles.eventTypeText,
              { color: getEventTypeColor(event.type) }
            ]}>
              {event.type}
            </Text>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* RSVP Status Card */}
        <View style={styles.section}>
          <View style={styles.rsvpCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.rsvpCardGradient}
            >
              <View style={styles.rsvpHeader}>
                <Text style={styles.rsvpTitle}>Your RSVP Status</Text>
                <RSVPStatusBadge status={rsvpStatus} />
              </View>
              
              <Text style={styles.rsvpSubtitle}>Will you attend this event?</Text>
              
              <View style={styles.rsvpButtons}>
                <TouchableOpacity
                  style={[
                    styles.rsvpButton,
                    rsvpStatus === 'Yes' && styles.rsvpButtonActive,
                    { borderColor: '#10b981' }
                  ]}
                  onPress={() => handleRSVP('Yes')}
                  disabled={rsvpLoading}
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={rsvpStatus === 'Yes' ? 'white' : '#10b981'} 
                  />
                  <Text style={[
                    styles.rsvpButtonText,
                    rsvpStatus === 'Yes' && styles.rsvpButtonTextActive,
                    { color: rsvpStatus === 'Yes' ? 'white' : '#10b981' }
                  ]}>
                    Yes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rsvpButton,
                    rsvpStatus === 'No' && styles.rsvpButtonActive,
                    { borderColor: '#ef4444' }
                  ]}
                  onPress={() => handleRSVP('No')}
                  disabled={rsvpLoading}
                >
                  <Ionicons 
                    name="close-circle" 
                    size={20} 
                    color={rsvpStatus === 'No' ? 'white' : '#ef4444'} 
                  />
                  <Text style={[
                    styles.rsvpButtonText,
                    rsvpStatus === 'No' && styles.rsvpButtonTextActive,
                    { color: rsvpStatus === 'No' ? 'white' : '#ef4444' }
                  ]}>
                    No
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rsvpButton,
                    rsvpStatus === 'Maybe' && styles.rsvpButtonActive,
                    { borderColor: '#f59e0b' }
                  ]}
                  onPress={() => handleRSVP('Maybe')}
                  disabled={rsvpLoading}
                >
                  <Ionicons 
                    name="help-circle" 
                    size={20} 
                    color={rsvpStatus === 'Maybe' ? 'white' : '#f59e0b'} 
                  />
                  <Text style={[
                    styles.rsvpButtonText,
                    rsvpStatus === 'Maybe' && styles.rsvpButtonTextActive,
                    { color: rsvpStatus === 'Maybe' ? 'white' : '#f59e0b' }
                  ]}>
                    Maybe
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.detailsGrid}>
            <DetailCard
              icon="time"
              label="Time"
              value={formatTime(event.time)}
              color="#6366f1"
            />
            <DetailCard
              icon="location"
              label="Location"
              value={event.location}
              color="#10b981"
            />
            {event.maxCapacity && (
              <DetailCard
                icon="people"
                label="Capacity"
                value={`${event.rsvpCount || 0} / ${event.maxCapacity}`}
                color="#f59e0b"
              />
            )}
            {event.registrationDeadline && (
              <DetailCard
                icon="calendar"
                label="RSVP Deadline"
                value={formatDate(event.registrationDeadline)}
                color="#ef4444"
              />
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.descriptionCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.descriptionGradient}
            >
              <Text style={styles.descriptionText}>
                {event.description || 'No description available.'}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Registration Details */}
        {event.requiresRegistration && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Registration Information</Text>
            <View style={styles.registrationCard}>
              <LinearGradient
                colors={['#fef3c7', '#fde68a']}
                style={styles.registrationGradient}
              >
                <View style={styles.registrationHeader}>
                  <Ionicons name="information-circle" size={24} color="#f59e0b" />
                  <Text style={styles.registrationTitle}>Registration Required</Text>
                </View>
                <Text style={styles.registrationText}>
                  This event requires advance registration. Please RSVP to confirm your attendance.
                </Text>
                {event.registrationDeadline && (
                  <Text style={styles.registrationDeadline}>
                    Registration deadline: {formatDate(event.registrationDeadline)}
                  </Text>
                )}
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity 
            style={styles.primaryAction} 
            onPress={() => navigation.navigate('Events')}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.primaryActionGradient}
            >
              <Ionicons name="calendar" size={20} color="white" />
              <Text style={styles.primaryActionText}>View All Events</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {rsvpLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingModalText}>Updating RSVP...</Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  eventTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  eventTypeText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
    marginTop: -20,
  },

  // Section Styles
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },

  // RSVP Card
  rsvpCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  rsvpCardGradient: {
    padding: 20,
  },
  rsvpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rsvpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  rsvpSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rsvpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'white',
    gap: 8,
  },
  rsvpButtonActive: {
    backgroundColor: '#6366f1',
  },
  rsvpButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rsvpButtonTextActive: {
    color: 'white',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Detail Cards
  detailsGrid: {
    gap: 12,
  },
  detailCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },

  // Description Card
  descriptionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  descriptionGradient: {
    padding: 20,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },

  // Registration Card
  registrationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registrationGradient: {
    padding: 20,
  },
  registrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  registrationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
  registrationText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
    marginBottom: 8,
  },
  registrationDeadline: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },

  // Footer Actions
  footerActions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  primaryAction: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  loadingModalText: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})