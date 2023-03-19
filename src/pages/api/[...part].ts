import type {NextApiRequest, NextApiResponse} from 'next'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import * as fs from "fs";
import {getContentType, getRootPath} from "@/util/fileUtil";
import {decode} from "@/util/urlUtil";
import {getLogger} from "@/util/logger";

const logger = getLogger()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let decodedUrl = ''
    if (req.url === undefined || req.method !== 'GET') {
        logger.info("on request", {method: req.method, path: undefined, ip: req.socket.remoteAddress})
        res.status(404);
        res.end(`path not found`);
        return
    } else {
        decodedUrl = decode(req.url)
        logger.info("on request", {method: req.method, path: decodedUrl, ip: req.socket.remoteAddress})
    }

    let path = getRootPath() + decodedUrl.substring(4, decodedUrl.length);
    const fromLocal = req.socket.remoteAddress === '::1' || req.socket.remoteAddress === '::ffff:127.0.0.1'

    try {
        let buffer = fs.readFileSync(path);
        res.writeHead(200, {'Content-Type': getContentType(path)});
        if (!fromLocal && buffer.length > 100_000) { // compress for non-local request and file > 1MB
            buffer = await imagemin.buffer(buffer, {plugins: [imageminMozjpeg({quality: 80})]});
        }
        res.end(buffer)
    } catch (e) {
        logger.error(`file not found: ${path}`)
        res.status(404);
        res.end();
    }
}
