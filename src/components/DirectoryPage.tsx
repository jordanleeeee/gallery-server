import React, {useEffect, useState} from 'react';
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

    let [scrollPosition, setScrollPosition] = useState<null | number>(null)

    useEffect(() => {
        scrollPosition && window.scrollTo(0, scrollPosition);
    }, [scrollPosition])

    useEffect(() => {
        const previousScrollPosition = sessionStorage.getItem('scrollPosition');
        if (previousScrollPosition) {
            setScrollPosition(Number.parseInt(previousScrollPosition));
            sessionStorage.removeItem('scrollPosition');
        }

        const onUnload = () => {
            sessionStorage.setItem('scrollPosition', String(window.scrollY));
        };
        router.events.on('routeChangeStart', onUnload)

        return () => {
            router.events.off('routeChangeStart', onUnload)
        };
    }, [router.events]);

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

            <div className={styles.fileEntryContainer}>
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
            </div>

            {galleryDirectors.length > 0 && <LineBreak content={"Gallery"}/>}

            <Gallery
                images={galleryDirectors.map(_ => {
                    return {
                        src: getFilePath(router.asPath, _.icon!),
                        height: _.imageHeight!,
                        width: _.imageWidth!,
                        thumbnailCaption: _.path + (_.path.includes("P】") ? "" : `【${_.imageCount}P】`)
                    }
                })}
                rowHeight={288}
                onClick={idx => router.push(getDirectoryPath(router.asPath, galleryDirectors[idx].path)).then()}
                enableImageSelection={false}
            />
        </>
    );
};

interface FileAndDirectoryProps {
    parent: string;
    file: File;
}

const FileAndDirectoryItem = React.memo(({parent, file}: FileAndDirectoryProps) => {
    return (
        <div className={styles.fileEntry}>
            <Image src={file.type === "directory" ? "/folder.png" : "/file.png"} alt={"back"} width={20} height={20}/>
            <div>{new Date(file.lastModify).toLocaleDateString('en-HK', dateTimeFormatOptions)}</div>
            {
                file.type === "directory" ?
                    <Link href={getResourcesPath(parent, file)}>{file.path}</Link> :
                    <a href={'/' + getResourcesPath(parent, file)}>{file.path}</a>
            }
        </div>
    );
});

FileAndDirectoryItem.displayName = 'FileAndDirectoryItem'

const LineBreak = ({content}: { content: string }) => {
    return (
        <div className={styles.divider}>
            <hr/>
            <div>{content}</div>
        </div>
    );
};

export default DirectoryPage;
