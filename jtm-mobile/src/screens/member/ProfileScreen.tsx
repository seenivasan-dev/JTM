// JTM Mobile - Simplified Profile Screen
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../../context/UserContext'
import { apiConfig, handleApiResponse, getHeaders } from '../../api/config'

interface ProfileProps {
  navigation: any
  route: any
}

export default function ProfileScreen({ navigation, route }: ProfileProps) {
  const { user: contextUser, setUser, logout } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [firstName, setFirstName] = useState(contextUser?.firstName || '')
  const [lastName, setLastName] = useState(contextUser?.lastName || '')
  const [mobileNumber, setMobileNumber] = useState(contextUser?.mobileNumber || '')
  const [street, setStreet] = useState(contextUser?.address?.street || '')
  const [city, setCity] = useState(contextUser?.address?.city || '')
  const [state, setState] = useState(contextUser?.address?.state || '')
  const [zipCode, setZipCode] = useState(contextUser?.address?.zipCode || '')
  const [country, setCountry] = useState(contextUser?.address?.country || '')

  // Update form when context user changes
  useEffect(() => {
    if (contextUser) {
      setFirstName(contextUser.firstName || '')
      setLastName(contextUser.lastName || '')
      setMobileNumber(contextUser.mobileNumber || '')
      setStreet(contextUser.address?.street || '')
      setCity(contextUser.address?.city || '')
      setState(contextUser.address?.state || '')
      setZipCode(contextUser.address?.zipCode || '')
      setCountry(contextUser.address?.country || '')
    }
  }, [contextUser])

  if (!contextUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to view your profile</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const updateData = {
        email: contextUser.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobileNumber: mobileNumber.trim(),
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          country: country.trim(),
        },
      }

      const response = await fetch(`${apiConfig.baseUrl}/mobile/user`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedUser = await handleApiResponse(response)
        setUser(updatedUser) // Update context
        setIsEditing(false)
        Alert.alert('Success', 'Profile updated successfully!')
      } else {
        const error = await response.json()
        Alert.alert('Error', error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      Alert.alert('Error', 'Failed to update profile. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    if (contextUser) {
      setFirstName(contextUser.firstName || '')
      setLastName(contextUser.lastName || '')
      setMobileNumber(contextUser.mobileNumber || '')
      setStreet(contextUser.address?.street || '')
      setCity(contextUser.address?.city || '')
      setState(contextUser.address?.state || '')
      setZipCode(contextUser.address?.zipCode || '')
      setCountry(contextUser.address?.country || '')
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout()
            navigation.navigate('Login')
          },
        },
      ]
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {contextUser.firstName.charAt(0)}{contextUser.lastName.charAt(0)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {contextUser.firstName} {contextUser.lastName}
            </Text>
            <Text style={styles.userEmail}>{contextUser.email}</Text>
            <Text style={styles.membershipType}>
              {contextUser.membershipType} Member
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.buttonDisabled]} 
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="pencil" size={20} color="#007AFF" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={firstName}
            onChangeText={setFirstName}
            editable={isEditing}
            placeholder="Enter first name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={lastName}
            onChangeText={setLastName}
            editable={isEditing}
            placeholder="Enter last name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={contextUser.email}
            editable={false}
            placeholder="Email address"
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            editable={isEditing}
            placeholder="Enter mobile number"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Address Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street Address</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={street}
            onChangeText={setStreet}
            editable={isEditing}
            placeholder="Enter street address"
            multiline
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={city}
              onChangeText={setCity}
              editable={isEditing}
              placeholder="City"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={state}
              onChangeText={setState}
              editable={isEditing}
              placeholder="State"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>ZIP Code</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={zipCode}
              onChangeText={setZipCode}
              editable={isEditing}
              placeholder="ZIP"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={country}
              onChangeText={setCountry}
              editable={isEditing}
              placeholder="Country"
            />
          </View>
        </View>
      </View>

      {/* Membership Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membership Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membership Type:</Text>
          <Text style={styles.infoValue}>{contextUser.membershipType}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[styles.infoValue, contextUser.isActive ? styles.statusActive : styles.statusInactive]}>
            {contextUser.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>

        {contextUser.membershipExpiry && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expires:</Text>
            <Text style={styles.infoValue}>
              {new Date(contextUser.membershipExpiry).toLocaleDateString()}
            </Text>
          </View>
        )}

        {contextUser.familyMembers && contextUser.familyMembers.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Family Members:</Text>
            <Text style={styles.infoValue}>{contextUser.familyMembers.length}</Text>
          </View>
        )}
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  membershipType: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  editButtonText: {
    color: '#007AFF',
    marginLeft: 5,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusActive: {
    color: '#28A745',
  },
  statusInactive: {
    color: '#DC3545',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});