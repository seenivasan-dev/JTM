import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateQRCodeData, generateQRCodeDataURL } from '@/lib/qrcode'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

interface RSVPRow {
  eventId: string
  userId: string
  name: string
  email: string
  phone?: string
  responseStatus: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE'
  numberOfGuests?: number
  dietaryRestrictions?: string
  specialRequests?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin privileges
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! }
    })
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const eventId = formData.get('eventId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    let rsvpRows: RSVPRow[] = []

    // Parse based on file type
    const fileName = file.name.toLowerCase()
    
    if (fileName.endsWith('.csv')) {
      // Parse CSV
      const csvText = buffer.toString('utf-8')
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      })
      rsvpRows = parsed.data as RSVPRow[]
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Parse Excel
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      rsvpRows = XLSX.utils.sheet_to_json(worksheet) as RSVPRow[]
    } else {
      return NextResponse.json({ error: 'Invalid file type. Use CSV or Excel.' }, { status: 400 })
    }

    if (rsvpRows.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 })
    }

    // Process each row
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < rsvpRows.length; i++) {
      const row = rsvpRows[i]
      
      try {
        // Validate required fields
        if (!row.userId || !row.name || !row.email) {
          results.failed++
          results.errors.push(`Row ${i + 1}: Missing required fields (userId, name, email)`)
          continue
        }

        // Check if user exists, create if not
        let user = await prisma.user.findUnique({
          where: { id: row.userId }
        })

        if (!user) {
          // Create user if not exists
          const nameParts = row.name.split(' ')
          user = await prisma.user.create({
            data: {
              id: row.userId,
              email: row.email,
              firstName: nameParts[0] || row.name,
              lastName: nameParts.slice(1).join(' ') || '',
              mobileNumber: row.phone || '',
              password: 'temp-password', // Will need to reset password
              membershipType: 'INDIVIDUAL'
            }
          })
        }

        // Check if RSVP response already exists
        let rsvpResponse = await prisma.rSVPResponse.findUnique({
          where: {
            eventId_userId: {
              eventId: eventId,
              userId: row.userId
            }
          }
        })

        if (!rsvpResponse) {
          // Create RSVP response with QR code
          const qrData = generateQRCodeData(row.userId, eventId, row.userId)
          const qrCodeImage = await generateQRCodeDataURL(qrData, {
            width: 300,
            margin: 2
          })

          rsvpResponse = await prisma.rSVPResponse.create({
            data: {
              eventId: eventId,
              userId: row.userId,
              qrCode: qrCodeImage,
              responses: {
                responseStatus: row.responseStatus || 'ATTENDING',
                numberOfGuests: row.numberOfGuests ? parseInt(String(row.numberOfGuests)) : 0,
                dietaryRestrictions: row.dietaryRestrictions,
                specialRequests: row.specialRequests,
                qrCodeData: qrData,
                emailStatus: 'PENDING'
              }
            }
          })
          results.success++
        } else {
          // Update existing RSVP if no QR code exists
          const responses = rsvpResponse.responses as any
          if (!rsvpResponse.qrCode || !responses?.qrCodeData) {
            const qrData = generateQRCodeData(rsvpResponse.id, eventId, row.userId)
            const qrCodeImage = await generateQRCodeDataURL(qrData, {
              width: 300,
              margin: 2
            })

            await prisma.rSVPResponse.update({
              where: { id: rsvpResponse.id },
              data: {
                qrCode: qrCodeImage,
                responses: {
                  ...responses,
                  qrCodeData: qrData,
                  emailStatus: responses?.emailStatus || 'PENDING'
                }
              }
            })
          }
          results.success++
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: 'Upload processed',
      results
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
