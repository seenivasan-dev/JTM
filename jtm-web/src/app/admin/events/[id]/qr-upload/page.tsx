// JTM Web - Admin RSVP QR Code Upload Page (Server Component)
import QRUploadPageClient from './QRUploadClient'

export default async function QRUploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params
  return <QRUploadPageClient eventId={eventId} />
}
