export interface File {
    path: string
    type: "file" | "directory" | "imageDirectory"
    contentType?: string // for file only
    icon?: string // for imageDirectory
}

export interface FileProps {
    rootPath: string
    subPath: string
    files: File[] // undefined represent a file
}

