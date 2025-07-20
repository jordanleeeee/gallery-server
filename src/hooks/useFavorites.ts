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
 * Custom hook for managing gallery favorites
 */
export const useFavorites = (): UseFavoritesReturn => {
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

        const loadedFavorites = getFavoritesFromStorage();
        setFavorites(loadedFavorites);
        setFavoritesCount(loadedFavorites.length);
    }, [isClient]);

    // Refresh favorites from storage
    const refreshFavorites = useCallback(() => {
        if (!isClient) return;

        const loadedFavorites = getFavoritesFromStorage();
        setFavorites(loadedFavorites);
        setFavoritesCount(loadedFavorites.length);
    }, [isClient]);

    // Add gallery to favorites
    const addToFavorites = useCallback(
        (gallery: FavoriteGallery) => {
            if (!isClient) return;

            const updatedFavorites = addGalleryToFavorites(gallery);
            setFavorites(updatedFavorites);
            setFavoritesCount(updatedFavorites.length);
        },
        [isClient]
    );

    // Remove gallery from favorites
    const removeFromFavorites = useCallback(
        (galleryPath: string) => {
            if (!isClient) return;

            const updatedFavorites = removeGalleryFromFavorites(galleryPath);
            setFavorites(updatedFavorites);
            setFavoritesCount(updatedFavorites.length);
        },
        [isClient]
    );

    // Check if gallery is favorited
    const isFavorited = useCallback(
        (galleryPath: string): boolean => {
            if (!isClient) return false;
            return isGalleryFavorited(galleryPath);
        },
        [isClient]
    );

    // Toggle favorite status
    const toggleFavorite = useCallback(
        (gallery: FavoriteGallery) => {
            if (!isClient) return;

            if (isGalleryFavorited(gallery.path)) {
                removeFromFavorites(gallery.path);
            } else {
                addToFavorites(gallery);
            }
        },
        [isClient, addToFavorites, removeFromFavorites]
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
