import type {NextApiRequest, NextApiResponse} from 'next'
import {removeFileOrDirectory} from "@/util/fileUtil";
import {getLogger} from "@/util/logger";
import {decode, getRootPath} from "@/util/urlUtil";

const logger = getLogger()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.url === undefined || req.method !== 'DELETE') {
        logger.info("on request", {method: req.method, path: undefined, ip: req.socket.remoteAddress})
        res.status(400);
        res.end(`invalid call`);
        return
    }
    let decodedUrl = decode(req.url)
    logger.info("on request", {method: req.method, path: decodedUrl, ip: req.socket.remoteAddress})

    let path = getRootPath() + decodedUrl.substring(11, decodedUrl.length);
    await removeFileOrDirectory(path)
    res.status(200);
    res.end("removed");
}
