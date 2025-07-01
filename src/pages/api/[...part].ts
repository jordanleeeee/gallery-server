import type {NextApiRequest, NextApiResponse} from 'next'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import * as fs from "fs";
import {getContentType, removeFileOrDirectory} from "@/util/fileUtil";
import {getRootPath} from "@/util/urlUtil";
import {decode} from "@/util/urlUtil";
import {getLogger} from "@/util/logger";

const logger = getLogger()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let decodedUrl = decode(req.url!)
    logger.info("on request", {method: req.method, path: decodedUrl, ip: req.socket.remoteAddress})

    let path = getRootPath() + decodedUrl.substring(4, decodedUrl.length);
    if (req.method === "GET") {
        const fromLocal = req.headers.host!.includes('localhost') || req.headers.host!.includes('127.0.0.1')

        try {
            let buffer = await fs.promises.readFile(path);
            res.writeHead(200, {'Content-Type': getContentType(path), 'Cache-Control': 'max-age=3600'});
            if (!fromLocal && buffer.length > 100_000) { // compress for non-local request and file > 1MB
                buffer = await imagemin.buffer(buffer, {plugins: [imageminMozjpeg({quality: 60})]});
            }
            res.end(buffer)
        } catch (e) {
            logger.error(`file not found: ${decodedUrl}`)
            res.status(404);
            res.end();
        }
    } else if (req.method === 'DELETE') {
        await removeFileOrDirectory(path);
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
}
