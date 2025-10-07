// JTM Mobile - Member Dashboard Screen
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { apiConfig, handleApiResponse, getHeaders } from '../../api/config'
import { useUser } from '../../context/UserContext'

interface MemberDashboardProps {
  navigation: any
}

export default function MemberDashboardScreen({ navigation }: MemberDashboardProps) {
  const { user: contextUser, setUser } = useUser()
  const [user, setLocalUser] = useState(contextUser)
  const [recentEvents, setRecentEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      if (!contextUser?.email) {
        Alert.alert('Error', 'Please log in again')
        navigation.navigate('Login')
        return
      }

      const headers = getHeaders()

      // Fetch updated user data and recent events
      const [userResponse, eventsResponse] = await Promise.all([
        fetch(`${apiConfig.baseUrl}/mobile/user?email=${encodeURIComponent(contextUser.email)}`, { headers }),
        fetch(`${apiConfig.baseUrl}/mobile/events?limit=3`, { headers })
      ])

      if (userResponse.ok) {
        const userData = await handleApiResponse(userResponse)
        setLocalUser(userData)
        setUser(userData) // Update context with latest data
        console.log('✅ User data loaded successfully:', userData.firstName)
      } else {
        console.log('❌ User response not ok:', userResponse.status, await userResponse.text())
      }

      if (eventsResponse.ok) {
        const eventsData = await handleApiResponse(eventsResponse)
        setRecentEvents(eventsData.events || [])
        console.log('✅ Events data loaded successfully:', eventsData.events.length, 'events')
      } else {
        console.log('❌ Events response not ok:', eventsResponse.status, await eventsResponse.text())
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      Alert.alert(
        'Network Error', 
        'Failed to load dashboard data. Please ensure:\n\n1. Your development server is running\n2. Your device is on the same network\n3. Try refreshing the app',
        [
          { text: 'Retry', onPress: () => fetchDashboardData() },
          { text: 'OK' }
        ]
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load user data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{user.firstName}!</Text>
        <View style={styles.statusBadge}>
          <Text style={[
            styles.statusText,
            { color: user.isActive ? '#059669' : '#dc2626' }
          ]}>
            {user.isActive ? 'Active Member' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Status Alerts */}
      {!user.isActive && (
        <View style={[styles.alert, styles.warningAlert]}>
          <Ionicons name="warning" size={20} color="#f59e0b" />
          <Text style={styles.alertText}>
            Your account is pending activation. Please contact an administrator.
          </Text>
        </View>
      )}

      {user.mustChangePassword && (
        <View style={[styles.alert, styles.errorAlert]}>
          <Ionicons name="lock-closed" size={20} color="#dc2626" />
          <View style={styles.alertContent}>
            <Text style={styles.alertText}>
              You must change your password before accessing other features.
            </Text>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => navigation.navigate('ChangePassword', { userId: user.id })}
            >
              <Text style={styles.alertButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="person" size={24} color="#3b82f6" />
          <Text style={styles.statNumber}>{user.membershipType}</Text>
          <Text style={styles.statLabel}>Membership</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{user.familyMembers?.length || 0}</Text>
          <Text style={styles.statLabel}>Family Members</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>{recentEvents.length}</Text>
          <Text style={styles.statLabel}>Upcoming Events</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionCard
            icon="person-outline"
            title="My Profile"
            subtitle="Update personal info"
            onPress={() => navigation.navigate('Profile')}
          />
          <ActionCard
            icon="calendar-outline"
            title="Events"
            subtitle="View & RSVP to events"
            onPress={() => navigation.navigate('Events')}
          />
          <ActionCard
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage preferences"
            onPress={() => navigation.navigate('Profile', { tab: 'notifications' })}
          />
          <ActionCard
            icon="settings-outline"
            title="Settings"
            subtitle="Account settings"
            onPress={() => navigation.navigate('Profile', { tab: 'security' })}
          />
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
        
        {recentEvents.length > 0 ? (
          <View style={styles.eventsContainer}>
            {recentEvents.slice(0, 3).map((event: any) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No recent events available</Text>
          </View>
        )}
      </View>

      {/* Membership Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membership Status</Text>
        <View style={styles.membershipCard}>
          <View style={styles.membershipInfo}>
            <Text style={styles.membershipType}>{user.membershipType} Membership</Text>
            {user.membershipExpiry && (
              <Text style={styles.membershipExpiry}>
                Expires: {new Date(user.membershipExpiry).toLocaleDateString()}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.renewButton}>
            <Text style={styles.renewButtonText}>Renew</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

interface ActionCardProps {
  icon: string
  title: string
  subtitle: string
  onPress: () => void
}

function ActionCard({ icon, title, subtitle, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <Ionicons name={icon as any} size={24} color="#3b82f6" />
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  )
}

interface EventCardProps {
  event: any
  onPress: () => void
}

function EventCard({ event, onPress }: EventCardProps) {
  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>
          {new Date(event.date).toLocaleDateString()}
        </Text>
        <Text style={styles.eventLocation}>{event.location}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  warningAlert: {
    backgroundColor: '#fef3c7',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  alertButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  alertButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  membershipInfo: {
    flex: 1,
  },
  membershipType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  membershipExpiry: {
    fontSize: 14,
    color: '#6b7280',
  },
  renewButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  renewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
})