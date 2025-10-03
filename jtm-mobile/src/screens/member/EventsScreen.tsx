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
} from 'react-native'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  rsvpRequired: boolean
  maxParticipants?: number
  flyer?: string
}

interface EventsScreenProps {
  navigation?: any
}

export default function EventsScreen({ navigation }: EventsScreenProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Mock data for now
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Community Picnic 2025',
      description: 'Join us for our annual community picnic with food, games, and fun activities for the whole family.',
      date: '2025-03-15T14:00:00Z',
      location: 'Central Park',
      rsvpRequired: true,
      maxParticipants: 100,
    },
    {
      id: '2',
      title: 'Cultural Night',
      description: 'Celebrate our diverse community with performances, food, and cultural exhibitions.',
      date: '2025-04-20T18:00:00Z',
      location: 'Community Center',
      rsvpRequired: true,
      maxParticipants: 150,
    },
    {
      id: '3',
      title: 'Volunteer Cleanup Day',
      description: 'Help us keep our community beautiful by participating in our quarterly cleanup event.',
      date: '2025-05-10T09:00:00Z',
      location: 'Various Locations',
      rsvpRequired: false,
    },
  ]

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/events')
      // const data = await response.json()
      // setEvents(data.events)
      
      // For now, use mock data
      setTimeout(() => {
        setEvents(mockEvents)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error loading events:', error)
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadEvents()
    setRefreshing(false)
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

  const handleEventPress = (event: Event) => {
    // TODO: Navigate to event details screen
    console.log('Event pressed:', event.title)
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
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <Text style={styles.headerSubtitle}>
          Stay connected with your community
        </Text>
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
                  {event.rsvpRequired && (
                    <View style={styles.rsvpBadge}>
                      <Text style={styles.rsvpText}>RSVP Required</Text>
                    </View>
                  )}
                  
                  {event.maxParticipants && (
                    <Text style={styles.participantsText}>
                      Max: {event.maxParticipants} people
                    </Text>
                  )}
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
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
  participantsText: {
    fontSize: 12,
    color: '#6b7280',
  },
})