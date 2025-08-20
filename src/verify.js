import { prisma } from "../prisma/client.js";

async function verifyStreamingData() {
    try {
        console.log("🔍 Vérification des données de streaming...");
        
        // Compter les entrées
        const totalCount = await prisma.streamingSite.count();
        console.log(`📊 Total des entrées StreamingSite: ${totalCount}`);
        
        if (totalCount === 0) {
            console.log("⚠️ Aucune donnée de streaming trouvée");
            return;
        }
        
        // Afficher quelques exemples
        console.log("\n📋 Exemples d'entrées StreamingSite:");
        const examples = await prisma.streamingSite.findMany({
            take: 10,
            include: {
                movie: {
                    select: {
                        title: true,
                        originalTitle: true,
                        releaseYear: true
                    }
                },
                serie: {
                    select: {
                        name: true,
                        titleYear: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });
        
        examples.forEach((entry, index) => {
            console.log(`\n--- Entrée ${index + 1} ---`);
            console.log(`ID: ${entry.id}`);
            console.log(`Network: ${entry.network}`);
            console.log(`Country: ${entry.country}`);
            
            if (entry.movie) {
                console.log(`Type: Film`);
                console.log(`Titre: ${entry.movie.title}`);
                console.log(`Titre original: ${entry.movie.originalTitle}`);
                console.log(`Année: ${entry.movie.releaseYear}`);
            } else if (entry.serie) {
                console.log(`Type: Série`);
                console.log(`Nom: ${entry.serie.name}`);
                console.log(`Année: ${entry.serie.titleYear}`);
            }
        });
        
        // Statistiques par type
        console.log("\n📈 Statistiques par type:");
        const movieCount = await prisma.streamingSite.count({
            where: { movieId: { not: null } }
        });
        const serieCount = await prisma.streamingSite.count({
            where: { serieId: { not: null } }
        });
        
        console.log(`Films: ${movieCount}`);
        console.log(`Séries: ${serieCount}`);
        
        // Statistiques par réseau
        console.log("\n🌐 Statistiques par réseau:");
        const networkStats = await prisma.streamingSite.groupBy({
            by: ['network'],
            _count: {
                network: true
            },
            orderBy: {
                _count: {
                    network: 'desc'
                }
            }
        });
        
        networkStats.forEach(stat => {
            console.log(`${stat.network}: ${stat._count.network} entrées`);
        });
        
        // Statistiques par pays
        console.log("\n🌍 Statistiques par pays:");
        const countryStats = await prisma.streamingSite.groupBy({
            by: ['country'],
            _count: {
                country: true
            },
            orderBy: {
                _count: {
                    country: 'desc'
                }
            }
        });
        
        countryStats.forEach(stat => {
            console.log(`${stat.country}: ${stat._count.country} entrées`);
        });
        
    } catch (error) {
        console.error("❌ Erreur lors de la vérification:", error);
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Connexion fermée");
    }
}

verifyStreamingData().catch((error) => {
    console.error("Erreur fatale:", error);
    process.exit(1);
});
