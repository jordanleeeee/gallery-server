export interface FileProps {
    rootPath: string;
    files: File[]; // undefined represent a file
}

export interface File {
    path: string;
    type: "file" | "directory" | "imageDirectory";
    contentType?: string; // for file only
    icon?: string; // for imageDirectory only
    imageCount?: number; // for imageDirectory only
    imageWidth?: number; // if it is an image / imageDirectory
    imageHeight?: number; // if it is an image / imageDirectory
    lastModify: string;
}

// Favorites-related types
export interface FavoriteGallery {
    path: string; // Gallery path from root (e.g., "/photos/vacation")
    rootPath: string; // Root path for the gallery
    thumbnailPath: string; // First image path for preview
    imageWidth: number; // Thumbnail dimensions
    imageHeight: number; // Thumbnail dimensions
}

export interface FavoritesData {
    galleries: FavoriteGallery[];
}
