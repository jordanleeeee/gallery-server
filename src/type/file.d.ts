export interface File {
    path: string
    type: "directory" | "file"
    contentType?: string
}

export interface FileProps {
    rootPath: string
    subPath: string
    files: File[] // undefined represent a file
}

