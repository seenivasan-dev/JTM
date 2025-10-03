// JTM Mobile - Member Management Screen
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native'

interface Member {
  id: string
  name: string
  email: string
  membershipType: string
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  expiryDate: string
}

interface MemberManagementScreenProps {
  navigation?: any
}

export default function MemberManagementScreen({ navigation }: MemberManagementScreenProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    loadMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchQuery, statusFilter])

  const loadMembers = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/members')
      // const data = await response.json()
      // setMembers(data)
      
      // Mock data for now
      setTimeout(() => {
        const mockMembers: Member[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@email.com',
            membershipType: 'Family',
            status: 'active',
            joinDate: '2024-01-15',
            expiryDate: '2025-01-15',
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            membershipType: 'Individual',
            status: 'active',
            joinDate: '2024-02-20',
            expiryDate: '2025-02-20',
          },
          {
            id: '3',
            name: 'Mike Wilson',
            email: 'mike.w@email.com',
            membershipType: 'Student',
            status: 'pending',
            joinDate: '2024-12-01',
            expiryDate: '2025-12-01',
          },
          {
            id: '4',
            name: 'Lisa Davis',
            email: 'lisa.davis@email.com',
            membershipType: 'Family',
            status: 'inactive',
            joinDate: '2023-06-10',
            expiryDate: '2024-06-10',
          },
          {
            id: '5',
            name: 'David Brown',
            email: 'david.brown@email.com',
            membershipType: 'Individual',
            status: 'active',
            joinDate: '2024-03-15',
            expiryDate: '2025-03-15',
          },
        ]
        setMembers(mockMembers)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error loading members:', error)
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        member =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    setFilteredMembers(filtered)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadMembers()
    setRefreshing(false)
  }

  const handleMemberAction = (member: Member, action: 'view' | 'activate' | 'deactivate' | 'delete') => {
    switch (action) {
      case 'view':
        setSelectedMember(member)
        setModalVisible(true)
        break
      case 'activate':
        Alert.alert(
          'Activate Member',
          `Are you sure you want to activate ${member.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Activate', onPress: () => updateMemberStatus(member.id, 'active') },
          ]
        )
        break
      case 'deactivate':
        Alert.alert(
          'Deactivate Member',
          `Are you sure you want to deactivate ${member.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Deactivate', onPress: () => updateMemberStatus(member.id, 'inactive') },
          ]
        )
        break
      case 'delete':
        Alert.alert(
          'Delete Member',
          `Are you sure you want to delete ${member.name}? This action cannot be undone.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteMember(member.id) },
          ]
        )
        break
    }
  }

  const updateMemberStatus = async (memberId: string, newStatus: 'active' | 'inactive') => {
    try {
      // TODO: API call to update member status
      // await fetch(`/api/admin/members/${memberId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status: newStatus })
      // })
      
      // Update local state for now
      setMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, status: newStatus } : member
        )
      )
      
      Alert.alert('Success', `Member status updated to ${newStatus}`)
    } catch (error) {
      Alert.alert('Error', 'Failed to update member status')
    }
  }

  const deleteMember = async (memberId: string) => {
    try {
      // TODO: API call to delete member
      // await fetch(`/api/admin/members/${memberId}`, { method: 'DELETE' })
      
      // Update local state for now
      setMembers(prev => prev.filter(member => member.id !== memberId))
      
      Alert.alert('Success', 'Member deleted successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to delete member')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981'
      case 'pending':
        return '#f59e0b'
      case 'inactive':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const FilterButton = ({ title, value, active }: { title: string; value: string; active: boolean }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={() => setStatusFilter(value as any)}
    >
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  )

  const MemberCard = ({ member }: { member: Member }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => handleMemberAction(member, 'view')}
    >
      <View style={styles.memberHeader}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberEmail}>{member.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(member.status) }]}>
          <Text style={styles.statusText}>{member.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.memberDetails}>
        <Text style={styles.membershipType}>{member.membershipType} Membership</Text>
        <Text style={styles.memberDate}>
          Expires: {new Date(member.expiryDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        {member.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => handleMemberAction(member, 'activate')}
          >
            <Text style={styles.actionButtonText}>Activate</Text>
          </TouchableOpacity>
        )}
        
        {member.status === 'active' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
            onPress={() => handleMemberAction(member, 'deactivate')}
          >
            <Text style={styles.actionButtonText}>Deactivate</Text>
          </TouchableOpacity>
        )}
        
        {member.status === 'inactive' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => handleMemberAction(member, 'activate')}
          >
            <Text style={styles.actionButtonText}>Reactivate</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
          onPress={() => handleMemberAction(member, 'delete')}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Member Management</Text>
        <Text style={styles.headerSubtitle}>
          {filteredMembers.length} of {members.length} members
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search members by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <FilterButton title="All" value="all" active={statusFilter === 'all'} />
          <FilterButton title="Active" value="active" active={statusFilter === 'active'} />
          <FilterButton title="Pending" value="pending" active={statusFilter === 'pending'} />
          <FilterButton title="Inactive" value="inactive" active={statusFilter === 'inactive'} />
        </ScrollView>
      </View>

      {/* Members List */}
      <ScrollView
        style={styles.membersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredMembers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No members found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Members will appear here once they register'}
            </Text>
          </View>
        ) : (
          filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))
        )}
      </ScrollView>

      {/* Member Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMember && (
              <>
                <Text style={styles.modalTitle}>Member Details</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedMember.name}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedMember.email}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Membership:</Text>
                  <Text style={styles.detailValue}>{selectedMember.membershipType}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, { color: getStatusColor(selectedMember.status) }]}>
                    {selectedMember.status.toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Join Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedMember.joinDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Expiry Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedMember.expiryDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    backgroundColor: '#dc2626',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fecaca',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#dc2626',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  membersList: {
    flex: 1,
    padding: 16,
  },
  memberCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  memberEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberDetails: {
    marginBottom: 12,
  },
  membershipType: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  memberDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
  },
  closeButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
})