import {FileProps} from "@/type/file";
import Directory from "@/components/Directory";
import Gallery from "@/components/Gallery";

const MyPage = (fileProps: FileProps) => {
    function showDirectory() {
        return fileProps.files.length == 0
            || !fileProps.files.every(_ => _.type === "file" && _.contentType!.includes("image"));
    }

    return showDirectory() ? (
        <Directory rootPath={fileProps.rootPath} subPath={fileProps.subPath} files={fileProps.files}/>
    ) : (
        <Gallery rootPath={fileProps.rootPath} subPath={fileProps.subPath} files={fileProps.files}/>
    );
};
export default MyPage;
