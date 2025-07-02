import {FileProps} from "@/type/file";
import DirectoryPage from "@/components/DirectoryPage";
import GalleryPage from "@/components/GalleryPage";

const Home = (fileProps: FileProps) => {
    function showDirectory(): boolean {
        return fileProps.files.length == 0 || !fileProps.files.every(_ => _.type === "file" && _.contentType!.includes("image"));
    }

    return showDirectory() ? <DirectoryPage rootPath={fileProps.rootPath} files={fileProps.files} /> : <GalleryPage rootPath={fileProps.rootPath} files={fileProps.files} />;
};
export default Home;
