import { prisma } from "../prisma/client.js";

export default async function searchInDatabase(originalTitle, year, runtime, type) {
    if (type === "movie") {
        try {
            const movie = await prisma.movie.findFirst({
                where: {
                    originalTitle: originalTitle,
                    releaseYear: year,
                    runtime: runtime,
                },
                select: {
                    imdbId: true,
                }
            });
            if (movie) {
                return movie;
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    } else if (type === "serie") {
        try {
            const serie = await prisma.series.findFirst({
                where: {
                    originalTitle: originalTitle,
                    releaseYear: year,
                    runtime: runtime,
                },
            });
            if (serie) {
                return serie;
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    } else {
        return null;
    }
}