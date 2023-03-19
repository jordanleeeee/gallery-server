import {ChangeEvent, useState} from "react";
import ImageGallery from "react-image-gallery";
import {Gallery, Image as GridImage} from "react-grid-gallery";
import {useRouter} from "next/router";
import Image from "next/image";
import {FileProps} from "@/type/file";
import {encode} from "@/util/urlUtil";
import styles from "../styles/Gallery.module.css";
import "react-image-gallery/styles/css/image-gallery.css";

const GalleryPage = (fileProps: FileProps) => {
    let [galleryZoom, setGalleryZoom] = useState("200");
    let [preview, setPreview] = useState({show: false, idx: 0});
    let router = useRouter();

    const zoomGallery = (event: ChangeEvent<HTMLInputElement>) => {
        const zoomValue = event.target.value;
        setGalleryZoom(zoomValue);
    };

    return preview.show ?
        <ImageGallery
            items={fileProps.files.map(_ => {
                let imagePath = encode("/api" + fileProps.subPath + "/" + _.path);
                return {
                    original: imagePath,
                    thumbnail: imagePath,
                };
            })}
            startIndex={preview.idx}
            slideInterval={2000}
            showIndex={true}
            onClick={() => setPreview({show: false, idx: 0})}
        /> :
        <>
            <div className={styles.toolbar}>
                <button onClick={() => router.back()}>
                    <Image src={"/back.png"} alt={"back"} width={18} height={18}/>
                </button>
                <input type="range" min="10" max="500" value={galleryZoom} id="zoom-range" onInput={zoomGallery}/>
            </div>

            <div className={styles.top}></div>
            <div style={{zoom: galleryZoom + '%'}}>
                <Gallery
                    images={fileProps.files.map(_ => {
                        return {
                            src: encode("/api" + fileProps.subPath + "/" + _.path),
                            width: _.imageWidth,
                            height: _.imageHeight
                        } as GridImage
                    })}
                    enableImageSelection={false}
                    onClick={(idx) => setPreview({show: true, idx})}
                />
            </div>
        </>
};

export default GalleryPage;
