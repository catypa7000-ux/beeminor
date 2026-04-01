import { useGame } from "../../../contexts/GameContext";
import { useAuth } from "../../../contexts/AuthContext";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CryptoNetwork = "TON" | "SOL" | "BNB";

type NetworkOption = {
  id: CryptoNetwork;
  name: string;
  color: string;
  minWithdraw: number;
};

// Withdrawal only: 1 diamond = 1 USDT, min 2 diamonds (do not use elsewhere — other prices/cells unchanged)
const DIAMOND_TO_USD = 1;
const MIN_DIAMONDS_WITHDRAWAL = 2;

const NETWORKS: NetworkOption[] = [
  {
    id: "TON",
    name: "TON (The Open Network)",
    color: "#0088CC",
    minWithdraw: MIN_DIAMONDS_WITHDRAWAL,
  },
  { id: "SOL", name: "Solana", color: "#14F195", minWithdraw: MIN_DIAMONDS_WITHDRAWAL },
  {
    id: "BNB",
    name: "Binance Smart Chain",
    color: "#F3BA2F",
    minWithdraw: MIN_DIAMONDS_WITHDRAWAL,
  },
];

const openAdSmartLink = () => {
  if (Platform.OS === 'web') {
    window.open(
      'https://pl28951061.profitablecpmratenetwork.com/45/02/20/4502205103ed25db71eb6aa696f1338f.js',
      '_blank'
    );
  }
};

export default function RetraitScreen() {
  const game = useGame();
  const { currentUser } = useAuth();
  const { diamonds, bvrCoins } = game;
  const [withdrawType, setWithdrawType] = useState<"diamonds" | "bvr">(
    "diamonds"
  );
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork | null>(
    null
  );
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const calculateFees = (amount: number): number => {
    if (amount < 10) return 1;
    return Math.max(1, amount * 0.1);
  };

  const calculateReceived = (amount: number): number => {
    const fees = calculateFees(amount);
    return Math.max(0, amount - fees);
  };

  const handleWithdraw = () => {
    // Trigger ad on button tap (web only)
    openAdSmartLink();

    console.log("=== WITHDRAWAL DEBUG ===");
    console.log("withdrawType:", withdrawType);
    console.log("withdrawAmount:", withdrawAmount);
    console.log("walletAddress:", walletAddress);
    console.log("bvrCoins:", bvrCoins);
    console.log("currentUser:", currentUser);

    const amount = parseFloat(withdrawAmount);
    console.log("parsed amount:", amount);

    if (!walletAddress.trim()) {
      if (Platform.OS === 'web') window.alert("Erreur: Veuillez entrer une adresse de portefeuille");
      else Alert.alert("Erreur", "Veuillez entrer une adresse de portefeuille");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      if (Platform.OS === 'web') window.alert("Erreur: Veuillez entrer un montant valide");
      else Alert.alert("Erreur", "Veuillez entrer un montant valide");
      return;
    }

    if (withdrawType === "diamonds") {
      const selectedNetworkInfo = NETWORKS.find(
        (n) => n.id === selectedNetwork
      );

      if (!selectedNetwork) {
        if (Platform.OS === 'web') window.alert("Erreur: Veuillez sélectionner un réseau");
        else Alert.alert("Erreur", "Veuillez sélectionner un réseau");
        return;
      }

      if (selectedNetworkInfo && amount < selectedNetworkInfo.minWithdraw) {
        const msg = `Erreur: Le montant minimum de retrait est de ${selectedNetworkInfo.minWithdraw.toLocaleString()} diamants (${(
          selectedNetworkInfo.minWithdraw * DIAMOND_TO_USD
        ).toFixed(2)}$)`;
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert("Erreur", msg);
        return;
      }

      if (diamonds < amount) {
        if (Platform.OS === 'web') window.alert("Erreur: Vous n'avez pas assez de diamants");
        else Alert.alert("Erreur", "Vous n'avez pas assez de diamants");
        return;
      }

      const usdAmount = amount * DIAMOND_TO_USD;
      const fees = calculateFees(usdAmount);
      const received = calculateReceived(usdAmount);

      // Use window.confirm for web compatibility
      const performWithdraw = () => {
        setIsSubmitting(true);
        game
          .submitWithdrawal({
            userId: currentUser?.id || "unknown",
            userEmail: currentUser?.email || "unknown",
            type: "withdrawal_diamond",
            amount: amount,
            network: selectedNetwork,
            walletAddress: walletAddress,
            usdAmount: usdAmount,
            fees: fees,
            receivedAmount: received,
          })
          .then(() => {
            const successMsg = "Succès: Votre demande de retrait a été soumise. L'administrateur va valider votre transaction sous 24-48h.";
            if (Platform.OS === 'web') window.alert(successMsg);
            else Alert.alert("Succès", successMsg);

            setWithdrawAmount("");
            setWalletAddress("");
          })
          .catch((error: unknown) => {
            console.error("Withdrawal error:", error);
            const msg =
              error instanceof Error
                ? error.message
                : "Erreur lors de la soumission du retrait";
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert("Erreur", msg);
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      };

      const confirmMsg = `Vous allez retirer ${amount.toLocaleString()} diamants (${usdAmount.toFixed(
        2
      )}$)\n` +
        `Frais: ${fees.toFixed(2)}$\n` +
        `Vous recevrez: ${received.toFixed(2)}$\n` +
        `Réseau: ${selectedNetwork}\n` +
        `Adresse: ${walletAddress.substring(0, 10)}...\n\n` +
        `Confirmer le retrait?`;

      if (Platform.OS === 'web') {
        if (window.confirm(confirmMsg)) {
          performWithdraw();
        }
      } else {
        Alert.alert(
          "Confirmation",
          confirmMsg,
          [
            { text: "Annuler", style: "cancel" },
            { text: "Confirmer", onPress: performWithdraw }
          ]
        );
      }
    } else {
      console.log("=== BVR WITHDRAWAL BRANCH ===");
      console.log("bvrCoins:", bvrCoins);
      console.log("amount:", amount);

      if (bvrCoins < amount) {
        console.log("Insufficient BVR");
        if (Platform.OS === 'web') window.alert("Erreur: Vous n'avez pas assez de BVR");
        else Alert.alert("Erreur", "Vous n'avez pas assez de BVR");
        return;
      }

      console.log("Showing confirmation dialog");

      // Use window.confirm for web compatibility
      const performWithdrawBVR = () => {
        console.log("Confirmed! Submitting withdrawal...");
        setIsSubmitting(true);
        game
          .submitWithdrawal({
            userId: currentUser?.id || "unknown",
            userEmail: currentUser?.email || "unknown",
            type: "withdrawal_bvr",
            amount: amount,
            network: "SOL",
            walletAddress: walletAddress,
          })
          .then((result) => {
            console.log("Withdrawal result:", result);
            const successMsg = "Succès: Votre demande de retrait BVR a été soumise. L'administrateur va valider votre transaction sur Solana sous 24-48h.";
            if (Platform.OS === 'web') window.alert(successMsg);
            else Alert.alert("Succès", successMsg);

            setWithdrawAmount("");
            setWalletAddress("");
          })
          .catch((error: unknown) => {
            console.error("Withdrawal error:", error);
            const msg =
              error instanceof Error
                ? error.message
                : "Erreur lors de la soumission du retrait";
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert("Erreur", msg);
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      };

      const confirmMsgBVR = `Vous allez retirer ${amount.toLocaleString()} BVR coins (jeu)\n` +
        `Vous recevrez: ${(amount / 100).toLocaleString()} BVR tokens\n` +
        `Réseau: Solana\n` +
        `Aucun frais\n` +
        `Adresse: ${walletAddress.substring(0, 10)}...\n\n` +
        `Confirmer le retrait?`;

      if (Platform.OS === 'web') {
        if (window.confirm(confirmMsgBVR)) {
          performWithdrawBVR();
        }
      } else {
        Alert.alert(
          "Confirmation",
          confirmMsgBVR,
          [
            { text: "Annuler", style: "cancel" },
            { text: "Confirmer", onPress: performWithdrawBVR }
          ]
        );
      }
    }
  };

  const amount = parseFloat(withdrawAmount) || 0;
  const usdAmount = amount * DIAMOND_TO_USD;
  const fees = calculateFees(usdAmount);
  const received = calculateReceived(usdAmount);

  console.log("withdrawType", withdrawType);

  const selectedNetworkInfo = NETWORKS.find((n) => n.id === selectedNetwork);
  const minWithdraw = selectedNetworkInfo?.minWithdraw || 0;

  const isButtonDisabled =
    isSubmitting ||
    !walletAddress.trim() ||
    amount <= 0 ||
    (withdrawType === "diamonds"
      ? !selectedNetwork || diamonds < amount || amount < minWithdraw
      : bvrCoins < amount);

  return (
    <View style={styles.background}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Retrait Crypto</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              withdrawType === "diamonds" && styles.typeButtonActive,
            ]}
            onPress={() => {
              setWithdrawType("diamonds");
              setSelectedNetwork(null);
              setWithdrawAmount("");
              setWalletAddress("");
            }}
          >
            <Text
              style={[
                styles.typeButtonText,
                withdrawType === "diamonds" && styles.typeButtonTextActive,
              ]}
            >
              💎 Diamants
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              withdrawType === "bvr" && styles.typeButtonActive,
            ]}
            onPress={() => {
              setWithdrawType("bvr");
              setSelectedNetwork("SOL");
              setWithdrawAmount("");
              setWalletAddress("");
            }}
          >
            <Text
              style={[
                styles.typeButtonText,
                withdrawType === "bvr" && styles.typeButtonTextActive,
              ]}
            >
              🪙 BVR
            </Text>
          </TouchableOpacity>
        </View>

        {withdrawType === "diamonds" ? (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <View style={styles.balanceDisplay}>
              <Text style={styles.balanceEmoji}>💎</Text>
              <Text style={styles.balanceAmount}>
                {diamonds.toLocaleString()}
              </Text>
              <Text style={styles.balanceSubtext}>diamants</Text>
            </View>
            <Text style={styles.balanceUSD}>
              ≈ {(diamonds * DIAMOND_TO_USD).toFixed(2)}$
            </Text>
          </View>
        ) : (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <View style={styles.balanceDisplay}>
              <Text style={styles.balanceEmoji}>🪙</Text>
              <Text style={styles.balanceAmount}>
                {bvrCoins.toLocaleString()}
              </Text>
              <Text style={styles.balanceSubtext}>BVR</Text>
            </View>
            <Text style={styles.balanceUSD}>Réseau: Solana uniquement</Text>
          </View>
        )}

        {withdrawType === "diamonds" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sélectionnez un réseau</Text>
            {NETWORKS.map((network) => (
              <TouchableOpacity
                key={network.id}
                style={[
                  styles.networkCard,
                  selectedNetwork === network.id && styles.networkCardSelected,
                ]}
                onPress={() => setSelectedNetwork(network.id)}
              >
                <View
                  style={[
                    styles.networkIndicator,
                    { backgroundColor: network.color },
                  ]}
                />
                <View style={styles.networkInfo}>
                  <Text style={styles.networkName}>{network.name}</Text>
                  <Text style={styles.networkSubtext}>
                    Min: {network.minWithdraw.toLocaleString()} diamants
                  </Text>
                </View>
                {selectedNetwork === network.id && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Réseau</Text>
            <View style={[styles.networkCard, styles.networkCardSelected]}>
              <View
                style={[
                  styles.networkIndicator,
                  { backgroundColor: "#14F195" },
                ]}
              />
              <View style={styles.networkInfo}>
                <Text style={styles.networkName}>Solana</Text>
                <Text style={styles.networkSubtext}>
                  Réseau unique pour les retraits BVR
                </Text>
              </View>
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓</Text>
              </View>
            </View>
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>
                ⚠️ ATTENTION - Non-Custodial Wallet Obligatoire
              </Text>
              <Text style={styles.warningText}>
                • Les BVR doivent être retirés UNIQUEMENT sur un non-custodial
                wallet de type Solflare, Trust, Phantom, Bitget{"\n"}• Si vous
                retirez sur un portefeuille qui n&apos;est pas un non-custodial
                wallet, vous risquez de perdre définitivement vos BVR{"\n"}•
                Vérifiez bien que votre adresse correspond à un non-custodial
                wallet avant de confirmer
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse du portefeuille</Text>
          <TextInput
            style={styles.input}
            placeholder={
              withdrawType === "bvr"
                ? "Entrez votre adresse Solana"
                : `Entrez votre adresse ${selectedNetwork || ""}`
            }
            placeholderTextColor="#999"
            value={walletAddress}
            onChangeText={setWalletAddress}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Montant du retrait</Text>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#999"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="number-pad"
            />
            <Text style={styles.currencyLabel}>
              {withdrawType === "diamonds" ? "💎" : "🪙"}
            </Text>
          </View>
          <Text style={styles.inputHint}>
            {withdrawType === "diamonds"
              ? "1 diamant = 1$ • Min: 2 diamants (2$)"
              : "Retrait BVR sur Solana uniquement"}
          </Text>
        </View>

        {amount > 0 && withdrawType === "diamonds" && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Résumé</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Diamants</Text>
              <Text style={styles.summaryValue}>
                {amount.toLocaleString()} 💎
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Montant USD</Text>
              <Text style={styles.summaryValue}>{usdAmount.toFixed(2)}$</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais</Text>
              <Text style={[styles.summaryValue, styles.feesText]}>
                -{fees.toFixed(2)}$
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>Vous recevrez</Text>
              <Text style={styles.summaryValueTotal}>
                {received.toFixed(2)}$
              </Text>
            </View>
          </View>
        )}

        {amount > 0 && withdrawType === "bvr" && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Résumé</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>BVR Coins (jeu)</Text>
              <Text style={styles.summaryValue}>
                {amount.toLocaleString()} 🪙
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Réseau</Text>
              <Text style={styles.summaryValue}>Solana</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>Vous recevrez</Text>
              <Text style={styles.summaryValueTotal}>
                {(amount / 100).toLocaleString()} BVR tokens
              </Text>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Informations importantes</Text>
          {withdrawType === "diamonds" ? (
            <Text style={styles.infoText}>
              • Taux de conversion: 1 diamant = 1${"\n"}• Minimum de
              retrait: 2 diamants (2$){"\n"}• Frais: 1$ fixe pour les
              retraits {"<"} 10${"\n"}• Frais: 10% pour les retraits ≥ 10${"\n"}
              • Réseaux disponibles: TON, Solana, BSC{"\n"}• Délai de
              traitement: 24-48 heures{"\n"}• Vérifiez bien votre adresse avant
              de confirmer
            </Text>
          ) : (
            <Text style={styles.infoText}>
              • 100 BVR jeu = 1 token BVR{"\n"}• Les BVR sont retirables
              uniquement sur Solana{"\n"}• Aucun frais de retrait pour les BVR
              {"\n"}• ⚠️ OBLIGATOIRE: Retrait sur non-custodial wallet
              uniquement (Solflare, Trust, Phantom, Bitget){"\n"}• Risque de
              perte totale si retrait sur wallet classique{"\n"}• Délai de
              traitement: 24-48 heures{"\n"}• Vérifiez bien votre adresse
              non-custodial wallet avant de confirmer
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={handleWithdraw}
          disabled={isSubmitting}
        >
          <Text style={styles.withdrawButtonText}>
            {isSubmitting ? "Traitement..." : "Retirer"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FFF8DC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FF8C00",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  typeSelector: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#FF8C00",
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#8B4513",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  balanceDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceEmoji: {
    fontSize: 32,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold" as const,
    color: "#FF8C00",
  },
  balanceSubtext: {
    fontSize: 16,
    color: "#666",
  },
  balanceUSD: {
    fontSize: 18,
    color: "#8B4513",
    marginTop: 8,
    fontWeight: "600" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#8B4513",
    marginBottom: 12,
  },
  networkCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  networkCardSelected: {
    borderColor: "#FF8C00",
    backgroundColor: "#FFF5E6",
  },
  networkIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#8B4513",
    marginBottom: 2,
  },
  networkSubtext: {
    fontSize: 12,
    color: "#666",
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF8C00",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadgeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#8B4513",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  amountInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#8B4513",
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#666",
    marginLeft: 8,
  },
  inputHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: "#FFF5E6",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#8B4513",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#8B4513",
  },
  feesText: {
    color: "#D32F2F",
  },
  summaryRowTotal: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#FFD700",
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#8B4513",
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#FF8C00",
  },
  infoCard: {
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#1976D2",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 22,
  },
  warningCard: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#EF5350",
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "bold" as const,
    color: "#C62828",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: "#C62828",
    lineHeight: 20,
  },
  withdrawButton: {
    backgroundColor: "#FF8C00",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  withdrawButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  withdrawButtonText: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#fff",
  },
});
