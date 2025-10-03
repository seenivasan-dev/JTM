// JTM Mobile - Simple Navigation Component (without React Navigation for now)
import React, { useState } from 'react'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'

// Import screens
import LoginScreen from '../screens/auth/LoginScreen'
import DashboardScreen from '../screens/member/DashboardScreen'
import ProfileScreen from '../screens/member/ProfileScreen'

// Simple icon component
const SimpleIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={[
    styles.iconContainer,
    { backgroundColor: focused ? '#3b82f6' : '#9ca3af' }
  ]}>
    <Text style={styles.iconText}>
      {name.substring(0, 2).toUpperCase()}
    </Text>
  </View>
)

// Navigation state type
interface NavigationState {
  currentScreen: string
  isAuthenticated: boolean
}

// Simple navigation component
export default function AppNavigator() {
  const [navState, setNavState] = useState<NavigationState>({
    currentScreen: 'Login',
    isAuthenticated: false,
  })

  // Simple navigation function
  const navigate = (screenName: string, params?: any) => {
    if (screenName === 'MemberTabs') {
      setNavState({
        currentScreen: 'Dashboard',
        isAuthenticated: true,
      })
    } else if (screenName === 'Login') {
      setNavState({
        currentScreen: 'Login',
        isAuthenticated: false,
      })
    } else {
      setNavState({
        ...navState,
        currentScreen: screenName,
      })
    }
  }

  // Render current screen
  const renderCurrentScreen = () => {
    const mockNavigation = { navigate }

    switch (navState.currentScreen) {
      case 'Login':
        return <LoginScreen navigation={mockNavigation} />
      case 'Dashboard':
        return <DashboardScreen navigation={mockNavigation} />
      case 'Profile':
        return <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
      case 'Events':
        return <EventsScreen />
      default:
        return <LoginScreen navigation={mockNavigation} />
    }
  }

  // If not authenticated, show login
  if (!navState.isAuthenticated) {
    return renderCurrentScreen()
  }

  // Show main app with bottom tabs
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {navState.currentScreen === 'Dashboard' ? 'JTM Community' : navState.currentScreen}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderCurrentScreen()}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigate('Dashboard')}
        >
          <SimpleIcon name="home" focused={navState.currentScreen === 'Dashboard'} />
          <Text style={[
            styles.tabLabel,
            { color: navState.currentScreen === 'Dashboard' ? '#3b82f6' : '#6b7280' }
          ]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigate('Events')}
        >
          <SimpleIcon name="events" focused={navState.currentScreen === 'Events'} />
          <Text style={[
            styles.tabLabel,
            { color: navState.currentScreen === 'Events' ? '#3b82f6' : '#6b7280' }
          ]}>
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigate('Profile')}
        >
          <SimpleIcon name="profile" focused={navState.currentScreen === 'Profile'} />
          <Text style={[
            styles.tabLabel,
            { color: navState.currentScreen === 'Profile' ? '#3b82f6' : '#6b7280' }
          ]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Placeholder Events Screen
function EventsScreen() {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderTitle}>Events Screen</Text>
      <Text style={styles.placeholderSubtitle}>Coming Soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50, // Account for status bar
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 8,
    paddingTop: 8,
    height: 80,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
})