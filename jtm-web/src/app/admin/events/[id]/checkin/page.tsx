// JTM Web - Admin Event QR Check-In Page (Server Component)
import CheckInClient from './CheckInClient'

export default async function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params
  return <CheckInClient eventId={eventId} />
}
