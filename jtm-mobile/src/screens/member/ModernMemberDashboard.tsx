// JTM Mobile - Modern Member Dashboard Screen
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
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
  
  return (
    <TouchableOpacity style={styles.modernEventCard} onPress={onPress}>
      <LinearGradient
        colors={isUpcoming ? ['#ffffff', '#f8fafc'] : ['#f1f5f9', '#e2e8f0']}
        style={styles.eventCardGradient}
      >
        <View style={styles.eventCardHeader}>
          <View style={[
            styles.eventDateBadge, 
            { backgroundColor: isUpcoming ? '#6366f1' : '#64748b' }
          ]}>
            <Text style={styles.eventDateDay}>{eventDate.getDate()}</Text>
            <Text style={styles.eventDateMonth}>
              {eventDate.toLocaleDateString('en', { month: 'short' }).toUpperCase()}
            </Text>
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
            <View style={styles.eventMeta}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.eventLocation} numberOfLines={1}>{event.location}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

interface MemberDashboardProps {
  navigation: any
}

export default function ModernMemberDashboard({ navigation }: MemberDashboardProps) {
  const { user } = useUser()
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = async () => {
    try {
      setError(null)
      
      // Load recent events
      const eventsResponse = await fetch(`${apiConfig.baseUrl}/api/mobile/events`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (eventsResponse.ok) {
        const eventsData = await handleApiResponse(eventsResponse)
        setRecentEvents(eventsData.events || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadDashboardData()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
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
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.firstName || 'Member'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationBell}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
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
        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.statGradient}
            >
              <Ionicons name="person-circle" size={32} color="white" />
              <Text style={styles.statNumber}>{user?.membershipType || 'N/A'}</Text>
              <Text style={styles.statLabel}>Membership</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statsCard}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.statGradient}
            >
              <Ionicons name="calendar" size={32} color="white" />
              <Text style={styles.statNumber}>{recentEvents.length}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Events')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.actionText}>Browse Events</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="person-outline" size={24} color="#22c55e" />
              </View>
              <Text style={styles.actionText}>My Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Notifications')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="notifications-outline" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.actionText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : recentEvents.length > 0 ? (
            <View style={styles.eventsContainer}>
              {recentEvents.slice(0, 3).map((event: any) => (
                <ModernEventCard 
                  key={event.id} 
                  event={event} 
                  onPress={() => navigation.navigate('EventDetail', { event })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
              </View>
              <Text style={styles.emptyTitle}>No Recent Events</Text>
              <Text style={styles.emptyText}>Check back later for upcoming community events</Text>
            </View>
          )}
        </View>

        {/* Membership Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Status</Text>
          <View style={styles.membershipCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.membershipGradient}
            >
              <View style={styles.membershipHeader}>
                <View style={styles.membershipInfo}>
                  <Text style={styles.membershipType}>{user?.membershipType || 'Standard'}</Text>
                  <Text style={styles.membershipStatus}>
                    {user?.isActive ? '✓ Active' : '⚠ Inactive'}
                  </Text>
                </View>
                <View style={styles.membershipIcon}>
                  <Ionicons name="diamond" size={24} color="#6366f1" />
                </View>
              </View>
              {user?.membershipExpiry && (
                <View style={styles.expiryInfo}>
                  <Text style={styles.expiryLabel}>Expires on:</Text>
                  <Text style={styles.expiryDate}>
                    {new Date(user.membershipExpiry).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationBell: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Section Styles
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },

  // Events Container
  eventsContainer: {
    gap: 12,
  },

  // Modern Event Card
  modernEventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  eventCardGradient: {
    padding: 16,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDateBadge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  eventDateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#64748b',
  },

  // Loading and Empty States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Membership Card
  membershipCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  membershipGradient: {
    padding: 20,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  membershipInfo: {
    flex: 1,
  },
  membershipType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  membershipStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  membershipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expiryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  expiryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },

  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})