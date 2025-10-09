// JTM Mobile - Modern Profile Screen
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
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../../context/UserContext'
import { apiConfig, getHeaders } from '../../api/config'

const { width, height } = Dimensions.get('window')

// Modern Info Card Component
const InfoCard = ({ icon, title, value, color = '#6366f1' }: {
  icon: string
  title: string
  value: string
  color?: string
}) => (
  <View style={styles.infoCard}>
    <LinearGradient
      colors={['#ffffff', '#f8fafc']}
      style={styles.infoCardGradient}
    >
      <View style={[styles.infoIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </LinearGradient>
  </View>
)

// QR Code Card Component
const QRCodeCard = ({ qrCode }: { qrCode?: string }) => (
  <View style={styles.qrCard}>
    <LinearGradient
      colors={['#6366f1', '#8b5cf6']}
      style={styles.qrCardGradient}
    >
      <View style={styles.qrHeader}>
        <Ionicons name="qr-code" size={24} color="white" />
        <Text style={styles.qrTitle}>My QR Code</Text>
      </View>
      <View style={styles.qrCodeContainer}>
        {qrCode ? (
          <View style={styles.qrCodePlaceholder}>
            <Ionicons name="qr-code-outline" size={80} color="white" />
          </View>
        ) : (
          <View style={styles.qrCodeEmpty}>
            <Ionicons name="qr-code-outline" size={40} color="rgba(255,255,255,0.7)" />
            <Text style={styles.qrEmptyText}>No QR code available</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  </View>
)

interface ProfileScreenProps {
  navigation: any
}

export default function ModernProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useUser()
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    )
  }

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword', { userId: user?.id })
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#10b981' : '#ef4444'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading profile...</Text>
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
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#ffffff', '#f1f5f9']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(user.isActive) + '20' }
          ]}>
            <Ionicons 
              name={user.isActive ? 'checkmark-circle' : 'alert-circle'} 
              size={16} 
              color={getStatusColor(user.isActive)} 
            />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(user.isActive) }
            ]}>
              {user.isActive ? 'Active Member' : 'Inactive'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Membership Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Information</Text>
          <View style={styles.infoGrid}>
            <InfoCard
              icon="diamond"
              title="Membership Type"
              value={user.membershipType || 'Standard'}
              color="#6366f1"
            />
            <InfoCard
              icon="calendar"
              title="Member Since"
              value={(user as any).createdAt ? formatDate((user as any).createdAt) : 'N/A'}
              color="#10b981"
            />
            {user.membershipExpiry && (
              <InfoCard
                icon="time"
                title="Expires On"
                value={formatDate(user.membershipExpiry)}
                color="#f59e0b"
              />
            )}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoGrid}>
            <InfoCard
              icon="call"
              title="Mobile Number"
              value={user.mobileNumber || 'Not provided'}
              color="#8b5cf6"
            />
            {user.address && (
              <InfoCard
                icon="location"
                title="Address"
                value={`${user.address.city}, ${user.address.state}`}
                color="#06b6d4"
              />
            )}
          </View>
        </View>

        {/* Family Members */}
        {user.familyMembers && user.familyMembers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            <View style={styles.familyContainer}>
              {user.familyMembers.map((member: any, index: number) => (
                <View key={index} style={styles.familyCard}>
                  <LinearGradient
                    colors={['#ffffff', '#f8fafc']}
                    style={styles.familyCardGradient}
                  >
                    <View style={styles.familyInfo}>
                      <View style={styles.familyAvatar}>
                        <Text style={styles.familyAvatarText}>
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </Text>
                      </View>
                      <View style={styles.familyDetails}>
                        <Text style={styles.familyName}>
                          {member.firstName} {member.lastName}
                        </Text>
                        <Text style={styles.familyRelation}>{member.relationship}</Text>
                        {member.age && (
                          <Text style={styles.familyAge}>{member.age} years old</Text>
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* QR Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My QR Code</Text>
          <QRCodeCard qrCode={(user as any).qrCode} />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
              <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="lock-closed" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.actionText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Notifications')}>
              <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="notifications" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.actionText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
              <View style={[styles.actionIcon, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="log-out" size={20} color="#ef4444" />
              </View>
              <Text style={[styles.actionText, { color: '#ef4444' }]}>Logout</Text>
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
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
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600',
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

  // Info Cards
  infoGrid: {
    gap: 12,
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },

  // Family Members
  familyContainer: {
    gap: 12,
  },
  familyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  familyCardGradient: {
    padding: 16,
  },
  familyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  familyAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  familyDetails: {
    flex: 1,
  },
  familyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  familyRelation: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: 2,
  },
  familyAge: {
    fontSize: 12,
    color: '#64748b',
  },

  // QR Code Card
  qrCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  qrCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCodePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCodeEmpty: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrEmptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 8,
  },

  // Action Buttons
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },

  // Loading State
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
})