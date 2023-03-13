import http from 'http';
import open from 'open';
import * as fs from 'fs';
import { networkInterfaces } from 'os';

import {getContentType, getContentInDirectory} from './fileUtil';
import {getDirectoryHtml} from "./htmlGenerator";
import {getLogger} from "./logger";

const logger = getLogger()

const port = 3000;
const currentDirectory = process.cwd();

console.log(`The current working directory is: ${currentDirectory}`);
if (process.argv[2] === "openBrowser") {
    open(`http://127.0.0.1:${port}/`).then();
}

const server = http.createServer((req, res) => {
    let path = decodeURI(req.url!);
    logger.info(`${req.method} ${path}`)

    let resources = currentDirectory + path;
    fs.stat(resources, (err, stats) => {
        if (err) {
            if (err.errno === -2) {
                res.statusCode = 404;
                res.end(`File not found: ${resources}`);
            } else {
                res.statusCode = 500;
                res.end(`Server error: ${err.message}`);
            }
            logger.error(err)
            return
        }

        if (stats.isDirectory()) {
            const files = getContentInDirectory(resources);
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(getDirectoryHtml(files, resources, path !== '/'))
        } else if (stats.isFile()) {
            fs.readFile(resources, (err, data) => {
                res.writeHead(200, {'Content-Type': getContentType(resources)});
                res.end(data)
            });
        }
    })

    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    // res.end('hello world');
});


server.listen(port, "0.0.0.0", () => {
    console.log(`Server available at `);
    console.log(`\thttp://127.0.0.1:${port}`);
    const nets = networkInterfaces()
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]!) {
            if (net.family === "IPv4" && !net.internal) {
                console.log(`\thttp://${net.address}:${port}`);
                break
            }
        }
    }
});
