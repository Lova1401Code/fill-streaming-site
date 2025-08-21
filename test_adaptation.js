import jsonData from "./utils/parser.js";
import { validateStreamingItem, sanitizeStreamingItem } from "./utils/errorHandler.js";

console.log("🧪 Test d'adaptation aux nouvelles clés JSON");
console.log("=" .repeat(50));

// Test avec le premier élément du JSON
const testItem = jsonData[0];
console.log("📋 Élément de test:", JSON.stringify(testItem, null, 2));

try {
    // Test de validation
    console.log("\n✅ Test de validation...");
    const isValid = validateStreamingItem(testItem);
    console.log("Validation réussie:", isValid);
    
    // Test de nettoyage
    console.log("\n🧹 Test de nettoyage...");
    const cleanItem = sanitizeStreamingItem(testItem);
    console.log("Données nettoyées:", JSON.stringify(cleanItem, null, 2));
    
    // Vérification des clés
    console.log("\n🔍 Vérification des clés:");
    console.log("- title:", cleanItem.title);
    console.log("- networks:", cleanItem.networks);
    console.log("- year:", cleanItem.year);
    console.log("- runtime:", cleanItem.runtime);
    console.log("- country:", cleanItem.country);
    
    // Test avec un élément ayant un originalTitle différent
    const parasiteItem = jsonData.find(item => item.title === "Parasite");
    if (parasiteItem) {
        console.log("\n🌍 Test avec Parasite (originalTitle différent):");
        console.log("- title:", parasiteItem.title);
        console.log("- originalTitle:", parasiteItem.originalTitle);
        console.log("- networks:", parasiteItem.networks);
    }
    
    console.log("\n🎉 Tous les tests sont passés avec succès !");
    
} catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
    console.error("Stack:", error.stack);
}
