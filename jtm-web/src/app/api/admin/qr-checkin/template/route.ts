import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Define columns with header labels
    const headers = [
      'name',
      'email',
      'phone',
      'Attending Adults',
      'Adult Veg Food',
      'Adult Non-Veg Food',
      'Kids Food',
      'dietaryRestrictions',
      'specialRequests',
    ]

    // Sample rows showing different scenarios
    const sampleRows = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        phone: '904-555-0101',
        'Attending Adults': 2,
        'Adult Veg Food': 2,
        'Adult Non-Veg Food': 0,
        'Kids Food': 1,
        dietaryRestrictions: 'Vegetarian',
        specialRequests: '',
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '904-555-0102',
        'Attending Adults': 2,
        'Adult Veg Food': 1,
        'Adult Non-Veg Food': 1,
        'Kids Food': 2,
        dietaryRestrictions: '',
        specialRequests: 'High chair needed',
      },
      {
        name: 'Arun Selvam',
        email: 'arun.selvam@example.com',
        phone: '904-555-0103',
        'Attending Adults': 3,
        'Adult Veg Food': 0,
        'Adult Non-Veg Food': 3,
        'Kids Food': 0,
        dietaryRestrictions: '',
        specialRequests: '',
      },
      {
        name: 'Kavitha Rajan',
        email: 'kavitha.rajan@example.com',
        phone: '904-555-0104',
        'Attending Adults': 3,
        'Adult Veg Food': 2,
        'Adult Non-Veg Food': 1,
        'Kids Food': 1,
        dietaryRestrictions: 'Gluten-free',
        specialRequests: 'Window seat',
      },
    ]

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // ── Sheet 1: Template (data entry sheet) ──
    const templateData = [headers, ...sampleRows.map(r => headers.map(h => (r as any)[h] ?? ''))]
    const templateSheet = XLSX.utils.aoa_to_sheet(templateData)

    // Column widths
    templateSheet['!cols'] = [
      { wch: 25 }, // name
      { wch: 32 }, // email
      { wch: 16 }, // phone
      { wch: 20 }, // Attending Adults
      { wch: 18 }, // Adult Veg Food
      { wch: 20 }, // Adult Non-Veg Food
      { wch: 12 }, // Kids Food
      { wch: 22 }, // dietaryRestrictions
      { wch: 24 }, // specialRequests
    ]

    // Style header row cells (bold + colored background)
    const headerRange = XLSX.utils.decode_range(templateSheet['!ref'] || 'A1')
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!templateSheet[cellAddr]) continue
      templateSheet[cellAddr].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '302b63' } },
        alignment: { horizontal: 'center' },
        border: {
          bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
          right:  { style: 'thin', color: { rgb: 'AAAAAA' } },
        },
      }
    }

    XLSX.utils.book_append_sheet(workbook, templateSheet, 'RSVP Template')

    // ── Sheet 2: Instructions ──
    const instructions = [
      ['JTM - RSVP Upload Template Instructions'],
      [''],
      ['REQUIRED COLUMNS'],
      ['Column', 'Description', 'Example'],
      ['name', 'Full name of attendee', 'Rajesh Kumar'],
      ['email', 'Email address (must be unique per event)', 'rajesh@example.com'],
      [''],
      ['HEADCOUNT COLUMN'],
      ['Column', 'Description', 'Example'],
      ['Attending Adults', 'Total number of adults attending (including visiting parents)', '3'],
      [''],
      ['FOOD COUNT COLUMNS (enter 0 if not applicable)'],
      ['Column', 'Description', 'Example'],
      ['Adult Veg Food', 'Number of vegetarian adult meals', '2'],
      ['Adult Non-Veg Food', 'Number of non-vegetarian adult meals', '1'],
      ['Kids Food', 'Number of kids meals (also used as kids headcount)', '1'],
      [''],
      ['OPTIONAL COLUMNS'],
      ['Column', 'Description', 'Example'],
      ['phone', 'Phone number', '904-555-0101'],
      ['dietaryRestrictions', 'Any dietary restrictions', 'Vegetarian, Gluten-free'],
      ['specialRequests', 'Any special requests', 'Window seat, High chair'],
      [''],
      ['NOTES'],
      ['- Delete the sample rows before uploading your real data'],
      ['- Keep the header row (Row 1) exactly as-is'],
      ['- Use 0 for food types that are not needed'],
      ['- Total Attendees = Attending Adults + Kids Food count'],
      ['- If no food is selected, the email will show "Event Only"'],
      ['- Each email address must be unique within the event'],
      ['- Accepted file formats: .xlsx, .xls, .csv'],
    ]

    const instrSheet = XLSX.utils.aoa_to_sheet(instructions)
    instrSheet['!cols'] = [{ wch: 30 }, { wch: 45 }, { wch: 25 }]

    // Style the title
    if (instrSheet['A1']) {
      instrSheet['A1'].s = {
        font: { bold: true, sz: 14, color: { rgb: '302b63' } },
      }
    }
    // Style section headers (rows: REQUIRED COLUMNS, HEADCOUNT, FOOD COUNT, OPTIONAL, NOTES)
    ;[2, 7, 11, 17, 23].forEach(row => {
      const cell = instrSheet[XLSX.utils.encode_cell({ r: row, c: 0 })]
      if (cell) cell.s = { font: { bold: true, color: { rgb: 'E05A00' } } }
    })

    XLSX.utils.book_append_sheet(workbook, instrSheet, 'Instructions')

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="JTM-RSVP-Template.xlsx"',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Template generation error:', error)
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 })
  }
}
