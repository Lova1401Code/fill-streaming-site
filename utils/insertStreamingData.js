import { prisma } from "../prisma/client.js";
import { getNormalizedNetwork, getNormalizedCountry } from "../config.js";

export default async function insertStreamingData(streamingData, movieId, serieId) {
    try {
        // Normalisation des données
        const normalizedNetwork = getNormalizedNetwork(streamingData.network);
        const normalizedCountry = getNormalizedCountry(streamingData.country);

        // Si c'est un film
        if (movieId) {
            await prisma.streamingSite.create({
                data: {
                    network: normalizedNetwork,
                    country: normalizedCountry,
                    movieId: movieId,
                    serieId: null,
                    serieOptimisedId: null
                }
            });
        }
        // Si c'est une série - créer les deux relations (Series ET SerieOptimised)
        else if (serieId) {
            // Créer l'entrée pour SerieOptimised
            await prisma.streamingSite.create({
                data: {
                    network: normalizedNetwork,
                    country: normalizedCountry,
                    movieId: null,
                    serieId: null,
                    serieOptimisedId: serieId
                }
            });

            await prisma.streamingSite.create({
                data: {
                    network: normalizedNetwork,
                    country: normalizedCountry,
                    movieId: null,
                    serieId: serieId,
                    serieOptimisedId: null
                }
            });
        }

        return true;
    } catch (error) {
        console.error("Erreur lors de l'insertion des données de streaming:", error);
        return false;
    }
}
