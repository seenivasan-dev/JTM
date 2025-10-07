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

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/events`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        console.error('Failed to load events')
        // Fall back to empty array if API fails
        setEvents([])
      }
    } catch (error) {
      console.error('Error loading events:', error)
      // Fall back to empty array if network fails
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading events...</Text>
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

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events scheduled at this time</Text>
          <Text style={styles.emptySubtext}>Check back later for upcoming events</Text>
        </View>
      ) : (
        <View style={styles.eventsList}>
          {events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => handleEventPress(event)}
            >
              {event.flyer && (
                <Image source={{ uri: event.flyer }} style={styles.eventImage} />
              )}
              
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                <Text style={styles.eventLocation}>📍 {event.location}</Text>
                <Text style={styles.eventDescription} numberOfLines={3}>
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
          ))}
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
})