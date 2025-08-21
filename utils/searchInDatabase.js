import { prisma } from "../prisma/client.js";

export default async function searchInDatabase(title, year, runtime) {
    try {
        // Recherche d'abord par title, puis par originalTitle si aucune correspondance
        const movie = await prisma.movie.findFirst({
            where: {
                OR: [
                    {
                        title: title,
                        releaseYear: parseInt(year),
                        runtime: parseInt(runtime),
                    },
                    {
                        originalTitle: title,
                        releaseYear: parseInt(year),
                        runtime: parseInt(runtime),
                    }
                ]
            },
            select: {
                id: true,
                imdbId: true,
            },
        });
        const serie = await prisma.serieOptimised.findFirst({
            where: {
                OR: [
                    {
                        name: title, // Utilise 'name' pour les séries
                        titleYear: parseInt(year),
                        // Note: runtime est un objet JSON pour les séries, on ne peut pas le comparer directement
                    },
                    {
                        worldWideName: title,
                        titleYear: parseInt(year),
                    }
                ]
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