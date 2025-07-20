import {useState, useEffect, useCallback} from "react";
import {FavoriteGallery} from "@/type/file";
import {getFavoritesFromStorage, addGalleryToFavorites, removeGalleryFromFavorites, isGalleryFavorited} from "@/util/favoritesUtil";

interface UseFavoritesReturn {
    favorites: FavoriteGallery[];
    favoritesCount: number;
    addToFavorites: (gallery: FavoriteGallery) => void;
    removeFromFavorites: (galleryPath: string) => void;
    isFavorited: (galleryPath: string) => boolean;
    toggleFavorite: (gallery: FavoriteGallery) => void;
    refreshFavorites: () => void;
}

/**
 * Custom hook for managing gallery favorites within a specific rootPath
 * @param rootPath - Root path to filter favorites
 */
export const useFavorites = (rootPath: string): UseFavoritesReturn => {
    const [favorites, setFavorites] = useState<FavoriteGallery[]>([]);
    const [favoritesCount, setFavoritesCount] = useState<number>(0);
    const [isClient, setIsClient] = useState(false);

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load favorites from localStorage on mount
    useEffect(() => {
        if (!isClient) return;

        const loadedFavorites = getFavoritesFromStorage(rootPath);
        setFavorites(loadedFavorites);
        setFavoritesCount(loadedFavorites.length);
    }, [isClient, rootPath]);

    // Refresh favorites from storage
    const refreshFavorites = useCallback(() => {
        if (!isClient) return;

        const loadedFavorites = getFavoritesFromStorage(rootPath);
        setFavorites(loadedFavorites);
        setFavoritesCount(loadedFavorites.length);
    }, [isClient, rootPath]);

    // Add gallery to favorites
    const addToFavorites = useCallback(
        (gallery: FavoriteGallery) => {
            if (!isClient) return;

            const updatedFavorites = addGalleryToFavorites(gallery, rootPath);
            setFavorites(updatedFavorites);
            setFavoritesCount(updatedFavorites.length);
        },
        [isClient, rootPath]
    );

    // Remove gallery from favorites
    const removeFromFavorites = useCallback(
        (galleryPath: string) => {
            if (!isClient) return;

            const updatedFavorites = removeGalleryFromFavorites(galleryPath, rootPath);
            setFavorites(updatedFavorites);
            setFavoritesCount(updatedFavorites.length);
        },
        [isClient, rootPath]
    );

    // Check if gallery is favorited
    const isFavorited = useCallback(
        (galleryPath: string): boolean => {
            if (!isClient) return false;
            return isGalleryFavorited(galleryPath, rootPath);
        },
        [isClient, rootPath]
    );

    // Toggle favorite status
    const toggleFavorite = useCallback(
        (gallery: FavoriteGallery) => {
            if (!isClient) return;

            if (isGalleryFavorited(gallery.path, rootPath)) {
                removeFromFavorites(gallery.path);
            } else {
                addToFavorites(gallery);
            }
        },
        [isClient, addToFavorites, removeFromFavorites, rootPath]
    );

    return {
        favorites,
        favoritesCount,
        addToFavorites,
        removeFromFavorites,
        isFavorited,
        toggleFavorite,
        refreshFavorites,
    };
};
