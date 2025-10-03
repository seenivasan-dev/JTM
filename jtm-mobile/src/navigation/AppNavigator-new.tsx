// JTM Mobile - Main Navigation Container
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'

// Import screens
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import MemberDashboardScreen from '../screens/member/MemberDashboardScreen'
import ProfileScreen from '../screens/member/ProfileScreen'
import EventsScreen from '../screens/member/EventsScreen'
import ChangePasswordScreen from '../screens/member/ChangePasswordScreen'
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen'
import MemberManagementScreen from '../screens/admin/MemberManagementScreen'
import AnalyticsScreen from '../screens/admin/AnalyticsScreen'

// Type definitions for navigation
export type RootStackParamList = {
  Auth: undefined
  MainTabs: undefined
  ChangePassword: { userId: string }
  AdminTabs: undefined
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type MemberTabParamList = {
  Dashboard: undefined
  Events: undefined
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

// Simple icon component (replace with proper icons later)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={{
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: focused ? '#3b82f6' : '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <Text style={{
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold'
    }}>
      {name.substring(0, 2).toUpperCase()}
    </Text>
  </View>
)

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  )
}

// Member Tab Navigator
function MemberTabNavigator() {
  return (
    <MemberTab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <MemberTab.Screen 
        name="Dashboard" 
        component={MemberDashboardScreen}
        options={{
          title: 'JTM Community',
          tabBarIcon: ({ focused }) => <TabIcon name="Dashboard" focused={focused} />,
        }}
      />
      <MemberTab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Events" focused={focused} />,
        }}
      />
      <MemberTab.Screen 
        name="Profile" 
        component={ProfileScreen}
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
        component={MemberManagementScreen}
        options={{
          title: 'Member Management',
          tabBarIcon: ({ focused }) => <TabIcon name="Members" focused={focused} />,
        }}
      />
      <AdminTab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Events" focused={focused} />,
        }}
      />
      <AdminTab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Analytics" focused={focused} />,
        }}
      />
    </AdminTab.Navigator>
  )
}

// Main App Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen}
          options={{
            headerShown: true,
            title: 'Change Password',
            headerStyle: {
              backgroundColor: '#3b82f6',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen name="MainTabs" component={MemberTabNavigator} />
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}