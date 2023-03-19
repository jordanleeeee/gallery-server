import React from "react";
import {GetServerSideProps} from "next";
import {FileProps} from "@/type/file";
import {getContentInDirectory, getRootPath} from "@/util/fileUtil";
import Home from "@/components/Home";
import {getLogger} from "@/util/logger";

const DynamicPage = (fileProps: FileProps) => {
    return <Home rootPath={fileProps.rootPath} subPath={fileProps.subPath} files={fileProps.files}/>;
};

const logger = getLogger()

export const getServerSideProps: GetServerSideProps<FileProps> = async ({params, req}) => {
    let rootPath = getRootPath()

    let subPath = "";
    if (params) {
        if (params.part) {
            subPath += "/";
            subPath += (params.part as string[]).join("/");
            logger.info("on request", {method: 'GET', path: subPath, ip: req.socket.remoteAddress})
        } else {
            logger.info("on request", {method: 'GET', path: "/", ip: req.socket.remoteAddress})
        }
    }

    try {
        let contentInDirectory = getContentInDirectory(rootPath + subPath);
        return {
            props: {
                rootPath,
                subPath,
                files: contentInDirectory,
            },
        };
    } catch (e) {
        logger.error(e)
        return {
            notFound: true,
        };
    }
};

export default DynamicPage;
