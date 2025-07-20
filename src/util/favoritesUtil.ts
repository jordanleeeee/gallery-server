import {FavoriteGallery, FavoritesData} from "@/type/file";

const FAVORITES_STORAGE_KEY = "gallery-favorites";

/**
 * Get all favorites from localStorage
 */
export function getFavoritesFromStorage(): FavoriteGallery[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!stored) return [];

        const data: FavoritesData = JSON.parse(stored);
        return data.galleries || [];
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
 */
export function addGalleryToFavorites(gallery: FavoriteGallery): FavoriteGallery[] {
    const favorites = getFavoritesFromStorage();

    // Check if already exists
    if (favorites.some(fav => fav.path === gallery.path)) {
        return favorites;
    }

    const updatedFavorites = [gallery, ...favorites];
    saveFavoritesToStorage(updatedFavorites);
    return updatedFavorites;
}

/**
 * Remove a gallery from favorites
 */
export function removeGalleryFromFavorites(galleryPath: string): FavoriteGallery[] {
    const favorites = getFavoritesFromStorage();

    const updatedFavorites = favorites.filter(fav => fav.path !== galleryPath);
    saveFavoritesToStorage(updatedFavorites);
    return updatedFavorites;
}

/**
 * Check if a gallery is favorited
 */
export function isGalleryFavorited(galleryPath: string): boolean {
    const favorites = getFavoritesFromStorage();
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
 * Get favorites count
 */
export function getFavoritesCount(): number {
    return getFavoritesFromStorage().length;
}
