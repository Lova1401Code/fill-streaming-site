import { prisma } from "../prisma/client.js";
import searchInDatabase from "../utils/searchInDatabase.js";

async function testConnection() {
    try {
        console.log("🔌 Test de connexion à la base de données...");
        
        // Test de connexion simple
        await prisma.$connect();
        console.log("✅ Connexion réussie!");
        
        // Test de recherche d'un film
        console.log("\n🔍 Test de recherche d'un film...");
        const movieResult = await searchInDatabase("Inception", 2010, 148);
        if (movieResult) {
            console.log("✅ Recherche de film réussie:", movieResult);
        } else {
            console.log("⚠️ Aucun film trouvé (normal si la base est vide)");
        }
        
        // Test de recherche d'une série
        console.log("\n🔍 Test de recherche d'une série...");
        const serieResult = await searchInDatabase("Stranger Things", 2016, 50);
        if (serieResult) {
            console.log("✅ Recherche de série réussie:", serieResult);
        } else {
            console.log("⚠️ Aucune série trouvée (normal si la base est vide)");
        }
        
        // Test de comptage des tables
        console.log("\n📊 Test de comptage des tables...");
        const movieCount = await prisma.movie.count();
        const serieCount = await prisma.series.count();
        const streamingCount = await prisma.streamingSite.count();
        
        console.log(`📈 Nombre de films: ${movieCount}`);
        console.log(`📺 Nombre de séries: ${serieCount}`);
        console.log(`🌐 Nombre de sites de streaming: ${streamingCount}`);
        
    } catch (error) {
        console.error("❌ Erreur lors du test:", error);
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Connexion fermée");
    }
}

testConnection().catch((error) => {
    console.error("Erreur fatale:", error);
    process.exit(1);
});
