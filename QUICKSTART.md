# 🚀 Guide de démarrage rapide

Ce guide vous permettra de démarrer rapidement avec le projet Fill Streaming Site.

## ⚡ Démarrage en 5 minutes

### 1. Prérequis
- Node.js 16+ installé
- Base de données PostgreSQL accessible
- Données de films/séries déjà présentes dans votre base

### 2. Installation
```bash
# Cloner ou télécharger le projet
cd fill-streaming-site

# Installer les dépendances
npm install
```

### 3. Configuration
```bash
# Copier le fichier de configuration
cp config.env.example .env

# Éditer .env avec vos informations de base
# DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
```

### 4. Génération du client Prisma
```bash
npx prisma generate
```

### 5. Test de connexion
```bash
npm run test
```

### 6. Test du système de lots
```bash
npm run test:batch
```

### 7. Lancer le traitement
```bash
npm run seed
```

## 🔍 Vérification

Après le traitement, vérifiez les résultats :
```bash
npm run verify
```

## 📊 Exemple de sortie avec lots

```
🚀 Début du traitement des données de streaming...
📊 25 éléments à traiter en 5 lots de 5
⚡ Traitement en parallèle: Activé

📈 Progrès: 0.0% (Lot 1/5)

🚀 --- Traitement du lot 1/5 (5 éléments) ---
Traitement de: Inception
✅ Film trouvé: Inception (ID: 123)
✅ StreamingSite créé: Netflix - USA pour Inception
✅ StreamingSite créé: Amazon Prime - USA pour Inception
📊 Résumé pour Inception: 2 succès, 0 erreurs

📊 Résumé du lot 1/5: 4 succès, 1 ignoré, 0 erreurs

⏳ Pause de 200ms avant le prochain lot...

🚀 --- Traitement du lot 2/5 (5 éléments) ---
...

🎉 Traitement terminé!
📊 Résumé global:
   ✅ Succès: 23
   ⚠️ Ignorés: 2
   ❌ Erreurs: 0
   📈 Total traité: 25
   🎯 Taux de succès: 92.0%
```

## ⚡ Traitement par lots

Le système traite vos données par **lots de 5 éléments** :
- **Performance** : 5 éléments traités simultanément
- **Contrôle** : Pause de 200ms entre chaque lot
- **Monitoring** : Suivi détaillé du progrès par lot
- **Robustesse** : Gestion d'erreurs avec `Promise.allSettled`

## 🆘 Problèmes courants

### Erreur de connexion
```bash
# Vérifiez votre .env
cat .env

# Testez la connexion
npm run test
```

### Aucune correspondance trouvée
- Vérifiez que vos films/séries existent dans la base
- Vérifiez les titres et années dans `data/file.json`
- Assurez-vous que les données existent dans votre base

### Erreur Prisma
```bash
# Régénérez le client
npx prisma generate

# Vérifiez le schéma
npx prisma db pull
```

### Problèmes de performance
```bash
# Testez le système de lots
npm run test:batch

# Ajustez la configuration dans config.js
# BATCH_SIZE: 5 (taille des lots)
# DELAY_BETWEEN_BATCHES: 200 (délai en ms)
```

## 📁 Structure des données

Votre fichier `data/file.json` doit ressembler à :
```json
[
  {
    "name_film": "Inception",
    "network": ["Netflix", "Amazon Prime"],
    "runtime": 148,
    "year": 2010,
    "country": "USA"
  }
]
```

## 🎯 Prochaines étapes

1. **Personnalisation** : Modifiez `config.js` selon vos besoins
2. **Données** : Adaptez `data/file.json` à votre catalogue
3. **Monitoring** : Utilisez les scripts de vérification
4. **Performance** : Ajustez la taille des lots et les délais
5. **Production** : Optimisez la configuration pour votre environnement

## 🔧 Configuration avancée

### Ajuster la taille des lots
```javascript
// Dans config.js
PROCESSING: {
    BATCH_SIZE: 10,           // Lots de 10 éléments
    DELAY_BETWEEN_BATCHES: 500, // 500ms entre les lots
}
```

### Désactiver le parallélisme
```javascript
// Dans config.js
PROCESSING: {
    PARALLEL_PROCESSING: false // Traitement séquentiel
}
```

## 📞 Support

En cas de problème :
1. Consultez les logs d'erreur
2. Vérifiez la configuration
3. Testez la connexion à la base
4. Testez le système de lots
5. Consultez le README complet

---

**Bon streaming ! 🎬**
