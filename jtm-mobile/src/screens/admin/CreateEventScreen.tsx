// JTM Mobile - Admin Event Creation Screen
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { apiConfig, getHeaders } from '../../api/config'

interface CreateEventScreenProps {
  navigation: any
}

interface RSVPField {
  id: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio'
  label: string
  required: boolean
  options?: string[]
}

export default function CreateEventScreen({ navigation }: CreateEventScreenProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    rsvpRequired: false,
    rsvpDeadline: '',
    maxParticipants: '',
  })
  
  const [rsvpFields, setRsvpFields] = useState<RSVPField[]>([])
  const [newField, setNewField] = useState({
    type: 'text' as const,
    label: '',
    required: false,
    options: [''],
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addRSVPField = () => {
    if (!newField.label.trim()) {
      Alert.alert('Error', 'Field label is required')
      return
    }

    const field: RSVPField = {
      id: Date.now().toString(),
      type: newField.type,
      label: newField.label.trim(),
      required: newField.required,
      options: ['select', 'radio'].includes(newField.type) 
        ? newField.options.filter(opt => opt.trim()) 
        : undefined,
    }

    setRsvpFields([...rsvpFields, field])
    setNewField({
      type: 'text',
      label: '',
      required: false,
      options: [''],
    })
  }

  const removeRSVPField = (id: string) => {
    setRsvpFields(rsvpFields.filter(field => field.id !== id))
  }

  const addOption = () => {
    setNewField(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const updateOption = (index: number, value: string) => {
    setNewField(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const removeOption = (index: number) => {
    setNewField(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Event title is required')
      return false
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Event description is required')
      return false
    }
    if (!formData.date.trim()) {
      Alert.alert('Error', 'Event date is required')
      return false
    }
    if (!formData.time.trim()) {
      Alert.alert('Error', 'Event time is required')
      return false
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Event location is required')
      return false
    }
    return true
  }

  const handleCreateEvent = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}:00`)
      const rsvpDeadlineDateTime = formData.rsvpDeadline 
        ? new Date(`${formData.rsvpDeadline}T23:59:59`)
        : null

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: eventDateTime.toISOString(),
        location: formData.location.trim(),
        rsvpRequired: formData.rsvpRequired,
        rsvpDeadline: rsvpDeadlineDateTime?.toISOString(),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        rsvpForm: formData.rsvpRequired && rsvpFields.length > 0 ? {
          fields: rsvpFields
        } : null,
      }

      const response = await fetch(`${apiConfig.baseUrl}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        Alert.alert(
          'Success',
          'Event created successfully!',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        )
      } else {
        const error = await response.json()
        Alert.alert('Error', error.error || 'Failed to create event')
      }
    } catch (error) {
      console.error('Event creation error:', error)
      Alert.alert('Error', 'Failed to create event. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        {/* Basic Event Information */}
        <Text style={styles.sectionTitle}>Event Details</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Event Title"
          value={formData.title}
          onChangeText={(text) => handleInputChange('title', text)}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Event Description"
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          multiline
          numberOfLines={4}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Date (YYYY-MM-DD)"
            value={formData.date}
            onChangeText={(text) => handleInputChange('date', text)}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Time (HH:MM)"
            value={formData.time}
            onChangeText={(text) => handleInputChange('time', text)}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Event Location"
          value={formData.location}
          onChangeText={(text) => handleInputChange('location', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Max Participants (optional)"
          value={formData.maxParticipants}
          onChangeText={(text) => handleInputChange('maxParticipants', text)}
          keyboardType="numeric"
        />

        {/* RSVP Configuration */}
        <View style={styles.rsvpSection}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Require RSVP</Text>
            <Switch
              value={formData.rsvpRequired}
              onValueChange={(value) => handleInputChange('rsvpRequired', value)}
            />
          </View>

          {formData.rsvpRequired && (
            <>
              <TextInput
                style={styles.input}
                placeholder="RSVP Deadline (YYYY-MM-DD) - optional"
                value={formData.rsvpDeadline}
                onChangeText={(text) => handleInputChange('rsvpDeadline', text)}
              />

              {/* RSVP Form Builder */}
              <Text style={styles.sectionTitle}>RSVP Form Fields</Text>
              
              {/* Existing Fields */}
              {rsvpFields.map((field) => (
                <View key={field.id} style={styles.fieldCard}>
                  <View style={styles.fieldInfo}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <Text style={styles.fieldType}>
                      {field.type} {field.required && '(required)'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeRSVPField(field.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add New Field */}
              <View style={styles.addFieldSection}>
                <Text style={styles.addFieldTitle}>Add RSVP Field</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Field Label"
                  value={newField.label}
                  onChangeText={(text) => setNewField(prev => ({ ...prev, label: text }))}
                />

                <View style={styles.fieldTypeRow}>
                  {['text', 'number', 'select', 'checkbox', 'radio'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newField.type === type && styles.typeButtonSelected
                      ]}
                      onPress={() => setNewField(prev => ({ ...prev, type: type as any }))}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        newField.type === type && styles.typeButtonTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Required Field</Text>
                  <Switch
                    value={newField.required}
                    onValueChange={(value) => setNewField(prev => ({ ...prev, required: value }))}
                  />
                </View>

                {/* Options for select/radio fields */}
                {['select', 'radio'].includes(newField.type) && (
                  <View style={styles.optionsSection}>
                    <Text style={styles.optionsTitle}>Options</Text>
                    {newField.options.map((option, index) => (
                      <View key={index} style={styles.optionRow}>
                        <TextInput
                          style={[styles.input, styles.optionInput]}
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChangeText={(text) => updateOption(index, text)}
                        />
                        {newField.options.length > 1 && (
                          <TouchableOpacity
                            style={styles.removeOptionButton}
                            onPress={() => removeOption(index)}
                          >
                            <Ionicons name="close" size={20} color="#dc2626" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                      <Ionicons name="add" size={16} color="#059669" />
                      <Text style={styles.addOptionText}>Add Option</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity style={styles.addFieldButton} onPress={addRSVPField}>
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.addFieldButtonText}>Add Field</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.buttonDisabled]}
          onPress={handleCreateEvent}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.createButtonText}>Create Event</Text>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  rsvpSection: {
    marginTop: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  fieldCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  fieldType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  addFieldSection: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  addFieldTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  fieldTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#dc2626',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  optionsSection: {
    marginTop: 10,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  removeOptionButton: {
    padding: 8,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addOptionText: {
    color: '#059669',
    marginLeft: 4,
    fontSize: 14,
  },
  addFieldButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  addFieldButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})