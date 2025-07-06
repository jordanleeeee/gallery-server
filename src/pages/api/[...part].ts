import type {NextApiRequest, NextApiResponse} from "next";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";
import {getContentType, removeFileOrDirectory, getContentInDirectory, isImage} from "@/util/fileUtil";
import {getRootPath} from "@/util/urlUtil";
import {decode} from "@/util/urlUtil";
import {getLogger} from "@/util/logger";

const logger = getLogger();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let decodedUrl = decode(req.url!);
    logger.info("on request", {method: req.method, path: decodedUrl, ip: req.socket.remoteAddress});

    let requestPath = getRootPath() + decodedUrl.substring(4, decodedUrl.length).split("?")[0];

    if (req.method === "GET") {
        // Check if this is a zip download request
        if (req.query.download === "zip") {
            return handleZipDownload(req, res, requestPath, decodedUrl);
        }

        const fromLocal = req.headers.host!.includes("localhost") || req.headers.host!.includes("127.0.0.1");
        const shouldCompress = req.query.compress !== "false";

        try {
            let buffer = await fs.promises.readFile(requestPath);
            res.writeHead(200, {"Content-Type": getContentType(requestPath), "Cache-Control": "max-age=3600"});
            // compress for non-local request and file > 1MB, unless compress=false
            if (!fromLocal && buffer.length > 100_000 && shouldCompress) {
                buffer = await imagemin.buffer(buffer, {plugins: [imageminMozjpeg({quality: 80})]});
            }
            res.end(buffer);
        } catch {
            logger.error(`file not found: ${decodedUrl}`);
            res.status(404);
            res.end();
        }
    } else if (req.method === "DELETE") {
        await removeFileOrDirectory(requestPath);
        res.status(200);
        res.end("removed");
    } else {
        res.status(400);
        res.end(`invalid call`);
    }
}

async function handleZipDownload(req: NextApiRequest, res: NextApiResponse, requestPath: string, decodedUrl: string) {
    try {
        // Check if the path is a directory
        const stats = await fs.promises.stat(requestPath);
        if (!stats.isDirectory()) {
            res.status(400).json({error: "Path is not a directory"});
            return;
        }

        // Get all files in the directory
        const files = getContentInDirectory(requestPath);
        const imageFiles = files.filter(file => file.type === "file" && isImage(file.contentType!));

        if (imageFiles.length === 0) {
            res.status(404).json({error: "No images found in directory"});
            return;
        }

        // Create directory name from the current path (remove query parameters first)
        const pathWithoutQuery = decodedUrl.split("?")[0]; // Remove query parameters
        const rawDirectoryName = pathWithoutQuery === "/api/" ? path.basename(getRootPath()) : path.basename(pathWithoutQuery.replace("/api", ""));

        // Sanitize filename for HTTP header - remove/replace invalid characters
        const directoryName =
            rawDirectoryName
                .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_") // Replace invalid filename characters
                .replace(/^\.+/, "") // Remove leading dots
                .trim() || "gallery"; // Fallback name if empty

        // Set response headers for zip download
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(directoryName)}.zip"`);
        res.setHeader("Cache-Control", "no-cache");

        // Create zip archive
        const archive = archiver("zip", {
            zlib: {level: 1}, // Minimal compression for faster streaming
        });

        // Handle archive warnings and errors
        archive.on("warning", function (err) {
            if (err.code === "ENOENT") {
                logger.warn("Archive warning:", err);
            } else {
                logger.error("Archive error:", err);
                throw err;
            }
        });

        archive.on("error", function (err) {
            logger.error("Archive error:", err);
            res.status(500).json({error: "Failed to create zip file"});
        });

        // Pipe archive data to the response
        archive.pipe(res);

        // Add files to the archive
        for (const file of imageFiles) {
            const filePath = path.join(requestPath, file.path);
            try {
                // Check if file still exists
                await fs.promises.access(filePath);
                archive.file(filePath, {name: file.path});
            } catch {
                logger.warn(`Skipping missing file: ${file.path}`);
            }
        }

        // Finalize the archive
        await archive.finalize();

        logger.info(`Zip download completed`, {
            path: decodedUrl,
            fileCount: imageFiles.length,
            zipName: `${directoryName}.zip`,
        });
    } catch (error) {
        logger.error("Zip download error:", error);
        if (!res.headersSent) {
            res.status(500).json({error: "Failed to generate zip file"});
        }
    }
}

export const config = {
    api: {
        responseLimit: false,
    },
};
