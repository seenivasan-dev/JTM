// JTM Mobile - Modern Notifications Screen
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../../context/UserContext'
import { apiConfig, getHeaders } from '../../api/config'

const { width, height } = Dimensions.get('window')

// Modern Notification Card Component
const ModernNotificationCard = ({ notification, onPress }: { 
  notification: Notification; 
  onPress: () => void 
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rsvp_approved':
        return 'checkmark-circle'
      case 'event_reminder':
        return 'calendar'
      case 'rsvp_deadline':
        return 'time'
      case 'membership_renewal':
        return 'refresh-circle'
      case 'welcome':
        return 'happy'
      case 'event_checkin':
        return 'qr-code'
      default:
        return 'notifications'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'rsvp_approved':
        return '#10b981'
      case 'event_reminder':
        return '#3b82f6'
      case 'rsvp_deadline':
        return '#f59e0b'
      case 'membership_renewal':
        return '#ef4444'
      case 'welcome':
        return '#8b5cf6'
      case 'event_checkin':
        return '#06b6d4'
      default:
        return '#6b7280'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `${diffInDays}d ago`
      } else {
        return date.toLocaleDateString()
      }
    }
  }

  return (
    <TouchableOpacity 
      style={[
        styles.notificationCard,
        !notification.read && styles.unreadCard
      ]} 
      onPress={onPress}
    >
      <LinearGradient
        colors={notification.read ? ['#f8fafc', '#f1f5f9'] : ['#ffffff', '#f8fafc']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor(notification.type) + '20' }
          ]}>
            <Ionicons
              name={getNotificationIcon(notification.type) as any}
              size={24}
              color={getNotificationColor(notification.type)}
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[
              styles.notificationTitle,
              !notification.read && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTimestamp}>
              {formatTimestamp(notification.timestamp)}
            </Text>
          </View>
          
          <View style={styles.cardActions}>
            {!notification.read && (
              <View style={styles.unreadIndicator} />
            )}
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

interface Notification {
  id: string
  type: 'rsvp_approved' | 'event_reminder' | 'rsvp_deadline' | 'membership_renewal' | 'welcome' | 'event_checkin'
  title: string
  message: string
  timestamp: string
  read: boolean
  data: any
}

interface NotificationsScreenProps {
  navigation: any
}

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/api/mobile/notifications?userEmail=${encodeURIComponent(user?.email || '')}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } else {
        console.error('Failed to load notifications')
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadNotifications()
    setRefreshing(false)
  }

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    await markAsRead(notification.id)

    // Navigate based on notification type
    switch (notification.type) {
      case 'rsvp_approved':
      case 'event_reminder':
      case 'rsvp_deadline':
        if (notification.data.eventId) {
          // You'd need to fetch the event details and navigate
          navigation.navigate('EventDetail', { 
            event: { id: notification.data.eventId } 
          })
        }
        break
      case 'membership_renewal':
        navigation.navigate('Profile')
        break
      case 'welcome':
        navigation.navigate('Events')
        break
      default:
        break
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`${apiConfig.baseUrl}/api/mobile/notifications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          notificationId,
          action: 'mark_read'
        }),
      })

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id)
      }

      Alert.alert('Success', 'All notifications marked as read')
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rsvp_approved':
        return 'checkmark-circle'
      case 'event_reminder':
        return 'calendar'
      case 'rsvp_deadline':
        return 'time'
      case 'membership_renewal':
        return 'refresh-circle'
      case 'welcome':
        return 'happy'
      case 'event_checkin':
        return 'qr-code'
      default:
        return 'notifications'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'rsvp_approved':
        return '#10b981'
      case 'event_reminder':
        return '#3b82f6'
      case 'rsvp_deadline':
        return '#f59e0b'
      case 'membership_renewal':
        return '#ef4444'
      case 'welcome':
        return '#8b5cf6'
      case 'event_checkin':
        return '#06b6d4'
      default:
        return '#6b7280'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `${diffInDays}d ago`
      } else {
        return date.toLocaleDateString()
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    )
  }

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
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Unread Count Banner */}
      {unreadCount > 0 && (
        <LinearGradient
          colors={['#fef3c7', '#fde68a']}
          style={styles.unreadBanner}
        >
          <View style={styles.unreadContent}>
            <Ionicons name="notifications" size={20} color="#92400e" />
            <Text style={styles.unreadText}>
              You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Text>
          </View>
        </LinearGradient>
      )}

      {/* Notifications List */}
      <ScrollView
        style={styles.notificationsList}
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
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-outline" size={64} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>
              You're all caught up! Notifications will appear here when you have updates.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => (
              <ModernNotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
              />
            ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  markAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Unread Banner
  unreadBanner: {
    marginHorizontal: 20,
    marginTop: -12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unreadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  unreadText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // Notifications List
  notificationsList: {
    flex: 1,
    paddingTop: 20,
  },
  notificationsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },

  // Modern Notification Card
  notificationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unreadCard: {
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardGradient: {
    borderRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#1f2937',
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  cardActions: {
    alignItems: 'center',
    gap: 8,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },

  // Loading State
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
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
  emptyMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Legacy styles for backwards compatibility
  notificationItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginLeft: 8,
    marginTop: 4,
  },
})