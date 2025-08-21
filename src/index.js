import getBatch, { getTotalCount, hasMoreData } from "../utils/getBatch.js";
import searchInDatabase from "../utils/searchInDatabase.js";
import insertStreamingData from "../utils/insertStreamingData.js";
import { validateStreamingItem, sanitizeStreamingItem, logError } from "../utils/errorHandler.js";
import { CONFIG, calculateBatchProgress } from "../config.js";
import { prisma } from "../prisma/client.js";
import fs from 'fs';

// Fichier pour sauvegarder l'état
const STATE_FILE = './resume_state.json';

class ResumeManager {
    constructor() {
        this.state = this.loadState();
    }

    loadState() {
        try {
            if (fs.existsSync(STATE_FILE)) {
                const data = fs.readFileSync(STATE_FILE, 'utf8');
                const state = JSON.parse(data);
                console.log(`🔄 État de reprise chargé: ${state.currentIndex}/${getTotalCount()} éléments traités`);
                return state;
            }
        } catch (error) {
            console.warn("⚠️ Impossible de charger l'état de reprise, démarrage depuis le début");
        }
        
        return {
            currentIndex: 0,
            successCount: 0,
            skippedCount: 0,
            errorCount: 0,
            lastProcessedItem: null,
            startTime: Date.now()
        };
    }

    saveState(state) {
        try {
            fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        } catch (error) {
            console.warn("⚠️ Impossible de sauvegarder l'état de reprise");
        }
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveState(this.state);
    }

    getProgress() {
        const total = getTotalCount();
        const progress = (this.state.currentIndex / total) * 100;
        return {
            current: this.state.currentIndex,
            total: total,
            progress: progress,
            remaining: total - this.state.currentIndex
        };
    }
}

async function processStreamingData(item, resumeManager) {
    try {
        // Validation et nettoyage
        if (!validateStreamingItem(item)) {
            return { success: false, skipped: false, item: item.title || 'Inconnu', error: 'Données invalides' };
        }

        const cleanItem = sanitizeStreamingItem(item);
        
        // Recherche dans la base
        const searchResult = await searchInDatabase(
            cleanItem.title,
            cleanItem.year,
            cleanItem.runtime
        );

        if (!searchResult) {
            return { success: false, skipped: true, item: cleanItem.name_film, error: 'Aucune correspondance trouvée' };
        }

        // Traitement des réseaux et pays
        const networks = cleanItem.networks;
        const country = cleanItem.country;

        let successCount = 0;
        let errorCount = 0;

        // Création des entrées StreamingSite pour chaque combinaison network/country
        for (const network of networks) {
            const streamingData = {
                network: network,
                country: country
            };

            let result = false;
            if (searchResult.type === "movie") {
                result = await insertStreamingData(streamingData, searchResult.movie.id, null);
            } else if (searchResult.type === "serie") {
                result = await insertStreamingData(streamingData, null, searchResult.serie.id);
            }

            if (result) {
                successCount++;
            } else {
                errorCount++;
            }
        }

        // Mise à jour de l'état de reprise
        resumeManager.updateState({
            lastProcessedItem: cleanItem.name_film,
            successCount: resumeManager.state.successCount + successCount,
            errorCount: resumeManager.state.errorCount + errorCount
        });

        return {
            success: successCount > 0,
            skipped: false,
            item: cleanItem.title,
            successCount: successCount,
            errorCount: errorCount
        };

    } catch (error) {
        logError(error, `Traitement de ${item.title || 'Inconnu'}`);
        return { success: false, skipped: false, item: item.title || 'Inconnu', error: error.message };
    }
}

async function processBatch(batch, batchNumber, totalBatches, resumeManager) {
    console.log(`\n🚀 --- Traitement du lot ${batchNumber}/${totalBatches} (${batch.length} éléments) ---`);

    // Traitement séquentiel pour éviter les connexions multiples
    let batchSuccessCount = 0;
    let batchSkippedCount = 0;
    let batchErrorCount = 0;

    for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        try {
            const result = await processStreamingData(item, resumeManager);
            
            if (result.success) {
                batchSuccessCount++;
                console.log(`✅ ${result.item}: Traité avec succès (${result.successCount} entrées créées)`);
            } else if (result.skipped) {
                batchSkippedCount++;
                console.log(`⚠️ ${result.item}: Ignoré (aucune correspondance trouvée)`);
            } else {
                batchErrorCount++;
                console.log(`❌ ${result.item}: Erreur lors du traitement`);
            }
        } catch (error) {
            batchErrorCount++;
            console.log(`❌ Élément ${i + 1}: Erreur fatale - ${error.message}`);
        }
    }

    console.log(`📊 Résumé du lot ${batchNumber}/${totalBatches}: ${batchSuccessCount} succès, ${batchSkippedCount} ignorés, ${batchErrorCount} erreurs`);

    return {
        successCount: batchSuccessCount,
        skippedCount: batchSkippedCount,
        errorCount: batchErrorCount
    };
}

async function main() {
    const resumeManager = new ResumeManager();
    
    try {
        console.log("🚀 Début du traitement des données de streaming...");
        
        if (resumeManager.state.currentIndex > 0) {
            console.log(`🔄 Reprise depuis l'index ${resumeManager.state.currentIndex}`);
            console.log(`📊 Progression précédente: ${resumeManager.state.successCount} succès, ${resumeManager.state.errorCount} erreurs`);
        }

        const totalCount = getTotalCount();
        const batchSize = CONFIG.PROCESSING.BATCH_SIZE;
        const totalBatches = Math.ceil(totalCount / batchSize);

        console.log(`📊 ${totalCount} éléments à traiter en ${totalBatches} lots de ${batchSize}`);
        console.log(`⚡ Traitement en parallèle: ${CONFIG.PROCESSING.PARALLEL_PROCESSING ? 'Activé' : 'Désactivé (traitement séquentiel)'}`);

        let currentIndex = resumeManager.state.currentIndex;
        let batchNumber = Math.floor(currentIndex / batchSize) + 1;

        // Traitement par lots
        while (hasMoreData(currentIndex)) {
            const batch = getBatch(currentIndex, batchSize);

            // Affichage du progrès
            const progress = calculateBatchProgress(currentIndex, totalCount, batchSize);
            const resumeProgress = resumeManager.getProgress();
            
            console.log(`\n📈 Progrès: ${progress.progress.toFixed(1)}% (Lot ${progress.currentBatch}/${progress.totalBatches})`);
            console.log(`🔄 Reprise: ${resumeProgress.progress.toFixed(1)}% (${resumeProgress.remaining} éléments restants)`);

            // Traitement du lot en parallèle
            const batchResults = await processBatch(batch, batchNumber, totalBatches, resumeManager);

            // Mise à jour de l'état global
            resumeManager.updateState({
                currentIndex: currentIndex + batchSize,
                successCount: resumeManager.state.successCount + batchResults.successCount,
                skippedCount: resumeManager.state.skippedCount + batchResults.skippedCount,
                errorCount: resumeManager.state.errorCount + batchResults.errorCount
            });

            // Passage au lot suivant
            currentIndex += batchSize;
            batchNumber++;

            // Pause entre les lots pour éviter de surcharger la base
            if (hasMoreData(currentIndex)) {
                console.log(`⏳ Pause de ${CONFIG.PROCESSING.DELAY_BETWEEN_BATCHES}ms avant le prochain lot...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.PROCESSING.DELAY_BETWEEN_BATCHES));
            }
        }

        console.log(`\n🎉 Traitement terminé!`);
        console.log(`📊 Résumé global:`);
        console.log(`   ✅ Succès: ${resumeManager.state.successCount}`);
        console.log(`   ⚠️ Ignorés: ${resumeManager.state.skippedCount}`);
        console.log(`   ❌ Erreurs: ${resumeManager.state.errorCount}`);
        console.log(`   📈 Total traité: ${totalCount}`);
        console.log(`   🎯 Taux de succès: ${((resumeManager.state.successCount / totalCount) * 100).toFixed(1)}%`);

        // Nettoyer le fichier d'état une fois terminé
        if (fs.existsSync(STATE_FILE)) {
            fs.unlinkSync(STATE_FILE);
            console.log("🧹 Fichier d'état de reprise supprimé");
        }

    } catch (error) {
        logError(error, "Fonction principale");
        console.log(`\n🔄 Le script peut être relancé avec 'npm run seed' pour reprendre automatiquement depuis l'index ${resumeManager.state.currentIndex}`);
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Connexion à la base de données fermée");
    }
}

// Gestion des signaux pour sauvegarder l'état avant arrêt
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Arrêt demandé par l\'utilisateur...');
    console.log('💾 Sauvegarde de l\'état de reprise...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Arrêt du processus...');
    console.log('💾 Sauvegarde de l\'état de reprise...');
    process.exit(0);
});

main().catch((error) => {
    logError(error, "Programme principal");
    process.exit(1);
});