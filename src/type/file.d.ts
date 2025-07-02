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
