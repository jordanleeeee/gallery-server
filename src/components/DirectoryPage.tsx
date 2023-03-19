import {File, FileProps} from "@/type/file";
import Link from "next/link";
import Image from "next/image";
import {encode} from "@/util/urlUtil";
import styles from "../styles/Directory.module.css";
import {useRouter} from "next/router";
import {Gallery, Image as GridImage} from "react-grid-gallery";


const DirectoryPage = (fileProps: FileProps) => {
    const router = useRouter()

    let galleryDirectors = fileProps.files.filter(_ => _.type === "imageDirectory")
    let fileAndDirectory = fileProps.files.filter(_ => _.type !== "imageDirectory")

    function title() {
        const urlPart: string[] = (fileProps.rootPath + fileProps.subPath).split('/');

        let part = []
        for (let i = 0; i < urlPart.length; i++) {
            part.push(<div>{urlPart[i]}{i != urlPart.length - 1 && '/'}</div>)
        }

        return part
    }

    return (
        <>
            <h1 className={styles.title}>{title()}</h1>

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
            <Gallery
                images={galleryDirectors.map(_ => {
                    return {
                        src: encode("/api" + fileProps.subPath + "/" + _.icon!),
                        height: _.imageHeight!,
                        width: _.imageWidth!,
                        thumbnailCaption: _.path,
                    } as GridImage
                })}
                onClick={idx => router.push(encode(`${fileProps.subPath}/${galleryDirectors[idx].path}/`))}
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

const LineBreak = ({content}: { content: string }) => {
    return (
        <div className={styles.divider}>
            <hr/>
            <div>{content}</div>
        </div>
    );
};

export default DirectoryPage;
