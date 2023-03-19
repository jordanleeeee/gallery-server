export interface FileProps {
    rootPath: string
    files: File[] // undefined represent a file
}

export interface File {
    path: string
    type: "file" | "directory" | "imageDirectory"
    contentType?: string    // for file only
    icon?: string           // for imageDirectory only
    imageWidth?: number     // if it is a image
    imageHeight?: number    // if it is a image
    lastModify: string
}

