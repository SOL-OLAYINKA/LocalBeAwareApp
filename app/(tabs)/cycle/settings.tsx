import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Platform, Alert, Modal } from 'react-native';
import { Bell, Clock, Calendar, Volume2, ChevronRight } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useCycleData } from '@/hooks/useCycleData';
import { fonts } from '@/lib/fonts';

// Sound options for notifications
const NOTIFICATION_SOUNDS = [
  { id: 'gentle', name: 'Gentle Bell', file: 'GentleBell.mp3' },
  { id: 'chime', name: 'Chime Breeze', file: 'ChimeBreeze.mp3' },
  { id: 'soft', name: 'Soft Pulse', file: 'SoftPulse.mp3' },
  { id: 'none', name: 'No Sound', file: null },
];


async function playSound(file: string) {
  if (!file) return;
  try {
    const { sound } = await Audio.Sound.createAsync(require(`@/assets/sounds/${file}`));
    await sound.playAsync();
  } catch (err) {
    console.warn('Failed to play sound:', err);
  }
}

export default function CycleSettingsScreen() {
  const { preferences, updatePreferences, loading, error } = useCycleData();
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [selectedSoundType, setSelectedSoundType] = useState<string | null>(null);

  const handleToggleNotification = async (key: 'notify_period_reminder' | 'notify_ovulation_reminder' | 'notify_log_reminder') => {
    try {
      if (!preferences[key]) {
        if (Platform.OS !== 'web') {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(
              'Permission Required',
              'Please enable notifications in your device settings to receive reminders.',
              [{ text: 'OK' }]
            );
            return;
          }
        }
      }

      await updatePreferences({
        ...preferences,
        [key]: !preferences[key],
      });

      if (Platform.OS !== 'web') {
        if (!preferences[key]) {
          await scheduleNotification(key);
        } else {
          await cancelNotification(key);
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update notification settings. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const scheduleNotification = async (type: string) => {
    if (Platform.OS === 'web') return;

    try {
      let trigger;
      let title;
      let body;

      switch (type) {
        case 'notify_period_reminder':
          trigger = { seconds: 172800, repeats: true };
          title = "Period Reminder";
          body = "Your period may start in 2 days";
          break;
        case 'notify_ovulation_reminder':
          trigger = { seconds: 86400, repeats: true };
          title = "Ovulation Day";
          body = "Today is your predicted ovulation day";
          break;
        case 'notify_log_reminder':
          const [hours, minutes] = preferences.notification_time.split(':');
          trigger = {
            hour: parseInt(hours, 10),
            minute: parseInt(minutes, 10),
            repeats: true
          };
          title = "Daily Log Reminder";
          body = "Remember to track your symptoms today";
          break;
      }

      const soundFile = getSoundFileForType(type);
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: soundFile,
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  };

  const cancelNotification = async (type: string) => {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelScheduledNotificationAsync(type);
    } catch (error) {
      console.error('Error canceling notification:', error);
      throw error;
    }
  };

  const getSoundFileForType = (type: string) => {
    switch (type) {
      case 'notify_period_reminder':
        return preferences.notification_sound_period;
      case 'notify_ovulation_reminder':
        return preferences.notification_sound_ovulation;
      case 'notify_log_reminder':
        return preferences.notification_sound_log;
      default:
        return 'default';
    }
  };

  const handleSoundSelect = async (soundFile: string | null) => {
    if (!selectedSoundType) return;

    const soundKey = `notification_sound_${selectedSoundType.split('_')[1]}` as keyof typeof preferences;
    
    try {
      await updatePreferences({
        ...preferences,
        [soundKey]: soundFile || 'default',
      });

      // Play sound preview if on native platform
      if (Platform.OS !== 'web' && soundFile) {
        // Here you would implement sound preview
        // This requires additional setup with expo-av
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update notification sound. Please try again.',
        [{ text: 'OK' }]
      );
    }

    setShowSoundPicker(false);
    setSelectedSoundType(null);
  };

  const openSoundPicker = (type: string) => {
    setSelectedSoundType(type);
    setShowSoundPicker(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell size={24} color="#FF6B8B" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Period Reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified 2 days before your predicted period
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.notify_period_reminder}
            onValueChange={() => handleToggleNotification('notify_period_reminder')}
            trackColor={{ false: '#D9D9D9', true: '#FFB6C1' }}
            thumbColor={preferences.notify_period_reminder ? '#FF6B8B' : '#F4F4F4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Calendar size={24} color="#FF6B8B" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Ovulation Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified on your predicted ovulation day
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.notify_ovulation_reminder}
            onValueChange={() => handleToggleNotification('notify_ovulation_reminder')}
            trackColor={{ false: '#D9D9D9', true: '#FFB6C1' }}
            thumbColor={preferences.notify_ovulation_reminder ? '#FF6B8B' : '#F4F4F4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Clock size={24} color="#FF6B8B" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Daily Log Reminder</Text>
              <Text style={styles.settingDescription}>
                Reminder to track your symptoms daily
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.notify_log_reminder}
            onValueChange={() => handleToggleNotification('notify_log_reminder')}
            trackColor={{ false: '#D9D9D9', true: '#FFB6C1' }}
            thumbColor={preferences.notify_log_reminder ? '#FF6B8B' : '#F4F4F4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sound Settings</Text>
        {preferences.notify_period_reminder && (
          <TouchableOpacity 
            style={styles.soundItem}
            onPress={() => openSoundPicker('notify_period_reminder')}>
            <View style={styles.settingInfo}>
              <Volume2 size={24} color="#FF6B8B" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Period Alert Sound</Text>
                <Text style={styles.settingDescription}>
                  {NOTIFICATION_SOUNDS.find(s => s.file === preferences.notification_sound_period)?.name || 'Default Sound'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>
        )}

        {preferences.notify_ovulation_reminder && (
          <TouchableOpacity 
            style={styles.soundItem}
            onPress={() => openSoundPicker('notify_ovulation_reminder')}>
            <View style={styles.settingInfo}>
              <Volume2 size={24} color="#FF6B8B" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Ovulation Alert Sound</Text>
                <Text style={styles.settingDescription}>
                  {NOTIFICATION_SOUNDS.find(s => s.file === preferences.notification_sound_ovulation)?.name || 'Default Sound'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>
        )}

        {preferences.notify_log_reminder && (
          <TouchableOpacity 
            style={styles.soundItem}
            onPress={() => openSoundPicker('notify_log_reminder')}>
            <View style={styles.settingInfo}>
              <Volume2 size={24} color="#FF6B8B" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Daily Reminder Sound</Text>
                <Text style={styles.settingDescription}>
                  {NOTIFICATION_SOUNDS.find(s => s.file === preferences.notification_sound_log)?.name || 'Default Sound'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showSoundPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSoundPicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Sound</Text>
            {NOTIFICATION_SOUNDS.map((sound) => (
              <TouchableOpacity
                key={sound.id}
                style={styles.soundOption}
                onPress={() => handleSoundSelect(sound.file)}>
                <Text style={styles.soundOptionText}>{sound.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSoundPicker(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Notifications will be sent at appropriate times based on your cycle data and preferences.
          {Platform.OS === 'web' && (
            <Text>
              {'\n'}Note: Notifications are not supported in web browsers.
            </Text>
          )}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: '#FF4B4B',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#333',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#666',
    marginTop: 2,
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#FFF5F7',
    margin: 20,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#666',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  soundOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  soundOptionText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: '#333',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#FF6B8B',
    textAlign: 'center',
  },
});