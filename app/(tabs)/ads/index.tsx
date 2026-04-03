import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ImageBackground } from 'react-native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { WebAdsterraSmartLink } from '../../../components/WebAdsterraSmartLink';
import { Play, Gift, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const isWeb = Platform.OS === 'web';

export default function AdsPage() {
  const { t } = useLanguage();

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1598124146163-36819847286d?q=80&w=2070&auto=format&fit=crop' }}
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Play color="#FFD700" size={32} />
            <Text style={styles.title}>{t.ads}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Gift color="#FFD700" size={24} />
              <Text style={styles.cardTitle}>{t.adsEarnFlowers}</Text>
            </View>
            <Text style={styles.cardDescription}>
              {t.adsEarnFlowersDesc}
            </Text>

            <View style={styles.adContainer}>
              {isWeb ? (
                <WebAdsterraSmartLink />
              ) : (
                <View style={styles.mobilePlaceholder}>
                  <Info color="#8B4513" size={48} />
                  <Text style={styles.placeholderText}>
                    Ads are currently optimized for Web.
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Info color="#FFD700" size={20} />
            <Text style={styles.infoText}>
              Watching ads helps support the game and keeps it free for everyone!
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 248, 220, 0.9)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B4513',
  },
  cardDescription: {
    fontSize: 16,
    color: '#5D4037',
    lineHeight: 22,
    marginBottom: 20,
  },
  adContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mobilePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 15,
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    gap: 10,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
    fontStyle: 'italic',
  },
});
