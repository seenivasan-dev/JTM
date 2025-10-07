import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

interface Renewal {
  id: string;
  user: {
    name: string;
    email: string;
    membershipNumber: string;
  };
  membershipType: string;
  paymentMethod: string;
  paymentReference: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  familyMembers?: Array<{
    name: string;
    relationship: string;
  }>;
  notes?: string;
  adminNotes?: string;
}

interface RenewalManagementMobileProps {
  initialRenewals: Renewal[];
  onProcessRenewal: (renewalId: string, action: 'approve' | 'reject', notes?: string) => Promise<void>;
  onSendReminders: () => Promise<{ sentCount: number; totalMembers: number }>;
}

export default function RenewalManagementMobile({
  initialRenewals,
  onProcessRenewal,
  onSendReminders,
}: RenewalManagementMobileProps) {
  const [renewals, setRenewals] = useState(initialRenewals);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  const filteredRenewals = renewals.filter(renewal => {
    if (statusFilter === 'all') return true;
    return renewal.status.toLowerCase() === statusFilter;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh - in real app, this would refetch data
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleProcessRenewal = async (renewal: Renewal, action: 'approve' | 'reject') => {
    Alert.alert(
      `${action === 'approve' ? 'Approve' : 'Reject'} Renewal`,
      `Are you sure you want to ${action} this renewal request for ${renewal.user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Reject',
          style: action === 'approve' ? 'default' : 'destructive',
          onPress: async () => {
            setIsProcessing(renewal.id);
            try {
              await onProcessRenewal(renewal.id, action);
              
              // Update local state
              setRenewals(prev =>
                prev.map(r =>
                  r.id === renewal.id
                    ? { ...r, status: action.toUpperCase() as 'APPROVED' | 'REJECTED' }
                    : r
                )
              );
              
              Alert.alert('Success', `Renewal request ${action}d successfully!`);
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} renewal request.`);
            } finally {
              setIsProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleSendReminders = async () => {
    Alert.alert(
      'Send Renewal Reminders',
      'This will send reminder emails to members whose renewals are due. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reminders',
          onPress: async () => {
            setIsSendingReminders(true);
            try {
              const result = await onSendReminders();
              Alert.alert(
                'Reminders Sent',
                `Successfully sent ${result.sentCount} reminders to ${result.totalMembers} members.`
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to send renewal reminders.');
            } finally {
              setIsSendingReminders(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FFA500';
      case 'APPROVED':
        return '#28A745';
      case 'REJECTED':
        return '#DC3545';
      default:
        return '#6C757D';
    }
  };

  const getStatusCounts = () => {
    return {
      total: renewals.length,
      pending: renewals.filter(r => r.status === 'PENDING').length,
      approved: renewals.filter(r => r.status === 'APPROVED').length,
      rejected: renewals.filter(r => r.status === 'REJECTED').length,
    };
  };

  const statusCounts = getStatusCounts();

  const renderRenewalCard = ({ item: renewal }: { item: Renewal }) => (
    <View style={styles.renewalCard}>
      {/* Header with user info and status */}
      <View style={styles.renewalHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{renewal.user.name}</Text>
          <Text style={styles.userEmail}>{renewal.user.email}</Text>
          <Text style={styles.membershipNumber}>#{renewal.user.membershipNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(renewal.status) }]}>
          <Text style={styles.statusText}>{renewal.status}</Text>
        </View>
      </View>

      {/* Renewal details */}
      <View style={styles.renewalDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Membership Type:</Text>
          <Text style={styles.detailValue}>{renewal.membershipType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method:</Text>
          <Text style={styles.detailValue}>{renewal.paymentMethod}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Reference:</Text>
          <Text style={styles.detailValue}>{renewal.paymentReference}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Submitted:</Text>
          <Text style={styles.detailValue}>
            {new Date(renewal.submittedAt).toLocaleDateString()}
          </Text>
        </View>

        {renewal.familyMembers && renewal.familyMembers.length > 0 && (
          <View style={styles.familySection}>
            <Text style={styles.familyTitle}>Family Members ({renewal.familyMembers.length}):</Text>
            {renewal.familyMembers.map((member, index) => (
              <Text key={index} style={styles.familyMember}>
                • {member.name} ({member.relationship})
              </Text>
            ))}
          </View>
        )}

        {renewal.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Member Notes:</Text>
            <Text style={styles.notesText}>{renewal.notes}</Text>
          </View>
        )}

        {renewal.adminNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Admin Notes:</Text>
            <Text style={styles.notesText}>{renewal.adminNotes}</Text>
          </View>
        )}
      </View>

      {/* Action buttons for pending renewals */}
      {renewal.status === 'PENDING' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleProcessRenewal(renewal, 'approve')}
            disabled={isProcessing === renewal.id}
          >
            {isProcessing === renewal.id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.actionButtonText}>Approve</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleProcessRenewal(renewal, 'reject')}
            disabled={isProcessing === renewal.id}
          >
            {isProcessing === renewal.id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.actionButtonText}>Reject</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Renewal Management</Text>
        <TouchableOpacity
          style={styles.reminderButton}
          onPress={handleSendReminders}
          disabled={isSendingReminders}
        >
          {isSendingReminders ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.reminderButtonText}>Send Reminders</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{statusCounts.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#FFA500' }]}>{statusCounts.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#28A745' }]}>{statusCounts.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#DC3545' }]}>{statusCounts.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === status && styles.filterButtonTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Renewals list */}
      <FlatList
        data={filteredRenewals}
        renderItem={renderRenewalCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No {statusFilter === 'all' ? '' : statusFilter} renewal requests found.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  reminderButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  reminderButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    padding: 15,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    padding: 5,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  renewalCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  renewalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  membershipNumber: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  renewalDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  familySection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  familyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  familyMember: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  notesSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#28A745',
  },
  rejectButton: {
    backgroundColor: '#DC3545',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});