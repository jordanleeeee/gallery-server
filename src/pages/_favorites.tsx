import React from "react";
import {GetServerSideProps} from "next";
import {FileProps} from "@/type/file";
import {getRootPath} from "@/util/urlUtil";
import {getLogger} from "@/util/logger";
import {FavoritesGallery} from "@/components/FavoritesGallery";

const FavoritesPage = (fileProps: FileProps) => {
    return <FavoritesGallery rootPath={fileProps.rootPath} />;
};

const logger = getLogger();
export const getServerSideProps: GetServerSideProps<FileProps> = async ({params, req}) => {
    let rootPath = getRootPath();
    logger.info("on request", {method: "GET", path: "/_favorites", ip: req.socket.remoteAddress, params});

    try {
        return {
            props: {
                rootPath,
                files: [],
            },
        };
    } catch (e) {
        logger.error(e);
        return {
            notFound: true,
        };
    }
};

export default FavoritesPage;
