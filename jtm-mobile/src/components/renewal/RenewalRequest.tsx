import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';

interface FamilyMember {
  id?: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
}

interface RenewalRequestProps {
  userId: string;
  currentMembershipType: string;
  familyMembers: FamilyMember[];
  onSubmit: (renewalData: any) => Promise<void>;
}

const MEMBERSHIP_TYPES = [
  { value: 'INDIVIDUAL', label: 'Individual Membership - ₹500/year' },
  { value: 'FAMILY', label: 'Family Membership - ₹800/year' },
  { value: 'STUDENT', label: 'Student Membership - ₹300/year' },
  { value: 'SENIOR', label: 'Senior Citizen - ₹400/year' },
];

const RELATIONSHIPS = [
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Other',
];

export default function RenewalRequest({
  userId,
  currentMembershipType,
  familyMembers: initialFamilyMembers,
  onSubmit,
}: RenewalRequestProps) {
  const [membershipType, setMembershipType] = useState(currentMembershipType);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
    initialFamilyMembers || []
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(-1);

  const addFamilyMember = () => {
    setFamilyMembers([
      ...familyMembers,
      {
        name: '',
        relationship: 'Spouse',
        dateOfBirth: '',
      },
    ]);
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!paymentReference.trim()) {
      Alert.alert('Error', 'Payment reference is required');
      return false;
    }

    if (!paymentMethod.trim()) {
      Alert.alert('Error', 'Payment method is required');
      return false;
    }

    // Validate family members if family membership
    if (membershipType === 'FAMILY') {
      for (let i = 0; i < familyMembers.length; i++) {
        const member = familyMembers[i];
        if (!member.name.trim() || !member.dateOfBirth.trim()) {
          Alert.alert('Error', `Please complete family member ${i + 1} details`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const renewalData = {
        membershipType,
        paymentReference,
        paymentMethod,
        familyMembers: membershipType === 'FAMILY' ? familyMembers : [],
        notes: notes.trim() || undefined,
      };

      await onSubmit(renewalData);
      
      Alert.alert('Success', 'Renewal request submitted successfully!');
      
      // Reset form
      setPaymentReference('');
      setPaymentMethod('');
      setNotes('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit renewal request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Membership Renewal</Text>
        <Text style={styles.subtitle}>
          Renew your membership to continue enjoying benefits
        </Text>
      </View>

      {/* Membership Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membership Type</Text>
        <TouchableOpacity 
          style={styles.selector}
          onPress={() => setShowMembershipModal(true)}
        >
          <Text style={styles.selectorText}>
            {MEMBERSHIP_TYPES.find(t => t.value === membershipType)?.label || 'Select type'}
          </Text>
          <Text style={styles.selectorArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Payment Method *</Text>
          <TextInput
            style={styles.input}
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            placeholder="e.g., UPI, Bank Transfer, Cash"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Payment Reference *</Text>
          <TextInput
            style={styles.input}
            value={paymentReference}
            onChangeText={setPaymentReference}
            placeholder="Transaction ID or reference number"
          />
        </View>
      </View>

      {/* Family Members (if family membership) */}
      {membershipType === 'FAMILY' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            <TouchableOpacity onPress={addFamilyMember} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Member</Text>
            </TouchableOpacity>
          </View>

          {familyMembers.map((member, index) => (
            <View key={index} style={styles.familyMemberCard}>
              <View style={styles.familyMemberHeader}>
                <Text style={styles.familyMemberTitle}>Member {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => removeFamilyMember(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={member.name}
                  onChangeText={(value) => updateFamilyMember(index, 'name', value)}
                  placeholder="Full name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship *</Text>
                <TouchableOpacity 
                  style={styles.selector}
                  onPress={() => {
                    setSelectedMemberIndex(index);
                    setShowRelationshipModal(true);
                  }}
                >
                  <Text style={styles.selectorText}>{member.relationship}</Text>
                  <Text style={styles.selectorArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth *</Text>
                <TextInput
                  style={styles.input}
                  value={member.dateOfBirth}
                  onChangeText={(value) => updateFamilyMember(index, 'dateOfBirth', value)}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Additional Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional information..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Renewal Request</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          * Required fields. Your renewal request will be reviewed within 2-3 business days.
        </Text>
      </View>

      {/* Membership Type Modal */}
      <Modal
        visible={showMembershipModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMembershipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Membership Type</Text>
            {MEMBERSHIP_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.modalOption}
                onPress={() => {
                  setMembershipType(type.value);
                  setShowMembershipModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowMembershipModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Relationship Modal */}
      <Modal
        visible={showRelationshipModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRelationshipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Relationship</Text>
            {RELATIONSHIPS.map((rel) => (
              <TouchableOpacity
                key={rel}
                style={styles.modalOption}
                onPress={() => {
                  if (selectedMemberIndex >= 0) {
                    updateFamilyMember(selectedMemberIndex, 'relationship', rel);
                  }
                  setShowRelationshipModal(false);
                  setSelectedMemberIndex(-1);
                }}
              >
                <Text style={styles.modalOptionText}>{rel}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowRelationshipModal(false);
                setSelectedMemberIndex(-1);
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  textArea: {
    height: 100,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  familyMemberCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  familyMemberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  familyMemberTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectorArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalCancelButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});