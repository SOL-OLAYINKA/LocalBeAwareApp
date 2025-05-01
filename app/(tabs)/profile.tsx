import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { Award, Bell, Calendar, Heart, History, Moon, Settings } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const mockUser = {
  name: 'Sarah Johnson',
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500',
  cycleSummary: {
    averageCycle: 28,
    daysTracked: 15,
    lastPeriod: '2024-02-15',
  },
  recentSymptoms: [
    {
      id: 'log-1',
      date: '2024-02-27',
      mood: 'Calm',
      symptoms: ['Mild cramps', 'Fatigue'],
    },
    {
      id: 'log-2',
      date: '2024-02-26',
      mood: 'Energetic',
      symptoms: ['Bloating'],
    },
    {
      id: 'log-3',
      date: '2024-02-25',
      mood: 'Anxious',
      symptoms: ['Headache', 'Insomnia'],
    },
  ],
  savedAffirmations: [
    {
      id: 'aff-1',
      text: "I am in tune with my body's natural rhythm",
      savedAt: '2024-02-27',
    },
    {
      id: 'aff-2',
      text: 'My well-being is a priority, and I honor it daily',
      savedAt: '2024-02-26',
    },
    {
      id: 'aff-3',
      text: 'I embrace my cycles with grace and understanding',
      savedAt: '2024-02-25',
    },
  ],
  streakDays: 7,
};

export default function ProfileScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    symptoms: true,
    period: true,
    affirmations: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{mockUser.name}</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Settings size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statCard}>
          <Calendar size={24} color="#FF6B8B" />
          <Text style={styles.statValue}>{mockUser.cycleSummary.averageCycle}</Text>
          <Text style={styles.statLabel}>Avg. Cycle</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.statCard}>
          <History size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{mockUser.cycleSummary.daysTracked}</Text>
          <Text style={styles.statLabel}>Days Tracked</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.statCard}>
          <Heart size={24} color="#FF6B8B" />
          <Text style={styles.statValue}>{mockUser.savedAffirmations.length}</Text>
          <Text style={styles.statLabel}>Affirmations</Text>
        </Animated.View>
      </View>

      {/* Streak Card */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Award size={32} color="#FFD700" />
          <View style={styles.streakInfo}>
            <Text style={styles.streakTitle}>Wellness Streak</Text>
            <Text style={styles.streakCount}>{mockUser.streakDays} Days</Text>
          </View>
        </View>
        <View style={styles.streakProgress}>
          <View style={[styles.progressBar, { width: `${Math.min((mockUser.streakDays / 10) * 100, 100)}%` }]} />
        </View>
        <Text style={styles.streakMessage}>
          Keep going! You're building healthy habits. 🌟
        </Text>
      </Animated.View>

      {/* Recent Symptoms */}
      <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Symptoms</Text>
        {mockUser.recentSymptoms.map((log) => (
          <View key={log.id} style={styles.symptomLog}>
            <Text style={styles.logDate}>{log.date}</Text>
            <View style={styles.logDetails}>
              <Text style={styles.logMood}>Mood: {log.mood}</Text>
              <Text style={styles.logSymptoms}>{log.symptoms.join(', ')}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* Saved Affirmations */}
      <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Affirmations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.affirmationsScroll}>
          {mockUser.savedAffirmations.map((affirmation) => (
            <View key={affirmation.id} style={styles.affirmationCard}>
              <Text style={styles.affirmationText}>{affirmation.text}</Text>
              <Text style={styles.affirmationDate}>{affirmation.savedAt}</Text>
              <TouchableOpacity style={styles.heartButton}>
                <Heart size={20} color="#FF6B8B" fill="#FF6B8B" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Notification Settings */}
      <Animated.View entering={FadeInDown.delay(700)} style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.notificationSettings}>
          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Bell size={24} color="#FF6B8B" />
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>Symptom Reminders</Text>
                <Text style={styles.notificationDescription}>
                  Daily reminders to log your symptoms
                </Text>
              </View>
            </View>
            <Switch
              value={notifications.symptoms}
              onValueChange={() => toggleNotification('symptoms')}
              trackColor={{ false: '#D9D9D9', true: '#FFB6C1' }}
              thumbColor={notifications.symptoms ? '#FF6B8B' : '#F4F4F4'}
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Calendar size={24} color="#FF6B8B" />
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>Period Alerts</Text>
                <Text style={styles.notificationDescription}>
                  Get notified before your period starts
                </Text>
              </View>
            </View>
            <Switch
              value={notifications.period}
              onValueChange={() => toggleNotification('period')}
              trackColor={{ false: '#D9D9D9', true: '#FFB6C1' }}
              thumbColor={notifications.period ? '#FF6B8B' : '#F4F4F4'}
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Moon size={24} color="#FF6B8B" />
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>Daily Affirmations</Text>
                <Text style={styles.notificationDescription}>
                  Start your day with positivity
                </Text>
              </View>
            </View>
            <Switch
              value={notifications.affirmations}
              onValueChange={() => toggleNotification('affirmations')}
              trackColor={{ false: '#D9D9D9', true: '#FFB6C1' }}
              thumbColor={notifications.affirmations ? '#FF6B8B' : '#F4F4F4'}
            />
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 100,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  streakCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF5F7',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakInfo: {
    marginLeft: 12,
  },
  streakTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  streakCount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FF6B8B',
  },
  streakProgress: {
    height: 8,
    backgroundColor: '#FFE5EB',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FF6B8B',
    borderRadius: 4,
  },
  streakMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 15,
  },
  symptomLog: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logDate: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B8B',
    marginBottom: 4,
  },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logMood: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  logSymptoms: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  affirmationsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  affirmationCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    marginRight: 15,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  affirmationText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  affirmationDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  heartButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  notificationSettings: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  notificationText: {
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
});