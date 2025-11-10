// JTM Web - Member Detail View Page
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Users,
  UserCheck,
  UserX,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'

interface MemberDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  })

  if (!admin) {
    redirect('/dashboard')
  }

  // Get member with all related data
  const member = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    include: {
      address: true,
      familyMembers: true,
      rsvpResponses: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Last 10 RSVPs
      },
    },
  })

  if (!member) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/members">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Members
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{member.firstName} {member.lastName}</h1>
          <p className="text-gray-600">Member Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-base">{member.firstName} {member.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                  <p className="text-base flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {member.mobileNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Membership Type</label>
                  <p className="text-base">
                    <Badge variant="outline">{member.membershipType}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-base">
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive ? (
                        <>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {member.membershipExpiry && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Membership Expires</label>
                  <p className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {new Date(member.membershipExpiry).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Information */}
          {member.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>{member.address.street}</p>
                  <p>{member.address.city}, {member.address.state} {member.address.zipCode}</p>
                  <p>{member.address.country}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Family Members */}
          {member.familyMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Family Members ({member.familyMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {member.familyMembers.map((familyMember) => (
                    <div key={familyMember.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{familyMember.firstName} {familyMember.lastName}</p>
                        <p className="text-sm text-gray-600">
                          {familyMember.relationship} • Age: {familyMember.age}
                        </p>
                        {familyMember.email && (
                          <p className="text-sm text-gray-600">{familyMember.email}</p>
                        )}
                      </div>
                      {familyMember.contactNumber && (
                        <Badge variant="outline">{familyMember.contactNumber}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent RSVP Activity</CardTitle>
              <CardDescription>Latest event responses</CardDescription>
            </CardHeader>
            <CardContent>
              {member.rsvpResponses.length > 0 ? (
                <div className="space-y-3">
                  {member.rsvpResponses.map((rsvp) => (
                    <div key={rsvp.id} className="flex flex-col gap-1 p-3 border rounded-lg">
                      <p className="font-medium text-sm">{rsvp.event.title}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(rsvp.event.date).toLocaleDateString()}
                      </p>
                      <div className="flex gap-1">
                        <Badge variant={rsvp.paymentConfirmed ? "default" : "secondary"} className="text-xs">
                          {rsvp.paymentConfirmed ? "Paid" : "Pending"}
                        </Badge>
                        <Badge variant={rsvp.checkedIn ? "default" : "outline"} className="text-xs">
                          {rsvp.checkedIn ? "Attended" : "Not Attended"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No RSVP activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}