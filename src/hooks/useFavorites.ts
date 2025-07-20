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

    // Load favorites from localStorage on mount
    useEffect(() => {
        const loadedFavorites = getFavoritesFromStorage(rootPath);
        setFavorites(loadedFavorites);
        setFavoritesCount(loadedFavorites.length);
    }, [rootPath]);

    // Refresh favorites from storage
    const refreshFavorites = useCallback(() => {
        const loadedFavorites = getFavoritesFromStorage(rootPath);
        setFavorites(loadedFavorites);
        setFavoritesCount(loadedFavorites.length);
    }, [rootPath]);

    // Add gallery to favorites
    const addToFavorites = useCallback(
        (gallery: FavoriteGallery) => {
            const updatedFavorites = addGalleryToFavorites(gallery, rootPath);
            setFavorites(updatedFavorites);
            setFavoritesCount(updatedFavorites.length);
        },
        [rootPath]
    );

    // Remove gallery from favorites
    const removeFromFavorites = useCallback(
        (galleryPath: string) => {
            const updatedFavorites = removeGalleryFromFavorites(galleryPath, rootPath);
            setFavorites(updatedFavorites);
            setFavoritesCount(updatedFavorites.length);
        },
        [rootPath]
    );

    // Check if gallery is favorited
    const isFavorited = useCallback(
        (galleryPath: string): boolean => {
            return isGalleryFavorited(galleryPath, rootPath);
        },
        [rootPath]
    );

    // Toggle favorite status
    const toggleFavorite = useCallback(
        (gallery: FavoriteGallery) => {
            if (isGalleryFavorited(gallery.path, rootPath)) {
                removeFromFavorites(gallery.path);
            } else {
                addToFavorites(gallery);
            }
        },
        [addToFavorites, removeFromFavorites, rootPath]
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
