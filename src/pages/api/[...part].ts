import type {NextApiRequest, NextApiResponse} from 'next'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import * as fs from "fs";
import {getContentType, getRootPath} from "@/util/fileUtil";
import {decode} from "@/util/urlUtil";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let path = getRootPath() + decode(req.url!.substring(4, req.url?.length))
    const fromLocal = req.socket.remoteAddress === '::1' || req.socket.remoteAddress === '::ffff:127.0.0.1'

    try {
        let buffer = fs.readFileSync(path);
        res.writeHead(200, {'Content-Type': getContentType(path)});
        if (!fromLocal && buffer.length > 100_000) { // compress for non-local request and file > 1MB
            buffer = await imagemin.buffer(buffer, {plugins: [imageminMozjpeg({quality: 80})]});
        }
        res.end(buffer)
    } catch (e) {
        res.status(404);
        res.end(`File not found: ${path}`);
    }
}
