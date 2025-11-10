'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Trash2, 
  Calendar,
  MapPin,
  Users,
  Save,
  ArrowLeft,
  GripVertical
} from 'lucide-react'
import Link from 'next/link'

interface RSVPField {
  id: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio'
  label: string
  required: boolean
  options?: string[]
}

interface EventFormData {
  title: string
  description: string
  flyer: string
  date: string
  location: string
  rsvpRequired: boolean
  rsvpDeadline: string
  maxParticipants: string
  rsvpForm: {
    fields: RSVPField[]
  }
}

export default function CreateEventForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    flyer: '',
    date: '',
    location: '',
    rsvpRequired: false,
    rsvpDeadline: '',
    maxParticipants: '',
    rsvpForm: {
      fields: []
    }
  })

  const updateFormData = (field: keyof EventFormData, value: string | boolean | { fields: RSVPField[] }) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addRSVPField = () => {
    const newField: RSVPField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: '',
      required: false,
      options: []
    }

    setFormData(prev => ({
      ...prev,
      rsvpForm: {
        fields: [...prev.rsvpForm.fields, newField]
      }
    }))
  }

  const removeRSVPField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      rsvpForm: {
        fields: prev.rsvpForm.fields.filter(field => field.id !== fieldId)
      }
    }))
  }

  const updateRSVPField = (fieldId: string, updates: Partial<RSVPField>) => {
    setFormData(prev => ({
      ...prev,
      rsvpForm: {
        fields: prev.rsvpForm.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      }
    }))
  }

  const addOption = (fieldId: string) => {
    const field = formData.rsvpForm.fields.find(f => f.id === fieldId)
    if (field) {
      updateRSVPField(fieldId, {
        options: [...(field.options || []), '']
      })
    }
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = formData.rsvpForm.fields.find(f => f.id === fieldId)
    if (field && field.options) {
      const newOptions = [...field.options]
      newOptions[optionIndex] = value
      updateRSVPField(fieldId, { options: newOptions })
    }
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = formData.rsvpForm.fields.find(f => f.id === fieldId)
    if (field && field.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex)
      updateRSVPField(fieldId, { options: newOptions })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Build event data object, omitting optional fields that are empty
      const eventData: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        rsvpRequired: formData.rsvpRequired,
      }

      // Only include optional fields if they have values
      if (formData.flyer && formData.flyer.trim()) {
        eventData.flyer = formData.flyer
      }

      if (formData.rsvpDeadline) {
        eventData.rsvpDeadline = new Date(formData.rsvpDeadline).toISOString()
      }

      if (formData.maxParticipants) {
        eventData.maxParticipants = parseInt(formData.maxParticipants)
      }

      if (formData.rsvpRequired && formData.rsvpForm.fields.length > 0) {
        eventData.rsvpForm = formData.rsvpForm
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        router.push('/events')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
      </div>

      {/* Basic Event Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Details
          </CardTitle>
          <CardDescription>
            Basic information about your event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="Enter event location"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe your event"
              className="min-h-24"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date & Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => updateFormData('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flyer">Event Flyer URL</Label>
              <Input
                id="flyer"
                type="url"
                value={formData.flyer}
                onChange={(e) => updateFormData('flyer', e.target.value)}
                placeholder="https://example.com/flyer.jpg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RSVP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            RSVP Settings
          </CardTitle>
          <CardDescription>
            Configure RSVP requirements and capacity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rsvpRequired"
              checked={formData.rsvpRequired}
              onCheckedChange={(checked: boolean) => updateFormData('rsvpRequired', checked)}
            />
            <Label htmlFor="rsvpRequired">Require RSVP for this event</Label>
          </div>

          {formData.rsvpRequired && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rsvpDeadline">RSVP Deadline</Label>
                <Input
                  id="rsvpDeadline"
                  type="datetime-local"
                  value={formData.rsvpDeadline}
                  onChange={(e) => updateFormData('rsvpDeadline', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => updateFormData('maxParticipants', e.target.value)}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RSVP Form Builder */}
      {formData.rsvpRequired && (
        <Card>
          <CardHeader>
            <CardTitle>RSVP Form Fields</CardTitle>
            <CardDescription>
              Add custom fields to collect additional information from attendees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.rsvpForm.fields.map((field, index) => (
              <Card key={field.id} className="border-dashed">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Field {index + 1}</span>
                      {field.required && <Badge variant="secondary">Required</Badge>}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRSVPField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Field Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateRSVPField(field.id, { label: e.target.value })}
                        placeholder="Enter field label"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: string) => updateRSVPField(field.id, { type: value as 'text' | 'number' | 'select' | 'checkbox' | 'radio' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                          <SelectItem value="radio">Radio Buttons</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.required}
                      onCheckedChange={(checked: boolean) => updateRSVPField(field.id, { required: !!checked })}
                    />
                    <Label>Required field</Label>
                  </div>

                  {(field.type === 'select' || field.type === 'radio') && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {field.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(field.id, optionIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(field.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addRSVPField}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add RSVP Field
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/events">Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Event
            </>
          )}
        </Button>
      </div>
    </form>
  )
}