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
import { apiConfig, getHeaders, handleApiResponse } from '../../api/config';

type Props = {
  navigation: any;
};

type MembershipType = 'INDIVIDUAL' | 'FAMILY' | 'CUSTOM';

interface FamilyMember {
  id?: number;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
}

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: MembershipType;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  familyMembers: FamilyMember[];
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [originalMembershipType, setOriginalMembershipType] = useState<MembershipType>('INDIVIDUAL');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    membershipType: 'INDIVIDUAL' as MembershipType,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    familyMembers: [] as FamilyMember[],
  });

  const [newFamilyMember, setNewFamilyMember] = useState({
    firstName: '',
    lastName: '',
    relationship: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      const response = await fetch(`${apiConfig.baseUrl}/api/users/me`, {
        method: 'GET',
        headers,
      });

      const data = await handleApiResponse(response);
      
      setUserData(data);
      setOriginalMembershipType(data.membershipType);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        membershipType: data.membershipType || 'INDIVIDUAL',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          zipCode: data.address?.zipCode || '',
        },
        familyMembers: data.familyMembers || [],
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile information');
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

  const handleSave = async () => {
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first and last name');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return;
    }

    if (formData.membershipType === 'FAMILY' && formData.familyMembers.length === 0) {
      Alert.alert('Validation Error', 'Family membership requires at least one family member');
      return;
    }

    const membershipTypeChanged = formData.membershipType !== originalMembershipType;

    if (membershipTypeChanged) {
      Alert.alert(
        'Membership Type Change',
        'Changing your membership type requires admin approval. Your changes will be submitted for review.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Submit for Approval',
            onPress: () => submitForApproval(),
          },
        ]
      );
    } else {
      await saveProfile();
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const headers = await getHeaders();
      const response = await fetch(`${apiConfig.baseUrl}/api/users/${userData?.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          ...(formData.membershipType === 'FAMILY' && {
            familyMembers: formData.familyMembers,
          }),
        }),
      });

      await handleApiResponse(response);

      Alert.alert('Success', 'Your profile has been updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    setSaving(true);
    try {
      const headers = await getHeaders();
      
      // First, update the basic profile information
      await fetch(`${apiConfig.baseUrl}/api/users/${userData?.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      // Then submit a renewal request for membership type change
      const response = await fetch(`${apiConfig.baseUrl}/api/users/renewals`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          newMembershipType: formData.membershipType,
          paymentReference: 'MEMBERSHIP_TYPE_CHANGE',
          ...(formData.membershipType === 'FAMILY' && {
            familyMembers: formData.familyMembers,
          }),
        }),
      });

      await handleApiResponse(response);

      Alert.alert(
        'Success',
        'Your profile changes and membership type change request have been submitted for admin approval. You will receive an email once reviewed.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting for approval:', error);
      
      if (error.message?.includes('pending renewal')) {
        Alert.alert(
          'Notice',
          'You already have a pending membership change request. Please wait for admin approval before making additional changes.'
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to submit request');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your personal information</Text>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        />

        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          placeholder="Email"
          value={formData.email}
          editable={false}
        />
        <Text style={styles.helpText}>Email cannot be changed</Text>

        <Text style={styles.label}>Phone *</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />
      </View>

      {/* Address Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        
        <Text style={styles.label}>Street Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Street Address"
          value={formData.address.street}
          onChangeText={(text) => 
            setFormData({ 
              ...formData, 
              address: { ...formData.address, street: text } 
            })
          }
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="City"
          value={formData.address.city}
          onChangeText={(text) => 
            setFormData({ 
              ...formData, 
              address: { ...formData.address, city: text } 
            })
          }
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="State"
              value={formData.address.state}
              onChangeText={(text) => 
                setFormData({ 
                  ...formData, 
                  address: { ...formData.address, state: text } 
                })
              }
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Zip Code"
              value={formData.address.zipCode}
              onChangeText={(text) => 
                setFormData({ 
                  ...formData, 
                  address: { ...formData.address, zipCode: text } 
                })
              }
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Membership Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membership Type</Text>
        {originalMembershipType !== formData.membershipType && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Changing membership type requires admin approval
            </Text>
          </View>
        )}
        
        <View style={styles.membershipTypes}>
          {(['INDIVIDUAL', 'FAMILY', 'CUSTOM'] as MembershipType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.membershipButton,
                formData.membershipType === type && styles.membershipButtonSelected,
              ]}
              onPress={() => setFormData({ ...formData, membershipType: type })}
            >
              <Text
                style={[
                  styles.membershipButtonText,
                  formData.membershipType === type && styles.membershipButtonTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Family Members */}
      {formData.membershipType === 'FAMILY' && (
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

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    marginRight: 8,
  },
  warningBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
  membershipTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  membershipButtonTextSelected: {
    color: '#007AFF',
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
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default EditProfileScreen;
