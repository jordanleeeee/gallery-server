import {FileProps} from "@/type/file";
import Directory from "@/components/Directory";
import Gallery from "@/components/Gallery";

const MyPage = (fileProps: FileProps) => {
    return !fileProps.files.every(_ => _.type === "file" && _.contentType!.includes("image")) ? (
        <Directory rootPath={fileProps.rootPath} subPath={fileProps.subPath} files={fileProps.files} />
    ) : (
        <Gallery rootPath={fileProps.rootPath} subPath={fileProps.subPath} files={fileProps.files} />
    );
};
export default MyPage;
