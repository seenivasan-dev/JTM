// JTM Mobile - Admin Dashboard Screen
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  pendingRenewals: number
  upcomingEvents: number
  recentRegistrations: number
}

interface AdminDashboardScreenProps {
  navigation?: any
}

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingRenewals: 0,
    upcomingEvents: 0,
    recentRegistrations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/dashboard-stats')
      // const data = await response.json()
      // setStats(data)
      
      // Mock data for now
      setTimeout(() => {
        setStats({
          totalMembers: 245,
          activeMembers: 198,
          pendingRenewals: 12,
          upcomingEvents: 3,
          recentRegistrations: 8,
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDashboardStats()
    setRefreshing(false)
  }

  const StatCard = ({ title, value, color = '#3b82f6' }: { title: string; value: number; color?: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  )

  const ActionButton = ({ title, subtitle, onPress, color = '#3b82f6' }: { 
    title: string; 
    subtitle: string; 
    onPress: () => void; 
    color?: string 
  }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Text style={styles.actionIconText}>{title.substring(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Manage your community efficiently
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard title="Total Members" value={stats.totalMembers} color="#3b82f6" />
          <StatCard title="Active Members" value={stats.activeMembers} color="#10b981" />
          <StatCard title="Pending Renewals" value={stats.pendingRenewals} color="#f59e0b" />
          <StatCard title="Upcoming Events" value={stats.upcomingEvents} color="#8b5cf6" />
          <StatCard title="New This Month" value={stats.recentRegistrations} color="#06b6d4" />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <ActionButton
          title="Manage Members"
          subtitle="View, activate, and manage member accounts"
          color="#3b82f6"
          onPress={() => navigation?.navigate('Members')}
        />
        
        <ActionButton
          title="Bulk Import"
          subtitle="Import multiple members from Excel/CSV"
          color="#10b981"
          onPress={() => {
            // TODO: Navigate to bulk import or implement in mobile
            console.log('Bulk import not yet implemented in mobile')
          }}
        />
        
        <ActionButton
          title="Events"
          subtitle="Create and manage community events"
          color="#8b5cf6"
          onPress={() => navigation?.navigate('Events')}
        />
        
        <ActionButton
          title="Renewals"
          subtitle="Process membership renewal requests"
          color="#f59e0b"
          onPress={() => {
            // TODO: Navigate to renewals screen
            console.log('Renewals screen not yet implemented')
          }}
        />
        
        <ActionButton
          title="Analytics"
          subtitle="View detailed reports and insights"
          color="#06b6d4"
          onPress={() => navigation?.navigate('Analytics')}
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>8 new member registrations</Text>
          <Text style={styles.activityTime}>Last 7 days</Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>12 renewal requests pending</Text>
          <Text style={styles.activityTime}>Awaiting review</Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>Community Picnic scheduled</Text>
          <Text style={styles.activityTime}>March 15, 2025</Text>
        </View>
      </View>
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
    backgroundColor: '#dc2626',
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
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  activityContainer: {
    padding: 16,
    marginBottom: 20,
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
})