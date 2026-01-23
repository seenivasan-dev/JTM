import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateQRCodeData, generateQRCodeDataURL } from '@/lib/qrcode'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

interface AttendeeRow {
  'Email Address'?: string
  'Primary Member - First Name'?: string
  'Primary Member - Last Name'?: string
  'Phone Number (used for JTM Member Identification)'?: string
  'Adults'?: number
  'Kids'?: number
  // Also support simplified column names
  email?: string
  name?: string
  firstName?: string
  lastName?: string
  phone?: string
  adults?: number
  kids?: number
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

    // Admin check is optional for this endpoint
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email || '' }
      })
    } catch (error) {
      console.warn('Admin check skipped:', error)
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
    const event = await prisma.checkInEvent.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    let attendeeRows: AttendeeRow[] = []

    // Parse based on file type
    const fileName = file.name.toLowerCase()
    
    if (fileName.endsWith('.csv')) {
      // Parse CSV
      const csvText = buffer.toString('utf-8')
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      })
      attendeeRows = parsed.data as AttendeeRow[]
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Parse Excel
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      attendeeRows = XLSX.utils.sheet_to_json(worksheet) as AttendeeRow[]
    } else {
      return NextResponse.json({ error: 'Invalid file type. Use CSV or Excel.' }, { status: 400 })
    }

    if (attendeeRows.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 })
    }

    // Process each row
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < attendeeRows.length; i++) {
      const row = attendeeRows[i]
      
      try {
        // Map Excel columns to internal fields
        const email = row['Email Address'] || row.email
        const firstName = row['Primary Member - First Name'] || row.firstName || ''
        const lastName = row['Primary Member - Last Name'] || row.lastName || ''
        const name = row.name || `${firstName} ${lastName}`.trim()
        const phone = row['Phone Number (used for JTM Member Identification)'] || row.phone
        const adults = row['Adults'] || row.adults || 1
        const kids = row['Kids'] || row.kids || 0

        // Validate required fields
        if (!name || !email) {
          results.failed++
          results.errors.push(`Row ${i + 1}: Missing required fields (name/email)`)
          continue
        }

        // Check if attendee already exists
        const existingAttendee = await prisma.qRAttendee.findUnique({
          where: {
            eventId_email: {
              eventId: eventId,
              email: email
            }
          }
        })

        if (existingAttendee) {
          results.success++
          continue
        }

        // Generate unique attendee ID for QR code
        const attendeeId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Generate QR code data
        const qrData = generateQRCodeData(attendeeId, eventId, email)
        
        // Generate QR code image
        const qrCodeImage = await generateQRCodeDataURL(qrData, {
          width: 300,
          margin: 2
        })

        // Create attendee record with QR code
        await prisma.qRAttendee.create({
          data: {
            eventId: eventId,
            name: name,
            email: email,
            phone: phone ? String(phone) : null,
            adults: adults ? parseInt(String(adults)) : 1,
            kids: kids ? parseInt(String(kids)) : 0,
            dietaryRestrictions: row.dietaryRestrictions,
            specialRequests: row.specialRequests,
            qrCodeData: qrData,
            qrCodeImageUrl: qrCodeImage,
            emailStatus: 'PENDING'
          }
        })

        results.success++
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
