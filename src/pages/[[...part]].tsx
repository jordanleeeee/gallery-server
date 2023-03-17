import React from "react";
import {GetServerSideProps} from "next";
import {FileProps} from "@/type/file";
import {getContentInDirectory, getRootPath} from "@/util/fileUtil";
import Home from "@/components/Home";

const DynamicPage = (fileProps: FileProps) => {
    return <Home rootPath={fileProps.rootPath} subPath={fileProps.subPath} files={fileProps.files}/>;
};

export const getServerSideProps: GetServerSideProps<FileProps> = async ({params}) => {
    let rootPath = getRootPath()

    let subPath = "";
    if (params) {
        if (params.part) {
            subPath += "/";
            subPath += (params.part as string[]).join("/");
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
        return {
            notFound: true,
        };
    }
};

export default DynamicPage;
