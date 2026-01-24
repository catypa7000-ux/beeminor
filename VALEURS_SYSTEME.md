# 💰 Valeurs du Système - Configuration Complète

## 📊 Taux de Conversion Principal

### Fleurs (Monnaie de base)
```
1 USD = 1000 Fleurs
```

### Diamants → Fleurs
```
1 Diamant = 0.10 USD
10,000 Diamants = 1000 Fleurs = 1 USD
```

**Ratio:** `10 Diamants = 1 Fleur`

---

## 🐝 Abeilles Virtuelles

### Abeille Virtuelle 1
- **Prix:** GRATUIT
- **Durée:** À VIE
- **Attribution:** Automatique lors de la création du compte
- **Production:** Miel de base

### Autres Abeilles
- Prix variables selon le type
- Durée limitée ou à vie selon le niveau
- Production de miel augmentée

---

## 🏪 Prix des Alvéoles

**IMPORTANT:** Tous les prix des alvéoles ont été **divisés par 10** pour correspondre au nouveau taux de conversion des fleurs.

### Anciens Prix vs Nouveaux Prix

| Alvéole | Ancien Prix | Nouveau Prix (÷10) |
|---------|-------------|-------------------|
| Alvéole 1 | 10,000 Fleurs | 1,000 Fleurs |
| Alvéole 2 | 50,000 Fleurs | 5,000 Fleurs |
| Alvéole 3 | 100,000 Fleurs | 10,000 Fleurs |
| Alvéole 4 | 250,000 Fleurs | 25,000 Fleurs |
| Alvéole 5 | 500,000 Fleurs | 50,000 Fleurs |

*Vérifier les prix exacts dans le code: `app/(tabs)/alveole/index.tsx`*

---

## 💸 Système de Retrait

### Limites de Retrait

#### Diamants
```
Minimum: 100,000 Diamants (= 10,000 Fleurs = 10 USD)
Maximum: 1,000,000 Diamants (= 100,000 Fleurs = 100 USD)
```

#### BVR Coins
```
Minimum: 10 BVR (= 10 USD = 10,000 Fleurs)
Maximum: 100 BVR (= 100 USD = 100,000 Fleurs)
```

### Taux de Conversion au Retrait

```javascript
// Diamants → USD
const diamantsToUSD = (diamants) => diamants * 0.0001;
// 10,000 Diamants = 1 USD

// BVR → USD
const bvrToUSD = (bvr) => bvr * 1;
// 1 BVR = 1 USD

// Fleurs → USD
const fleursToUSD = (fleurs) => fleurs / 1000;
// 1000 Fleurs = 1 USD
```

### Frais de Retrait
```
TON Network: 2 TON
Solana Network: 0.5 SOL
BNB Smart Chain: 0.01 BNB
```

**Important:** Ces frais sont déduits du montant reçu par l'utilisateur.

---

## 💳 Système d'Envoi (Wallet)

### Wallet → Envoi d'Argent

**PROBLÈME IDENTIFIÉ:** Les valeurs affichées ne correspondent pas avec les fleurs lors de l'envoi.

### Correction Nécessaire

Les conversions dans le wallet doivent être:

```javascript
// Affichage USD dans le wallet
const fleursToUSD = (fleurs) => fleurs / 1000;

// Exemple d'affichage
Si l'utilisateur a: 50,000 Fleurs
Affichage wallet: 50 USD (50,000 / 1000)

Si l'utilisateur envoie: 10,000 Fleurs
Montant affiché: 10 USD
```

### Vérifications à Faire

1. ✅ Vérifier `app/(tabs)/menu/wallet.tsx`
2. ✅ Vérifier `app/(tabs)/menu/retrait.tsx`
3. ✅ Vérifier `app/(tabs)/menu/echange.tsx`
4. ✅ S'assurer que la conversion 1000 Fleurs = 1 USD est appliquée partout

---

## 🎰 Système de Roulette

### Coût par Tour
```
1 Tour = 1 Ticket
```

### Attribution de Tickets

#### Automatique lors des achats:
- **1 ticket par 10$ dépensés** lors de l'achat de fleurs
- Les tickets sont automatiquement attribués lors de l'approbation d'un dépôt crypto par l'admin
- Exemples:
  - Dépôt de 10$ → 1 ticket
  - Dépôt de 25$ → 2 tickets
  - Dépôt de 100$ → 10 tickets

#### Attribution manuelle (Admin Panel):
- Admin peut attribuer des tickets supplémentaires aux utilisateurs
- Les tickets sont stockés dans la base de données
- Les tickets ne sont PAS convertis en fleurs

### Gains de la Roulette
Les gains sont en **Fleurs** et suivent le taux:
```
1000 Fleurs gagnées = 1 USD de valeur
```

---

## 🎁 Système de Récompenses

### Parrainage

#### Bonus d'invitation
```
Bonus immédiat lors de l'inscription d'un ami: +100 Fleurs (= 0.10 USD)
```

#### Bonus d'affiliation (sur achats de l'ami)
```
Commission sur achats: 5% du montant dépensé par l'ami
```

#### Bonus premier achat
```
Bonus unique au premier achat de l'ami: +1000 Fleurs (= 1.00 USD)
```

**Exemple complet:**
- Ami s'inscrit → +100 fleurs
- Ami fait un achat de 10,000 fleurs → +500 fleurs (5%) + 1000 fleurs (bonus premier achat) = +1500 fleurs
- Ami fait un autre achat de 5,000 fleurs → +250 fleurs (5%)

### Récompenses Journalières
```
Connexion quotidienne: +100 Fleurs (= 0.10 USD)
Tâche complétée: Variable selon la tâche
```

---

## 📱 Panel Admin - Ressources

### Attribution de Ressources

Lors de l'attribution de ressources via le panel admin:

```javascript
// Fleurs
input: 10000 → +10,000 Fleurs (= 10 USD)

// Diamants
input: 100000 → +100,000 Diamants (= 10,000 Fleurs = 10 USD)

// Miel
input: 5000 → +5,000 Miel (utilisé pour améliorer les abeilles)

// Tickets (Roulette)
input: 50 → +50 Tickets (50 tours de roulette)

// BVR Coins
input: 10 → +10 BVR (= 10 USD)
```

---

## 🔄 Conversions Rapides

### Tableau de Conversion

| Montant USD | Fleurs | Diamants | BVR Coins |
|-------------|--------|----------|-----------|
| $0.10 | 100 | 1,000 | 0.1 |
| $1.00 | 1,000 | 10,000 | 1 |
| $10.00 | 10,000 | 100,000 | 10 |
| $50.00 | 50,000 | 500,000 | 50 |
| $100.00 | 100,000 | 1,000,000 | 100 |

### Taux d'Échange BVR → Fleurs
```
100 BVR coins = 0.01 fleur
10,000 BVR coins = 1 fleur
```

### Taux de Retrait BVR
```
100 BVR coins (jeu) = 1 BVR token (blockchain)
```

---

## 🚨 Points Critiques à Vérifier

### ✅ Liste de Vérification

- [x] Prix des alvéoles divisés par 10
- [x] Conversion 1000 Fleurs = 1 USD partout
- [x] Abeille virtuelle 1 gratuite à la création de compte
- [x] **Wallet: Affichage correct USD ↔ Fleurs**
- [x] **Retrait: Montants affichés corrects**
- [x] **Échange: Conversions correctes**
- [x] Panel Admin: Attribution de tickets fonctionnelle
- [x] Système de roulette fonctionnel
- [x] **Attribution automatique de tickets lors des achats (1 ticket / 10$)**
- [x] **FIX: Attribution fleurs et tickets lors de l'approbation des dépôts**
- [x] **FIX: Création automatique du GameState si inexistant lors de l'approbation**

---

## 📝 Fichiers à Vérifier

### Frontend
```
app/(tabs)/menu/wallet.tsx       → Affichage USD/Fleurs
app/(tabs)/menu/retrait.tsx      → Conversions retrait
app/(tabs)/menu/echange.tsx      → Conversions échange
app/(tabs)/alveole/index.tsx     → Prix alvéoles ÷10
app/(tabs)/shop/index.tsx        → Prix abeilles
contexts/GameContext.tsx         → Logique de jeu
```

### Backend
```
backend/routes/transactions.js   → Logique retrait
backend/routes/game.js          → Logique jeu
backend/models/GameState.js     → Structure données
backend/models/User.js          → Structure utilisateur
```

---

## 🔧 Formules de Calcul

### JavaScript / TypeScript

```typescript
// Conversions de base
const FLEURS_PER_USD = 1000;
const DIAMANTS_PER_USD = 10000;
const DIAMANTS_PER_FLEUR = 10;

// Fleurs → USD
const fleursToUSD = (fleurs: number): number => fleurs / FLEURS_PER_USD;

// USD → Fleurs
const usdToFleurs = (usd: number): number => usd * FLEURS_PER_USD;

// Diamants → USD
const diamantsToUSD = (diamants: number): number => diamants / DIAMANTS_PER_USD;

// Diamants → Fleurs
const diamantsToFleurs = (diamants: number): number => diamants / DIAMANTS_PER_FLEUR;

// Fleurs → Diamants
const fleursToDiamants = (fleurs: number): number => fleurs * DIAMANTS_PER_FLEUR;

// BVR → USD (1:1)
const bvrToUSD = (bvr: number): number => bvr;

// BVR Coins → Fleurs (échange)
const bvrCoinsToFleurs = (bvrCoins: number): number => bvrCoins / 10000;
// 100 BVR coins = 0.01 fleur

// BVR Coins → BVR Tokens (retrait)
const bvrCoinsToTokens = (bvrCoins: number): number => bvrCoins / 100;
// 100 BVR coins = 1 BVR token
```

---

## 📧 Contact & Support

Pour toute question sur les valeurs du système:
- Vérifier ce document en premier
- Consulter le code source des fichiers listés
- Vérifier la base de données MongoDB

---

---

## 🔧 Corrections Récentes (2025-12-10)

### Problème Résolu: Transactions sans attribution de fleurs/tickets

**Problème:** Les utilisateurs ne recevaient ni fleurs ni tickets lors de l'approbation des transactions par l'admin.

**Causes identifiées:**
1. Le GameState de l'utilisateur n'existait pas dans la base de données
2. Aucune vérification n'était faite avant d'essayer d'attribuer les ressources
3. Erreurs silencieuses lors de la sauvegarde

**Solutions implémentées:**

1. **Création automatique du GameState** (`backend/routes/transactions.js`)
   - Lors de l'approbation d'un dépôt, si le GameState n'existe pas, il est créé automatiquement
   - Valeurs par défaut: 100 miel, 0 fleurs, 1 alvéole débloquée

2. **Logs détaillés** pour le debugging
   - Logs avant/après l'attribution des ressources
   - Identification claire du userId et des montants
   - Messages d'erreur explicites avec émojis pour visibilité

3. **Gestion d'erreur robuste**
   - Retour d'erreur 404 si le GameState ne peut pas être créé
   - Retour d'erreur 500 si la sauvegarde échoue
   - Protection contre les valeurs null/undefined

4. **Calcul correct des fleurs et tickets**
   - Parse des notes JSON pour récupérer les montants précalculés
   - Fallback sur calcul automatique si notes manquantes
   - Formule: `fleurs = (usdAmount - 1) * 1000` (après taxe de 1$)
   - Formule: `tickets = Math.floor(usdAmount / 10)` (1 ticket par 10$)

**Test recommandé:**
1. Créer un compte utilisateur
2. Soumettre un dépôt crypto de 10$ via le Wallet
3. Approuver la transaction dans le panel admin
4. Vérifier que l'utilisateur reçoit:
   - 9,000 fleurs (10$ - 1$ taxe = 9$ × 1000)
   - 1 ticket (10$ / 10)

---

**Dernière mise à jour:** 2025-12-10
**Version du système:** 1.1
**Taux de conversion:** 1 USD = 1000 Fleurs (FIXE)
