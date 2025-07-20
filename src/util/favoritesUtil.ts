import {FavoriteGallery, FavoritesData} from "@/type/file";

const FAVORITES_STORAGE_KEY = "gallery-favorites";

/**
 * Get favorites from localStorage filtered by rootPath
 * @param rootPath - Root path to filter favorites
 */
export function getFavoritesFromStorage(rootPath: string): FavoriteGallery[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!stored) return [];

        const data: FavoritesData = JSON.parse(stored);
        const allGalleries = data.galleries || [];

        return allGalleries.filter(gallery => gallery.rootPath === rootPath);
    } catch (error) {
        console.error("Error reading favorites from localStorage:", error);
        return [];
    }
}

/**
 * Save favorites to localStorage
 */
export function saveFavoritesToStorage(galleries: FavoriteGallery[]): void {
    if (typeof window === "undefined") return;

    try {
        const data: FavoritesData = {
            galleries,
        };

        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving favorites to localStorage:", error);
    }
}

/**
 * Add a gallery to favorites
 * @param gallery - The gallery to add to favorites
 * @param rootPath - Root path to filter the returned favorites
 */
export function addGalleryToFavorites(gallery: FavoriteGallery, rootPath: string): FavoriteGallery[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        const data: FavoritesData = stored ? JSON.parse(stored) : {galleries: []};
        const allFavorites = data.galleries || [];

        // Check if already exists
        if (allFavorites.some(fav => fav.path === gallery.path)) {
            return getFavoritesFromStorage(rootPath);
        }

        const updatedAllFavorites = [gallery, ...allFavorites];
        saveFavoritesToStorage(updatedAllFavorites);

        // Return filtered favorites for the hook
        return getFavoritesFromStorage(rootPath);
    } catch (error) {
        console.error("Error adding gallery to favorites:", error);
        return getFavoritesFromStorage(rootPath);
    }
}

/**
 * Remove a gallery from favorites
 * @param galleryPath - The path of the gallery to remove
 * @param rootPath - Root path to filter the returned favorites
 */
export function removeGalleryFromFavorites(galleryPath: string, rootPath: string): FavoriteGallery[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!stored) return [];

        const data: FavoritesData = JSON.parse(stored);
        const allFavorites = data.galleries || [];

        const updatedAllFavorites = allFavorites.filter(fav => fav.path !== galleryPath);
        saveFavoritesToStorage(updatedAllFavorites);

        // Return filtered favorites for the hook
        return getFavoritesFromStorage(rootPath);
    } catch (error) {
        console.error("Error removing gallery from favorites:", error);
        return getFavoritesFromStorage(rootPath);
    }
}

/**
 * Check if a gallery is favorited within a specific rootPath
 * @param galleryPath - The path of the gallery to check
 * @param rootPath - Root path to filter the search
 */
export function isGalleryFavorited(galleryPath: string, rootPath: string): boolean {
    const favorites = getFavoritesFromStorage(rootPath);
    return favorites.some(fav => fav.path === galleryPath);
}

/**
 * Clear all favorites (for debugging/reset)
 */
export function clearAllFavorites(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
}

/**
 * Get favorites count for a specific rootPath
 * @param rootPath - Root path to filter the count
 */
export function getFavoritesCount(rootPath: string): number {
    return getFavoritesFromStorage(rootPath).length;
}
