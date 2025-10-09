// JTM Mobile - Main Navigation Container
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Import UserContext
import { useUser } from '../context/UserContext'

// Import screens
import ModernLoginScreen from '../screens/auth/ModernLoginScreen'
import ModernRegistrationScreen from '../screens/auth/ModernRegistrationScreen'
import ModernMemberDashboard from '../screens/member/ModernMemberDashboard'
import ModernProfileScreen from '../screens/member/ModernProfileScreen'
import ModernEventsScreen from '../screens/member/ModernEventsScreen'
import ModernEventDetailsScreen from '../screens/member/ModernEventDetailsScreen'
import NotificationsScreen from '../screens/member/NotificationsScreen'
import ChangePasswordScreen from '../screens/member/ChangePasswordScreen'
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen'
import CreateEventScreen from '../screens/admin/CreateEventScreen'

// Type definitions for navigation
export type RootStackParamList = {
  Auth: undefined
  MainTabs: undefined
  AdminTabs: undefined
  ChangePassword: { userId: string }
  EventDetail: { eventId: string }
  CreateEvent: undefined
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type MemberTabParamList = {
  Dashboard: undefined
  Events: undefined
  Notifications: undefined
  Profile: undefined
}

export type AdminTabParamList = {
  AdminDashboard: undefined
  Members: undefined
  Events: undefined
  Analytics: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const MemberTab = createBottomTabNavigator<MemberTabParamList>()
const AdminTab = createBottomTabNavigator<AdminTabParamList>()

// Modern Tab Icon Component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const getIconName = (tabName: string) => {
    switch (tabName) {
      case 'Dashboard': return 'home'
      case 'Events': return 'calendar'
      case 'Notifications': return 'notifications'
      case 'Profile': return 'person'
      case 'Admin': return 'settings'
      case 'Members': return 'people'
      case 'Analytics': return 'stats-chart'
      default: return 'ellipse'
    }
  }

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
    }}>
      <Ionicons 
        name={getIconName(name) as any} 
        size={24} 
        color={focused ? '#6366f1' : '#9ca3af'} 
      />
    </View>
  )
}

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={ModernLoginScreen} />
      <AuthStack.Screen name="Register" component={ModernRegistrationScreen} />
    </AuthStack.Navigator>
  )
}

// Member Tab Navigator
function MemberTabNavigator() {
  return (
    <MemberTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <MemberTab.Screen 
        name="Dashboard" 
        component={ModernMemberDashboard}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Dashboard" focused={focused} />,
          tabBarLabel: 'Home',
        }}
      />
      <MemberTab.Screen 
        name="Events" 
        component={ModernEventsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Events" focused={focused} />,
        }}
      />
      <MemberTab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Notifications" focused={focused} />,
        }}
      />
      <MemberTab.Screen 
        name="Profile" 
        component={ModernProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
        }}
      />
    </MemberTab.Navigator>
  )
}

// Admin Tab Navigator
function AdminTabNavigator() {
  return (
    <AdminTab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#dc2626',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#dc2626',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <AdminTab.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{
          title: 'Admin Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon name="Admin" focused={focused} />,
        }}
      />
      <AdminTab.Screen 
        name="Members" 
        component={ModernMemberDashboard}
        options={{
          title: 'Member Management',
          tabBarIcon: ({ focused }) => <TabIcon name="Members" focused={focused} />,
        }}
      />
      <AdminTab.Screen 
        name="Events" 
        component={ModernEventsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Events" focused={focused} />,
        }}
      />
      <AdminTab.Screen 
        name="Analytics" 
        component={ModernMemberDashboard}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Analytics" focused={focused} />,
        }}
      />
    </AdminTab.Navigator>
  )
}

// Main App Navigator with User Context Logic
export default function AppNavigator() {
  const { user } = useUser()

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          // User is logged in - show main app screens
          <>
            <Stack.Screen 
              name={user.isAdmin ? "AdminTabs" : "MainTabs"} 
              component={user.isAdmin ? AdminTabNavigator : MemberTabNavigator} 
            />
            <Stack.Screen 
              name="ChangePassword" 
              component={ChangePasswordScreen}
              options={{
                headerShown: true,
                title: 'Change Password',
                headerStyle: {
                  backgroundColor: '#6366f1',
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen 
              name="EventDetail" 
              component={ModernEventDetailsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="CreateEvent" 
              component={CreateEventScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        ) : (
          // User is not logged in - show auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}