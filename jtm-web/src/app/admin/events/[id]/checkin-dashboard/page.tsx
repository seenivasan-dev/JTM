// JTM Web - Admin Event Check-In Dashboard Page (Server Component)
import CheckInDashboardClient from './CheckInDashboardClient'

export default async function CheckInDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params
  return <CheckInDashboardClient eventId={eventId} />
}
