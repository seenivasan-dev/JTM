// JTM Mobile - Analytics Screen (Placeholder)
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native'

interface AnalyticsScreenProps {
  navigation?: any
}

export default function AnalyticsScreen({ navigation }: AnalyticsScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>
          Community insights and reports
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>📊 Analytics Dashboard</Text>
          <Text style={styles.placeholderText}>
            This screen will show detailed analytics including:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Member growth trends</Text>
            <Text style={styles.featureItem}>• Membership type distribution</Text>
            <Text style={styles.featureItem}>• Renewal patterns</Text>
            <Text style={styles.featureItem}>• Event attendance statistics</Text>
            <Text style={styles.featureItem}>• Revenue analysis</Text>
            <Text style={styles.featureItem}>• Geographic distribution</Text>
          </View>
          <Text style={styles.comingSoon}>Coming Soon!</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  content: {
    padding: 20,
  },
  placeholderCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureList: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  comingSoon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'center',
  },
})