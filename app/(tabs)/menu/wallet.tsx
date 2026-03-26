import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import * as ExpoClipboard from 'expo-clipboard';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Copy, Bitcoin } from 'lucide-react-native';
import { useGame, Transaction } from '../../../contexts/GameContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdmin } from '../../../contexts/AdminContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { WebAdsterraSmartLink } from '../../../components/WebAdsterraSmartLink';

type CryptoNetwork = {
  id: string;
  name: string;
  symbol: string;
  color: string;
};

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { submitWithdrawal } = useGame();
  const { currentUser } = useAuth();
  const { tonAddress, solanaAddress } = useAdmin();
  const { t } = useLanguage();
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');

  const CRYPTO_NETWORKS: (CryptoNetwork & { address: string })[] = [
    {
      id: 'sol',
      name: 'Solana',
      symbol: 'SOL',
      address: solanaAddress || 'Adresse non configurée',
      color: '#14F195',
    },
    {
      id: 'ton',
      name: 'TON',
      symbol: 'TON',
      address: tonAddress || 'Adresse non configurée',
      color: '#0088CC',
    },
  ];

  const copyToClipboard = async (address: string) => {
    await ExpoClipboard.setStringAsync(address);
    if (Platform.OS === 'web') {
      window.alert('Adresse copiée dans le presse-papier');
    } else {
      Alert.alert('Succès', 'Adresse copiée dans le presse-papier');
    }
  };

  const calculateFlowersEarned = (usdValue: number): number => {
    const FEE = 1;
    const netValue = Math.max(0, usdValue - FEE);
    return Math.floor(netValue * 1000);
  };

  const handleExchange = () => {
    if (!selectedNetwork || !usdAmount) {
      const msg = t.error + ': ' + (t.selectNetworkError || 'Veuillez sélectionner un réseau et entrer un montant');
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Erreur', msg);
      return;
    }

    const usdValue = parseFloat(usdAmount);
    if (isNaN(usdValue) || usdValue <= 0) {
      const msg = t.error + ': ' + t.invalidAmount;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Erreur', msg);
      return;
    }

    if (usdValue < 5) {
      const msg = `${t.error}\n\n${t.minAmountWarning}\n\nLes envois en dessous de 5$ ne seront pas comptabilisés.`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Erreur', msg);
      return;
    }

    const flowersToAdd = calculateFlowersEarned(usdValue);
    const selectedNetworkData = CRYPTO_NETWORKS.find(n => n.id === selectedNetwork);

    const cryptoSymbol = selectedNetworkData?.symbol || selectedNetwork.toUpperCase();

    const performExchange = async () => {
      const transaction: Omit<Transaction, 'id' | 'status' | 'createdAt'> = {
        userId: currentUser?.id || 'unknown',
        userEmail: currentUser?.email || 'unknown',
        type: 'deposit_crypto',
        amount: usdValue,
        network: selectedNetworkData?.name || selectedNetwork,
        walletAddress: selectedNetworkData?.address || '',
        usdAmount: usdValue,
        fees: 1,
        receivedAmount: usdValue - 1,
        flowersAmount: flowersToAdd,
      };

      try {
        await submitWithdrawal(transaction);
        setUsdAmount('');
        setSelectedNetwork('');

        const successMsg = `Demande envoyée!\n\n` +
          `Votre dépôt de ${usdValue.toFixed(2)}$ en ${cryptoSymbol} a été soumis.\n\n` +
          `Les ${flowersToAdd.toLocaleString()} fleurs seront ajoutées après validation par l'admin.\n\n` +
          `Vous recevrez une notification une fois la transaction validée ou rejetée.`;

        if (Platform.OS === 'web') {
          window.alert(successMsg);
        } else {
          Alert.alert('Succès', successMsg);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Erreur', msg);
      }
    };

    const confirmMsg = `Confirmer l'envoi:\n\n` +
      `Réseau: ${cryptoSymbol}\n` +
      `Montant envoyé: ${usdValue.toFixed(2)}$\n` +
      `Taxe: 1.00$\n` +
      `Net: ${(usdValue - 1).toFixed(2)}$\n\n` +
      `Vous recevrez: ${flowersToAdd.toLocaleString()} fleurs\n\n` +
      `Votre dépôt sera soumis pour validation par l'administrateur. Vous recevrez une notification une fois validé.`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        performExchange();
      }
    } else {
      Alert.alert(
        "Confirmation",
        confirmMsg,
        [
          { text: "Annuler", style: "cancel" },
          { text: "Confirmer", onPress: performExchange }
        ]
      );
    }
  };

  return (
    <View style={styles.background}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/menu')}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresses de réception</Text>
          <Text style={styles.sectionDescription}>
            Envoyez des crypto à ces adresses pour recevoir des fleurs
          </Text>

          {CRYPTO_NETWORKS.map((network) => (
            <View key={network.id} style={styles.networkCard}>
              <View style={styles.networkHeader}>
                <View style={[styles.networkIcon, { backgroundColor: network.color }]}>
                  <Bitcoin color="#fff" size={28} />
                </View>
                <View style={styles.networkInfo}>
                  <Text style={styles.networkName}>{network.name}</Text>
                  <Text style={styles.networkSymbol}>{network.symbol}</Text>
                  <Text style={styles.minValueText}>
                    Valeur de 5$ minimum
                  </Text>
                </View>
              </View>

              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Adresse:</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.address} numberOfLines={1}>
                    {network.address}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(network.address)}
                  >
                    <Copy color="#FF8C00" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Déclarer un envoi crypto</Text>
          <Text style={styles.sectionDescription}>
            {t.afterSendingConfirm}
          </Text>


          <View style={styles.exchangeCard}>
            <Text style={styles.inputLabel}>Réseau</Text>
            <View style={styles.networkSelector}>
              {CRYPTO_NETWORKS.map((network) => (
                <TouchableOpacity
                  key={network.id}
                  style={[
                    styles.networkButton,
                    selectedNetwork === network.id && styles.networkButtonActive,
                    { borderColor: network.color },
                  ]}
                  onPress={() => setSelectedNetwork(network.id)}
                >
                  <Text
                    style={[
                      styles.networkButtonText,
                      selectedNetwork === network.id && styles.networkButtonTextActive,
                    ]}
                  >
                    {network.symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>
              Montant envoyé (en USD)
            </Text>
            <Text style={styles.inputDescription}>
              Indiquez la valeur en $ de la crypto que vous avez envoyée en {selectedNetwork === 'sol' ? 'SOL' : selectedNetwork === 'ton' ? 'TON' : 'SOL/TON'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#999"
              value={usdAmount}
              onChangeText={setUsdAmount}
              keyboardType="decimal-pad"
            />

            {usdAmount && parseFloat(usdAmount) > 0 && selectedNetwork && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>💵 {t.youWillReceiveFlowers}:</Text>
                <Text style={styles.previewAmount}>
                  {calculateFlowersEarned(parseFloat(usdAmount)).toLocaleString()} 🌸
                </Text>
                <View style={styles.calculationDetails}>
                  <Text style={styles.calculationText}>
                    • Montant: {parseFloat(usdAmount).toFixed(2)}$
                  </Text>
                  <Text style={styles.calculationText}>
                    • Taxe: 1.00$
                  </Text>
                  <Text style={styles.calculationText}>
                    • Net: {(parseFloat(usdAmount) - 1).toFixed(2)}$
                  </Text>
                </View>
                {parseFloat(usdAmount) < 5 && (
                  <Text style={styles.minWarningText}>
                    ⚠️ {t.minAmountWarning}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.exchangeButton,
                (!selectedNetwork || !usdAmount) && styles.exchangeButtonDisabled,
              ]}
              onPress={handleExchange}
              disabled={!selectedNetwork || !usdAmount}
            >
              <Text style={styles.exchangeButtonText}>Soumettre pour validation</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>⚠️ Important</Text>
          <Text style={styles.warningText}>• Vérifiez bien l&apos;adresse avant d&apos;envoyer</Text>
          <Text style={styles.warningText}>• Les transactions crypto sont irréversibles</Text>
          <Text style={styles.warningText}>• Utilisez le bon réseau (Solana ou TON)</Text>
          <Text style={styles.warningText}>• {t.minAmountWarning}</Text>
          <Text style={styles.warningText}>• ⚠️ Les envois en dessous de 5$ ne sont pas comptabilisés</Text>
          <Text style={styles.warningText}>• 💵 Une taxe de 1$ est prélevée sur le montant envoyé</Text>
          <Text style={styles.warningText}>• 🔔 Vous recevrez une notification quand le dev validera votre transaction</Text>
          <Text style={styles.warningText}>• L&apos;admin vérifiera le montant reçu avant validation</Text>
        </View>

        <WebAdsterraSmartLink />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FF8C00',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#8B4513',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  networkCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  networkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  networkIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#8B4513',
  },
  networkSymbol: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  minValueText: {
    fontSize: 13,
    color: '#FF8C00',
    fontWeight: '600' as const,
    marginTop: 4,
  },
  addressContainer: {
    marginBottom: 0,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  address: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontFamily: 'monospace' as const,
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  exchangeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#8B4513',
    marginBottom: 6,
  },
  inputDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  networkSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  networkButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  networkButtonActive: {
    backgroundColor: '#FFF8DC',
  },
  networkButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  networkButtonTextActive: {
    color: '#8B4513',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
  },
  previewContainer: {
    backgroundColor: '#FFF8DC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8B4513',
    marginBottom: 8,
  },
  previewAmount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FF8C00',
    textAlign: 'center',
    marginBottom: 12,
  },
  calculationDetails: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  calculationText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  minWarningText: {
    fontSize: 12,
    color: '#FF4500',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600' as const,
  },
  exchangeButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  exchangeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  exchangeButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#8B4513',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  infoBox: {
    backgroundColor: '#E6F3FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  infoBoxText: {
    fontSize: 13,
    color: '#0066CC',
    marginBottom: 4,
    fontWeight: '500' as const,
  },
});
