'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  DollarSign,
  ChefHat,
  Save,
  Settings
} from 'lucide-react'

interface FoodOption {
  id: string
  name: string
  price: number
  description?: string
  category: 'veg' | 'nonveg' | 'both'
  available: boolean
}

interface FoodPricingManagerProps {
  eventId?: string
  initialOptions?: FoodOption[]
  onSave?: (options: FoodOption[]) => void
}

export default function FoodPricingManager({ 
  eventId, 
  initialOptions = [], 
  onSave 
}: FoodPricingManagerProps) {
  const [foodOptions, setFoodOptions] = useState<FoodOption[]>(
    initialOptions.length > 0 ? initialOptions : [
      {
        id: 'veg-meal',
        name: 'Vegetarian Meal',
        price: 15,
        description: 'Traditional vegetarian meal with rice, dal, vegetables, and dessert',
        category: 'veg',
        available: true
      },
      {
        id: 'nonveg-meal',
        name: 'Non-Vegetarian Meal',
        price: 20,
        description: 'Complete meal with chicken/lamb curry, rice, vegetables, and dessert',
        category: 'nonveg',
        available: true
      }
    ]
  )
  const [loading, setLoading] = useState(false)

  const addFoodOption = () => {
    const newOption: FoodOption = {
      id: `option-${Date.now()}`,
      name: '',
      price: 0,
      description: '',
      category: 'veg',
      available: true
    }
    setFoodOptions([...foodOptions, newOption])
  }

  const updateFoodOption = (id: string, updates: Partial<FoodOption>) => {
    setFoodOptions(prev => prev.map(option => 
      option.id === id ? { ...option, ...updates } : option
    ))
  }

  const removeFoodOption = (id: string) => {
    setFoodOptions(prev => prev.filter(option => option.id !== id))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (onSave) {
        await onSave(foodOptions)
      }
      
      // If eventId is provided, save to the specific event
      if (eventId) {
        const response = await fetch(`/api/admin/events/${eventId}/food-options`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ foodOptions }),
        })

        if (!response.ok) {
          throw new Error('Failed to save food options')
        }
      }
    } catch (error) {
      console.error('Error saving food options:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRSVPField = () => {
    if (foodOptions.length === 0) return null

    const availableOptions = foodOptions.filter(option => option.available)
    
    return {
      id: 'foodPreference',
      type: 'select',
      label: 'Food Preference',
      required: true,
      options: [
        'No food required',
        ...availableOptions.map(option => `${option.name} - $${option.price}`)
      ]
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            Food Pricing Manager
          </h2>
          <p className="text-muted-foreground">Configure food options and pricing for your event</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addFoodOption} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Options
          </Button>
        </div>
      </div>

      {/* Food Options */}
      <div className="space-y-4">
        {foodOptions.map((option) => (
          <Card key={option.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Food Option Configuration</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={option.category === 'veg' ? 'default' : option.category === 'nonveg' ? 'destructive' : 'secondary'}>
                    {option.category === 'veg' ? '🌱 Vegetarian' : option.category === 'nonveg' ? '🍖 Non-Vegetarian' : '🍽️ Both'}
                  </Badge>
                  <Button
                    onClick={() => removeFoodOption(option.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option Name */}
                <div className="space-y-2">
                  <Label htmlFor={`name-${option.id}`}>Option Name</Label>
                  <Input
                    id={`name-${option.id}`}
                    value={option.name}
                    onChange={(e) => updateFoodOption(option.id, { name: e.target.value })}
                    placeholder="e.g., Vegetarian Meal"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor={`price-${option.id}`}>Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id={`price-${option.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={option.price}
                      onChange={(e) => updateFoodOption(option.id, { price: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor={`category-${option.id}`}>Food Category</Label>
                  <Select 
                    value={option.category} 
                    onValueChange={(value: 'veg' | 'nonveg' | 'both') => 
                      updateFoodOption(option.id, { category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">🌱 Vegetarian</SelectItem>
                      <SelectItem value="nonveg">🍖 Non-Vegetarian</SelectItem>
                      <SelectItem value="both">🍽️ Both (Mixed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <Label htmlFor={`available-${option.id}`}>Available</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`available-${option.id}`}
                      checked={option.available}
                      onCheckedChange={(checked: boolean) => updateFoodOption(option.id, { available: checked })}
                    />
                    <Label htmlFor={`available-${option.id}`} className="text-sm">
                      {option.available ? 'Available for ordering' : 'Temporarily unavailable'}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor={`description-${option.id}`}>Description (Optional)</Label>
                <Textarea
                  id={`description-${option.id}`}
                  value={option.description || ''}
                  onChange={(e) => updateFoodOption(option.id, { description: e.target.value })}
                  placeholder="Describe what's included in this meal option..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {foodOptions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Food Options Configured</h3>
              <p className="text-muted-foreground mb-4">
                Add food options with pricing to allow members to order meals during RSVP.
              </p>
              <Button onClick={addFoodOption}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Food Option
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Section */}
      {foodOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              RSVP Form Preview
            </CardTitle>
            <CardDescription>
              This is how the food selection will appear in your RSVP form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <Label className="text-base font-medium">Food Preference *</Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select your food preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No food required</SelectItem>
                  {foodOptions
                    .filter(option => option.available)
                    .map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name} - ${option.price.toFixed(2)}
                        {option.description && (
                          <span className="text-sm text-muted-foreground block">
                            {option.description}
                          </span>
                        )}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Please select your food preference. Payment confirmation will be required after RSVP.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Summary */}
      {foodOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {foodOptions.filter(option => option.available).map(option => (
                <div key={option.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{option.name}</h4>
                    <Badge variant={option.category === 'veg' ? 'default' : 'destructive'}>
                      {option.category === 'veg' ? 'Veg' : 'Non-Veg'}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-600">${option.price.toFixed(2)}</p>
                  {option.description && (
                    <p className="text-sm text-muted-foreground mt-2">{option.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}