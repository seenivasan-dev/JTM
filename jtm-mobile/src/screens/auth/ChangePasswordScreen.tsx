import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { apiConfig, getHeaders, handleApiResponse } from '../../api/config';

type Props = {
  navigation: any;
  route?: any;
};

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const ChangePasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Check password strength whenever new password changes
  useEffect(() => {
    const password = formData.newPassword;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    });
  }, [formData.newPassword]);

  const validateForm = (): boolean => {
    if (!formData.currentPassword) {
      Alert.alert('Validation Error', 'Please enter your current password');
      return false;
    }

    if (!formData.newPassword) {
      Alert.alert('Validation Error', 'Please enter a new password');
      return false;
    }

    if (!Object.values(passwordStrength).every(Boolean)) {
      Alert.alert(
        'Validation Error',
        'New password does not meet all security requirements'
      );
      return false;
    }

    if (!formData.confirmPassword) {
      Alert.alert('Validation Error', 'Please confirm your new password');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const headers = await getHeaders();
      const response = await fetch(`${apiConfig.baseUrl}/api/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await handleApiResponse(response);

      Alert.alert(
        'Success',
        'Password changed successfully! Please login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to login or home screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Password change error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <View style={styles.requirementRow}>
      <View style={[styles.requirementIcon, met ? styles.requirementMet : styles.requirementUnmet]}>
        <Text style={[styles.requirementIconText, met ? styles.requirementMetText : styles.requirementUnmetText]}>
          {met ? '✓' : '✕'}
        </Text>
      </View>
      <Text style={[styles.requirementText, met ? styles.requirementMetText : styles.requirementUnmetText]}>
        {text}
      </Text>
    </View>
  );

  const allRequirementsMet = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = formData.newPassword && formData.confirmPassword && 
                        formData.newPassword === formData.confirmPassword;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🔒</Text>
        </View>
        <Text style={styles.title}>Change Your Password</Text>
        <Text style={styles.subtitle}>
          For security purposes, please set a new permanent password
        </Text>
      </View>

      <View style={styles.form}>
        {/* Current Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your current password"
              value={formData.currentPassword}
              onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
              secureTextEntry={!showPasswords.current}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
            >
              <Text style={styles.eyeIcon}>{showPasswords.current ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your new password"
              value={formData.newPassword}
              onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
              secureTextEntry={!showPasswords.new}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
            >
              <Text style={styles.eyeIcon}>{showPasswords.new ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          {formData.newPassword && (
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <PasswordRequirement met={passwordStrength.hasMinLength} text="At least 8 characters" />
              <PasswordRequirement met={passwordStrength.hasUppercase} text="One uppercase letter" />
              <PasswordRequirement met={passwordStrength.hasLowercase} text="One lowercase letter" />
              <PasswordRequirement met={passwordStrength.hasNumber} text="One number" />
              <PasswordRequirement met={passwordStrength.hasSpecialChar} text="One special character" />
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry={!showPasswords.confirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
            >
              <Text style={styles.eyeIcon}>{showPasswords.confirm ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          {passwordsMatch && (
            <View style={styles.matchIndicator}>
              <Text style={styles.matchText}>✓ Passwords match</Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!allRequirementsMet || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!allRequirementsMet || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            <Text style={styles.securityTextBold}>Security Notice:</Text> Your password will be 
            encrypted and stored securely. You cannot access any features until you complete 
            this password change.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    paddingRight: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  requirementsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  requirementMet: {
    backgroundColor: '#10b981',
  },
  requirementUnmet: {
    backgroundColor: '#e0e0e0',
  },
  requirementIconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  requirementMetText: {
    color: '#10b981',
  },
  requirementUnmetText: {
    color: '#999',
  },
  requirementText: {
    fontSize: 13,
  },
  matchIndicator: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 6,
  },
  matchText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
  },
  securityTextBold: {
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;
