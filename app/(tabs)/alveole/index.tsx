import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useGame, ALVEOLE_LEVELS } from "../../../contexts/GameContext";
import { useLanguage } from "../../../contexts/LanguageContext";

const isWeb = Platform.OS === "web";
const MAX_WEB_WIDTH = 600;

export default function AlveoleScreen() {
  const insets = useSafeAreaInsets();
  const {
    honey,
    sellHoney,
    isLoaded,
    flowers,
    alveoles,
    buyAlveole,
    getMaxCapacity,
  } = useGame();
  const { t } = useLanguage();

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  const formatNumber = (num: number) => {
    if (Math.abs(num) < 1) {
      return num.toFixed(5);
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toFixed(0);
  };

  const handleQuickSell = (percentage: number) => {
    // Cap amount to available honey to prevent sync issues
    const calculatedAmount = Math.floor(honey * percentage);
    const amount = Math.min(calculatedAmount, Math.floor(honey));
    
    const performSell = () => {
      sellHoney(amount).then((success) => {
        if (success) {
          if (Platform.OS === 'web') {
            window.alert(`${t.sold}\n\n${t.transactionSuccess}`);
          } else {
            Alert.alert(t.sold, t.transactionSuccess);
          }
        } else {
          if (Platform.OS === 'web') {
            window.alert(`${t.error}\n\n${t.transactionFailed}`);
          } else {
            Alert.alert(t.error, t.transactionFailed);
          }
        }
      });
    };

    if (amount < 1) {
      const msg = `${t.insufficientHoney}\n\nVous avez besoin d'au moins 1 miel (USDT) pour vendre.`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert(t.insufficientHoney, "Vous avez besoin d'au moins 1 miel (USDT) pour vendre.");
      }
      return;
    }

    // 1 miel = 1 diamant + 0.001 fleurs + 0.005 BVR par miel
    const diamondsEarned = Math.floor(amount);
    const flowersEarned = amount * 0.001;
    const bvrEarned = amount * 0.005;

    const confirmMsg = `${t.sellHoney} ${formatNumber(amount)} ${t.honey.toLowerCase()} (USDT) (${
      percentage * 100
    }%) pour:\n\n💎 ${diamondsEarned} ${t.diamonds.toLowerCase()}\n🌸 ${flowersEarned.toFixed(2)} ${t.flowers.toLowerCase()}\n🐝 ${bvrEarned.toFixed(2)} BVR\n\nConfirmer?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        performSell();
      }
    } else {
      Alert.alert(
        "Confirmation",
        confirmMsg,
        [
          { text: "Annuler", style: "cancel" },
          { text: "Confirmer", onPress: performSell }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#8B4513", "#A0522D", "#CD853F"]}
        style={styles.background}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + 20,
              maxWidth: isWeb ? MAX_WEB_WIDTH : undefined,
              width: "100%",
              alignSelf: "center",
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.sellHoney}</Text>
          </View>

          <View style={styles.sellCard}>
            <Text style={styles.sellTitle}>{t.honeyExchange}</Text>
            <Text style={styles.sellDescription}>{t.honeyExchangeRate}</Text>

            <View style={styles.quickSellButtons}>
              <TouchableOpacity
                style={styles.quickSellButton}
                onPress={() => handleQuickSell(0.25)}
              >
                <Text style={styles.quickSellButtonText}>25%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickSellButton}
                onPress={() => handleQuickSell(0.5)}
              >
                <Text style={styles.quickSellButtonText}>50%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickSellButton}
                onPress={() => handleQuickSell(0.75)}
              >
                <Text style={styles.quickSellButtonText}>75%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickSellButton}
                onPress={() => handleQuickSell(1)}
              >
                <Text style={styles.quickSellButtonText}>100%</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sellButton}
              onPress={handleQuickSell.bind(null, 1)}
            >
              <Text style={styles.sellButtonText}>{t.sellAllHoney}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.alveoleLevels}</Text>
          </View>

          {ALVEOLE_LEVELS.map((alveole) => {
            const isUnlocked = alveoles[alveole.level];
            const isCurrentLevel =
              isUnlocked && alveole.capacity === getMaxCapacity();

            return (
              <View key={alveole.level} style={styles.alveoleCard}>
                <View style={styles.alveoleHeader}>
                  <Text style={styles.alveoleLevel}>
                    {t.level} {alveole.level}
                  </Text>
                  {isUnlocked && (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedText}>{t.unlocked}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.alveoleCapacity}>
                  {t.capacity}: {formatNumber(alveole.capacity)}{" "}
                  {t.honey.toLowerCase()}
                </Text>

                {alveole.cost > 0 && (
                  <Text style={styles.alveoleCost}>
                    {t.cost}: {formatNumber(alveole.cost)} 🌸
                  </Text>
                )}

                {!isUnlocked && (
                  <TouchableOpacity
                    style={[
                      styles.unlockButton,
                      flowers < alveole.cost && styles.unlockButtonDisabled,
                    ]}
                    onPress={async () => {
                      const success = await buyAlveole(alveole.level);
                      if (success) {
                        if (Platform.OS === 'web') {
                          window.alert(
                            `${t.success}\n\n${t.alveoleUnlocked.replace(
                              "{level}",
                              alveole.level.toString()
                            )}`
                          );
                        } else {
                          const { Alert } = require('react-native');
                          Alert.alert(t.success, t.alveoleUnlocked.replace("{level}", alveole.level.toString()));
                        }
                      } else {
                        if (Platform.OS === 'web') {
                          window.alert(
                            `${t.insufficientFlowers}\n\n${t.needFlowers.replace(
                              "{amount}",
                              formatNumber(alveole.cost)
                            )}`
                          );
                        } else {
                          const { Alert } = require('react-native');
                          Alert.alert(t.insufficientFlowers, t.needFlowers.replace("{amount}", formatNumber(alveole.cost)));
                        }
                      }
                    }}
                    disabled={flowers < alveole.cost}
                  >
                    <Text style={styles.unlockButtonText}>{t.unlock}</Text>
                  </TouchableOpacity>
                )}

                {isCurrentLevel && (
                  <View style={styles.currentLevelBadge}>
                    <Text style={styles.currentLevelText}>
                      {t.currentLevel}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8B4513",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#FFD700",
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isWeb ? 24 : 20,
  },

  sectionHeader: {
    marginTop: 30,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#FFD700",
  },

  sellCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sellTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#8B4513",
    marginBottom: 8,
    textAlign: "center",
  },
  sellDescription: {
    fontSize: 14,
    color: "#8B4513",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  quickSellButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  quickSellButton: {
    flex: 1,
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  quickSellButtonText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#8B4513",
  },
  sellButton: {
    backgroundColor: "#32CD32",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sellButtonText: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#fff",
  },

  alveoleCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  alveoleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  alveoleLevel: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#8B4513",
  },
  unlockedBadge: {
    backgroundColor: "#32CD32",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#fff",
  },
  alveoleCapacity: {
    fontSize: 16,
    color: "#8B4513",
    marginBottom: 8,
  },
  alveoleCost: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 12,
  },
  unlockButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  unlockButtonDisabled: {
    backgroundColor: "#CCC",
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#8B4513",
  },
  currentLevelBadge: {
    backgroundColor: "#4169E1",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  currentLevelText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
