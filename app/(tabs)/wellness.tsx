import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { Heart, BookOpen, Youtube, Instagram, Globe } from 'lucide-react-native';

const socialLinks = [
  {
    title: 'YouTube Channel',
    description: 'Watch educational videos about women\'s health',
    icon: Youtube,
    color: '#FF0000',
    url: 'https://www.youtube.com/@beawarewomanhealth/videos',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500',
  },
  {
    title: 'Instagram',
    description: 'Follow us for daily wellness tips and inspiration',
    icon: Instagram,
    color: '#E1306C',
    url: 'https://www.instagram.com/beawarewomanhealth/profilecard/?igsh=MWwzc254NHJmYms0eA==',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500',
  },
  {
    title: 'Blog',
    description: 'Read in-depth articles about women\'s health',
    icon: Globe,
    color: '#4CAF50',
    url: 'https://beawarewomenhealth.com/blogs/',
    thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500',
  },
];

export default function WellnessScreen() {
  const handleLinkPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const handleSaveAffirmation = () => {
    Alert.alert('Saved!', 'Your affirmation has been saved successfully.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wellness Hub</Text>
        <Text style={styles.subtitle}>Your daily dose of wellness</Text>
      </View>

      <View style={styles.dailyTipCard}>
        <View style={styles.tipIconContainer}>
          <Heart size={24} color="#FF6B8B" />
        </View>
        <Text style={styles.tipTitle}>Daily Health Tip</Text>
        <Text style={styles.tipText}>
          Stay hydrated! Drinking enough water can help reduce bloating and cramps during your period.
        </Text>
      </View>

      <View style={styles.affirmationCard}>
        <View style={styles.affirmationIconContainer}>
          <BookOpen size={24} color="#7CB9E8" />
        </View>
        <Text style={styles.affirmationTitle}>Today's Affirmation</Text>
        <Text style={styles.affirmationText}>
          "I honor my health and listen to my body."
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAffirmation}>
          <Text style={styles.saveButtonText}>Save Affirmation</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Connect & Learn</Text>
      <View style={styles.socialContainer}>
        {socialLinks.map((link) => (
          <TouchableOpacity
            key={link.title}
            style={styles.socialCard}
            onPress={() => handleLinkPress(link.url)}
          >
            <Image source={{ uri: link.thumbnail }} style={styles.socialBanner} />
            <View style={[styles.iconContainer, { backgroundColor: link.color }]}>
              <link.icon size={24} color="#FFF" />
            </View>
            <View style={styles.socialInfo}>
              <Text style={styles.socialTitle}>{link.title}</Text>
              <Text style={styles.socialDescription}>{link.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
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
  dailyTipCard: {
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
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B8B',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    lineHeight: 24,
  },
  affirmationCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#F0F7FF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  affirmationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  affirmationTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#7CB9E8',
    marginBottom: 8,
  },
  affirmationText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#7CB9E8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  socialContainer: {
    padding: 20,
  },
  socialCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  socialBanner: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  iconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  socialInfo: {
    padding: 20,
  },
  socialTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  socialDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
});
