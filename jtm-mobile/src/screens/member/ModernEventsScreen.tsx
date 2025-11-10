// JTM Mobile - Modern Events Screen
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { apiConfig, handleApiResponse, getHeaders } from '../../api/config'
import { useUser } from '../../context/UserContext'

const { width, height } = Dimensions.get('window')

// Modern Event Card Component
const ModernEventCard = ({ event, onPress }: { event: any; onPress: () => void }) => {
  const eventDate = new Date(event.date)
  const isUpcoming = eventDate > new Date()
  const isPastEvent = eventDate < new Date()
  
  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <LinearGradient
        colors={isUpcoming ? ['#ffffff', '#f8fafc'] : ['#f1f5f9', '#e2e8f0']}
        style={styles.eventCardGradient}
      >
        {/* Event Status Badge */}
        <View style={[
          styles.statusBadge,
          { backgroundColor: isUpcoming ? '#10b981' : isPastEvent ? '#6b7280' : '#f59e0b' }
        ]}>
          <Text style={styles.statusText}>
            {isUpcoming ? 'UPCOMING' : isPastEvent ? 'PAST' : 'TODAY'}
          </Text>
        </View>

        <View style={styles.eventContent}>
          {/* Date Badge */}
          <View style={[
            styles.dateBadge,
            { backgroundColor: isUpcoming ? '#6366f1' : '#64748b' }
          ]}>
            <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
            <Text style={styles.dateMonth}>
              {eventDate.toLocaleDateString('en', { month: 'short' }).toUpperCase()}
            </Text>
            <Text style={styles.dateYear}>{eventDate.getFullYear()}</Text>
          </View>

          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
            
            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text style={styles.metaText}>
                  {eventDate.toLocaleTimeString('en', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color="#64748b" />
                <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
              </View>
            </View>

            {event.description && (
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
            )}

            {/* RSVP Info */}
            {event.rsvpRequired && (
              <View style={styles.rsvpInfo}>
                <View style={styles.rsvpStats}>
                  <Text style={styles.rsvpCount}>
                    {event._count?.rsvpResponses || 0}
                    {event.maxParticipants ? `/${event.maxParticipants}` : ''} attending
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

interface EventsScreenProps {
  navigation: any
}

export default function ModernEventsScreen({ navigation }: EventsScreenProps) {
  const { user } = useUser()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const loadEvents = async () => {
    try {
      console.log('🔄 [ModernEventsScreen] Loading events from:', `${apiConfig.baseUrl}/api/mobile/events`)
      
      const response = await fetch(`${apiConfig.baseUrl}/api/mobile/events?includeExpired=true&limit=20`, {
        method: 'GET',
        headers: getHeaders(),
      })

      console.log('📡 [ModernEventsScreen] Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📦 [ModernEventsScreen] Raw API response:', JSON.stringify(data, null, 2))
        
        const eventsData = data.events || []
        console.log(`✅ [ModernEventsScreen] Setting ${eventsData.length} events`)
        
        setEvents(eventsData)
        
        if (eventsData.length === 0) {
          console.log('⚠️ [ModernEventsScreen] No events returned from API')
        }
      } else {
        const errorText = await response.text()
        console.error('❌ [ModernEventsScreen] Failed to load events:', response.status, errorText)
        Alert.alert('Error', `Failed to load events (${response.status})`)
        setEvents([])
      }
    } catch (error) {
      console.error('💥 [ModernEventsScreen] Error loading events:', error)
      Alert.alert('Error', 'Failed to load events. Please check your network connection.')
      setEvents([])
    } finally {
      console.log('🏁 [ModernEventsScreen] Setting loading to false')
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🚀 [ModernEventsScreen] Component mounted, starting to load events')
    loadEvents()
  }, [])

  // Debug: Log events state changes
  useEffect(() => {
    console.log('📊 [ModernEventsScreen] Events state updated:', events.length, 'events')
    if (events.length > 0) {
      console.log('🎯 [ModernEventsScreen] First event:', JSON.stringify(events[0], null, 2))
    }
  }, [events])

  // Debug: Log loading state changes
  useEffect(() => {
    console.log('⏳ [ModernEventsScreen] Loading state:', loading)
  }, [loading])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadEvents()
    setRefreshing(false)
  }

  const handleEventPress = (event: any) => {
    console.log('🎯 [ModernEventsScreen] Navigating to event detail:', event.id)
    navigation?.navigate('EventDetail', { event })
  }

  const filterEvents = (events: any[], filter: string) => {
    const now = new Date()
    switch (filter) {
      case 'upcoming':
        return events.filter(event => new Date(event.date) > now)
      case 'past':
        return events.filter(event => new Date(event.date) < now)
      case 'today':
        return events.filter(event => {
          const eventDate = new Date(event.date)
          return eventDate.toDateString() === now.toDateString()
        })
      default:
        return events
    }
  }

  const filteredEvents = filterEvents(events, activeFilter)

  const filters = [
    { key: 'all', label: 'All Events', count: events.length },
    { key: 'upcoming', label: 'Upcoming', count: filterEvents(events, 'upcoming').length },
    { key: 'today', label: 'Today', count: filterEvents(events, 'today').length },
    { key: 'past', label: 'Past', count: filterEvents(events, 'past').length },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Community Events</Text>
          <Text style={styles.headerSubtitle}>Discover and join amazing events</Text>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                activeFilter === filter.key && styles.activeFilterTab
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={[
                styles.filterTabText,
                activeFilter === filter.key && styles.activeFilterTabText
              ]}>
                {filter.label}
              </Text>
              {filter.count > 0 && (
                <View style={[
                  styles.filterBadge,
                  activeFilter === filter.key && styles.activeFilterBadge
                ]}>
                  <Text style={[
                    styles.filterBadgeText,
                    activeFilter === filter.key && styles.activeFilterBadgeText
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.eventsContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : filteredEvents.length > 0 ? (
          <View style={styles.eventsList}>
            {filteredEvents.map((event: any) => (
              <ModernEventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'all' 
                ? 'No events are currently available.' 
                : `No ${activeFilter} events found.`}
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Filter Styles
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    marginTop: -12,
    marginHorizontal: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: '#6366f1',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeFilterTabText: {
    color: 'white',
  },
  filterBadge: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  activeFilterBadgeText: {
    color: 'white',
  },

  // Events Container
  eventsContainer: {
    flex: 1,
    paddingTop: 20,
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },

  // Event Card Styles
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  eventCardGradient: {
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  eventContent: {
    flexDirection: 'row',
    padding: 16,
  },
  dateBadge: {
    width: 70,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateYear: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  eventMeta: {
    gap: 6,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  rsvpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  rsvpStats: {
    flex: 1,
  },
  rsvpCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },

  // Loading and Empty States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
})