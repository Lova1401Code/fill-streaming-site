# Fill Streaming Site

Ce projet permet de remplir automatiquement la table `StreamingSite` de votre base de données avec les informations de streaming (réseaux et pays) pour les films et séries.

## 🎯 Objectif

Le but de ce projet est de :
1. Lire les données de streaming depuis un fichier JSON
2. Vérifier l'existence des films/séries dans la base de données en utilisant :
   - Le titre original (`originalTitle` pour les films, `name` pour les séries)
   - L'année (`releaseYear` pour les films, `titleYear` pour les séries)
   - La durée (`runtime` pour les films)
3. Créer des entrées dans la table `StreamingSite` avec les relations appropriées vers `Movie` ou `Series`
4. Normaliser et valider les données avant insertion
5. **Traiter les données par lots de 5 en parallèle** pour optimiser les performances

## 📁 Structure du projet

```
fill-streaming-site/
├── data/
│   └── file.json          # Données de streaming à traiter
├── prisma/
│   ├── schema.prisma      # Schéma de la base de données
│   └── client.js          # Client Prisma
├── utils/
│   ├── parser.js          # Parser du fichier JSON
│   ├── getBatch.js        # Gestion des lots de données (5 par lot)
│   ├── searchInDatabase.js # Recherche dans la base
│   ├── InsertInDatabase.js # Insertion dans la base
│   ├── insertStreamingData.js # Insertion des données de streaming
│   └── errorHandler.js    # Gestion des erreurs et validation
├── src/
│   ├── index.js           # Point d'entrée principal (traitement par lots)
│   ├── test.js            # Script de test de connexion
│   ├── testBatch.js       # Test du système de lots
│   ├── cleanup.js         # Script de nettoyage
│   └── verify.js          # Script de vérification
├── config.js               # Configuration centralisée
├── config.env.example      # Exemple de configuration
└── package.json
```

## 🚀 Installation et configuration

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer la base de données
1. Copiez `config.env.example` vers `.env`
2. Modifiez le fichier `.env` avec vos informations de connexion :
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
   ```

### 3. Générer le client Prisma
```bash
npx prisma generate
```

### 4. Vérifier la connexion à la base
```bash
npx prisma db pull
```

## 📊 Format des données

Le fichier `data/file.json` doit contenir un tableau d'objets avec la structure suivante :

```json
{
  "name_film": "Nom du film/série",
  "network": ["Netflix", "Amazon Prime"],
  "runtime": 148,
  "year": 2010,
  "country": "USA"
}
```

**Champs :**
- `name_film` : Titre du film ou de la série
- `network` : Tableau des réseaux de streaming
- `runtime` : Durée en minutes (pour les films)
- `year` : Année de sortie
- `country` : Pays de diffusion

## ⚙️ Configuration

Le fichier `config.js` contient la configuration centralisée :

- **Base de données** : URL, timeout, connexions max
- **Traitement par lots** : Taille des lots (5), délais, tentatives
- **Logs** : Niveau, timestamps, progression
- **Validation** : Mode strict, gestion des erreurs

### Traitement par lots

Le système traite les données par **lots de 5 éléments** :
- **Taille des lots** : 5 éléments par lot (configurable)
- **Traitement parallèle** : Chaque lot utilise `Promise.allSettled` pour traiter les 5 éléments simultanément
- **Délai entre lots** : 200ms de pause entre chaque lot pour éviter la surcharge
- **Progrès en temps réel** : Affichage du progrès par lot et global

### Normalisation automatique

Le système normalise automatiquement :
- **Réseaux** : Netflix, netflix, NETFLIX → Netflix
- **Pays** : USA, United States, US → USA

## 🎬 Utilisation

### Scripts disponibles

#### Test de connexion
```bash
npm run test
```
Teste la connexion à la base et les fonctions de recherche.

#### Test du système de lots
```bash
npm run test:batch
```
Teste le système de traitement par lots sans connexion à la base.

#### Remplissage des données
```bash
npm run seed
```
Traite le fichier JSON par lots de 5 et remplit la table StreamingSite.

#### Nettoyage
```bash
npm run cleanup
```
⚠️ **ATTENTION** : Supprime TOUTES les entrées de StreamingSite.

#### Vérification
```bash
npm run verify
```
Affiche les statistiques et exemples des données insérées.

### Ou directement avec Node
```bash
node src/test.js         # Test de connexion
node src/testBatch.js    # Test des lots
node src/index.js        # Remplissage par lots
node src/cleanup.js      # Nettoyage
node src/verify.js       # Vérification
```

## 🔍 Logique de recherche

### Pour les films
- Recherche par `originalTitle`, `releaseYear`, et `runtime`

### Pour les séries
- Recherche par `name` et `titleYear`
- Note : Le `runtime` n'est pas utilisé pour les séries car il est stocké en JSON

## 📝 Résultat

Le script va :
1. Valider et nettoyer chaque élément du fichier JSON
2. **Diviser les données en lots de 5 éléments**
3. **Traiter chaque lot en parallèle** avec `Promise.allSettled`
4. Rechercher la correspondance dans la base pour chaque élément
5. Normaliser les réseaux et pays
6. Créer des entrées `StreamingSite` pour chaque combinaison network/country
7. Établir les relations avec `Movie` ou `Series`
8. Afficher les logs de progression détaillés par lot

## ⚡ Traitement parallèle

### Avantages du système par lots
- **Performance** : Traitement de 5 éléments simultanément
- **Contrôle** : Pause entre les lots pour éviter la surcharge
- **Monitoring** : Suivi détaillé du progrès par lot
- **Robustesse** : Gestion d'erreurs avec `Promise.allSettled`

### Exemple de sortie
```
🚀 --- Traitement du lot 1/5 (5 éléments) ---
📊 Résumé du lot 1/5: 4 succès, 1 ignoré, 0 erreurs

⏳ Pause de 200ms avant le prochain lot...

🚀 --- Traitement du lot 2/5 (5 éléments) ---
📊 Résumé du lot 2/5: 5 succès, 0 ignoré, 0 erreurs
```

## 🛡️ Gestion des erreurs

Le système inclut une gestion robuste des erreurs :

- **Validation** : Vérification des champs obligatoires
- **Normalisation** : Standardisation des données
- **Logging** : Traçabilité complète des erreurs
- **Récupération** : Continuation du traitement malgré les erreurs
- **Rapports** : Statistiques détaillées des succès/échecs par lot

## ⚠️ Notes importantes

- Assurez-vous que votre base de données contient les films/séries avant de lancer le script
- Le script vérifie l'existence avant d'insérer les données
- **Traitement par lots de 5 éléments en parallèle**
- **Pause de 200ms entre chaque lot** pour éviter la surcharge
- Les erreurs sont loggées mais n'arrêtent pas le traitement des autres éléments
- Le système normalise automatiquement les noms de réseaux et pays

## 🐛 Dépannage

### Erreur de connexion à la base
- Vérifiez votre `DATABASE_URL` dans le fichier `.env`
- Assurez-vous que PostgreSQL est en cours d'exécution
- Vérifiez les permissions de votre utilisateur

### Erreur "Prisma client not found"
- Exécutez `npx prisma generate`
- Vérifiez que `@prisma/client` est installé

### Aucune correspondance trouvée
- Vérifiez que les titres correspondent exactement
- Vérifiez que les années et durées sont correctes
- Assurez-vous que les données existent dans votre base

### Erreurs de validation
- Vérifiez le format du fichier JSON
- Assurez-vous que tous les champs obligatoires sont présents
- Consultez les logs d'erreur pour plus de détails

### Problèmes de performance
- Ajustez la taille des lots dans `config.js`
- Modifiez le délai entre les lots
- Vérifiez la charge de votre base de données

## 🔄 Workflow recommandé

1. **Test de connexion** : `npm run test` - Vérifier la connexion
2. **Test des lots** : `npm run test:batch` - Vérifier le système de lots
3. **Nettoyage** (optionnel) : `npm run cleanup` - Vider la table
4. **Remplissage** : `npm run seed` - Insérer les données par lots
5. **Vérification** : `npm run verify` - Contrôler le résultat

## 📈 Monitoring et logs

Le système fournit des logs détaillés :
- **Progression par lot** : Suivi en temps réel de chaque lot
- **Traitement parallèle** : Affichage des éléments traités simultanément
- **Statistiques par lot** : Compteurs de succès/échecs pour chaque lot
- **Progrès global** : Pourcentage d'avancement et estimation du temps restant
- **Détails des erreurs** : Contexte et éléments problématiques
- **Résumés détaillés** : Statistiques complètes par lot et globales

## 🔧 Personnalisation

Vous pouvez modifier le fichier `config.js` pour :
- **Ajuster la taille des lots** : Modifier `BATCH_SIZE`
- **Modifier les délais** : Ajuster `DELAY_BETWEEN_BATCHES`
- **Activer/désactiver le parallélisme** : Modifier `PARALLEL_PROCESSING`
- **Modifier les alias** : Ajouter de nouveaux réseaux/pays
- **Configurer le niveau de logs** : Ajuster les paramètres de logging
- **Activer le mode strict** : Arrêter le traitement en cas d'erreur

## 📊 Exemple de configuration avancée

```javascript
// Dans config.js
PROCESSING: {
    BATCH_SIZE: 10,           // Lots de 10 éléments
    DELAY_BETWEEN_BATCHES: 500, // 500ms entre les lots
    MAX_RETRIES: 5,           // 5 tentatives en cas d'échec
    PARALLEL_PROCESSING: true // Traitement parallèle activé
}
```
