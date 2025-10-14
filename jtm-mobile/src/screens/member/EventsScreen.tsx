// JTM Mobile - Events Screen
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../../context/UserContext'
import { apiConfig, getHeaders } from '../../api/config'

interface Event {
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
  rsvpForm?: any
}

interface EventsScreenProps {
  navigation?: any
}

export default function EventsScreen({ navigation }: EventsScreenProps) {
  const { user } = useUser()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setError(null)
      console.log('Fetching events from:', `${apiConfig.baseUrl}/api/mobile/events`)
      
      const response = await fetch(`${apiConfig.baseUrl}/api/mobile/events?includeExpired=true&limit=20`, {
        method: 'GET',
        headers: getHeaders(),
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Events API response:', JSON.stringify(data, null, 2))
        const events = data.events || []
        console.log('Number of events received:', events.length)
        setEvents(events)
        
        if (events.length === 0) {
          console.log('No events found in database')
        }
      } else {
        const errorData = await response.text()
        console.error('Failed to load events:', response.status, errorData)
        setError(`Failed to load events (${response.status}): ${errorData}`)
        setEvents([])
      }
    } catch (error) {
      console.error('Error loading events:', error)
      setError('Network error. Please check your connection.')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    setError(null)
    await loadEvents()
    setRefreshing(false)
  }

  const handleEventPress = (event: Event) => {
    navigation?.navigate('EventDetail', { event })
  }

  const handleCreateEvent = () => {
    navigation?.navigate('CreateEvent')
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

  const isEventExpired = (dateString: string) => {
    const eventDate = new Date(dateString)
    const now = new Date()
    return eventDate < now
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadEvents}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Upcoming Events</Text>
          <Text style={styles.headerSubtitle}>
            Stay connected with your community
          </Text>
        </View>
        {user?.isAdmin && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {events.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events available</Text>
          <Text style={styles.emptySubtext}>
            {error ? 'There was an issue loading events' : 'No events have been created yet'}
          </Text>
          {error && (
            <TouchableOpacity style={styles.retryButton} onPress={loadEvents}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.eventsList}>
          {events.map((event) => {
            const expired = isEventExpired(event.date)
            return (
            <TouchableOpacity
              key={event.id}
              style={[styles.eventCard, expired && styles.expiredEventCard]}
              onPress={() => handleEventPress(event)}
            >
              {event.flyer && (
                <Image 
                  source={{ uri: event.flyer }} 
                  style={[styles.eventImage, expired && styles.expiredEventImage]} 
                />
              )}
              
              <View style={styles.eventContent}>
                <View style={styles.eventTitleContainer}>
                  <Text style={[styles.eventTitle, expired && styles.expiredEventTitle]}>
                    {event.title}
                  </Text>
                  {expired && (
                    <View style={styles.expiredBadge}>
                      <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.eventDate, expired && styles.expiredEventDate]}>
                  {formatDate(event.date)}
                </Text>
                <Text style={[styles.eventLocation, expired && styles.expiredEventLocation]}>
                  📍 {event.location}
                </Text>
                <Text style={[styles.eventDescription, expired && styles.expiredEventDescription]} numberOfLines={3}>
                  {event.description}
                </Text>
                
                <View style={styles.eventFooter}>
                  <View style={styles.badgeContainer}>
                    {event.rsvpRequired && (
                      <View style={styles.rsvpBadge}>
                        <Text style={styles.rsvpText}>RSVP Required</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.attendeeInfo}>
                    <Text style={styles.participantsText}>
                      {event.currentAttendees} attending
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: '#dc2626',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fecaca',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  rsvpBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rsvpText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  attendeeInfo: {
    alignItems: 'flex-end',
  },
  participantsText: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Expired Event Styles
  expiredEventCard: {
    opacity: 0.7,
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    borderWidth: 1,
  },
  expiredEventImage: {
    opacity: 0.5,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expiredEventTitle: {
    color: '#6b7280',
  },
  expiredBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  expiredBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  expiredEventDate: {
    color: '#9ca3af',
  },
  expiredEventLocation: {
    color: '#9ca3af',
  },
  expiredEventDescription: {
    color: '#9ca3af',
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
})