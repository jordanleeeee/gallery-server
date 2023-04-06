import {ChangeEvent, TouchEventHandler, useState} from "react";
import ImageGallery from "react-image-gallery";
import {Gallery} from "react-grid-gallery";
import {useRouter} from "next/router";
import Image from "next/image";
import {FileProps} from "@/type/file";
import {getFilePath} from "@/util/urlUtil";
import Modal, {setAppElement} from 'react-modal';
import styles from "../styles/Gallery.module.css";
import "react-image-gallery/styles/css/image-gallery.css";

let diffStart: number
let zoomStart: number
const zoomMin: number = 20
const zoomMax: number = 180

const GalleryPage = (fileProps: FileProps) => {
    let [galleryZoom, setGalleryZoom] = useState(50);
    let [preview, setPreview] = useState<{ show: boolean, idx?: number }>({show: false});
    let router = useRouter();

    const zoomGallery = (event: ChangeEvent<HTMLInputElement>) => {
        const zoomValue = event.target.value;
        setGalleryZoom(parseInt(zoomValue));
    };

    const onTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
        let touch1 = event.touches[0]
        let touch2 = event.touches[1]
        if (touch1 === undefined || touch2 === undefined) return
        diffStart = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        zoomStart = galleryZoom
    }

    const onTouchMove: TouchEventHandler<HTMLDivElement> = (event) => {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        if (touch1 === undefined || touch2 === undefined) return

        const diffNow = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        let targetZoom = zoomStart + ((diffNow - diffStart) / 10);

        if (targetZoom >= zoomMax) setGalleryZoom(zoomMax);
        else if (targetZoom <= zoomMin) setGalleryZoom(zoomMin)
        else setGalleryZoom(targetZoom)
    }

    return <>
        <GalleryPreview fileProps={fileProps} display={preview} close={() => setPreview({show: false})}/>
        <div className={styles.toolbar}>
            <Image src={"/back.png"} alt={"back"} width={18} height={18} onClick={() => router.back()}/>
            <input type="range" min={zoomMin} max={zoomMax} value={galleryZoom} id="zoom-range" onInput={zoomGallery}/>
        </div>

        <div className={styles.top}></div>
        <div className={styles.gridGalleryContainer} onTouchStart={onTouchStart} onTouchMove={onTouchMove}>
            <Gallery
                images={fileProps.files.map(_ => {
                    return {
                        src: getFilePath(router.asPath, _.path),
                        height: _.imageHeight!,
                        width: _.imageWidth!
                    }
                })}
                rowHeight={360 * (galleryZoom / 50)}
                enableImageSelection={false}
                onClick={(idx) => setPreview({show: true, idx})}
            />
        </div>
    </>
};

interface PreviewProps {
    fileProps: FileProps
    display: { show: boolean, idx?: number }
    close: () => void
}

const GalleryPreview = (props: PreviewProps) => {
    let [showExtra, setShowExtra] = useState(true);
    let router = useRouter();

    setAppElement("body")

    return <>
        <Modal isOpen={props.display.show}
               bodyOpenClassName={styles.noScroll}
               style={{ // modal cover whole screen
                   content: {position: 'inherit', inset: 0, padding: '8px', border: "none"},
                   overlay: {zIndex: 2}
               }}
        >
            <ImageGallery
                items={props.fileProps.files.map(_ => {
                    let imagePath = getFilePath(router.asPath, _.path);
                    return {
                        original: imagePath,
                        thumbnail: imagePath,
                    };
                })}
                startIndex={props.display.idx!}
                slideInterval={2000}
                showIndex={true}
                showThumbnails={showExtra}
                showNav={showExtra}
                onScreenChange={fullScreen => setShowExtra(!fullScreen)}
                onClick={props.close}
            />
        </Modal>
    </>
}
export default GalleryPage;
