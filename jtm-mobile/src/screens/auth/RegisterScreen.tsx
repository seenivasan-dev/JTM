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
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { apiConfig, getHeaders, handleApiResponse } from '../../api/config'

interface RegisterScreenProps {
  navigation: any
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    membershipType: 'INDIVIDUAL',
    // Address fields
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    // Payment fields
    paymentMethod: 'Zelle',
    paymentConfirmation: '',
  })
  const [familyMembers, setFamilyMembers] = useState<Array<{
    firstName: string
    lastName: string
    relationship: string
    age: string
    email: string
  }>>([])
  const [newFamilyMember, setNewFamilyMember] = useState({
    firstName: '',
    lastName: '',
    relationship: '',
    age: '',
    email: '',
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
    if (!formData.mobileNumber.trim()) {
      Alert.alert('Error', 'Mobile number is required')
      return false
    }
    
    // Validate mobile number format (10 digits)
    const mobileRegex = /^\d{10}$/
    if (!mobileRegex.test(formData.mobileNumber.replace(/\D/g, ''))) {
      Alert.alert('Error', 'Mobile number must be exactly 10 digits')
      return false
    }
    if (!formData.street.trim()) {
      Alert.alert('Error', 'Street address is required')
      return false
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'City is required')
      return false
    }
    if (!formData.state.trim()) {
      Alert.alert('Error', 'State is required')
      return false
    }
    if (!formData.zipCode.trim()) {
      Alert.alert('Error', 'ZIP code is required')
      return false
    }
    
    // Validate ZIP code format
    const zipRegex = /^\d{5}(-\d{4})?$/
    if (!zipRegex.test(formData.zipCode.trim())) {
      Alert.alert('Error', 'ZIP code must be in format 12345 or 12345-6789')
      return false
    }

    // Validate payment confirmation
    if (!formData.paymentConfirmation.trim()) {
      Alert.alert('Error', 'Payment confirmation number is required')
      return false
    }

    return true
  }

  const addFamilyMember = () => {
    if (!newFamilyMember.firstName.trim() || !newFamilyMember.lastName.trim() || !newFamilyMember.relationship.trim()) {
      Alert.alert('Error', 'First name, last name, and relationship are required for family members')
      return
    }

    // Validate email if provided
    if (newFamilyMember.email.trim() && !newFamilyMember.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address for family member')
      return
    }

    // Validate age if provided
    if (newFamilyMember.age && (isNaN(parseInt(newFamilyMember.age)) || parseInt(newFamilyMember.age) < 0 || parseInt(newFamilyMember.age) > 120)) {
      Alert.alert('Error', 'Please enter a valid age (0-120) for family member')
      return
    }

    setFamilyMembers([...familyMembers, { ...newFamilyMember }])
    setNewFamilyMember({
      firstName: '',
      lastName: '',
      relationship: '',
      age: '',
      email: '',
    })
  }

  const removeFamilyMember = (index: number) => {
    const updated = familyMembers.filter((_, i) => i !== index)
    setFamilyMembers(updated)
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    const registrationData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      mobileNumber: formData.mobileNumber.replace(/\D/g, ''), // Remove non-digits
      membershipType: formData.membershipType,
      paymentMethod: formData.paymentMethod,
      paymentConfirmation: formData.paymentConfirmation.trim(),
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        country: formData.country.trim(),
      },
      ...(formData.membershipType === 'FAMILY' && familyMembers.length > 0 && {
        familyMembers: familyMembers.map(member => ({
          firstName: member.firstName.trim(),
          lastName: member.lastName.trim(),
          relationship: member.relationship.trim(),
          age: member.age ? parseInt(member.age) : 0,
          email: member.email.trim() || '',
        }))
      }),
    }

    setLoading(true)
    try {
      const response = await fetch(`${apiConfig.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(registrationData),
      })

      if (response.ok) {
        const result = await handleApiResponse(response)
        Alert.alert(
          'Registration Successful',
          'Your membership application has been submitted for review. You will receive an email with login credentials once your account is activated.',
          [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]
        )
      } else {
        const error = await response.json()
        console.log('Registration error response:', error)
        console.log('Registration data sent:', registrationData)
        Alert.alert('Registration Failed', error.error || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      console.log('Registration data sent:', registrationData)
      Alert.alert('Error', 'Registration failed. Please check your network connection.')
    } finally {
      setLoading(false)
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
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChangeText={(text) => handleInputChange('mobileNumber', text)}
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionTitle}>Address Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={formData.street}
            onChangeText={(text) => handleInputChange('street', text)}
            multiline
          />

          <View style={styles.nameContainer}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="City"
              value={formData.city}
              onChangeText={(text) => handleInputChange('city', text)}
            />
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="State"
              value={formData.state}
              onChangeText={(text) => handleInputChange('state', text)}
            />
          </View>

          <View style={styles.nameContainer}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="ZIP Code"
              value={formData.zipCode}
              onChangeText={(text) => handleInputChange('zipCode', text)}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="Country"
              value={formData.country}
              onChangeText={(text) => handleInputChange('country', text)}
            />
          </View>

          <View style={styles.membershipSection}>
            <Text style={styles.sectionTitle}>Membership Type</Text>
            <View style={styles.membershipOptions}>
              {['INDIVIDUAL', 'FAMILY', 'CUSTOM'].map((type) => (
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
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </Text>
                 </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.feeNote}>
              Annual membership fee • Renews every January 1st
            </Text>
          </View>

          {/* Payment Information Section */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentInfoText}>
                Please complete your payment before submitting registration
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Payment Method</Text>
            <View style={styles.paymentMethodOptions}>
              {['Zelle', 'Venmo', 'Cash', 'Check'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethodButton,
                    formData.paymentMethod === method && styles.paymentMethodSelected
                  ]}
                  onPress={() => handleInputChange('paymentMethod', method)}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    formData.paymentMethod === method && styles.paymentMethodTextSelected
                  ]}>
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder={`${formData.paymentMethod} Confirmation Number / Transaction ID`}
              value={formData.paymentConfirmation}
              onChangeText={(text) => handleInputChange('paymentConfirmation', text)}
            />
          </View>

          {/* Family Members Section - Only show for FAMILY membership */}
          {formData.membershipType === 'FAMILY' && (
            <View style={styles.familySection}>
              <Text style={styles.sectionTitle}>Family Members</Text>
              
              {/* Existing Family Members */}
              {familyMembers.map((member, index) => (
                <View key={index} style={styles.familyMemberCard}>
                  <View style={styles.familyMemberInfo}>
                    <Text style={styles.familyMemberName}>
                      {member.firstName} {member.lastName}
                    </Text>
                    <Text style={styles.familyMemberDetails}>
                      {member.relationship}{member.age ? ` • ${member.age} years old` : ''}
                    </Text>
                    {member.email && (
                      <Text style={styles.familyMemberEmail}>{member.email}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.removeFamilyMember}
                    onPress={() => removeFamilyMember(index)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add New Family Member Form */}
              <View style={styles.addFamilyMemberForm}>
                <Text style={styles.addFamilyMemberTitle}>Add Family Member</Text>
                
                <View style={styles.nameRow}>
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    placeholder="First Name"
                    value={newFamilyMember.firstName}
                    onChangeText={(text) => setNewFamilyMember(prev => ({ ...prev, firstName: text }))}
                  />
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    placeholder="Last Name"
                    value={newFamilyMember.lastName}
                    onChangeText={(text) => setNewFamilyMember(prev => ({ ...prev, lastName: text }))}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Relationship (e.g., Spouse, Child, Parent)"
                  value={newFamilyMember.relationship}
                  onChangeText={(text) => setNewFamilyMember(prev => ({ ...prev, relationship: text }))}
                />

                <View style={styles.nameRow}>
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    placeholder="Age (optional)"
                    value={newFamilyMember.age}
                    onChangeText={(text) => setNewFamilyMember(prev => ({ ...prev, age: text }))}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    placeholder="Email (optional)"
                    value={newFamilyMember.email}
                    onChangeText={(text) => setNewFamilyMember(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity style={styles.addFamilyMemberButton} onPress={addFamilyMember}>
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.addFamilyMemberButtonText}>Add Family Member</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
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
  membershipFeeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 4,
  },
  membershipFeeTextSelected: {
    color: '#dc2626',
  },
  feeNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  paymentSection: {
    marginBottom: 16,
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  paymentMethodOptions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  paymentMethodButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  paymentMethodSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentMethodTextSelected: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  paymentInfo: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  paymentInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  paymentInfoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
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
  familySection: {
    marginBottom: 16,
  },
  familyMemberCard: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  familyMemberInfo: {
    flex: 1,
  },
  familyMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  familyMemberDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  familyMemberEmail: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  removeFamilyMember: {
    padding: 8,
  },
  addFamilyMemberForm: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  addFamilyMemberTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addFamilyMemberButton: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addFamilyMemberButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
})