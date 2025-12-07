// JTM Web - Automatic Membership Expiration Utility
// This utility automatically expires memberships on January 1st at 12:01 AM every year

import { prisma } from '@/lib/prisma';

interface ExpirationResult {
  executed: boolean;
  alreadyExpired: boolean;
  count?: number;
  message: string;
  processedAt?: Date;
  nextExpirationDate?: Date;
}

/**
 * Checks if today is January 1st and if expiration hasn't run yet this year
 * Returns true if expiration should be executed
 */
export function shouldRunExpiration(): boolean {
  const now = new Date();
  const isJanuaryFirst = now.getMonth() === 0 && now.getDate() === 1;
  return isJanuaryFirst;
}

/**
 * Gets the next January 1st expiration date
 */
export function getNextExpirationDate(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const nextYear = now.getMonth() === 0 && now.getDate() === 1 ? currentYear : currentYear + 1;
  return new Date(nextYear, 0, 1, 0, 1, 0); // January 1st, 12:01 AM
}

/**
 * Checks if expiration has already been executed this year
 * by checking if there's a log entry for current year
 */
async function hasExpiredThisYear(): Promise<boolean> {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1, 0, 0, 0);
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

  try {
    // Check if there's any user that was deactivated on Jan 1st this year
    // by checking membershipExpiry dates
    const expirationCheck = await prisma.user.findFirst({
      where: {
        membershipExpiry: {
          gte: yearStart,
          lte: new Date(currentYear, 0, 1, 23, 59, 59), // End of Jan 1st
        },
        isActive: false,
      },
    });

    return expirationCheck !== null;
  } catch (error) {
    console.error('Error checking expiration status:', error);
    return false;
  }
}

/**
 * Main function to expire all memberships
 * This should be called automatically on January 1st
 */
export async function expireAllMemberships(): Promise<ExpirationResult> {
  try {
    // Check if we should run expiration
    if (!shouldRunExpiration()) {
      return {
        executed: false,
        alreadyExpired: false,
        message: 'Not January 1st - expiration will run automatically on January 1st at 12:01 AM',
        nextExpirationDate: getNextExpirationDate(),
      };
    }

    // Check if already expired this year
    const alreadyExpired = await hasExpiredThisYear();
    if (alreadyExpired) {
      return {
        executed: false,
        alreadyExpired: true,
        message: 'Memberships have already been expired this year',
        processedAt: new Date(),
      };
    }

    console.log('🔄 [Auto-Expiration] Starting annual membership expiration...');

    // Get count of active users before expiration
    const activeCount = await prisma.user.count({
      where: { isActive: true },
    });

    console.log(`📊 [Auto-Expiration] Found ${activeCount} active members to expire`);

    // Expire all active memberships
    const expiryDate = new Date(); // Current date (January 1st)
    
    const result = await prisma.user.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
        membershipExpiry: expiryDate,
      },
    });

    console.log(`✅ [Auto-Expiration] Successfully expired ${result.count} memberships`);

    return {
      executed: true,
      alreadyExpired: false,
      count: result.count,
      message: `Successfully expired ${result.count} memberships on January 1st, ${new Date().getFullYear()}`,
      processedAt: expiryDate,
      nextExpirationDate: getNextExpirationDate(),
    };

  } catch (error) {
    console.error('❌ [Auto-Expiration] Error expiring memberships:', error);
    throw new Error('Failed to expire memberships');
  }
}

/**
 * Manual trigger for admin - can be called any time
 * Bypasses the January 1st check
 */
export async function manualExpireAllMemberships(): Promise<ExpirationResult> {
  try {
    console.log('🔄 [Manual Expiration] Admin-triggered membership expiration...');

    const activeCount = await prisma.user.count({
      where: { isActive: true },
    });

    if (activeCount === 0) {
      return {
        executed: false,
        alreadyExpired: true,
        count: 0,
        message: 'No active memberships to expire',
        processedAt: new Date(),
      };
    }

    const expiryDate = new Date();
    
    const result = await prisma.user.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
        membershipExpiry: expiryDate,
      },
    });

    console.log(`✅ [Manual Expiration] Expired ${result.count} memberships`);

    return {
      executed: true,
      alreadyExpired: false,
      count: result.count,
      message: `Manually expired ${result.count} memberships`,
      processedAt: expiryDate,
    };

  } catch (error) {
    console.error('❌ [Manual Expiration] Error:', error);
    throw new Error('Failed to manually expire memberships');
  }
}

/**
 * Get expiration status information
 */
export async function getExpirationStatus() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  const activeCount = await prisma.user.count({
    where: { isActive: true },
  });

  const expiredThisYear = await hasExpiredThisYear();
  const nextExpirationDate = getNextExpirationDate();
  const isExpirationDay = shouldRunExpiration();

  return {
    currentYear,
    activeMembers: activeCount,
    expiredThisYear,
    isExpirationDay,
    nextExpirationDate,
    daysUntilExpiration: Math.ceil((nextExpirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  };
}
