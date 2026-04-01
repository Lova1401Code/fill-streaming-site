import { prisma } from "../prisma/client.js";

async function cleanupStreamingSite() {
    try {
        console.log("🧹 Nettoyage de la table StreamingSite...");
        
        // Compter les entrées avant suppression
        const beforeCount = await prisma.streamingSite.count();
        console.log(`📊 Nombre d'entrées avant nettoyage: ${beforeCount}`);
        
        if (beforeCount === 0) {
            console.log("✅ La table est déjà vide");
            return;
        }
        
        // Demander confirmation
        console.log("⚠️ ATTENTION: Cette action va supprimer TOUTES les entrées de StreamingSite!");
        console.log("Appuyez sur Ctrl+C pour annuler ou attendez 5 secondes pour continuer...");
        
        // Attendre 5 secondes
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Supprimer toutes les entrées
        const deleteResult = await prisma.streamingSite.deleteMany({});
        console.log(`🗑️ ${deleteResult.count} entrées supprimées`);
        
        // Vérifier le résultat
        const afterCount = await prisma.streamingSite.count();
        console.log(`📊 Nombre d'entrées après nettoyage: ${afterCount}`);
        
        console.log("✅ Nettoyage terminé avec succès!");
        
    } catch (error) {
        console.error("❌ Erreur lors du nettoyage:", error);
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Connexion fermée");
    }
}

cleanupStreamingSite().catch((error) => {
    console.error("Erreur fatale:", error);
    process.exit(1);
});
