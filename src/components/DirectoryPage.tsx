import {File, FileProps} from "@/type/file";
import Link from "next/link";
import Image from "next/image";
import {encode} from "@/util/urlUtil";
import styles from "../styles/Directory.module.css";
import {useRouter} from "next/router";


const DirectoryPage = (fileProps: FileProps) => {
    const router = useRouter()

    let galleryDirectors = fileProps.files.filter(_ => _.type === "imageDirectory")
    let fileAndDirectory = fileProps.files.filter(_ => _.type !== "imageDirectory")

    return (
        <>
            <h1>{fileProps.rootPath + fileProps.subPath}</h1>

            <LineBreak content={"Files"}/>
            {fileProps.subPath !== "" &&
                <div className={styles.fileEntry}>
                    <Image src={"/folder.png"} alt={"back"} width={20} height={20}/>
                    <Link href={router.asPath + "/.."}>../</Link>
                </div>
            }

            {
                fileAndDirectory.map((_, idx) => (
                    <FileAndDirectoryItem key={idx} subPath={fileProps.subPath} file={_}/>
                ))
            }

            {galleryDirectors.length > 0 && <LineBreak content={"Gallery"}/>}
            <div className={styles.galleryEntryWrapper}>
                {
                    galleryDirectors.map((_, idx) => (
                        <GalleryEntry key={idx} subPath={fileProps.subPath} icon={"/api" + fileProps.subPath + "/" + _.icon!} file={_}/>
                    ))
                }
            </div>
        </>
    );
};

interface FileAndDirectoryProps {
    subPath: string;
    file: File;
}

const FileAndDirectoryItem = ({subPath, file}: FileAndDirectoryProps) => {
    function getLink(): string {
        if (file.type === "directory") {
            return encode(`${subPath}/${file.path}/`);
        } else {
            return encode(`api${subPath}/${file.path}/`);
        }
    }

    return (
        <div className={styles.fileEntry}>
            <Image src={file.type === "directory" ? "/folder.png" : "/file.png"} alt={"back"} width={20} height={20}/>
            <Link href={getLink()}>{file.path}</Link>
        </div>
    );
};

interface GalleryEntryProps {
    subPath: string;
    icon: string;
    file: File;
}

const GalleryEntry = ({subPath, icon, file}: GalleryEntryProps) => {
    function getLink(): string {
        return encode(`${subPath}/${file.path}/`);
    }

    return (
        <Link href={getLink()} className={styles.galleryEntry}>
            <img src={encode(icon)} alt={file.path}/>
            <span>{file.path}</span>
        </Link>
    );
};

const LineBreak = ({content}: { content: string }) => {
    return (
        <div className={styles.divider}>
            <hr/>
            <div>{content}</div>
        </div>
    );
};

export default DirectoryPage;
