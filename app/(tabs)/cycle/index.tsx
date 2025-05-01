import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { format, addDays, subDays, isBefore, isAfter, parseISO } from 'date-fns';
import { Bell, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCycleData } from '@/hooks/useCycleData';
import ErrorFallback from '@/components/ErrorFallback';

export default function CycleScreen() {
  const router = useRouter();
  const { entries, preferences, loading, error, settingUpPreferences, calculateNextPeriod, calculateOvulation, refresh } = useCycleData();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<{
    title: string;
    description: string;
    color: string;
  } | null>(null);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    updatePhaseInfo(day.dateString);
  };

  const updatePhaseInfo = (date: string) => {
    const selectedEntry = entries.find(entry => {
      const start = parseISO(entry.start_date);
      const end = parseISO(entry.end_date);
      const selected = parseISO(date);
      return !isBefore(selected, start) && !isAfter(selected, end);
    });

    if (selectedEntry) {
      if (selectedEntry.type === 'period') {
        setPhaseInfo({
          title: 'Menstrual Phase',
          description: 'This is your period. Take care of yourself and rest if needed.',
          color: '#FF6B8B',
        });
      } else if (selectedEntry.type === 'ovulation') {
        setPhaseInfo({
          title: 'Ovulation Phase',
          description: 'You are ovulating. This is your most fertile time.',
          color: '#4CAF50',
        });
      }
    } else {
      const nextOvulation = calculateOvulation();
      if (nextOvulation) {
        const ovulationDate = parseISO(nextOvulation);
        const selected = parseISO(date);
        const daysToOvulation = Math.abs(
          Math.ceil((ovulationDate.getTime() - selected.getTime()) / (1000 * 60 * 60 * 24))
        );

        if (daysToOvulation <= 5) {
          setPhaseInfo({
            title: 'Fertile Window',
            description: 'You are in your fertile window. Fertility is typically highest during these days.',
            color: '#FFC107',
          });
          return;
        }
      }

      setPhaseInfo({
        title: 'Follicular Phase',
        description: 'Your body is preparing for ovulation. This is a great time for high-energy activities!',
        color: '#666',
      });
    }
  };

  useEffect(() => {
    updatePhaseInfo(today);
  }, [entries]);

  const calculateMarkedDates = () => {
    const markedDates: Record<string, { marked: boolean; dotColor?: string; selected?: boolean; selectedColor?: string; textColor?: string }> = {};

    const sortedEntries = [...entries].sort((a, b) => 
      isBefore(parseISO(a.start_date), parseISO(b.start_date)) ? -1 : 1
    );

    sortedEntries.forEach(entry => {
      if (entry.type === 'period') {
        let currentDate = parseISO(entry.start_date);
        const endDate = parseISO(entry.end_date);

        while (!isAfter(currentDate, endDate)) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          markedDates[dateStr] = {
            marked: true,
            dotColor: '#FF6B8B',
          };
          currentDate = addDays(currentDate, 1);
        }
      }
    });

    sortedEntries.forEach(entry => {
      if (entry.type === 'ovulation') {
        markedDates[entry.start_date] = {
          marked: true,
          dotColor: '#4CAF50',
        };

        for (let i = 1; i <= 5; i++) {
          const date = format(subDays(parseISO(entry.start_date), i), 'yyyy-MM-dd');
          markedDates[date] = {
            marked: true,
            dotColor: '#FFC107',
          };
        }
      }
    });

    const nextPeriod = calculateNextPeriod();
    const nextOvulation = calculateOvulation();

    if (nextPeriod) {
      const periodStart = parseISO(nextPeriod);

      // Predicted period (5 days)
      for (let i = 0; i < 5; i++) {
        const dateStr = format(addDays(periodStart, i), 'yyyy-MM-dd');
        markedDates[dateStr] = {
          marked: true,
          dotColor: '#FF6B8B',
          textColor: '#FF6B8B',
        };
      }

      // PMS (5 days before period)
      for (let i = 1; i <= 5; i++) {
        const pmsDateStr = format(subDays(periodStart, i), 'yyyy-MM-dd');
        if (!markedDates[pmsDateStr]) {
          markedDates[pmsDateStr] = {
            marked: true,
            dotColor: '#9C27B0',
          };
        }
      }
    }

    if (nextOvulation) {
      const ovulationDate = format(parseISO(nextOvulation), 'yyyy-MM-dd');
      markedDates[ovulationDate] = {
        marked: true,
        dotColor: '#4CAF50',
        textColor: '#4CAF50',
      };
    }

    // Mark today
    markedDates[today] = {
      ...markedDates[today],
      selected: true,
      selectedColor: '#FF6B8B',
    };

    return markedDates;
  };

  if (error) {
    return <ErrorFallback errorMessage={error} onRetry={refresh} />;
  }

  if (settingUpPreferences) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Setting up your preferences...</Text>
      </View>
    );
  }

  if (!loading && !entries.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Cycle Tracker</Text>
              <Text style={styles.subtitle}>Track your menstrual cycle and ovulation</Text>
            </View>
          </View>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Welcome to Cycle Tracking!</Text>
          <Text style={styles.emptyDescription}>
            Start tracking your menstrual cycle to get personalized predictions and insights.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/cycle/log-period')}>
            <Text style={styles.startButtonText}>Log Your First Period</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Cycle Tracker</Text>
            <Text style={styles.subtitle}>Track your menstrual cycle and ovulation</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/cycle/settings')}>
              <Settings size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <RNCalendar
        style={styles.calendar}
        theme={{
          calendarBackground: '#FFF',
          textSectionTitleColor: '#666',
          selectedDayBackgroundColor: '#FF6B8B',
          selectedDayTextColor: '#FFF',
          todayTextColor: '#FF6B8B',
          dayTextColor: '#333',
          textDisabledColor: '#D9E1E8',
          dotColor: '#FF6B8B',
          monthTextColor: '#333',
          textMonthFontFamily: 'Inter-SemiBold',
          textDayFontFamily: 'Inter-Regular',
          textDayHeaderFontFamily: 'Inter-SemiBold',
        }}
        markedDates={calculateMarkedDates()}
        onDayPress={handleDayPress}
        enableSwipeMonths={true}
      />

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#FF6B8B' }]} />
            <Text style={styles.legendText}>Period</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Ovulation</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>Fertile Window</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#9C27B0' }]} />
            <Text style={styles.legendText}>PMS</Text>
          </View>
        </View>
      </View>

      {phaseInfo && (
        <View style={[styles.phaseInfo, { borderLeftColor: phaseInfo.color }]}>
          <Text style={[styles.phaseTitle, { color: phaseInfo.color }]}>{phaseInfo.title}</Text>
          <Text style={styles.phaseDescription}>{phaseInfo.description}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/cycle/log-period')}>
        <Text style={styles.addButtonText}>Log Period</Text>
      </TouchableOpacity>
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
    marginTop: 50,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#FF6B8B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  calendar: {
    marginHorizontal: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  legend: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  phaseInfo: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
  },
  phaseTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  phaseDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  addButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FF6B8B',
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});