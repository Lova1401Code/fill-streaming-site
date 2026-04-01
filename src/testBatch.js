import getBatch, { getTotalCount, hasMoreData } from "../utils/getBatch.js";
import { CONFIG, calculateBatchProgress } from "../config.js";

async function testBatchProcessing() {
    try {
        console.log("🧪 Test du système de traitement par lots...");
        
        const totalCount = getTotalCount();
        const batchSize = CONFIG.PROCESSING.BATCH_SIZE;
        const totalBatches = Math.ceil(totalCount / batchSize);
        
        console.log(`📊 Configuration:`);
        console.log(`   - Total d'éléments: ${totalCount}`);
        console.log(`   - Taille des lots: ${batchSize}`);
        console.log(`   - Nombre total de lots: ${totalBatches}`);
        console.log(`   - Délai entre lots: ${CONFIG.PROCESSING.DELAY_BETWEEN_BATCHES}ms`);
        
        console.log(`\n🔍 Test des lots:`);
        
        let currentIndex = 0;
        let batchNumber = 1;
        
        while (hasMoreData(currentIndex)) {
            const batch = getBatch(currentIndex, batchSize);
            const progress = calculateBatchProgress(currentIndex, totalCount, batchSize);
            
            console.log(`\n--- Lot ${batchNumber}/${totalBatches} ---`);
            console.log(`   Index: ${currentIndex} - ${currentIndex + batch.length - 1}`);
            console.log(`   Progrès: ${progress.progress.toFixed(1)}%`);
            console.log(`   Éléments: ${batch.length}`);
            console.log(`   Contenu:`);
            
            batch.forEach((item, index) => {
                console.log(`     ${index + 1}. ${item.name_film} (${item.year})`);
            });
            
            // Simulation du traitement
            console.log(`   ⏱️ Traitement simulé...`);
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulation d'un délai
            
            currentIndex += batchSize;
            batchNumber++;
        }
        
        console.log(`\n✅ Test terminé!`);
        console.log(`📈 Tous les ${totalBatches} lots ont été simulés avec succès.`);
        
    } catch (error) {
        console.error("❌ Erreur lors du test:", error);
    }
}

testBatchProcessing().catch((error) => {
    console.error("Erreur fatale:", error);
    process.exit(1);
});

