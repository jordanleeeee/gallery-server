import {ChangeEvent, useState} from "react";
import ImageGallery from "react-image-gallery";
import {Gallery} from "react-grid-gallery";
import {useRouter} from "next/router";
import Image from "next/image";
import {FileProps} from "@/type/file";
import {getFilePath} from "@/util/urlUtil";
import Modal from 'react-modal';
import styles from "../styles/Gallery.module.css";
import "react-image-gallery/styles/css/image-gallery.css";

const GalleryPage = (fileProps: FileProps) => {
    let [galleryZoom, setGalleryZoom] = useState("50");
    let [preview, setPreview] = useState<{ show: boolean, idx?: number }>({show: false});
    let router = useRouter();

    const zoomGallery = (event: ChangeEvent<HTMLInputElement>) => {
        const zoomValue = event.target.value;
        setGalleryZoom(zoomValue);
    };

    return <>
        <Modal isOpen={preview.show}
               bodyOpenClassName={styles.noScroll}
               style={{ // modal cover whole screen
                   content: {position: 'inherit', inset: 0, padding: '8px', border: "none"},
                   overlay: {zIndex: 2}
               }}
        >
            <ImageGallery
                items={fileProps.files.map(_ => {
                    let imagePath = getFilePath(router.asPath, _.path);
                    return {
                        original: imagePath,
                        thumbnail: imagePath,
                    };
                })}
                startIndex={preview.idx}
                slideInterval={2000}
                showIndex={true}
                onClick={() => setPreview({show: false})}
            />
        </Modal>

        <div className={styles.toolbar}>
            <Image src={"/back.png"} alt={"back"} width={18} height={18} onClick={() => router.back()}/>
            <input type="range" min="20" max="180" value={galleryZoom} id="zoom-range" onInput={zoomGallery}/>
        </div>

        <div className={styles.top}></div>
        <div>
            <Gallery
                images={fileProps.files.map(_ => {
                    return {
                        src: getFilePath(router.asPath, _.path),
                        height: _.imageHeight!,
                        width: _.imageWidth!
                    }
                })}
                rowHeight={360 * parseInt(galleryZoom) / 50}
                enableImageSelection={false}
                onClick={(idx) => setPreview({show: true, idx})}
            />
        </div>
    </>
};

export default GalleryPage;
