import { prisma } from "../prisma/client.js";

export default async function searchInDatabase(originalTitle, year, runtime) {
    try {
        const movie = await prisma.movie.findFirst({
            where: {
                originalTitle: originalTitle,
                releaseYear: parseInt(year),
                runtime: parseInt(runtime),
            },
            select: {
                id: true,
                imdbId: true,
            },
        });
        const serie = await prisma.series.findFirst({
            where: {
                name: originalTitle, // Utilise 'name' au lieu de 'originalTitle' pour les séries
                titleYear: parseInt(year),
                // Note: runtime est un objet JSON pour les séries, on ne peut pas le comparer directement
            },
            select: {
                id: true,
                imdbId: true,
            },
        });
        if (movie) {
            return {movie, type: "movie"};
        } else if (serie) {
            return {serie, type: "serie"};
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}