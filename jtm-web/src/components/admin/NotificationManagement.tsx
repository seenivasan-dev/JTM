'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Bell,
  Send,
  Users,
  Calendar,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Plus,
  ImagePlus,
  X
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'

interface Notification {
  id: string
  title: string
  message: string
  type: 'event' | 'renewal' | 'announcement' | 'reminder'
  priority: 'low' | 'medium' | 'high'
  recipients: 'all' | 'active' | 'inactive' | 'family' | 'individual'
  status: 'draft' | 'sent' | 'scheduled'
  sentAt?: string
  scheduledFor?: string
  openRate?: number
  clickRate?: number
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Upcoming Community Festival',
      message: 'Join us for our annual community festival on October 15th. RSVP required.',
      type: 'event',
      priority: 'high',
      recipients: 'all',
      status: 'sent',
      sentAt: '2025-10-01T10:00:00Z',
      openRate: 78,
      clickRate: 42
    },
    {
      id: '2',
      title: 'Membership Renewal Reminder',
      message: 'Your membership expires soon. Please renew to continue enjoying our services.',
      type: 'renewal',
      priority: 'medium',
      recipients: 'active',
      status: 'sent',
      sentAt: '2025-09-28T09:00:00Z',
      openRate: 65,
      clickRate: 28
    },
    {
      id: '3',
      title: 'New Food Truck Event',
      message: 'Draft notification for upcoming food truck event',
      type: 'event',
      priority: 'medium',
      recipients: 'all',
      status: 'draft'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const flyerInputRef = useRef<HTMLInputElement>(null)

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'announcement' as const,
    priority: 'medium' as const,
    recipients: 'all' as const,
    scheduledFor: ''
  })

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFlyerFile(file)
  }

  const clearFlyer = () => {
    setFlyerFile(null)
    if (flyerInputRef.current) flyerInputRef.current.value = ''
  }

  const handleSendNotification = async (notificationId: string, notif?: Partial<Notification>) => {
    // Find the notification data to send
    const target = notif || notifications.find(n => n.id === notificationId)
    if (!target) return

    setSending(true)
    setSendResult(null)
    try {
      const fd = new FormData()
      fd.append('title', target.title || newNotification.title)
      fd.append('message', target.message || newNotification.message)
      fd.append('recipients', target.recipients || newNotification.recipients)
      if (flyerFile) fd.append('flyer', flyerFile)

      const response = await fetch('/api/admin/send-notification', {
        method: 'POST',
        body: fd,
      })

      const result = await response.json()
      if (response.ok) {
        setSendResult({ type: 'success', message: result.message })
        setNotifications(prev => prev.map(n =>
          n.id === notificationId
            ? { ...n, status: 'sent' as const, sentAt: new Date().toISOString() }
            : n
        ))
      } else {
        setSendResult({ type: 'error', message: result.error || 'Failed to send notification' })
      }
    } catch {
      setSendResult({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setSending(false)
    }
  }

  const handleCreateNotification = async (sendImmediately: boolean) => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) return

    const newId = Date.now().toString()

    if (sendImmediately) {
      setSending(true)
      setSendResult(null)
      try {
        const fd = new FormData()
        fd.append('title', newNotification.title)
        fd.append('message', newNotification.message)
        fd.append('recipients', newNotification.recipients)
        if (flyerFile) fd.append('flyer', flyerFile)

        const response = await fetch('/api/admin/send-notification', {
          method: 'POST',
          body: fd,
        })

        const result = await response.json()
        if (response.ok) {
          setSendResult({ type: 'success', message: result.message })
          setNotifications(prev => [
            {
              id: newId,
              ...newNotification,
              status: 'sent' as const,
              sentAt: new Date().toISOString(),
            },
            ...prev,
          ])
          setIsCreateDialogOpen(false)
          resetForm()
        } else {
          setSendResult({ type: 'error', message: result.error || 'Failed to send' })
        }
      } catch {
        setSendResult({ type: 'error', message: 'Network error. Please try again.' })
      } finally {
        setSending(false)
      }
    } else {
      // Save as draft (local state only — no DB model for notifications yet)
      const notification: Notification = {
        id: newId,
        ...newNotification,
        status: newNotification.scheduledFor ? 'scheduled' : 'draft'
      }
      setNotifications(prev => [notification, ...prev])
      setIsCreateDialogOpen(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setNewNotification({
      title: '',
      message: '',
      type: 'announcement',
      priority: 'medium',
      recipients: 'all',
      scheduledFor: ''
    })
    setFlyerFile(null)
    if (flyerInputRef.current) flyerInputRef.current.value = ''
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || notification.type === filterType
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />
      case 'renewal': return <Clock className="h-4 w-4" />
      case 'announcement': return <MessageSquare className="h-4 w-4" />
      case 'reminder': return <Bell className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-800'
      case 'renewal': return 'bg-orange-100 text-orange-800'
      case 'announcement': return 'bg-green-100 text-green-800'
      case 'reminder': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'draft': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-600" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const stats = {
    totalNotifications: notifications.length,
    sentNotifications: notifications.filter(n => n.status === 'sent').length,
    draftNotifications: notifications.filter(n => n.status === 'draft').length,
    scheduledNotifications: notifications.filter(n => n.status === 'scheduled').length,
    avgOpenRate: Math.round(notifications.filter(n => n.openRate).reduce((acc, n) => acc + (n.openRate || 0), 0) / notifications.filter(n => n.openRate).length || 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notification Management</h1>
              <p className="text-white/90 text-lg">Send announcements, reminders, and updates to your community</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-white text-purple-600 hover:bg-white/90 shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Notification
          </Button>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to your community members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="Notification title..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Your message..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={newNotification.type} onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="renewal">Renewal</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newNotification.priority} onValueChange={(value: any) => setNewNotification({ ...newNotification, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Recipients</label>
                    <Select value={newNotification.recipients} onValueChange={(value: any) => setNewNotification({ ...newNotification, recipients: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="active">Active Members</SelectItem>
                        <SelectItem value="inactive">Inactive Members</SelectItem>
                        <SelectItem value="family">Family Memberships</SelectItem>
                        <SelectItem value="individual">Individual Memberships</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Schedule For (Optional)</label>
                    <Input
                      type="datetime-local"
                      value={newNotification.scheduledFor}
                      onChange={(e) => setNewNotification({ ...newNotification, scheduledFor: e.target.value })}
                    />
                  </div>
                </div>
                {/* Flyer Upload */}
                <div>
                  <label className="text-sm font-medium">Event Flyer (Optional)</label>
                  <div className="mt-1">
                    {flyerFile ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <ImagePlus className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-800 flex-1 truncate">{flyerFile.name}</span>
                        <button type="button" onClick={clearFlyer} className="text-green-600 hover:text-red-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="flyer-upload"
                        className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <ImagePlus className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Click to upload flyer image (JPG, PNG, WebP)</span>
                        <input
                          id="flyer-upload"
                          ref={flyerInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={handleFlyerChange}
                        />
                      </label>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Image will be embedded directly in the email body</p>
                  </div>
                </div>
                {sendResult && (
                  <Alert variant={sendResult.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{sendResult.message}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); setSendResult(null) }}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateNotification(false)}
                  disabled={sending || !newNotification.title.trim() || !newNotification.message.trim()}
                >
                  {newNotification.scheduledFor ? 'Schedule' : 'Save Draft'}
                </Button>
                <Button
                  onClick={() => handleCreateNotification(true)}
                  disabled={sending || !newNotification.title.trim() || !newNotification.message.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {sending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotifications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sentNotifications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draftNotifications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduledNotifications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOpenRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="event">Events</SelectItem>
            <SelectItem value="renewal">Renewals</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
            <SelectItem value="reminder">Reminders</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Send result alert */}
      {sendResult && !isCreateDialogOpen && (
        <Alert variant={sendResult.type === 'error' ? 'destructive' : 'default'} className="border-green-300 bg-green-50">
          <AlertDescription>{sendResult.message}</AlertDescription>
        </Alert>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(notification.type)}
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                    <Badge className={getPriorityColor(notification.priority)}>
                      {notification.priority}
                    </Badge>
                  </div>
                  <CardDescription>{notification.message}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(notification.status)}
                  <span className="text-sm font-medium capitalize">{notification.status}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Recipients: {notification.recipients}</span>
                  </div>
                  {notification.sentAt && (
                    <div>
                      Sent: {format(new Date(notification.sentAt), 'MMM dd, yyyy h:mm a')}
                    </div>
                  )}
                  {notification.scheduledFor && (
                    <div>
                      Scheduled: {format(new Date(notification.scheduledFor), 'MMM dd, yyyy h:mm a')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notification.status === 'sent' && (
                    <div className="flex gap-4 text-sm">
                      <span>Open: {notification.openRate}%</span>
                      <span>Click: {notification.clickRate}%</span>
                    </div>
                  )}
                  {notification.status === 'draft' && (
                    <Button
                      size="sm"
                      disabled={sending}
                      onClick={() => handleSendNotification(notification.id)}
                    >
                      {sending ? (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Now
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your filters or search term.'
              : 'Create your first notification to get started.'
            }
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          )}
        </div>
      )}
    </div>
  )
}