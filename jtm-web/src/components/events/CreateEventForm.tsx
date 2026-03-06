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
  GripVertical,
  UtensilsCrossed,
  Upload,
  X,
  ImageIcon
} from 'lucide-react'
import Link from 'next/link'

interface RSVPField {
  id: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio'
  label: string
  required: boolean
  options?: string[]
}

interface FoodConfig {
  enabled: boolean
  vegFood: boolean
  nonVegFood: boolean
  kidsFood: boolean
  kidsEatFree: boolean
  allowNoFood: boolean
}

interface EventFormData {
  title: string
  description: string
  eventType: string
  flyer: string
  date: string
  location: string
  rsvpRequired: boolean
  rsvpDeadline: string
  maxParticipants: string
  rsvpForm: {
    fields: RSVPField[]
  }
  foodConfig: FoodConfig
  paymentRequired: boolean
  qrCheckinEnabled: boolean
}

export default function CreateEventForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const [flyerPreview, setFlyerPreview] = useState<string>('')
  const [flyerUploading, setFlyerUploading] = useState(false)
  const pendingStatusRef = React.useRef<'DRAFT' | 'PUBLISHED'>('PUBLISHED')
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventType: '',
    flyer: '',
    date: '',
    location: '',
    rsvpRequired: false,
    rsvpDeadline: '',
    maxParticipants: '',
    rsvpForm: {
      fields: []
    },
    foodConfig: {
      enabled: false,
      vegFood: false,
      nonVegFood: false,
      kidsFood: false,
      kidsEatFree: false,
      allowNoFood: false,
    },
    paymentRequired: false,
    qrCheckinEnabled: false,
  })

  const updateFormData = (field: keyof EventFormData, value: string | boolean | { fields: RSVPField[] } | FoodConfig) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateFoodConfig = (key: keyof FoodConfig, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      foodConfig: { ...prev.foodConfig, [key]: value }
    }))
  }

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFlyerFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFlyerPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removeFlyerFile = () => {
    setFlyerFile(null)
    setFlyerPreview('')
    updateFormData('flyer', '')
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
      // Upload flyer file first if one was selected
      let flyerUrl = formData.flyer
      if (flyerFile) {
        setFlyerUploading(true)
        const uploadData = new FormData()
        uploadData.append('file', flyerFile)
        const uploadRes = await fetch('/api/upload/flyer', { method: 'POST', body: uploadData })
        setFlyerUploading(false)
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          flyerUrl = url
        } else {
          const err = await uploadRes.json()
          alert(err.error || 'Failed to upload flyer')
          setLoading(false)
          return
        }
      }

      // Build event data object, omitting optional fields that are empty
      const eventData: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        rsvpRequired: formData.rsvpRequired,
      }

      // Only include optional fields if they have values
      if (formData.eventType) {
        eventData.eventType = formData.eventType
      }

      if (flyerUrl && flyerUrl.trim()) {
        eventData.flyer = flyerUrl
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

      // Always include foodConfig (API will store it; UI hides food section if enabled=false)
      eventData.foodConfig = formData.foodConfig

      // Always include paymentRequired and qrCheckinEnabled
      eventData.paymentRequired = formData.paymentRequired
      eventData.qrCheckinEnabled = formData.qrCheckinEnabled
      eventData.status = pendingStatusRef.current

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        router.push('/admin/events')
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
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={formData.eventType} onValueChange={(v) => updateFormData('eventType', v)}>
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {['Cultural', 'Sports', 'Yoga', 'Picnic', 'Movie', 'Literature', 'Celebrity', 'Online', 'Youth', 'General'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="Enter event location"
                required
              />
            </div>

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
          </div>

          <div className="space-y-2">
            <Label>Event Flyer</Label>
            {flyerPreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                <div className="h-40 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flyerPreview} alt="Flyer preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={removeFlyerFile}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="bg-gray-50 px-3 py-1.5 text-xs text-gray-500 flex items-center gap-1.5 border-t border-gray-200">
                  <ImageIcon className="h-3 w-3" />
                  {flyerFile?.name}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors group">
                <Upload className="h-8 w-8 text-gray-400 group-hover:text-cyan-500 mb-2 transition-colors" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-cyan-600">Click to upload flyer</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Max 5MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFlyerChange} />
              </label>
            )}
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

              <div className="pt-2 space-y-3 border-t border-muted">
                <p className="text-sm font-medium text-muted-foreground">RSVP Confirmation Settings</p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paymentRequired"
                    checked={formData.paymentRequired}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        // Auto-inject Zelle reference field and enable RSVP
                        const hasZelleField = formData.rsvpForm.fields.some(f => f.id === 'auto_zelle_ref')
                        setFormData(prev => ({
                          ...prev,
                          paymentRequired: true,
                          rsvpRequired: true,
                          rsvpForm: {
                            fields: hasZelleField ? prev.rsvpForm.fields : [
                              ...prev.rsvpForm.fields,
                              { id: 'auto_zelle_ref', type: 'text' as const, label: 'Zelle Confirmation Number', required: true, options: [] }
                            ]
                          }
                        }))
                      } else {
                        // Remove auto-injected Zelle field
                        setFormData(prev => ({
                          ...prev,
                          paymentRequired: false,
                          rsvpForm: { fields: prev.rsvpForm.fields.filter(f => f.id !== 'auto_zelle_ref') }
                        }))
                      }
                    }}
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
                    id="kidsEatFree"
                    checked={formData.foodConfig.kidsEatFree}
                    onCheckedChange={(checked: boolean) => updateFoodConfig('kidsEatFree', checked)}
                  />
                  <Label htmlFor="kidsEatFree">🆓 Kids Eat Free</Label>
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

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/events">Cancel</Link>
        </Button>
        <Button
          type="submit"
          variant="outline"
          disabled={loading || flyerUploading}
          onClick={() => { pendingStatusRef.current = 'DRAFT' }}
        >
          {(loading && pendingStatusRef.current === 'DRAFT') ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </>
          )}
        </Button>
        <Button
          type="submit"
          disabled={loading || flyerUploading}
          onClick={() => { pendingStatusRef.current = 'PUBLISHED' }}
        >
          {(loading && pendingStatusRef.current === 'PUBLISHED') ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {flyerUploading ? 'Uploading flyer...' : 'Publishing...'}
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Publish Event
            </>
          )}
        </Button>
      </div>
    </form>
  )
}