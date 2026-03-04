/* eslint-disable @typescript-eslint/no-explicit-any */
// JTM Web - Edit Event Client Component
'use client'

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
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Users,
  Plus,
  Trash2,
  GripVertical,
  UtensilsCrossed
} from 'lucide-react'
import Link from 'next/link'

interface RSVPField {
  id: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio'
  label: string
  required: boolean
  options?: string[]
}

interface Event {
  id: string
  title: string
  description: string
  flyer?: string | null
  date: string
  location: string
  rsvpRequired: boolean
  rsvpDeadline?: string | null
  maxParticipants?: number | null
  rsvpForm?: {
    fields: RSVPField[]
  } | null
  foodConfig?: {
    enabled: boolean
    vegFood: boolean
    nonVegFood: boolean
    kidsFood: boolean
    allowNoFood: boolean
  } | null
  paymentRequired: boolean
  qrCheckinEnabled: boolean
  currentAttendees: number
  createdAt: string
  updatedAt: string
}

interface EditEventClientProps {
  event: Event
}

export default function EditEventClient({ event }: EditEventClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    flyer: event.flyer || '',
    date: event.date.substring(0, 16), // Format for datetime-local input
    location: event.location,
    rsvpRequired: event.rsvpRequired,
    rsvpDeadline: event.rsvpDeadline ? event.rsvpDeadline.substring(0, 16) : '',
    maxParticipants: event.maxParticipants?.toString() || '',
    rsvpForm: {
      fields: event.rsvpForm?.fields || []
    },
    foodConfig: {
      enabled: event.foodConfig?.enabled ?? false,
      vegFood: event.foodConfig?.vegFood ?? false,
      nonVegFood: event.foodConfig?.nonVegFood ?? false,
      kidsFood: event.foodConfig?.kidsFood ?? false,
      allowNoFood: event.foodConfig?.allowNoFood ?? false,
    },
    paymentRequired: event.paymentRequired ?? false,
    qrCheckinEnabled: event.qrCheckinEnabled ?? false,
  })

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateFoodConfig = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      foodConfig: {
        ...prev.foodConfig,
        [field]: value
      }
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

    updateFormData('rsvpForm', {
      fields: [...formData.rsvpForm.fields, newField]
    })
  }

  const removeRSVPField = (fieldId: string) => {
    updateFormData('rsvpForm', {
      fields: formData.rsvpForm.fields.filter(field => field.id !== fieldId)
    })
  }

  const updateRSVPField = (fieldId: string, updates: Partial<RSVPField>) => {
    updateFormData('rsvpForm', {
      fields: formData.rsvpForm.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    })
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

      // Always include foodConfig, paymentRequired, and qrCheckinEnabled
      eventData.foodConfig = formData.foodConfig
      eventData.paymentRequired = formData.paymentRequired
      eventData.qrCheckinEnabled = formData.qrCheckinEnabled

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        router.push(`/events/${event.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/events/${event.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Event</h1>
            <p className="text-gray-600">Update event details and RSVP form</p>
          </div>
        </div>
        <Badge variant="outline">
          {event.currentAttendees} attendees
        </Badge>
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
                placeholder="Event location"
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
              rows={4}
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

      {/* RSVP Settings */}
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
            <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
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
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => updateFormData('maxParticipants', e.target.value)}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3 border-t border-muted">
                <p className="text-sm font-medium text-muted-foreground">RSVP Confirmation Settings</p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paymentRequired"
                    checked={formData.paymentRequired}
                    onCheckedChange={(checked: boolean) => updateFormData('paymentRequired', checked)}
                  />
                  <Label htmlFor="paymentRequired">Payment required — members must pay before spot is confirmed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="qrCheckinEnabled"
                    checked={formData.qrCheckinEnabled}
                    onCheckedChange={(checked: boolean) => updateFormData('qrCheckinEnabled', checked)}
                  />
                  <Label htmlFor="qrCheckinEnabled">QR code check-in — generate QR codes for confirmed attendees</Label>
                </div>
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
              Create custom fields to collect information from attendees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.rsvpForm.fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Field {index + 1}</span>
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

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Label>Field Type</Label>
                    <Select 
                      value={field.type} 
                      onValueChange={(value: RSVPField['type']) => 
                        updateRSVPField(field.id, { type: value })
                      }
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

                  <div>
                    <Label>Field Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateRSVPField(field.id, { label: e.target.value })}
                      placeholder="Enter field label"
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.required}
                        onCheckedChange={(checked: boolean) => 
                          updateRSVPField(field.id, { required: checked })
                        }
                      />
                      <Label>Required</Label>
                    </div>
                  </div>
                </div>

                {(field.type === 'select' || field.type === 'radio') && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Options</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(field.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {field.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(field.id, optionIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addRSVPField}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Form Field
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Food Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Food at this Event?
          </CardTitle>
          <CardDescription>
            Enable food so members can specify their meal preferences when they RSVP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="foodEnabled"
              checked={formData.foodConfig.enabled}
              onCheckedChange={(checked: boolean) => updateFoodConfig('enabled', checked)}
            />
            <Label htmlFor="foodEnabled">This event has food</Label>
          </div>

          {formData.foodConfig.enabled && (
            <div className="pl-6 space-y-3 border-l-2 border-muted">
              <p className="text-sm text-muted-foreground">Select which food categories to offer:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vegFood"
                    checked={formData.foodConfig.vegFood}
                    onCheckedChange={(checked: boolean) => updateFoodConfig('vegFood', checked)}
                  />
                  <Label htmlFor="vegFood">🥦 Veg (Adults)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nonVegFood"
                    checked={formData.foodConfig.nonVegFood}
                    onCheckedChange={(checked: boolean) => updateFoodConfig('nonVegFood', checked)}
                  />
                  <Label htmlFor="nonVegFood">🍗 Non-Veg (Adults)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kidsFood"
                    checked={formData.foodConfig.kidsFood}
                    onCheckedChange={(checked: boolean) => updateFoodConfig('kidsFood', checked)}
                  />
                  <Label htmlFor="kidsFood">🧒 Kids Meals</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowNoFood"
                    checked={formData.foodConfig.allowNoFood}
                    onCheckedChange={(checked: boolean) => updateFoodConfig('allowNoFood', checked)}
                  />
                  <Label htmlFor="allowNoFood">🚫 Allow &quot;No Food&quot; option</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href={`/events/${event.id}`}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Updating...' : 'Update Event'}
        </Button>
      </div>
    </form>
  )
}