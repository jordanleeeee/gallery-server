import {File} from "@/type/file";

export function getRootPath() {
    return process.cwd()
}

export function encode(url: string): string {
    return url
        .split("/")
        .map(_ => encodeURIComponent(_))
        .join("/");
}

export function decode(url: string): string {
    return url
        .split("/")
        .map(_ => decodeURIComponent(_))
        .join("/");
}

export function getResourcesPath(parent: string, file: File): string {
    let destination = parent;
    if (file.type === "file") destination = "api/resource" + destination;
    if (parent.length > 1) destination += "/";
    destination += encode(file.path) + "/";
    return destination;
}

export function getFilePath(parent: string, fileName: string): string {
    let destination = "/api/resource" + parent;
    if (parent.length > 1) destination += "/";
    destination += encode(fileName);
    return destination;
}

export function getDirectoryPath(parent: string, fileName: string): string {
    let destination = parent;
    if (parent.length > 1) destination += "/";
    destination += encode(fileName) + "/";
    return destination;
}
