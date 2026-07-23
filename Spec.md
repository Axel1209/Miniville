# Spécification Technique & Fonctionnelle : Miniville – Édition Écologie & Réchauffement Climatique

## 1. Vue d'Ensemble & Règles Générales

### 1.1 Objectif du Jeu
Le but de chaque joueur est de développer sa ville en construisant des établissements et d'être le premier à bâtir ses **4 Monuments** :
1. Mont Saint Michel
2. Boîte de nuit Bolivienne
3. P'tite Ka'fête
4. Domaine de Damian

---

### 1.2 Structure d'un Tour de Jeu
Chaque tour se déroule en 3 phases successives :

1. **Lancer de Dé(s) :**
   - Par défaut, le joueur actif lance **1 dé**.
   - Si le joueur a construit le *Mont Saint Michel*, il peut choisir de lancer **1 dé ou 2 dés**.

2. **Résolution des Revenus (Activation des Établissements) :**
   - La somme des dés détermine la ou les cartes activées sur la table.
   - Les cartes réagissent selon leur couleur/type (voir section 1.3).

3. **Achat / Construction :**
   - Le joueur actif peut dépenser ses pièces pour acheter **au maximum un (1) établissement** ou **un (1) monument** de son choix.

---

### 1.3 Typologie des Établissements

| Couleur / Type | Nom du Type | Condition de Déclenchement | Remarques / Limitations |
| :--- | :--- | :--- | :--- |
| **🔵 Bleu** | Primaire | Tour de **n'importe quel joueur** | S'active que vous soyez le lanceur de dés ou non. |
| **🟢 Vert** | Secondaire | **Votre tour uniquement** | S'active uniquement lorsque vous êtes le lanceur de dés. |
| **🔴 Rouge** | Tertiaire | **Tour des autres joueurs** | S'active quand un autre joueur lance le résultat correspondant. Prend des pièces au lanceur. |
| **🟣 Violet** | Majeur | **Votre tour uniquement** | Effets puissants ou spéciaux. Limité à **1 exemplaire maximum par type et par joueur**. |

---

### 1.4 Mécanique du Réchauffement Climatique (RC)

1. **Compteur de Température Globale :**
   - La partie débute à **+0.0°C**.
   - Chaque carte identifiée comme **polluante** ($\Delta$) augmente le compteur global de **+0.1°C** à chaque fois qu'elle est activée par un tirage de dé.

2. **Seuil Critique :**
   - Le réchauffement climatique s'enclenche à **+2.0°C** à 2 joueurs, **+3.0°C** à 3 joueurs, et **+4.0°C** à 4 joueurs.
   - Lorsque la température globale atteint ou dépasse ce seuil, les **Malus RC** s'appliquent immédiatement à toutes les cartes polluantes actives sur le plateau.

3. **Protection Climatique :**
   - Le *Siège EEVL* (carte Violette) permet au joueur qui le possède d'annuler tous les malus du Réchauffement Climatique pour son propre jeu.

---

## 2. Spécification des Monuments

| Monument | Coût | Type d'Effet | Description Fonctionnelle |
| :--- | :---: | :--- | :--- |
| **Mont Saint Michel** | **5** | Passif / Capacité | Vous permet de choisir au début de votre tour entre lancer **1 dé** ou **2 dés**. |
| **Boîte de nuit Bolivienne** | **10** | Déclenché (Dés) | Si vous obtenez un **double** (deux dés identiques), vous rejouez immédiatement un tour complet. |
| **P'tite Ka'fête** | **20** | Actif (1x/tour) | Une fois par tour, si le résultat du lancer de dé ne vous convient pas, vous pouvez relancer l'intégralité de vos dés. |
| **Domaine de Damian** | **40** | Condition de victoire | Aucun effet passif ou actif. Nécessaire pour remporter la partie. |

---

## 3. Spécification Exhaustive des Cartes d'Établissements

### 3.1 Tableau Récapitulatif

| Carte | Dé(s) | Coût | Type | Effet Principal | Polluante ($\Delta$) | Malus Si RC $\ge$ Seuil |
| :--- | :---: | :---: | :--- | :--- | :---: | :--- |
| **Compost** | 1 | 1 | 🔵 Bleu | Recevez 2 pièces de la banque. | non | Aucun |
| **Extraction de caoutchouc** | 2 | 1 | 🔵 Bleu | Recevez 1 pièce de la banque. | **Oui** (+0.1°C) | Recevez **0 pièce**. |
| **AMAP** | 2-3 | 2 | 🟢 Vert | Recevez 1 pièce de la banque. | non | Aucun |
| **Atelier de réparation de vélo** | 3 | 2 | 🔴 Rouge | Voler 1 pièce au joueur qui a lancé les dés. | non | Aucun |
| **Maison Autonome** | 4 | 2 | 🟢 Vert | Recevez 3 pièces de la banque. | non | Aucun |
| **Puit de Pétrole** | 5 | 3 | 🔵 Bleu | Recevez 2 pièces de la banque. | **Oui** (+0.1°C) | Recevez **1 seule pièce** (au lieu de 2). |
| **Les subsistances** | 5 | 3 | 🔴 Rouge | Voler 2 pièces au joueur qui a lancé les dés. | non | Aucun |
| **Centrale nucléaire** | 6 | 8 | 🟣 Violet | Recevez 6 pièces de la banque. *Règle spéciale de fusion.* | non | Effet d'explosion spécifique (voir 3.2). |
| **Siège EEVL** | 6 | 10 | 🟣 Violet | Protection totale contre les malus du Réchauffement Climatique. | non | Protecteur contre le RC. |
| **Le Foyer** | 7 | 3 | 🔴 Rouge | Voler 3 pièces au lanceur de dés (sauf s'il a un Foyer). | non | Aucun |
| **Biocoop** | 7 | 5 | 🟢 Vert | Recevez 3 pièces par carte *AMAP* que vous possédez. | non | Aucun |
| **Piste de ski indoor** | 8 | 7 | 🟢 Vert | Voler 5 pièces au joueur ayant le moins de cartes polluantes. | **Oui** (+0.1°C) | Aucun malus direct supplémentaire. |
| **Unité de méthanisation** | 8 | 4 | 🟢 Vert | Recevez 3 pièces par carte *Compost* que vous possédez. | non | Aucun |
| **Raffinerie** | 9 | 3 | 🟢 Vert | Recevez 3 pièces par carte *Puit de pétrole* que vous possédez. | **Oui** (+0.1°C) | Synergie annulée : recevez **1 seule pièce au total**. |
| **Eolienne** | 9 | 4 | 🔵 Bleu | Recevez 3 pièces de la banque. | non | Aucun |
| **Le Sun** | 9 | 3 | 🔴 Rouge | Voler 3 pièces au lanceur + échange obligatoire d'1 carte. | non | Aucun |
| **Petit parc serin** | 10 | 3 | 🟢 Vert | Recevez 4 pièces de la banque. | non | Aucun |
| **Usine Michelin** | 10 | 3 | 🟢 Vert | Recevez 4 pièces par carte *Extraction de caoutchouc* possédée. | **Oui** (+0.1°C) | Synergie annulée : recevez **1 seule pièce au total**. |
| **Panneaux Solaires** | 11-12 | 2 | 🔵 Bleu | Recevez 3 pièces de la banque. | non | Aucun |

---

### 3.2 Détails des Règles Particulières sur Bâtiments Spéciaux

#### 1. Centrale Nucléaire (Valeur 6, Coût 8, Violette)
- **Fonctionnement standard :** Pendant votre tour, gagnez **6 pièces**.
- **Effet Critique (Fusion Nucléaire) :** Si la *Centrale Nucléaire* s'active **deux fois consécutivement** (sur deux tours où un 6 est tiré par le propriétaire), le réacteur entre en fusion.
- **Conséquences de la fusion :**
  - Destruction totale de la ville du propriétaire (toutes ses cartes établissements sont défaussées/détruites).
  - Destruction de toutes les cartes de valeur **6** chez les voisins directs (joueurs situés immédiatement à gauche et à droite).

#### 2. Le Sun (Valeur 9, Coût 3, Rouge)
- **Fonctionnement :** Lorsqu'un autre joueur obtient un 9, vous lui volez **3 pièces**.
- **Effet d'échange :** Immédiatement après le vol, vous devez échanger 1 carte de votre choix dans votre ville contre 1 carte de la ville du joueur qui a lancé les dés.

#### 3. Le Foyer (Valeur 7, Coût 3, Rouge)
- **Fonctionnement :** Voler 3 pièces au joueur actif.
- **Immunité Foyer :** Si le joueur actif possède lui-même au moins une carte *Le Foyer*, l'effet est complètement annulé (il ne vous verse aucune pièce).

#### 4. Piste de Ski Indoor (Valeur 8, Coût 7, Verte)
- **Fonctionnement :** Pendant votre tour, identifiez le joueur qui possède le **strict minimum de cartes polluantes** ($\Delta$) sur la table. Vous lui volez **5 pièces**.
- **Impact écologique :** Augmente tout de même la température globale de **+0.1°C** à chaque déclenchement.