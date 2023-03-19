import {File, FileProps} from "@/type/file";
import Link from "next/link";
import Image from "next/image";
import {decode, getDirectoryPath, getFilePath, getResourcesPath} from "@/util/urlUtil";
import styles from "../styles/Directory.module.css";
import {useRouter} from "next/router";
import {Gallery} from "react-grid-gallery";

const dateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
} as Intl.DateTimeFormatOptions

const DirectoryPage = (fileProps: FileProps) => {
    const router = useRouter()

    let galleryDirectors = fileProps.files
        .filter(_ => _.type === "imageDirectory")
        .sort((a, b) => b.lastModify.localeCompare(a.lastModify))
    let fileAndDirectory = fileProps.files
        .filter(_ => _.type !== "imageDirectory")
        .sort((a, b) => b.lastModify.localeCompare(a.lastModify))

    function title() {
        const urlPart: string[] = decode((fileProps.rootPath + router.asPath)).split('/');

        let part = []
        for (let i = 0; i < urlPart.length; i++) {
            part.push(<div key={i}>{urlPart[i] + (i != urlPart.length - 1 ? '/' : '')}</div>)
        }

        return part
    }

    return (
        <>
            <h1 className={styles.title}>{title()}</h1>

            {
                fileAndDirectory.length + (router.asPath !== "/" ? 1 : 0) > 0 &&
                <LineBreak content={"Files"}/>
            }

            {
                router.asPath !== "/" &&
                <div className={styles.fileEntry}>
                    <Image src={"/folder.png"} alt={"back"} width={20} height={20}/>
                    <Link href={router.asPath + "/.."}>../</Link>
                </div>
            }

            {
                fileAndDirectory.map((_, idx) => (
                    <FileAndDirectoryItem key={idx} parent={router.asPath} file={_}/>
                ))
            }

            {galleryDirectors.length > 0 && <LineBreak content={"Gallery"}/>}

            <Gallery
                images={galleryDirectors.map(_ => {
                    return {
                        src: getFilePath(router.asPath, _.icon!),
                        height: _.imageHeight!,
                        width: _.imageWidth!,
                        thumbnailCaption: _.path,
                    }
                })}
                onClick={idx => router.push(getDirectoryPath(router.asPath, galleryDirectors[idx].path)).then()}
                enableImageSelection={false}
                tileViewportStyle={{
                    zoom: '160%',
                    maxWidth: '29vw',
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            />
        </>
    );
};

interface FileAndDirectoryProps {
    parent: string;
    file: File;
}

const FileAndDirectoryItem = ({parent, file}: FileAndDirectoryProps) => {
    return (
        <div className={styles.fileEntry}>
            <Image src={file.type === "directory" ? "/folder.png" : "/file.png"} alt={"back"} width={20} height={20}/>
            <div>{new Date(file.lastModify).toLocaleDateString('en-HK', dateTimeFormatOptions)}</div>
            <Link href={getResourcesPath(parent, file)}>{file.path}</Link>
        </div>
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