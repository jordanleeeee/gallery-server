import type {NextApiRequest, NextApiResponse} from 'next'
import * as fs from "fs";
import {getContentType} from "@/util/fileUtil";
import {decode} from "@/util/urlUtil";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    let path = process.cwd() + decode(req.url!.substring(4, req.url?.length))

    try {
        let buffer = fs.readFileSync(path);
        res.writeHead(200, {'Content-Type': getContentType(path)});
        res.end(buffer)
    } catch (e) {
        res.status(404);
        res.end(`File not found: ${path}`);
    }
}
