import {useEffect, useState} from "react";
import ImageGallery from "react-image-gallery";
import {Gallery} from "react-grid-gallery";
import {useRouter} from "next/router";
import {FileProps} from "@/type/file";
import {decode, getFilePath} from "@/util/urlUtil";
import useZoomGestures from "@/hooks/useZoomGestures";
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
    Container,
    Paper,
    CircularProgress,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {ArrowBack, ZoomIn, Delete, Download, FileDownload, DeleteForever} from "@mui/icons-material";

const GalleryPage = (fileProps: FileProps) => {
    const [preview, setPreview] = useState<{show: boolean; idx?: number}>({show: false});
    const [isDownloading, setIsDownloading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const theme = useTheme();

    const [isClient, setIsClient] = useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const router = useRouter();

    // Use the custom zoom gestures hook
    const {zoom: galleryZoom, onTouchStart, onTouchMove, handleSliderChange, zoomMin, zoomMax} = useZoomGestures();

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
        sessionStorage.setItem("restore", "true");
    }, []);

    const handleDeleteGallery = async () => {
        setDeleteDialogOpen(false);
        try {
            await fetch(`/api/${router.asPath}`, {method: "DELETE"});
            router.back();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const handleDownloadClick = () => {
        setDownloadDialogOpen(true);
    };

    const downloadGallery = () => {
        if (isDownloading) return;

        setDownloadDialogOpen(false);
        setIsDownloading(true);

        try {
            // Create download URL for server-side zip generation
            const zipUrl = `/api${router.asPath}?download=zip`;

            // Create a temporary link element and trigger download
            // This allows the browser to start the download immediately
            // as the server streams the zip content
            const link = document.createElement("a");
            link.href = zipUrl;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Reset downloading state after a short delay
            // since we can't track the actual download completion
            setTimeout(() => {
                setIsDownloading(false);
            }, 2000);
        } catch (error) {
            console.error("Download error:", error);
            setIsDownloading(false);
        }
    };

    // Show loading state until client-side hydration is complete
    if (!isClient) {
        return (
            <Box sx={{flexGrow: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{flexGrow: 1, minHeight: "100vh"}}>
            <GalleryPreview fileProps={fileProps} display={preview} close={() => setPreview({show: false})} />

            <AppBar position="fixed" sx={{zIndex: theme => theme.zIndex.drawer + 1}}>
                <Toolbar variant="dense">
                    <IconButton edge="start" color="inherit" onClick={() => router.back()} sx={{mr: 2}}>
                        <ArrowBack />
                    </IconButton>

                    <ZoomIn sx={{mr: 1}} />
                    <Slider
                        value={galleryZoom}
                        onChange={handleSliderChange}
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
                    <IconButton color="inherit" onClick={() => setDeleteDialogOpen(true)}>
                        <Delete />
                    </IconButton>
                    {isMobile && (
                        <IconButton color="inherit" onClick={handleDownloadClick} disabled={isDownloading} sx={{mr: 1}}>
                            <Download />
                        </IconButton>
                    )}
                </Toolbar>
                {isDownloading && <LinearProgress color="secondary" />}
            </AppBar>

            <Container maxWidth={false} sx={{mt: 8, px: 0.25}}>
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
                            onClick={idx => setPreview({show: true, idx})}
                            enableImageSelection={false}
                        />
                    </Paper>
                </div>
            </Container>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{display: "flex", alignItems: "center"}}>
                    <DeleteForever sx={{mr: 1, color: "error.main"}} />
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

            {/* Download Confirmation Dialog */}
            <Dialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)}>
                <DialogTitle sx={{display: "flex", alignItems: "center"}}>
                    <FileDownload sx={{mr: 1, color: "primary.main"}} />
                    Download Gallery
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Download all {fileProps.files.length} images from &quot;{decode(router.asPath)}&quot; as a ZIP file?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDownloadDialogOpen(false)}>Cancel</Button>
                    <Button onClick={downloadGallery} color="primary" variant="contained" startIcon={<FileDownload />}>
                        Download
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

interface PreviewProps {
    fileProps: FileProps;
    display: {show: boolean; idx?: number};
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
                    width: "95vw",
                    maxWidth: "95vw",
                    m: 0,
                    borderRadius: 0,
                },
            }}
        >
            <Box sx={{position: "relative", height: "100%", bgcolor: "black"}}>
                {props.display.idx !== undefined && (
                    <ImageGallery
                        items={props.fileProps.files.map(_ => {
                            let path = getFilePath(router.asPath, _.path);
                            return {
                                original: path,
                                thumbnail: path,
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
