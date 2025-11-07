import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiConfig, getHeaders, handleApiResponse } from '../../api/config';

type Props = {
  navigation: any;
};

type MembershipType = 'INDIVIDUAL' | 'FAMILY' | 'CUSTOM';
type PaymentMethod = 'Zelle' | 'Venmo' | 'Cash' | 'Check';

interface FamilyMember {
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
}

const RenewalRequestScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentMembershipType, setCurrentMembershipType] = useState<MembershipType>('INDIVIDUAL');
  
  const [formData, setFormData] = useState({
    newMembershipType: 'INDIVIDUAL' as MembershipType,
    paymentMethod: 'Zelle' as PaymentMethod,
    paymentConfirmation: '',
    familyMembers: [] as FamilyMember[],
  });

  const [newFamilyMember, setNewFamilyMember] = useState({
    firstName: '',
    lastName: '',
    relationship: '',
    dateOfBirth: '',
  });

  const membershipFees = {
    INDIVIDUAL: 100,
    FAMILY: 200,
    CUSTOM: 150,
  };

  useEffect(() => {
    fetchCurrentMembership();
  }, []);

  const fetchCurrentMembership = async () => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      const response = await fetch(`${apiConfig.baseUrl}/api/users/me`, {
        method: 'GET',
        headers,
      });

      const data = await handleApiResponse(response);
      
      if (data.membershipType) {
        setCurrentMembershipType(data.membershipType);
        setFormData(prev => ({
          ...prev,
          newMembershipType: data.membershipType,
        }));

        if (data.membershipType === 'FAMILY' && data.familyMembers) {
          setFormData(prev => ({
            ...prev,
            familyMembers: data.familyMembers,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching current membership:', error);
      Alert.alert('Error', 'Failed to load current membership information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMember = () => {
    if (!newFamilyMember.firstName.trim() || !newFamilyMember.lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter family member\'s first and last name');
      return;
    }

    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { ...newFamilyMember }],
    }));

    setNewFamilyMember({
      firstName: '',
      lastName: '',
      relationship: '',
      dateOfBirth: '',
    });
  };

  const handleRemoveFamilyMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.paymentConfirmation.trim()) {
      Alert.alert('Validation Error', 'Please enter payment confirmation number');
      return;
    }

    if (formData.newMembershipType === 'FAMILY' && formData.familyMembers.length === 0) {
      Alert.alert('Validation Error', 'Family membership requires at least one family member');
      return;
    }

    setSubmitting(true);
    try {
      const headers = await getHeaders();
      const requestBody = {
        newMembershipType: formData.newMembershipType,
        paymentReference: formData.paymentConfirmation,
        ...(formData.newMembershipType === 'FAMILY' && {
          familyMembers: formData.familyMembers,
        }),
      };

      const response = await fetch(`${apiConfig.baseUrl}/api/users/renewals`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const data = await handleApiResponse(response);

      Alert.alert(
        'Success',
        'Your renewal request has been submitted successfully. You will receive an email once it is reviewed by the admin.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting renewal request:', error);
      
      if (error.message?.includes('pending renewal')) {
        Alert.alert('Notice', 'You already have a pending renewal request. Please wait for admin approval.');
      } else {
        Alert.alert('Error', error.message || 'Failed to submit renewal request');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading membership information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Membership Renewal</Text>
        <Text style={styles.subtitle}>Annual Membership Renewal Request</Text>
      </View>

      {/* Current Membership Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Current Membership Type</Text>
        <Text style={styles.infoValue}>{currentMembershipType}</Text>
      </View>

      {/* Membership Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Membership Type</Text>
        <View style={styles.membershipTypes}>
          {(['INDIVIDUAL', 'FAMILY', 'CUSTOM'] as MembershipType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.membershipButton,
                formData.newMembershipType === type && styles.membershipButtonSelected,
              ]}
              onPress={() => setFormData({ ...formData, newMembershipType: type })}
            >
              <Text
                style={[
                  styles.membershipButtonText,
                  formData.newMembershipType === type && styles.membershipButtonTextSelected,
                ]}
              >
                {type}
              </Text>
              <Text
                style={[
                  styles.membershipFeeText,
                  formData.newMembershipType === type && styles.membershipFeeTextSelected,
                ]}
              >
                ${membershipFees[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.feeNote}>Annual membership fee • Renews every January 1st</Text>
      </View>

      {/* Family Members Section */}
      {formData.newMembershipType === 'FAMILY' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          
          {/* Existing Family Members */}
          {formData.familyMembers.map((member, index) => (
            <View key={index} style={styles.familyMemberCard}>
              <View style={styles.familyMemberInfo}>
                <Text style={styles.familyMemberName}>
                  {member.firstName} {member.lastName}
                </Text>
                {member.relationship && (
                  <Text style={styles.familyMemberDetail}>{member.relationship}</Text>
                )}
                {member.dateOfBirth && (
                  <Text style={styles.familyMemberDetail}>DOB: {member.dateOfBirth}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFamilyMember(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add New Family Member */}
          <View style={styles.addFamilyMemberSection}>
            <Text style={styles.addFamilyMemberTitle}>Add Family Member</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name *"
              value={newFamilyMember.firstName}
              onChangeText={(text) =>
                setNewFamilyMember({ ...newFamilyMember, firstName: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name *"
              value={newFamilyMember.lastName}
              onChangeText={(text) =>
                setNewFamilyMember({ ...newFamilyMember, lastName: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship (e.g., Spouse, Child)"
              value={newFamilyMember.relationship}
              onChangeText={(text) =>
                setNewFamilyMember({ ...newFamilyMember, relationship: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (MM/DD/YYYY)"
              value={newFamilyMember.dateOfBirth}
              onChangeText={(text) =>
                setNewFamilyMember({ ...newFamilyMember, dateOfBirth: text })
              }
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddFamilyMember}
            >
              <Text style={styles.addButtonText}>+ Add Family Member</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Payment Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentInfoTitle}>Renewal Fee</Text>
          <Text style={styles.paymentInfoText}>
            ${membershipFees[formData.newMembershipType]}
          </Text>
        </View>

        <Text style={styles.label}>Payment Method *</Text>
        <View style={styles.paymentMethodOptions}>
          {(['Zelle', 'Venmo', 'Cash', 'Check'] as PaymentMethod[]).map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentMethodButton,
                formData.paymentMethod === method && styles.paymentMethodSelected,
              ]}
              onPress={() => setFormData({ ...formData, paymentMethod: method })}
            >
              <Text
                style={[
                  styles.paymentMethodText,
                  formData.paymentMethod === method && styles.paymentMethodTextSelected,
                ]}
              >
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Payment Confirmation Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter transaction ID or confirmation number"
          value={formData.paymentConfirmation}
          onChangeText={(text) =>
            setFormData({ ...formData, paymentConfirmation: text })
          }
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Renewal Request</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  membershipTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  membershipButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  membershipButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  membershipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  membershipButtonTextSelected: {
    color: '#007AFF',
  },
  membershipFeeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  membershipFeeTextSelected: {
    color: '#007AFF',
  },
  feeNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  familyMemberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  familyMemberInfo: {
    flex: 1,
  },
  familyMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  familyMemberDetail: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addFamilyMemberSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  addFamilyMemberTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentInfo: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentInfoTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paymentInfoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentMethodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  paymentMethodButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  paymentMethodSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#666',
  },
  paymentMethodTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default RenewalRequestScreen;
