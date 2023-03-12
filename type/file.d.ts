interface File {
    path: string
    type: "directory" | "file"
    contentType?: string
}

export {File}
