import {FileProps} from "@/type/file";
import {ChangeEvent, useState} from "react";
import ImageGallery, {ReactImageGalleryItem} from "react-image-gallery";
import {Gallery, Image as GridImage} from "react-grid-gallery";
import styles from "../styles/Gallery.module.css";
import "react-image-gallery/styles/css/image-gallery.css";
import {useRouter} from "next/router";
import Image from "next/image";
import {encode} from "@/util/urlUtil";

const GalleryPage = (fileProps: FileProps) => {
    let [galleryZoom, setGalleryZoom] = useState("200");
    let [showPreview, setShowPreview] = useState(false);
    let [previewIdx, setPreviewIdx] = useState(0);
    const router = useRouter();

    let images: GridImage[] = fileProps.files.map(_ => {
        return {
            src: encode("/api" + fileProps.subPath + "/" + _.path),
            width: _.imageWidth,
            height: _.imageHeight
        } as GridImage
    })

    const zoomGallery = (event: ChangeEvent<HTMLInputElement>) => {
        const zoomValue = event.target.value;
        setGalleryZoom(zoomValue);
    };

    function toPreview(): ReadonlyArray<ReactImageGalleryItem> {
        return fileProps.files.map(_ => {
            let imagePath = encode("/api" + fileProps.subPath + "/" + _.path);
            return {
                original: imagePath,
                thumbnail: imagePath,
            };
        });
    }

    let openView = (idx: number) => {
        setPreviewIdx(idx);
        setShowPreview(true);
    };

    let closePreview = () => {
        setShowPreview(false);
    };

    return showPreview ?
        <Preview items={toPreview()} idx={previewIdx} closePreview={closePreview}/> :
        <>
            <div className={styles.toolbar}>
                <button onClick={() => router.back()}>
                    <Image src={"/back.png"} alt={"back"} width={18} height={18}/>
                </button>
                <input type="range" min="10" max="500" value={galleryZoom} id="zoom-range" onInput={zoomGallery}/>
            </div>

            <div className={styles.top}></div>
            <div style={{zoom: galleryZoom + "%"}}>
                <Gallery
                    images={images}
                    enableImageSelection={false}
                    onClick={openView}
                />
            </div>
        </>
};

interface PreviewProps {
    items: ReadonlyArray<ReactImageGalleryItem>;
    idx: number;
    closePreview: () => void;
}

const Preview = ({items, idx, closePreview}: PreviewProps) => {
    return <ImageGallery
        items={items}
        startIndex={idx}
        slideInterval={2000}
        showIndex={true}
        onClick={() => closePreview()}
    />;
};

export default GalleryPage;
