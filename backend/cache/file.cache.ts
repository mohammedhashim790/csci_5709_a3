/**
 * File caching module that provides caching mechanisms for file-related operations
 * to improve performance and reduce database load.
 */

import FileSchema from "../models/file.model.js";

type CacheEntry = {
    data: any[]; timestamp: number;
};

const cache = new Map<string, CacheEntry>();


/**
 * Retrieves files for a specific patient, using a caching mechanism.
 * Cache expires after 5 minutes to ensure data freshness.
 *
 * @param patientId - The unique identifier of the patient
 * @returns Promise resolving to an array of the 3 most recent files for the patient
 */
export const getCachedFile = async (patientId: string) => {
    const cacheKey = `appointments-${patientId}`;

    if (cache.has(cacheKey)) {
        const {data, timestamp} = cache.get(cacheKey)!;
        // 300000 = 5 Minutes
        if (Date.now() - timestamp < 300000) {
            return data;
        }
    }

    let files: any = await FileSchema.find({patientId})
        .sort({
            createdAt: -1,
        })
        .lean();
    files = files.splice(0, 3);

    cache.set(cacheKey, {data: files, timestamp: Date.now()});
    return files;
}




