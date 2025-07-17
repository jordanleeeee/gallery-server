import type {NextApiRequest, NextApiResponse} from "next";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import * as fs from "fs";
import {getContentType, removeFileOrDirectory} from "@/util/fileUtil";
import {getRootPath} from "@/util/urlUtil";
import {decode} from "@/util/urlUtil";
import {getLogger} from "@/util/logger";

const logger = getLogger();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let decodedUrl = decode(req.url!);
    logger.info("on request", {method: req.method, path: decodedUrl, ip: req.socket.remoteAddress});

    let requestPath = getRootPath() + decodedUrl.substring(10, decodedUrl.length).split("?")[0];

    if (req.method === "GET") {
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

export const config = {
    api: {
        responseLimit: false,
    },
};
