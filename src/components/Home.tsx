import {FileProps} from "@/type/file";
import DirectoryPage from "@/components/DirectoryPage";
import GalleryPage from "@/components/GalleryPage";

const MyPage = (fileProps: FileProps) => {
    function showDirectory() {
        return fileProps.files.length == 0
            || !fileProps.files.every(_ => _.type === "file" && _.contentType!.includes("image"));
    }

    return showDirectory() ? (
        <DirectoryPage rootPath={fileProps.rootPath} subPath={fileProps.subPath} files={fileProps.files}/>
    ) : (
        <GalleryPage rootPath={fileProps.rootPath} subPath={fileProps.subPath} files={fileProps.files}/>
    );
};
export default MyPage;
