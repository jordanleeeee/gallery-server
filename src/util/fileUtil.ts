import * as path from 'path';
import * as fs from 'fs';
import {File} from "@/type/file";

export function getContentType(filePath: string): string {
    const extension = path.extname(filePath);
    switch (extension) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'text/javascript';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.gif':
            return 'image/gif';
        case '.svg':
            return 'image/svg+xml';
        case '.webp':
            return 'image/webp';
        case '.ico':
            return 'image/x-icon';
        case '.woff':
            return 'font/woff';
        case '.woff2':
            return 'font/woff2';
        case '.ttf':
            return 'font/ttf';
        case '.otf':
            return 'font/otf';
        case '.txt':
            return 'text/plain';
        case '.pdf':
            return 'application/pdf';
        case '.zip':
            return 'application/zip';
        case '.mp3':
            return 'audio/mpeg';
        case '.wav':
            return 'audio/wav';
        case '.mp4':
            return 'video/mp4';
        case '.webm':
            return 'video/webm';
        default:
            return 'text/plain';
    }
}

export function isImage(contentType: string): boolean {
    return contentType.includes("image")
}

export function getContentInDirectory(path: string): File[] {
    const contents = fs.readdirSync(path);

    const files: File[] = [];
    for (const item of contents) {
        if (item.startsWith(".")) continue

        const itemPath = `${path}/${item}`;
        const stats = fs.statSync(itemPath);
        let items: File = {
            path: item,
            type: stats.isDirectory() ? "directory" : "file",
        };

        if (!stats.isDirectory()) {
            items.contentType = getContentType(item)
        } else {
            let innerContent = fs.readdirSync(path + "/" + item);
            if (innerContent.length !== 0 && !innerContent.some(_ => !isImage(getContentType(_)))) {
                items.type = "imageDirectory"
                items.icon = item + "/" + innerContent[0]
            }
        }
        files.push(items)
    }
    return files
}
