import { useGame } from "../../../contexts/GameContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  Image,
  Linking,
  Switch,
} from "react-native";
import { Power, Play } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const MAX_WEB_WIDTH = 600;

type AnimatedBee = {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
};

export default function HomeScreen() {
  const {
    honey,
    getTotalProduction,
    getTotalBees,
    getMaxCapacity,
    isLoaded,
    sellHoney,
    productionPaused,
    resumeProduction,
    toggleProduction,
  } = useGame();
  const { t } = useLanguage();
  const beesAnimated = useRef<AnimatedBee[]>([]);
  const [showStats, setShowStats] = useState<boolean>(false);

  useEffect(() => {
    if (isWeb) {
      // Inject Popunder script directly on web
      const script = document.createElement("script");
      script.src = "https://pl28951061.profitablecpmratenetwork.com/45/02/20/4502205103ed25db71eb6aa696f1338f.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  useEffect(() => {
    const totalBees = getTotalBees();
    const beesToShow = Math.min(totalBees, 14);

    beesAnimated.current = Array.from({ length: beesToShow }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * (width - 100) + 50),
      y: new Animated.Value(Math.random() * (height * 0.4) + height * 0.25),
    }));

    beesAnimated.current.forEach((bee) => {
      const animateBee = () => {
        const duration = 3000 + Math.random() * 2000;
        Animated.parallel([
          Animated.timing(bee.x, {
            toValue: Math.random() * (width - 100) + 50,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(bee.y, {
            toValue: Math.random() * (height * 0.4) + height * 0.25,
            duration,
            useNativeDriver: true,
          }),
        ]).start(() => animateBee());
      };
      animateBee();
    });
  }, [getTotalBees]);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  const openAdSmartLink = async () => {
    const SMART_LINK = "https://www.profitablecpmratenetwork.com/gt4rsy3c5e?key=805445ad63b0dd24d450c75c44fc9dd6";
    console.log("Attempting to open ad:", SMART_LINK);
    
    try {
      if (isWeb) {
        // Direct window.open is often most reliable on web
        window.open(SMART_LINK, "_blank");
      } else {
        // Use WebBrowser for a better native experience
        await WebBrowser.openBrowserAsync(SMART_LINK);
      }
    } catch (err) {
      console.error("Error opening ad link:", err);
      // Fallback to Linking
      Linking.openURL(SMART_LINK).catch(() => {});
    }
  };

  const formatNumber = (num: any) => {
    const val = typeof num === "number" ? num : Number(num);
    if (isNaN(val) || val === null || val === undefined) {
      return "0";
    }
    if (val >= 1000000) {
      return (val / 1000000).toFixed(2) + "M";
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(2) + "K";
    }
    return val.toFixed(5);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/beeminor-new-logo.jpeg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={[styles.webContainer, { backgroundColor: "transparent" }]}>

        <View
          style={[styles.sceneContainer, { paddingTop: isWeb ? 20 : 40 }]}
        >
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowStats(true)}
          >
            <Text style={styles.infoButtonText}>🐝❓</Text>
          </TouchableOpacity>

          <View style={styles.beesContainer}>
            {beesAnimated.current.map((bee) => (
              <Animated.View
                key={bee.id}
                style={[
                  styles.bee,
                  {
                    transform: [{ translateX: bee.x }, { translateY: bee.y }],
                  },
                ]}
              >
                <Text style={styles.beeEmoji}>🐝</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <LinearGradient
          colors={["rgba(0,0,0,0)", "#fff9e6", "#fffaed"]}
          style={[
            styles.bottomGradient,
            {
              maxWidth: isWeb ? MAX_WEB_WIDTH : undefined,
              width: "100%",
              alignSelf: "center",
            },
          ]}
        >
          <View style={styles.honeyDisplayContainer}>
            <View style={styles.honeyDisplay}>
              <Text style={styles.honeyEmoji}>🍯</Text>
              <Text style={styles.honeyAmount}>{formatNumber(honey)} USDT</Text>
            </View>

            {/* Production Control Section */}
            <View style={styles.productionControl}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Power color={productionPaused ? "#FF4500" : "#32CD32"} size={20} />
                  <Text style={styles.toggleLabel}>
                    {productionPaused ? t.productionOff : t.productionOn}
                  </Text>
                </View>
                <Switch
                  value={!productionPaused}
                  onValueChange={(value) => {
                    toggleProduction(!value);
                  }}
                  trackColor={{ false: "#767577", true: "#FFD700" }}
                  thumbColor={!productionPaused ? "#FF8C00" : "#f4f3f4"}
                />
              </View>
            </View>
            
            <View style={styles.bottomButtonsRow}>
              <TouchableOpacity
                style={styles.sellButton}
                onPress={async () => {
                  // Trigger ad on button tap
                  openAdSmartLink();

                  const sellAmount = Math.floor(honey);
                  const diamondsPreview = sellAmount;
                  const flowersPreview = (sellAmount * 0.001).toFixed(2);
                  const bvrPreview = (sellAmount * 0.005).toFixed(2);
                  const message = `Vendre ${sellAmount.toLocaleString()} miel (USDT) pour:\n💎 ${diamondsPreview.toLocaleString()} diamants\n🌸 ${flowersPreview} fleurs\n🐝 ${bvrPreview} BVR\n\nConfirmer ?`;

                  const handleSell = async () => {
                    const success = await sellHoney(sellAmount);
                    if (success) {
                      const flowersGot = (sellAmount * 0.001).toFixed(2);
                      const bvrGot = (sellAmount * 0.005).toFixed(2);
                      const successMsg = `Vendu ! Vous avez reçu ${sellAmount.toLocaleString()} 💎 diamants, ${flowersGot} 🌸 fleurs et ${bvrGot} 🐝 BVR.`;
                      if (isWeb) {
                        window.alert(successMsg);
                      } else {
                        Alert.alert("Succès", successMsg);
                      }
                    } else {
                      if (isWeb) {
                        window.alert("Error: You need at least 1 miel (USDT) to sell!");
                      } else {
                        Alert.alert("Error", "You need at least 1 miel (USDT) to sell!");
                      }
                    }
                  };

                  if (isWeb) {
                    const confirmed = window.confirm(message);
                    if (confirmed) {
                      await handleSell();
                    }
                  } else {
                    Alert.alert(
                      "Sell Honey",
                      message,
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "OK", onPress: handleSell },
                      ],
                      { cancelable: false }
                    );
                  }
                }}
              >
                <Text style={styles.sellButtonText}>{t.sellHoney}</Text>
              </TouchableOpacity>

              {productionPaused && (
                <TouchableOpacity
                  style={styles.resumeProductionButton}
                  onPress={async () => {
                    await openAdSmartLink();
                    await resumeProduction();
                  }}
                >
                  <Play color="#FFF" size={18} />
                  <Text style={styles.resumeProductionText}>
                    {t.reactivate}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        <Modal
          visible={showStats}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStats(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowStats(false)}
          >
            <View style={styles.statsModal}>
              <Text style={styles.statsTitle}>{t.statistics}</Text>

              <View style={styles.statCardModal}>
                <Text style={styles.statLabelModal}>{t.totalProduction}</Text>
                <Text style={styles.statValueModal}>
                  {formatNumber(getTotalProduction())} 🍯/h
                </Text>
              </View>

              <View style={styles.statCardModal}>
                <Text style={styles.statLabelModal}>{t.totalBees}</Text>
                <Text style={styles.statValueModal}>{getTotalBees()}</Text>
              </View>

              <View style={styles.statCardModal}>
                <Text style={styles.statLabelModal}>{t.honeyPerSec}</Text>
                <Text style={styles.statValueModal}>
                  {formatNumber(getTotalProduction() / 3600)} 🍯/s
                </Text>
              </View>

              <View style={styles.statCardModal}>
                <Text style={styles.statLabelModal}>{t.maxCapacity}</Text>
                <Text style={styles.statValueModal}>
                  {formatNumber(getMaxCapacity())} 🍯
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowStats(false)}
              >
                <Text style={styles.closeButtonText}>{t.close}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  webContainer: {
    flex: 1,
    maxWidth: isWeb ? MAX_WEB_WIDTH : undefined,
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: isWeb ? 150 : 170,
    paddingBottom: isWeb ? 15 : 20,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#87CEEB",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#fff",
  },
  honeyDisplayContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isWeb ? 8 : 10,
    gap: 12,
  },
  bottomButtonsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  honeyDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.95)",
    paddingHorizontal: isWeb ? 16 : 20,
    paddingVertical: isWeb ? 8 : 10,
    borderRadius: isWeb ? 16 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: isWeb ? 2 : 3,
    borderColor: "#FFD700",
  },
  honeyEmoji: {
    fontSize: isWeb ? 28 : 32,
    marginRight: isWeb ? 6 : 8,
  },
  honeyAmount: {
    fontSize: isWeb ? 20 : 24,
    fontWeight: "bold" as const,
    color: "#8B4513",
  },
  sceneContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  beesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  bee: {
    position: "absolute",
  },
  beeEmoji: {
    fontSize: 28,
  },
  statsContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#FF8C00",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8B4513",
    textAlign: "center",
  },
  infoButton: {
    position: "absolute",
    top: isWeb ? 20 : 40,
    left: isWeb ? 15 : 20,
    backgroundColor: "rgba(255, 215, 0, 0.9)",
    borderRadius: isWeb ? 20 : 25,
    padding: isWeb ? 8 : 10,
    borderWidth: 2,
    borderColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  infoButtonText: {
    fontSize: isWeb ? 24 : 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statsModal: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: isWeb ? Math.min(width * 0.9, 400) : "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#8B4513",
    textAlign: "center",
    marginBottom: 20,
  },
  statCardModal: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  statLabelModal: {
    fontSize: 14,
    color: "#8B4513",
    opacity: 0.8,
    marginBottom: 4,
  },
  statValueModal: {
    fontSize: 22,
    fontWeight: "bold" as const,
    color: "#8B4513",
  },
  closeButton: {
    backgroundColor: "#FF8C00",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#FFF",
    textAlign: "center",
  },
  sellButton: {
    backgroundColor: "#FF8C00",
    paddingHorizontal: isWeb ? 16 : 20,
    paddingVertical: isWeb ? 8 : 10,
    borderRadius: isWeb ? 16 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: isWeb ? 2 : 3,
    borderColor: "#FFA500",
  },
  sellButtonText: {
    fontSize: isWeb ? 14 : 16,
    fontWeight: "bold" as const,
    color: "#FFF",
  },
  resumeProductionButton: {
    backgroundColor: "#8B4513",
    paddingVertical: isWeb ? 8 : 10,
    paddingHorizontal: isWeb ? 16 : 20,
    borderRadius: isWeb ? 16 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: isWeb ? 2 : 3,
    borderColor: "#A0522D",
  },
  resumeProductionText: {
    color: "#fff",
    fontWeight: "bold" as const,
    fontSize: isWeb ? 14 : 16,
  },
  productionControl: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 12,
    width: "100%",
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.5)",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
  },
});
