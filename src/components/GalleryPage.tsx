import {ChangeEvent, TouchEventHandler, useEffect, useState} from "react";
import ImageGallery from "react-image-gallery";
import {Gallery} from "react-grid-gallery";
import {useRouter} from "next/router";
import Image from "next/image";
import {FileProps} from "@/type/file";
import {decode, getFilePath} from "@/util/urlUtil";
import Modal, {setAppElement} from "react-modal";
import JSZip from "jszip";
import styles from "../styles/Gallery.module.css";
import "react-image-gallery/styles/css/image-gallery.css";

let diffStart: number;
let zoomStart: number;
const zoomMin: number = 20;
const zoomMax: number = 180;

const GalleryPage = (fileProps: FileProps) => {
    let [galleryZoom, setGalleryZoom] = useState(50);
    let [preview, setPreview] = useState<{ show: boolean; idx?: number }>({show: false});
    let [isMobile, setIsMobile] = useState(false);
    let [isDownloading, setIsDownloading] = useState(false);
    let router = useRouter();

    const zoomGallery = (event: ChangeEvent<HTMLInputElement>) => {
        const zoomValue = event.target.value;
        setGalleryZoom(parseInt(zoomValue));
    };

    // Detect mobile device
    useEffect(() => {
        const checkIsMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor;
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
            setIsMobile(isMobileDevice);
        };

        checkIsMobile();
    }, []);

    useEffect(() => {
        const zoomLevel = window.localStorage.getItem("zoomLevel");
        if (zoomLevel !== null) {
            setGalleryZoom(parseInt(zoomLevel));
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("zoomLevel", String(galleryZoom));
    }, [galleryZoom]);

    const onTouchStart: TouchEventHandler<HTMLDivElement> = event => {
        let touch1 = event.touches[0];
        let touch2 = event.touches[1];
        if (touch1 === undefined || touch2 === undefined) return;
        diffStart = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        zoomStart = galleryZoom;
    };

    const onTouchMove: TouchEventHandler<HTMLDivElement> = event => {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        if (touch1 === undefined || touch2 === undefined) return;

        const diffNow = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        let targetZoom = zoomStart + (diffNow - diffStart) / 10;

        if (targetZoom >= zoomMax) setGalleryZoom(zoomMax);
        else if (targetZoom <= zoomMin) setGalleryZoom(zoomMin);
        else setGalleryZoom(targetZoom);
    };

    let removeGallery = async () => {
        let remove = confirm(`are you sure you want to remove ${decode(router.asPath)}`);
        if (remove) {
            await fetch(`/api/${router.asPath}`, {method: "DELETE"});
            alert(`${decode(router.asPath)} removed`);
            router.back();
        }
    };

    const downloadGallery = async () => {
        if (isDownloading) return;

        setIsDownloading(true);

        // Create directory name from the current path
        const currentPath = decode(router.asPath);
        console.log(currentPath)
        const directoryName = currentPath === "/" ? fileProps.rootPath.split("/").pop() : currentPath.split("/").pop()

        const downloadConfirm = confirm(`Download all ${fileProps.files.length} images as "${directoryName}.zip"?`);

        if (!downloadConfirm) {
            setIsDownloading(false);
            return;
        }

        try {
            const zip = new JSZip();
            let successCount = 0;
            let parallel = false
            // Add all images to ZIP file
            if (parallel) {
                const fetchPromises = fileProps.files.map(async (file) => {
                    const imageUrl = getFilePath(router.asPath, file.path) + "?compress=false";

                    try {
                        const response = await fetch(imageUrl);
                        if (!response.ok) throw new Error(`Failed to fetch ${file.path}`);

                        const blob = await response.blob();
                        return {file, blob, success: true};
                    } catch (error) {
                        console.error(`Failed to fetch ${file.path}:`, error);
                        return {file, blob: null, success: false};
                    }
                });

                // Wait for all fetch operations to complete
                const results = await Promise.allSettled(fetchPromises);

                // Process results and add successful ones to ZIP
                for (const result of results) {
                    if (result.status === 'fulfilled' && result.value.success && result.value.blob) {
                        zip.file(result.value.file.path, result.value.blob);
                        successCount++;
                    }
                }
            } else {
                for (let i = 0; i < fileProps.files.length; i++) {
                    const file = fileProps.files[i];
                    const imageUrl = getFilePath(router.asPath, file.path) + "?compress=false";

                    try {
                        // Fetch the image as blob
                        const response = await fetch(imageUrl);
                        if (!response.ok) throw new Error(`Failed to fetch ${file.path}`);

                        const blob = await response.blob();

                        // Add image to ZIP
                        zip.file(file.path, blob);
                        successCount++;
                    } catch (error) {
                        console.error(`Failed to fetch ${file.path}:`, error);
                    }
                }
            }

            if (successCount === 0) {
                alert("No images could be downloaded");
                return;
            }

            // Generate ZIP file
            const zipBlob = await zip.generateAsync({type: "blob"});

            // Create a download link for ZIP file
            const url = window.URL.createObjectURL(zipBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${directoryName}.zip`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            alert(`Download completed! ZIP file contains ${successCount} of ${fileProps.files.length} images`);
        } catch (error) {
            console.error("Download error:", error);
            alert("An error occurred during download");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <GalleryPreview fileProps={fileProps} display={preview} close={() => setPreview({show: false})}/>
            <div className={styles.toolbar}>
                <Image src={"/back.png"} alt={"back"} width={18} height={18} onClick={() => router.back()}/>
                <input type="range" min={zoomMin} max={zoomMax} value={galleryZoom} id="zoom-range" onInput={zoomGallery}/>
                <Image src={"/bin.png"} alt={"back"} width={18} height={18} onClick={removeGallery}/>
                {isMobile && <Image src={"/download.png"} alt={"download"} width={18} height={18} onClick={downloadGallery}/>}
            </div>

            <div className={styles.top}></div>
            <div className={styles.gridGalleryContainer} onTouchStart={onTouchStart} onTouchMove={onTouchMove}>
                <Gallery
                    images={fileProps.files.map(_ => {
                        return {
                            src: getFilePath(router.asPath, _.path),
                            height: _.imageHeight!,
                            width: _.imageWidth!,
                        };
                    })}
                    rowHeight={360 * (galleryZoom / 50)}
                    enableImageSelection={false}
                    onClick={idx => setPreview({show: true, idx})}
                />
            </div>
        </>
    );
};

interface PreviewProps {
    fileProps: FileProps;
    display: { show: boolean; idx?: number };
    close: () => void;
}

const GalleryPreview = (props: PreviewProps) => {
    let [showExtra, setShowExtra] = useState(true);
    let router = useRouter();

    setAppElement("body");

    return (
        <>
            <Modal
                isOpen={props.display.show}
                bodyOpenClassName={styles.noScroll}
                style={{
                    // modal cover whole screen
                    content: {position: "inherit", inset: 0, padding: "8px", border: "none"},
                    overlay: {zIndex: 2},
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
                    onClick={() => {
                        setShowExtra(true);
                        props.close();
                    }}
                />
            </Modal>
        </>
    );
};
export default GalleryPage;
