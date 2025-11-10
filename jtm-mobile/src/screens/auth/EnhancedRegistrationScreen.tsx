// JTM Mobile - Enhanced Registration Screen with Membership Types and Family Members
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { apiConfig } from '../../api/config'

const { width, height } = Dimensions.get('window')

// Modern Input Component
const ModernInput = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'words',
  error,
  required = true,
}: {
  label: string
  icon: string
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
  keyboardType?: any
  autoCapitalize?: any
  error?: string
  required?: boolean
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <View style={[
      styles.inputWrapper,
      error && styles.inputWrapperError
    ]}>
      <View style={styles.inputIcon}>
        <Ionicons name={icon as any} size={20} color={error ? "#ef4444" : "#6b7280"} />
      </View>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {value.trim() && !error && (
        <View style={styles.validIcon}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
        </View>
      )}
    </View>
    {error && (
      <Text style={styles.errorText}>{error}</Text>
    )}
  </View>
)

// Membership Type Selector
const MembershipTypeSelector = ({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (type: string) => void
}) => {
  const types = [
    { value: 'INDIVIDUAL', label: 'Individual', icon: 'person', description: 'Single member' },
    { value: 'FAMILY', label: 'Family', icon: 'people', description: 'Family membership' },
  ]

  return (
    <View style={styles.membershipContainer}>
      <Text style={styles.inputLabel}>
        Membership Type <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.membershipTypes}>
        {types.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.membershipTypeCard,
              selected === type.value && styles.membershipTypeCardSelected
            ]}
            onPress={() => onSelect(type.value)}
          >
            <View style={[
              styles.membershipIconContainer,
              selected === type.value && styles.membershipIconContainerSelected
            ]}>
              <Ionicons 
                name={type.icon as any} 
                size={24} 
                color={selected === type.value ? '#6366f1' : '#6b7280'} 
              />
            </View>
            <Text style={[
              styles.membershipTypeLabel,
              selected === type.value && styles.membershipTypeLabelSelected
            ]}>
              {type.label}
            </Text>
            <Text style={styles.membershipTypeDescription}>{type.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

// Payment Method Selector
const PaymentMethodSelector = ({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (method: string) => void
}) => {
  const methods = [
    { value: 'CASH', label: 'Cash', icon: 'cash' },
    { value: 'CHECK', label: 'Check', icon: 'document-text' },
    { value: 'ZELLE', label: 'Zelle', icon: 'phone-portrait' },
    { value: 'VENMO', label: 'Venmo', icon: 'logo-venmo' },
    { value: 'PAYPAL', label: 'PayPal', icon: 'logo-paypal' },
    { value: 'CREDIT_CARD', label: 'Card', icon: 'card' },
    { value: 'OTHER', label: 'Other', icon: 'ellipsis-horizontal' },
  ]

  return (
    <View style={styles.paymentMethodContainer}>
      <Text style={styles.inputLabel}>Payment Method (Optional)</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.paymentMethodsScroll}
      >
        {methods.map((method) => (
          <TouchableOpacity
            key={method.value}
            style={[
              styles.paymentMethodCard,
              selected === method.value && styles.paymentMethodCardSelected
            ]}
            onPress={() => onSelect(method.value)}
          >
            <Ionicons 
              name={method.icon as any} 
              size={24} 
              color={selected === method.value ? '#6366f1' : '#6b7280'} 
            />
            <Text style={[
              styles.paymentMethodLabel,
              selected === method.value && styles.paymentMethodLabelSelected
            ]}>
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

interface FamilyMember {
  firstName: string
  lastName: string
  age: string
  relationship: string
  email?: string
  contactNumber?: string
}

interface EnhancedRegistrationScreenProps {
  navigation: any
}

export default function EnhancedRegistrationScreen({ navigation }: EnhancedRegistrationScreenProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    membershipType: 'INDIVIDUAL',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    initialPaymentMethod: '',
    initialPaymentConfirmation: '',
  })
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const validateForm = () => {
    const newErrors: any = {}

    // Personal Information
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }

    // Address
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'

    // Family Members (if FAMILY type)
    if (formData.membershipType === 'FAMILY' && familyMembers.length === 0) {
      newErrors.familyMembers = 'Please add at least one family member'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, {
      firstName: '',
      lastName: '',
      age: '',
      relationship: '',
      email: '',
      contactNumber: '',
    }])
  }

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers]
    updated[index] = { ...updated[index], [field]: value }
    setFamilyMembers(updated)
  }

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index))
  }

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly')
      return
    }

    try {
      setLoading(true)
      const url = `${apiConfig.baseUrl}/api/auth/register`
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        membershipType: formData.membershipType,
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: 'USA',
        },
        initialPaymentMethod: formData.initialPaymentMethod || undefined,
        initialPaymentConfirmation: formData.initialPaymentConfirmation?.trim() || undefined,
        familyMembers: formData.membershipType === 'FAMILY' 
          ? familyMembers.map(fm => ({
              firstName: fm.firstName.trim(),
              lastName: fm.lastName.trim(),
              age: parseInt(fm.age) || 0,
              relationship: fm.relationship.trim(),
              email: fm.email?.trim() || undefined,
              contactNumber: fm.contactNumber?.trim() || undefined,
            }))
          : [],
      }

      console.log('Registration URL:', url)
      console.log('Registration payload:', JSON.stringify(payload, null, 2))

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        Alert.alert(
          '✅ Registration Successful!',
          data.data?.message || 'Your account is pending admin approval. You will receive an email with login instructions once your account is activated.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        )
      } else {
        Alert.alert('Registration Failed', data.message || 'An error occurred during registration')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      console.error('Error name:', error?.name)
      console.error('Error message:', error?.message)
      
      let errorMessage = 'Network error. Please try again.'
      
      if (error?.name === 'AbortError') {
        errorMessage = 'Request timeout. The server is taking too long to respond. Please check:\n\n1. Is the web server running?\n2. Can you access http://192.168.1.105:3000 in your browser?\n3. Are you on the same WiFi network?'
      } else if (error?.message?.includes('Network request failed')) {
        errorMessage = 'Cannot connect to server. Please verify:\n\n1. Web server is running (npm run dev)\n2. Your device is on WiFi (not cellular)\n3. Same network as your computer\n4. Server URL: http://192.168.1.105:3000'
      }
      
      Alert.alert('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#ffffff', '#f1f5f9']}
                style={styles.logo}
              >
                <Ionicons name="person-add" size={40} color="#6366f1" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Join JTM Community</Text>
            <Text style={styles.subtitle}>Create your membership account</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.formGradient}
              >
                {/* Section: Personal Information */}
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <ModernInput
                  label="First Name"
                  icon="person"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  error={errors.firstName}
                />

                <ModernInput
                  label="Last Name"
                  icon="person"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  error={errors.lastName}
                />

                <ModernInput
                  label="Email Address"
                  icon="mail"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />

                <ModernInput
                  label="Mobile Number"
                  icon="call"
                  placeholder="Enter your mobile number"
                  value={formData.mobileNumber}
                  onChangeText={(value) => handleInputChange('mobileNumber', value)}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  error={errors.mobileNumber}
                />

                {/* Section: Address */}
                <Text style={styles.sectionTitle}>Address</Text>

                <ModernInput
                  label="Street Address"
                  icon="home"
                  placeholder="Enter street address"
                  value={formData.street}
                  onChangeText={(value) => handleInputChange('street', value)}
                  error={errors.street}
                />

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <ModernInput
                      label="City"
                      icon="location"
                      placeholder="City"
                      value={formData.city}
                      onChangeText={(value) => handleInputChange('city', value)}
                      error={errors.city}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <ModernInput
                      label="State"
                      icon="map"
                      placeholder="State"
                      value={formData.state}
                      onChangeText={(value) => handleInputChange('state', value)}
                      error={errors.state}
                    />
                  </View>
                </View>

                <ModernInput
                  label="ZIP Code"
                  icon="location-outline"
                  placeholder="Enter ZIP code"
                  value={formData.zipCode}
                  onChangeText={(value) => handleInputChange('zipCode', value)}
                  keyboardType="numeric"
                  error={errors.zipCode}
                />

                {/* Section: Membership Type */}
                <Text style={styles.sectionTitle}>Membership Type</Text>
                
                <MembershipTypeSelector
                  selected={formData.membershipType}
                  onSelect={(type) => {
                    handleInputChange('membershipType', type)
                    if (type !== 'FAMILY') {
                      setFamilyMembers([])
                    }
                  }}
                />

                {/* Section: Payment Information */}
                <Text style={styles.sectionTitle}>Payment Information</Text>
                <Text style={styles.sectionDescription}>
                  Payment details will be reviewed during approval process
                </Text>

                <PaymentMethodSelector
                  selected={formData.initialPaymentMethod}
                  onSelect={(method) => handleInputChange('initialPaymentMethod', method)}
                />

                <ModernInput
                  label="Payment Confirmation/Reference"
                  icon="receipt"
                  placeholder="Check number, transaction ID, etc."
                  value={formData.initialPaymentConfirmation}
                  onChangeText={(value) => handleInputChange('initialPaymentConfirmation', value)}
                  required={false}
                />

                {/* Section: Family Members (if FAMILY type) */}
                {formData.membershipType === 'FAMILY' && (
                  <>
                    <View style={styles.familyMembersHeader}>
                      <Text style={styles.sectionTitle}>Family Members</Text>
                      <TouchableOpacity
                        style={styles.addFamilyButton}
                        onPress={addFamilyMember}
                      >
                        <Ionicons name="add-circle" size={24} color="#6366f1" />
                        <Text style={styles.addFamilyButtonText}>Add Member</Text>
                      </TouchableOpacity>
                    </View>

                    {errors.familyMembers && (
                      <Text style={styles.errorText}>{errors.familyMembers}</Text>
                    )}

                    {familyMembers.map((member, index) => (
                      <View key={index} style={styles.familyMemberCard}>
                        <View style={styles.familyMemberHeader}>
                          <Text style={styles.familyMemberTitle}>Family Member {index + 1}</Text>
                          <TouchableOpacity onPress={() => removeFamilyMember(index)}>
                            <Ionicons name="trash" size={20} color="#ef4444" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.row}>
                          <View style={styles.halfWidth}>
                            <ModernInput
                              label="First Name"
                              icon="person"
                              placeholder="First name"
                              value={member.firstName}
                              onChangeText={(value) => updateFamilyMember(index, 'firstName', value)}
                            />
                          </View>
                          <View style={styles.halfWidth}>
                            <ModernInput
                              label="Last Name"
                              icon="person"
                              placeholder="Last name"
                              value={member.lastName}
                              onChangeText={(value) => updateFamilyMember(index, 'lastName', value)}
                            />
                          </View>
                        </View>

                        <View style={styles.row}>
                          <View style={styles.halfWidth}>
                            <ModernInput
                              label="Age"
                              icon="calendar"
                              placeholder="Age"
                              value={member.age}
                              onChangeText={(value) => updateFamilyMember(index, 'age', value)}
                              keyboardType="numeric"
                            />
                          </View>
                          <View style={styles.halfWidth}>
                            <ModernInput
                              label="Relationship"
                              icon="people"
                              placeholder="e.g., Spouse, Child"
                              value={member.relationship}
                              onChangeText={(value) => updateFamilyMember(index, 'relationship', value)}
                            />
                          </View>
                        </View>

                        <ModernInput
                          label="Email (Optional)"
                          icon="mail"
                          placeholder="Email address"
                          value={member.email || ''}
                          onChangeText={(value) => updateFamilyMember(index, 'email', value)}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          required={false}
                        />

                        <ModernInput
                          label="Contact Number (Optional)"
                          icon="call"
                          placeholder="Contact number"
                          value={member.contactNumber || ''}
                          onChangeText={(value) => updateFamilyMember(index, 'contactNumber', value)}
                          keyboardType="phone-pad"
                          required={false}
                        />
                      </View>
                    ))}
                  </>
                )}

                {/* Information Notice */}
                <View style={styles.infoNotice}>
                  <Ionicons name="information-circle" size={20} color="#6366f1" />
                  <Text style={styles.infoText}>
                    Your account will be reviewed by an administrator. You'll receive login credentials via email once approved.
                  </Text>
                </View>

                {/* Registration Button */}
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6']}
                    style={styles.registerButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="person-add" size={20} color="white" />
                        <Text style={styles.registerButtonText}>Create Account</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Terms */}
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.registerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight! + 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  formGradient: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  validIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  membershipContainer: {
    marginBottom: 16,
  },
  membershipTypes: {
    flexDirection: 'row',
    gap: 12,
  },
  membershipTypeCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  membershipTypeCardSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#6366f1',
  },
  membershipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  membershipIconContainerSelected: {
    backgroundColor: '#ddd6fe',
  },
  membershipTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  membershipTypeLabelSelected: {
    color: '#6366f1',
  },
  membershipTypeDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
    marginTop: -8,
  },
  paymentMethodContainer: {
    marginBottom: 16,
  },
  paymentMethodsScroll: {
    marginTop: 8,
  },
  paymentMethodCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    minWidth: 80,
  },
  paymentMethodCardSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#6366f1',
  },
  paymentMethodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  paymentMethodLabelSelected: {
    color: '#6366f1',
  },
  familyMembersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  addFamilyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addFamilyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  familyMemberCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  familyMemberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  familyMemberTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoNotice: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#6366f1',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
})
