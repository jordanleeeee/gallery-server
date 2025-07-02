import { ChangeEvent, TouchEventHandler, useEffect, useState } from "react";
import ImageGallery from "react-image-gallery";
import { Gallery } from "react-grid-gallery";
import { useRouter } from "next/router";
import Image from "next/image";
import { FileProps } from "@/type/file";
import { decode, getFilePath } from "@/util/urlUtil";
import Modal, { setAppElement } from "react-modal";
import JSZip from "jszip";
import "react-image-gallery/styles/css/image-gallery.css";
import {
    AppBar,
    Toolbar,
    IconButton,
    Slider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    LinearProgress,
    Typography,
    Container,
    Paper,
    CircularProgress
} from "@mui/material";
import { ArrowBack, ZoomIn, Delete, Download, Close, FileDownload, DeleteForever } from "@mui/icons-material";

let diffStart: number;
let zoomStart: number;
const zoomMin: number = 20;
const zoomMax: number = 180;

const GalleryPage = (fileProps: FileProps) => {
    const [galleryZoom, setGalleryZoom] = useState(50);
    const [preview, setPreview] = useState<{ show: boolean; idx?: number }>({ show: false });
    const [isMobile, setIsMobile] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    const zoomGallery = (event: Event, newValue: number | number[]) => {
        setGalleryZoom(newValue as number);
    };

    // Detect mobile device - only on client side
    useEffect(() => {
        if (!isClient) return;

        const checkIsMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor;
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
            setIsMobile(isMobileDevice);
        };

        checkIsMobile();
    }, [isClient]);

    // Load zoom level from localStorage - only on client side
    useEffect(() => {
        if (!isClient) return;

        const zoomLevel = window.localStorage.getItem("zoomLevel");
        if (zoomLevel !== null) {
            setGalleryZoom(parseInt(zoomLevel));
        }
    }, [isClient]);

    // Save zoom level to localStorage
    useEffect(() => {
        if (!isClient) return;

        window.localStorage.setItem("zoomLevel", String(galleryZoom));
    }, [galleryZoom, isClient]);

    const onTouchStart: TouchEventHandler<HTMLDivElement> = event => {
        // Only handle multi-touch for pinch gestures
        if (event.touches.length !== 2) {
            return;
        }

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        diffStart = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        zoomStart = galleryZoom;
    };

    const onTouchMove: TouchEventHandler<HTMLDivElement> = event => {
        // Only handle multi-touch for pinch gestures
        if (event.touches.length !== 2) return;

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        const diffNow = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        const scaleFactor = (diffNow - diffStart) / 5; // Reduced sensitivity
        let targetZoom = zoomStart + scaleFactor;

        if (targetZoom >= zoomMax) targetZoom = zoomMax;
        else if (targetZoom <= zoomMin) targetZoom = zoomMin;

        setGalleryZoom(Math.round(targetZoom));
    };

    const handleDeleteGallery = async () => {
        setDeleteDialogOpen(false);
        try {
            await fetch(`/api/${router.asPath}`, { method: "DELETE" });
            router.back();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const downloadGallery = async () => {
        if (isDownloading) return;

        setIsDownloading(true);

        // Create directory name from the current path
        const currentPath = decode(router.asPath);
        const directoryName = currentPath === "/" ? fileProps.rootPath.split("/").pop() : currentPath.split("/").pop();

        try {
            const zip = new JSZip();
            let successCount = 0;

            for (let i = 0; i < fileProps.files.length; i++) {
                const file = fileProps.files[i];
                const imageUrl = getFilePath(router.asPath, file.path) + "?compress=false";

                try {
                    const response = await fetch(imageUrl);
                    if (!response.ok) throw new Error(`Failed to fetch ${file.path}`);

                    const blob = await response.blob();
                    zip.file(file.path, blob);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to fetch ${file.path}:`, error);
                }
            }

            if (successCount === 0) {
                return;
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(zipBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${directoryName}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
        } finally {
            setIsDownloading(false);
        }
    };



    // Show loading state until client-side hydration is complete
    if (!isClient) {
        return (
            <Box sx={{ flexGrow: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, minHeight: "100vh" }}>
            <GalleryPreview fileProps={fileProps} display={preview} close={() => setPreview({ show: false })} />

            <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
                <Toolbar variant="dense">
                    <IconButton edge="start" color="inherit" onClick={() => router.back()} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>

                    <ZoomIn sx={{ mr: 1 }} />
                    <Slider
                        value={galleryZoom}
                        onChange={zoomGallery}
                        min={zoomMin}
                        max={zoomMax}
                        sx={{
                            flexGrow: 1,
                            mx: 2,
                            color: "common.white",
                            "& .MuiSlider-thumb": {
                                color: "common.white",
                            },
                            "& .MuiSlider-track": {
                                color: "common.white",
                            },
                            "& .MuiSlider-rail": {
                                color: "rgba(255, 255, 255, 0.3)",
                            },
                        }}
                    />

                    {isMobile && (
                        <IconButton color="inherit" onClick={downloadGallery} disabled={isDownloading} sx={{ mr: 1 }}>
                            <Download />
                        </IconButton>
                    )}
                    <IconButton color="inherit" onClick={() => setDeleteDialogOpen(true)}>
                        <Delete />
                    </IconButton>
                </Toolbar>
                {isDownloading && <LinearProgress color="secondary" />}
            </AppBar>

            <Container maxWidth={false} sx={{ mt: 8, px: 0.25 }}>
                <div
                    style={{
                        position: "relative",
                        minHeight: "calc(100vh - 80px)",
                        touchAction: "pan-y", // Allow vertical scrolling, prevent horizontal pan
                    }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            minHeight: "calc(100vh - 80px)",
                            bgcolor: "background.default",
                            p: 0.25,
                        }}
                    >
                        <Gallery
                            images={fileProps.files.map(_ => {
                                return {
                                    src: getFilePath(router.asPath, _.path),
                                    height: _.imageHeight!,
                                    width: _.imageWidth!,
                                };
                            })}
                            rowHeight={360 * (galleryZoom / 50)}
                            onClick={idx => setPreview({ show: true, idx })}
                            enableImageSelection={false}
                        />
                    </Paper>
                </div>
            </Container>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
                    <DeleteForever sx={{ mr: 1, color: "error.main" }} />
                    Delete Gallery
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete &quot;{decode(router.asPath)}&quot;? This action cannot be undone.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteGallery} color="error" variant="contained" startIcon={<DeleteForever />}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

interface PreviewProps {
    fileProps: FileProps;
    display: { show: boolean; idx?: number };
    close: () => void;
}

const GalleryPreview = (props: PreviewProps) => {
    const router = useRouter();
    let [showExtra, setShowExtra] = useState(true);

    return (
        <Dialog
            open={props.display.show}
            onClose={props.close}
            maxWidth={false}
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    height: "100vh",
                    maxHeight: "100vh",
                    width: "90vw",
                    maxWidth: "90vw",
                    m: 0,
                    borderRadius: 0,
                },
            }}
        >
            <Box sx={{ position: "relative", height: "100%", bgcolor: "black" }}>
                {props.display.idx !== undefined && (
                    <ImageGallery
                        items={props.fileProps.files.map(_ => {
                            return {
                                original: getFilePath(router.asPath, _.path),
                                thumbnail: getFilePath(router.asPath, _.path),
                            };
                        })}
                        startIndex={props.display.idx}
                        showPlayButton={false}
                        showFullscreenButton={true}
                        showBullets={false}
                        showIndex={true}
                        slideOnThumbnailOver={false}
                        showThumbnails={showExtra}
                        showNav={showExtra}
                        onScreenChange={fullScreen => setShowExtra(!fullScreen)}
                        onClick={() => {
                            setShowExtra(true);
                            props.close();
                        }}
                    />
                )}
            </Box>
        </Dialog>
    );
};

export default GalleryPage;
