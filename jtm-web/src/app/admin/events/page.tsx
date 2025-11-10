// JTM Web - Admin Events Redirect
// This page redirects to the unified events page at /events
// The /events page now handles both user and admin views intelligently

import { redirect } from 'next/navigation'

export default function AdminEventsRedirect() {
  redirect('/events')
}