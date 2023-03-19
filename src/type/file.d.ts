export interface File {
    path: string
    type: "file" | "directory" | "imageDirectory"
    contentType?: string    // for file only
    icon?: string           // for imageDirectory only
    imageWidth?: number     // if it is a image
    imageHeight?: number    // if it is a image
    lastModify: string
}

export interface FileProps {
    rootPath: string
    subPath: string
    files: File[] // undefined represent a file
}

