import { prisma } from "../prisma/client.js";

export default async function insertInDatabase(data, imdbId, type) {
    if (type === "movie") {
        try {
            await prisma.movie.update({
                where: {
                    imdbId: imdbId,
                },
                data: data,
            });
        } catch (error) {
            console.error(error);
            return null;
        }   
    } else if (type === "serie") {
        try {
            await prisma.series.update({
                where: {
                    imdbId: imdbId,
                },
                data: data,
            });
            await prisma.serieOptimised.update({
                where: {
                    imdbId: imdbId,
                },
                data: data,
            });
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}