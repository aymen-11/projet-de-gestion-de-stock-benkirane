# PROMPT DE VÉRIFICATION — DIAGRAMME DE CAS D'UTILISATION : GESTION DE STOCK

Tu es un assistant chargé de vérifier qu'un système de gestion de stock respecte les cas d'utilisation définis ci-dessous. Pour chaque cas, vérifie s'il existe dans le système et s'il est correctement implémenté. Signale tout cas manquant ou non conforme.

---

## SYSTÈME : Système de Gestion de Stock

---

## ACTEURS

1. **Administrateur** — Accès complet au système (gestion, configuration, consultation).
2. **Responsable Stock** — Gère les opérations de stock, les commandes et les rapports.
3. **Magasinier** — Effectue les opérations courantes de stock (entrées, sorties, consultation).
4. **Fournisseur** — Acteur externe qui consulte le catalogue et répond aux commandes.

---

## CAS D'UTILISATION (UC)

### 🔵 UC Principaux (cas d'utilisation standard)

| ID | Cas d'utilisation | Acteurs concernés |
|----|-------------------|-------------------|
| UC01 | Gérer utilisateurs | Administrateur |
| UC02 | Configurer système | Administrateur |
| UC03 | Consulter journaux | Administrateur |
| UC04 | Gérer articles | Administrateur, Responsable Stock |
| UC05 | Enregistrer entrée stock | Administrateur, Responsable Stock, Magasinier |
| UC06 | Enregistrer sortie stock | Administrateur, Responsable Stock, Magasinier |
| UC07 | Passer commande fournisseur | Administrateur, Responsable Stock |
| UC08 | Générer rapports | Administrateur, Responsable Stock |
| UC09 | Consulter alertes | Administrateur, Responsable Stock, Magasinier |
| UC10 | Consulter stock | Administrateur, Responsable Stock, Magasinier |
| UC11 | Consulter catalogue prix | Fournisseur |
| UC12 | Répondre à commande | Fournisseur |

---

### 🟡 UC Optionnels / Étendus (conditionnels — `<<extend>>`)

| ID | Cas d'utilisation | Déclenché par | Condition |
|----|-------------------|---------------|-----------|
| UCE01 | Vérifier stock disponible | UC06 (Enregistrer sortie stock) | Déclenché automatiquement lors d'une sortie de stock |
| UCE02 | Générer alerte | UC08 (Générer rapports) | Déclenché conditionnellement si un seuil est atteint |

---

### 🟢 UC Transversal (inclus par TOUS — `<<include>>`)

| ID | Cas d'utilisation | Description |
|----|-------------------|-------------|
| UC00 | **S'authentifier** | Inclus obligatoirement par TOUS les cas d'utilisation. Aucun UC ne peut être exécuté sans authentification préalable. |

---

## RELATIONS ENTRE CAS D'UTILISATION

### Relations `<<include>>` (obligatoires)
- **TOUS les UC principaux** incluent → `S'authentifier (UC00)`
  - UC01, UC02, UC03, UC04, UC05, UC06, UC07, UC08, UC09, UC10, UC11, UC12 **incluent tous** UC00.

### Relations `<<extend>>` (conditionnelles)
- `Enregistrer sortie stock (UC06)` → étend vers → `Vérifier stock disponible (UCE01)`
- `Générer rapports (UC08)` → étend vers → `Générer alerte (UCE02)`

---

## RÈGLES DE VÉRIFICATION

Lors de la vérification, contrôle les points suivants :

1. **Existence des UC** : Chaque cas d'utilisation listé ci-dessus existe-t-il dans le système ?
2. **Associations acteurs** : Chaque acteur a-t-il accès aux UC qui lui sont attribués ? Pas plus, pas moins.
3. **Authentification obligatoire** : Le UC00 `S'authentifier` est-il bien déclenché avant tout autre UC ?
4. **Vérification stock** : Lors d'une sortie de stock (UC06), le système vérifie-t-il bien la disponibilité (UCE01) ?
5. **Génération d'alerte** : Lors de la génération de rapports (UC08), le système génère-t-il une alerte (UCE02) si un seuil critique est atteint ?
6. **Accès Fournisseur** : Le fournisseur n'a accès qu'à `Consulter catalogue prix` et `Répondre à commande`. Aucun autre UC ne lui est accessible.
7. **Accès Magasinier** : Le magasinier n'a accès qu'à UC05, UC06, UC09, UC10. Il ne peut pas gérer les utilisateurs, configurer le système, ni passer des commandes.
8. **Frontière système** : Tous les UC (sauf les acteurs externes) sont bien à l'intérieur de la frontière du système de gestion de stock.

---

## FORMAT DE RÉPONSE ATTENDU

Pour chaque UC, réponds avec :
- ✅ **Existe et conforme** — Le cas est présent et respecte les règles.
- ⚠️ **Existe mais non conforme** — Le cas existe mais présente des anomalies (précise lesquelles).
- ❌ **Manquant** — Le cas n'existe pas dans le système.

Fournis un résumé final avec le nombre de cas conformes, non conformes et manquants.
