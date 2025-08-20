import getBatch, { getTotalCount, hasMoreData } from "../utils/getBatch.js";
import searchInDatabase from "../utils/searchInDatabase.js";
import insertStreamingData from "../utils/insertStreamingData.js";
import { validateStreamingItem, sanitizeStreamingItem, logError } from "../utils/errorHandler.js";
import { CONFIG, calculateBatchProgress } from "../config.js";
import { prisma } from "../prisma/client.js";

async function processStreamingData(item) {
    try {
        // Validation et nettoyage des données
        validateStreamingItem(item);
        const cleanItem = sanitizeStreamingItem(item);
        
        console.log(`Traitement de: ${cleanItem.name_film}`);
        
        // Recherche dans la base de données
        const searchResult = await searchInDatabase(
            cleanItem.name_film, 
            cleanItem.year, 
            cleanItem.runtime
        );
        
        if (!searchResult) {
            console.log(`❌ Aucune correspondance trouvée pour: ${cleanItem.name_film}`);
            return { success: false, skipped: true, item: cleanItem.name_film };
        }
        
        const { movie, serie, type } = searchResult;
        let movieId = null;
        let serieId = null;
        
        if (type === "movie") {
            movieId = movie.id;
            console.log(`✅ Film trouvé: ${cleanItem.name_film} (ID: ${movieId})`);
        } else if (type === "serie") {
            serieId = serie.id;
            console.log(`✅ Série trouvée: ${cleanItem.name_film} (ID: ${serieId})`);
        }
        
        // Traitement des réseaux et pays
        const networks = cleanItem.network;
        //const countries = Array.isArray(cleanItem.country) ? cleanItem.country : [cleanItem.country];
        const country = cleanItem.country;

        let successCount = 0;
        let errorCount = 0;
        
        // Création des entrées StreamingSite pour chaque combinaison network/country
        for (const network of networks) {
                const streamingData = {
                    network: network,
                    country: country
                };
                
                const success = await insertStreamingData(streamingData, movieId, serieId);
                if (success) {
                    successCount++;
                    console.log(`✅ StreamingSite créé: ${network} - ${country} pour ${cleanItem.name_film}`);
                } else {
                    errorCount++;
                    console.log(`❌ Erreur lors de la création de StreamingSite pour ${cleanItem.name_film}`);
                }
        }
        
        console.log(`📊 Résumé pour ${cleanItem.name_film}: ${successCount} succès, ${errorCount} erreurs`);
        return { 
            success: successCount > 0, 
            skipped: false, 
            item: cleanItem.name_film,
            successCount,
            errorCount
        };
        
    } catch (error) {
        logError(error, `Traitement de ${item.name_film}`);
        return { success: false, skipped: false, item: item.name_film, error: error.message };
    }
}

async function processBatch(batch, batchNumber, totalBatches) {
    console.log(`\n🚀 --- Traitement du lot ${batchNumber}/${totalBatches} (${batch.length} éléments) ---`);
    
    // Traitement en parallèle avec Promise.allSettled
    const promises = batch.map(item => processStreamingData(item));
    const results = await Promise.allSettled(promises);
    
    let batchSuccessCount = 0;
    let batchSkippedCount = 0;
    let batchErrorCount = 0;
    
    // Analyse des résultats
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            const { success, skipped, item, successCount, errorCount } = result.value;
            if (success) {
                batchSuccessCount++;
                console.log(`✅ ${item}: Traité avec succès (${successCount} entrées créées)`);
            } else if (skipped) {
                batchSkippedCount++;
                console.log(`⚠️ ${item}: Ignoré (aucune correspondance trouvée)`);
            } else {
                batchErrorCount++;
                console.log(`❌ ${item}: Erreur lors du traitement`);
            }
        } else {
            batchErrorCount++;
            console.log(`❌ Élément ${index + 1}: Erreur fatale - ${result.reason.message}`);
        }
    });
    
    console.log(`📊 Résumé du lot ${batchNumber}/${totalBatches}: ${batchSuccessCount} succès, ${batchSkippedCount} ignorés, ${batchErrorCount} erreurs`);
    
    return {
        successCount: batchSuccessCount,
        skippedCount: batchSkippedCount,
        errorCount: batchErrorCount
    };
}

async function main() {
    try {
        console.log("🚀 Début du traitement des données de streaming...");
        
        const totalCount = getTotalCount();
        const batchSize = CONFIG.PROCESSING.BATCH_SIZE;
        const totalBatches = Math.ceil(totalCount / batchSize);
        
        console.log(`📊 ${totalCount} éléments à traiter en ${totalBatches} lots de ${batchSize}`);
        console.log(`⚡ Traitement en parallèle: ${CONFIG.PROCESSING.PARALLEL_PROCESSING ? 'Activé' : 'Désactivé'}`);
        
        let globalSuccessCount = 0;
        let globalSkippedCount = 0;
        let globalErrorCount = 0;
        let currentIndex = 0;
        let batchNumber = 1;
        
        // Traitement par lots
        while (hasMoreData(currentIndex)) {
            const batch = getBatch(currentIndex, batchSize);
            
            // Affichage du progrès
            const progress = calculateBatchProgress(currentIndex, totalCount, batchSize);
            console.log(`\n📈 Progrès: ${progress.progress.toFixed(1)}% (Lot ${progress.currentBatch}/${progress.totalBatches})`);
            
            // Traitement du lot en parallèle
            const batchResults = await processBatch(batch, batchNumber, totalBatches);
            
            // Mise à jour des compteurs globaux
            globalSuccessCount += batchResults.successCount;
            globalSkippedCount += batchResults.skippedCount;
            globalErrorCount += batchResults.errorCount;
            
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
        console.log(`   ✅ Succès: ${globalSuccessCount}`);
        console.log(`   ⚠️ Ignorés: ${globalSkippedCount}`);
        console.log(`   ❌ Erreurs: ${globalErrorCount}`);
        console.log(`   📈 Total traité: ${totalCount}`);
        console.log(`   🎯 Taux de succès: ${((globalSuccessCount / totalCount) * 100).toFixed(1)}%`);
        
    } catch (error) {
        logError(error, "Fonction principale");
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Connexion à la base de données fermée");
    }
}

main().catch((error) => {
    logError(error, "Programme principal");
    process.exit(1);
});