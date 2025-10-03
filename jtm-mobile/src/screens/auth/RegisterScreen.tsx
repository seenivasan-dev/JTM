// JTM Mobile - Register Screen
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'

interface RegisterScreenProps {
  navigation: any
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    membershipType: 'Individual',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Last name is required')
      return false
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required')
      return false
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address')
      return false
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return false
    }
    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: `${formData.firstName} ${formData.lastName}`,
      //     email: formData.email,
      //     phone: formData.phone,
      //     address: formData.address,
      //     membershipType: formData.membershipType,
      //     password: formData.password,
      //   }),
      // })

      // Mock registration for now
      setTimeout(() => {
        setLoading(false)
        Alert.alert(
          'Registration Successful',
          'Your membership application has been submitted for review. You will receive an email once your account is activated.',
          [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]
        )
      }, 2000)
    } catch (error) {
      setLoading(false)
      Alert.alert('Error', 'Registration failed. Please try again.')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Join Our Community</Text>
          <Text style={styles.headerSubtitle}>
            Create your membership account
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameContainer}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              autoCapitalize="words"
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Address"
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.membershipSection}>
            <Text style={styles.sectionTitle}>Membership Type</Text>
            <View style={styles.membershipOptions}>
              {['Individual', 'Family', 'Student'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.membershipOption,
                    formData.membershipType === type && styles.membershipOptionSelected
                  ]}
                  onPress={() => handleInputChange('membershipType', type)}
                >
                  <Text style={[
                    styles.membershipOptionText,
                    formData.membershipType === type && styles.membershipOptionTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkButton}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fecaca',
  },
  form: {
    padding: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nameInput: {
    width: '48%',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
  },
  membershipSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  membershipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  membershipOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  membershipOptionSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fee2e2',
  },
  membershipOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  membershipOptionTextSelected: {
    color: '#dc2626',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLinkButton: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
})