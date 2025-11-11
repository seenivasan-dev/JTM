/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { generateWelcomeEmail } from '@/lib/email/templates';

const bulkUserSchema = z.object({
  users: z.array(z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
    membershipType: z.enum(['INDIVIDUAL', 'FAMILY', 'CUSTOM']),
    address: z.object({
      street: z.string().min(5, 'Street address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().min(5, 'ZIP code is required'),
      country: z.string().default('USA'),
    }),
    familyMembers: z.array(z.object({
      firstName: z.string().min(2, 'First name is required'),
      lastName: z.string().min(2, 'Last name is required'),
      age: z.number().min(0).max(150, 'Invalid age'),
      contactNumber: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      relationship: z.string().min(2, 'Relationship is required'),
    })).optional(),
  })),
});

const bulkActivationSchema = z.object({
  userIds: z.array(z.string()),
  action: z.enum(['activate', 'deactivate']),
});

interface ImportError {
  row: number;
  field: string;
  message: string;
}

// Helper function to parse CSV content
function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

// Helper function to generate temporary password
function generateTempPassword(): string {
  return Math.random().toString(36).slice(-8);
}

// Handle bulk activation/deactivation
async function handleBulkActivation(body: any, admin: any) {
  const validatedData = bulkActivationSchema.parse(body);
  const { userIds, action } = validatedData;

  if (action === 'activate') {
    // Step 1: Get all users to activate
    const usersToActivate = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        isActive: false, // Only activate inactive users
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        tempPassword: true,
      },
    });

    if (usersToActivate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No inactive users found to activate',
        count: 0,
      });
    }

    // Step 2: Generate temp passwords and send emails FIRST
    const emailResults = [];
    const successfulActivations: string[] = []; // User IDs where email succeeded
    
    for (const user of usersToActivate) {
      // Always generate new temp password (even if user had one)
      const tempPassword = Math.random().toString(36).slice(-8);
      
      try {
        // Try to send email BEFORE activating
        // Ensure loginUrl has protocol
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const loginUrl = baseUrl.startsWith('http') ? `${baseUrl}/auth/login` : `https://${baseUrl}/auth/login`;
        
        const emailTemplate = generateWelcomeEmail({
          firstName: user.firstName,
          email: user.email,
          tempPassword: tempPassword,
          loginUrl,
        });

        const result = await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          tags: ['activation', 'welcome', 'bulk-activation'],
        });

        if (result.success) {
          console.log(`✅ Welcome email sent to ${user.email} - will activate`);
          
          // Email succeeded - update with temp password and mark for activation
          const hashedTempPassword = await bcrypt.hash(tempPassword, 12);
          await prisma.user.update({
            where: { id: user.id },
            data: {
              tempPassword: hashedTempPassword,
              mustChangePassword: true,
            },
          });
          
          successfulActivations.push(user.id);
          emailResults.push({
            email: user.email,
            sent: true,
            activated: true,
          });
        } else {
          console.error(`❌ Email failed for ${user.email}: ${result.error} - user NOT activated`);
          emailResults.push({
            email: user.email,
            sent: false,
            activated: false,
            error: result.error,
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Email exception for ${user.email}: ${errorMsg} - user NOT activated`);
        emailResults.push({
          email: user.email,
          sent: false,
          activated: false,
          error: errorMsg,
        });
      }
    }

    // Step 3: Only activate users whose emails were sent successfully
    if (successfulActivations.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: { in: successfulActivations },
        },
        data: {
          isActive: true,
          activatedBy: admin.id,
          activatedAt: new Date(),
        },
      });

      console.log(`✅ Activated ${successfulActivations.length} users (emails sent successfully)`);
    }

    const failedCount = usersToActivate.length - successfulActivations.length;
    
    return NextResponse.json({
      success: successfulActivations.length > 0,
      message: failedCount > 0 
        ? `Activated ${successfulActivations.length} users. ${failedCount} users NOT activated due to email failures.`
        : `Successfully activated ${successfulActivations.length} users`,
      totalRequested: userIds.length,
      totalProcessed: usersToActivate.length,
      activated: successfulActivations.length,
      failed: failedCount,
      emailResults,
    });
  }

  // Deactivation doesn't need email, proceed normally
  if (action === 'deactivate') {
    await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        isActive: false,
        activatedBy: null,
        activatedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deactivated ${userIds.length} users`,
      count: userIds.length,
    });
  }

  return NextResponse.json({
    success: true,
    message: `Successfully ${action}d ${userIds.length} users`,
    count: userIds.length,
  });
}

// Handle bulk user creation from JSON
async function handleBulkUserCreation(validatedData: any, admin: any) {
  const results = [];
  const errors = [];

  for (const userData of validatedData.users) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        errors.push({
          email: userData.email,
          error: 'User already exists',
        });
        continue;
      }

      // Generate temporary password
      const tempPassword = generateTempPassword();

      // Create user with address and family members in transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            mobileNumber: userData.mobileNumber,
            membershipType: userData.membershipType,
            tempPassword,
            mustChangePassword: true,
            isActive: false,
            importedFromExcel: true,
            activatedBy: admin.id,
          },
        });

        await tx.address.create({
          data: {
            ...userData.address,
            userId: user.id,
          },
        });

        if (userData.familyMembers && userData.familyMembers.length > 0) {
          await tx.familyMember.createMany({
            data: userData.familyMembers.map((fm: any) => ({
              ...fm,
              userId: user.id,
            })),
          });
        }

        await tx.notificationPreferences.create({
          data: {
            userId: user.id,
            email: true,
            push: true,
            eventReminders: true,
            membershipRenewal: true,
            adminUpdates: true,
          },
        });

        return { user, tempPassword };
      });

      results.push({
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        tempPassword: result.tempPassword,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      errors.push({
        email: userData.email,
        error: 'Failed to create user',
      });
    }
  }

  return NextResponse.json({
    success: true,
    created: results.length,
    failed: errors.length,
    users: results,
    errors,
  });
}

// POST /api/users/bulk-import - Import users from Excel/CSV file or JSON data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if this is a file upload or JSON data
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Read file content
      const content = await file.text();
      let rows: any[];

      try {
        if (file.name.endsWith('.csv')) {
          rows = parseCSV(content);
        } else {
          return NextResponse.json({ error: 'Only CSV files are supported currently' }, { status: 400 });
        }
      } catch (error) {
        return NextResponse.json({ error: 'Failed to parse file' }, { status: 400 });
      }

      if (rows.length === 0) {
        return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
      }

      // Process the rows and create users
      const results = {
        total: rows.length,
        successful: 0,
        failed: 0,
        errors: [] as ImportError[],
        newUsers: [] as Array<{
          email: string;
          firstName: string;
          lastName: string;
          tempPassword: string;
        }>
      };

      for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i];
        const rowNumber = i + 2; // Account for header row and 0-based indexing

        try {
          // Validate required fields
          const requiredFields = ['firstName', 'lastName', 'email', 'mobileNumber', 'membershipType', 'street', 'city', 'state', 'zipCode'];
          for (const field of requiredFields) {
            if (!rowData[field]) {
              results.errors.push({
                row: rowNumber,
                field,
                message: `${field} is required`
              });
            }
          }

          if (results.errors.some(e => e.row === rowNumber)) {
            results.failed++;
            continue;
          }

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: rowData.email },
          });

          if (existingUser) {
            results.errors.push({
              row: rowNumber,
              field: 'email',
              message: 'User with this email already exists'
            });
            results.failed++;
            continue;
          }

          // Generate temporary password
          const tempPassword = generateTempPassword();

          // Create user
          const user = await prisma.user.create({
            data: {
              email: rowData.email,
              firstName: rowData.firstName,
              lastName: rowData.lastName,
              mobileNumber: rowData.mobileNumber,
              membershipType: rowData.membershipType || 'INDIVIDUAL',
              tempPassword,
              mustChangePassword: true,
              isActive: false, // Admin needs to activate
              importedFromExcel: true,
              activatedBy: admin.id,
              address: {
                create: {
                  street: rowData.street,
                  city: rowData.city,
                  state: rowData.state,
                  zipCode: rowData.zipCode,
                  country: rowData.country || 'USA',
                }
              },
              notifications: {
                create: {
                  email: true,
                  push: true,
                  eventReminders: true,
                  membershipRenewal: true,
                  adminUpdates: true,
                }
              }
            },
          });

          results.newUsers.push({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            tempPassword,
          });

          results.successful++;

        } catch (error) {
          console.error('Error creating user:', error);
          results.errors.push({
            row: rowNumber,
            field: 'general',
            message: 'Failed to create user'
          });
          results.failed++;
        }
      }

      return NextResponse.json(results);
    } else {
      // Handle JSON data (existing functionality)
      const body = await request.json();
      
      // Check if this is bulk activation
      if (body.action && body.userIds) {
        return handleBulkActivation(body, admin);
      }
      
      // Handle bulk user creation
      const validatedData = bulkUserSchema.parse(body);
      return handleBulkUserCreation(validatedData, admin);
    }

  } catch (error) {
    console.error('Bulk import error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}