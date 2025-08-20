import getBatch from "../utils/getBatch.js";
import searchInDatabase from "../utils/searchInDatabase.js";
import insertInDatabase from "../utils/InsertInDatabase.js";

export default async function principal(batch) {
    for (const item of batch) {
        try {
            const resultSearch = await searchInDatabase(item.title, item.year, item.runtime);
            if (resultSearch.type === "movie" && resultSearch.movie) {
                await insertInDatabase(item, resultSearch.movie.imdbId, "movie");
            } else if (resultSearch.type === "serie" && resultSearch.serie) {
                await insertInDatabase(item, resultSearch.serie.imdbId, "serie");
            }
        } catch (error) {
            console.error(error);
        }
    }
}