import React, {useEffect, useState} from "react";
import {File, FileProps} from "@/type/file";
import Link from "next/link";
import {decode, getDirectoryPath, getFilePath, getResourcesPath} from "@/util/urlUtil";
import {useRouter} from "next/router";
import {Gallery} from "react-grid-gallery";
import {
    Container,
    Typography,
    Breadcrumbs,
    Card,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Box,
    Chip,
    Paper,
    Avatar,
    CircularProgress,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {Folder, InsertDriveFile, ArrowBack, PhotoLibrary} from "@mui/icons-material";

const dateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
} as Intl.DateTimeFormatOptions;

const DirectoryPage = (fileProps: FileProps) => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Responsive page size
    const GALLERIES_PER_PAGE = isMobile ? 10 : 30;

    // Pagination state for galleries
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [displayedGalleries, setDisplayedGalleries] = useState<File[]>([]);

    // Filter and sort files
    const galleryDirectors = fileProps.files.filter(_ => _.type === "imageDirectory").sort((a, b) => b.lastModify.localeCompare(a.lastModify));
    const fileAndDirectory = fileProps.files.filter(_ => _.type !== "imageDirectory").sort((a, b) => b.lastModify.localeCompare(a.lastModify));

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // clear display gallery when page change
        setDisplayedGalleries([]);
        setCurrentPage(1);
    }, [router.asPath]);

    useEffect(() => {
        if (!isClient) return;

        const previousScrollPosition = sessionStorage.getItem("scrollPosition");
        const previousGalleryCount = sessionStorage.getItem("galleryCount");
        const restore = sessionStorage.getItem("restore");

        if (restore && previousScrollPosition && previousGalleryCount) {
            const targetGalleryCount = Number.parseInt(previousGalleryCount);
            const targetScrollPosition = Number.parseInt(previousScrollPosition);

            // Load the same number of galleries that were previously loaded
            if (galleryDirectors.length > 0) {
                const galleriesNeeded = Math.min(targetGalleryCount, galleryDirectors.length);
                setDisplayedGalleries(galleryDirectors.slice(0, galleriesNeeded));
                setCurrentPage(Math.ceil(galleriesNeeded / GALLERIES_PER_PAGE));
            }

            // Restore scroll position after galleries are loaded
            setTimeout(() => {
                window.scrollTo(0, targetScrollPosition);
                sessionStorage.removeItem("scrollPosition");
                sessionStorage.removeItem("galleryCount");
                sessionStorage.removeItem("restore");
            }, 100);
        } else {
            // clear restore record if isn't restored
            sessionStorage.removeItem("scrollPosition");
            sessionStorage.removeItem("galleryCount");
            sessionStorage.removeItem("restore");
        }

        const onUnload = () => {
            sessionStorage.setItem("scrollPosition", String(window.scrollY));
            sessionStorage.setItem("galleryCount", String(displayedGalleries.length));
        };

        router.events.on("routeChangeStart", onUnload);

        return () => {
            router.events.off("routeChangeStart", onUnload);
        };
    }, [router.events, isClient, galleryDirectors.length, displayedGalleries.length, GALLERIES_PER_PAGE]);

    // Initialize displayed galleries on first load (only if not restoring)
    useEffect(() => {
        if (galleryDirectors.length > 0) {
            const restore = sessionStorage.getItem("restore");
            if (!restore) {
                setDisplayedGalleries(galleryDirectors.slice(0, GALLERIES_PER_PAGE));
                setCurrentPage(1);
            } else {
            }
        }
    }, [galleryDirectors.length]);

    // Handle responsive page size changes
    useEffect(() => {
        if (!isClient || displayedGalleries.length === 0) return;

        // If screen size changed, adjust the current page calculation
        const newCurrentPage = Math.ceil(displayedGalleries.length / GALLERIES_PER_PAGE);
        if (newCurrentPage !== currentPage) {
            setCurrentPage(newCurrentPage);
        }
    }, [GALLERIES_PER_PAGE, isClient, displayedGalleries.length, currentPage]);

    // Scroll event listener for infinite scroll
    useEffect(() => {
        if (!isClient) return;

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            // Check if user is near the bottom (within 200px)
            if (scrollTop + windowHeight >= docHeight - 200) {
                loadMoreGalleries();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isClient, currentPage, isLoadingMore, displayedGalleries.length, galleryDirectors.length]);

    // Load more galleries function
    const loadMoreGalleries = () => {
        if (isLoadingMore || displayedGalleries.length >= galleryDirectors.length) return;

        setIsLoadingMore(true);

        // Simulate loading delay for better UX
        setTimeout(
            () => {
                const nextPage = currentPage + 1;
                const startIndex = (nextPage - 1) * GALLERIES_PER_PAGE;
                const endIndex = startIndex + GALLERIES_PER_PAGE;
                const newGalleries = galleryDirectors.slice(startIndex, endIndex);

                setDisplayedGalleries(prev => [...prev, ...newGalleries]);
                setCurrentPage(nextPage);
                setIsLoadingMore(false);
            },
            isMobile ? 10 : 500
        );
    };

    function buildBreadcrumbs() {
        const urlPart: string[] = decode(fileProps.rootPath + router.asPath)
            .split("/")
            .filter(part => part !== "");

        return urlPart.map((part, index) => (
            <Typography key={index} color="text.primary" sx={{fontSize: "1.1rem"}} component="span">
                {part}
            </Typography>
        ));
    }

    // Don't render until client-side hydration is complete to avoid mismatch
    if (!isClient) {
        return (
            <Container maxWidth="lg" sx={{py: 3}}>
                <Box sx={{mb: 4}}>
                    <Typography variant="h6" sx={{mb: 2}}>
                        Loading...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{py: 3}}>
            <Box sx={{mb: 4}}>
                <Breadcrumbs separator="/" sx={{mb: 2}}>
                    {buildBreadcrumbs()}
                </Breadcrumbs>
            </Box>

            {fileAndDirectory.length + (router.asPath !== "/" ? 1 : 0) > 0 && (
                <Box sx={{mb: 4}}>
                    <Typography variant="h6" sx={{mb: 2, display: "flex", alignItems: "center"}}>
                        <InsertDriveFile sx={{mr: 1, color: "primary.main"}} />
                        Files & Folders
                    </Typography>

                    <Card>
                        <List>
                            {router.asPath !== "/" && (
                                <ListItem disablePadding>
                                    <ListItemButton component={Link} href={router.asPath + "/.."}>
                                        <ListItemIcon>
                                            <Avatar sx={{bgcolor: "grey.300", width: 32, height: 32}}>
                                                <ArrowBack fontSize="small" />
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText primary="../" secondary="Parent directory" />
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {fileAndDirectory.map((file, idx) => (
                                <React.Fragment key={idx}>
                                    <FileAndDirectoryItem parent={router.asPath} file={file} />
                                    {idx < fileAndDirectory.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Card>
                </Box>
            )}

            {galleryDirectors.length > 0 && (
                <Box sx={{mb: 4}}>
                    <Typography variant="h6" sx={{mb: 2, display: "flex", alignItems: "center"}}>
                        <PhotoLibrary sx={{mr: 1, color: "primary.main"}} />
                        Image Galleries
                    </Typography>

                    <Paper sx={{px: 0.25, py: 2, bgcolor: "background.paper"}}>
                        <Gallery
                            images={displayedGalleries.map(_ => {
                                return {
                                    src: getFilePath(router.asPath, _.icon!),
                                    height: _.imageHeight!,
                                    width: _.imageWidth!,
                                    thumbnailCaption: _.path + (_.path.includes("P】") ? "" : `【${_.imageCount}P】`),
                                };
                            })}
                            rowHeight={288}
                            onClick={idx => router.push(getDirectoryPath(router.asPath, displayedGalleries[idx].path)).then()}
                            enableImageSelection={false}
                        />

                        {isLoadingMore && (
                            <Box sx={{display: "flex", justifyContent: "center", mt: 2}}>
                                <CircularProgress size={24} />
                                <Typography variant="body2" sx={{ml: 1, alignSelf: "center"}}>
                                    Loading more galleries...
                                </Typography>
                            </Box>
                        )}

                        {displayedGalleries.length >= galleryDirectors.length && galleryDirectors.length > GALLERIES_PER_PAGE && (
                            <Box sx={{display: "flex", justifyContent: "center", mt: 2}}>
                                <Typography variant="body2" color="text.secondary">
                                    All galleries loaded
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            )}
        </Container>
    );
};

interface FileAndDirectoryProps {
    parent: string;
    file: File;
}

const FileAndDirectoryItem = React.memo(({parent, file}: FileAndDirectoryProps) => {
    const isDirectory = file.type === "directory";
    const formatDate = new Date(file.lastModify).toLocaleDateString("en-HK", dateTimeFormatOptions);

    const ItemContent = () => (
        <ListItemButton>
            <ListItemIcon>
                <Avatar sx={{bgcolor: isDirectory ? "primary.light" : "grey.300", width: 32, height: 32}}>{isDirectory ? <Folder fontSize="small" /> : <InsertDriveFile fontSize="small" />}</Avatar>
            </ListItemIcon>
            <ListItemText
                primary={file.path}
                secondary={
                    <Box sx={{display: "flex", alignItems: "center", mt: 0.5}}>
                        <Chip label={formatDate} size="small" variant="outlined" sx={{mr: 1, fontSize: "0.75rem"}} />
                        <Chip label={isDirectory ? "Folder" : "File"} size="small" color={isDirectory ? "primary" : "default"} variant="filled" sx={{fontSize: "0.75rem"}} />
                    </Box>
                }
            />
        </ListItemButton>
    );

    return (
        <ListItem disablePadding>
            {isDirectory ? (
                <Link href={getResourcesPath(parent, file)} style={{width: "100%", textDecoration: "none", color: "inherit"}}>
                    <ItemContent />
                </Link>
            ) : (
                <a href={"/" + getResourcesPath(parent, file)} style={{width: "100%", textDecoration: "none", color: "inherit"}}>
                    <ItemContent />
                </a>
            )}
        </ListItem>
    );
});

FileAndDirectoryItem.displayName = "FileAndDirectoryItem";

export default DirectoryPage;
