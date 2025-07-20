import React, {useEffect, useState, useMemo, useCallback, useRef} from "react";
import {File, FileProps, FavoriteGallery} from "@/type/file";
import Link from "next/link";
import {decode, getDirectoryPath, getFilePath, getResourcesPath} from "@/util/urlUtil";
import {useRouter} from "next/router";
import {Gallery} from "react-grid-gallery";
import {useThemeMode} from "@/contexts/ThemeContext";
import {useFavorites} from "@/hooks/useFavorites";
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
    IconButton,
    Tooltip,
    Badge,
} from "@mui/material";
import {Folder, InsertDriveFile, ArrowBack, PhotoLibrary, Brightness4, Brightness7, Favorite, FavoriteBorder} from "@mui/icons-material";

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
    const restorationAttempted = useRef(false);
    const initializationAttempted = useRef(false);
    const {mode, toggleTheme} = useThemeMode();
    const {isFavorited, toggleFavorite, favoritesCount} = useFavorites(fileProps.rootPath);

    // Responsive page size
    const GALLERIES_PER_PAGE = isMobile ? 10 : 30;

    // Pagination state for galleries
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [displayedGalleries, setDisplayedGalleries] = useState<File[]>([]);

    // Filter and sort files
    const galleryDirectors = useMemo(() => fileProps.files.filter(_ => _.type === "imageDirectory").sort((a, b) => b.lastModify.localeCompare(a.lastModify)), [fileProps.files]);
    const fileAndDirectory = useMemo(() => fileProps.files.filter(_ => _.type !== "imageDirectory").sort((a, b) => b.lastModify.localeCompare(a.lastModify)), [fileProps.files]);

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // clear display gallery when page change
        setDisplayedGalleries([]);
        setCurrentPage(1);
        restorationAttempted.current = false; // Reset restoration flag when page changes
        initializationAttempted.current = false; // Reset initialization flag when page changes
    }, [router.asPath]);

    // Handle restoration and initialization logic
    useEffect(() => {
        if (!isClient || galleryDirectors.length === 0) return;

        const previousScrollPosition = sessionStorage.getItem("scrollPosition");
        const previousGalleryCount = sessionStorage.getItem("galleryCount");
        const restore = sessionStorage.getItem("restore");

        // Handle restoration
        if (restore && previousScrollPosition && previousGalleryCount && !restorationAttempted.current) {
            restorationAttempted.current = true; // Mark that restoration has been attempted
            const targetGalleryCount = Number.parseInt(previousGalleryCount);
            const targetScrollPosition = Number.parseInt(previousScrollPosition);

            // Load the same number of galleries that were previously loaded
            const galleriesNeeded = Math.min(targetGalleryCount, galleryDirectors.length);
            setDisplayedGalleries(galleryDirectors.slice(0, galleriesNeeded));
            setCurrentPage(Math.ceil(galleriesNeeded / GALLERIES_PER_PAGE));

            // Restore scroll position after galleries are loaded
            setTimeout(() => {
                window.scrollTo(0, targetScrollPosition);
                sessionStorage.removeItem("scrollPosition");
                sessionStorage.removeItem("galleryCount");
                sessionStorage.removeItem("restore");
            }, 100);
        }
        // Handle normal initialization
        else if (!restore && !initializationAttempted.current && displayedGalleries.length === 0) {
            initializationAttempted.current = true; // Mark that initialization has been attempted
            setDisplayedGalleries(galleryDirectors.slice(0, GALLERIES_PER_PAGE));
            setCurrentPage(1);
        }

        // Clear restore record if not used
        if (!restore) {
            sessionStorage.removeItem("scrollPosition");
            sessionStorage.removeItem("galleryCount");
            sessionStorage.removeItem("restore");
        }
    }, [isClient, galleryDirectors, GALLERIES_PER_PAGE, displayedGalleries.length]);

    // Handle router events for saving scroll position
    useEffect(() => {
        if (!isClient) return;

        const onUnload = () => {
            sessionStorage.setItem("scrollPosition", String(window.scrollY));
            sessionStorage.setItem("galleryCount", String(displayedGalleries.length));
        };

        router.events.on("routeChangeStart", onUnload);

        return () => {
            router.events.off("routeChangeStart", onUnload);
        };
    }, [router.events, isClient, displayedGalleries.length]);

    // Load more galleries function
    const loadMoreGalleries = useCallback(() => {
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
    }, [isLoadingMore, displayedGalleries.length, galleryDirectors, currentPage, GALLERIES_PER_PAGE, isMobile]);

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
    }, [isClient, loadMoreGalleries]);

    // Handle favorite toggle for galleries
    const handleFavoriteToggle = useCallback(
        (galleryFile: File, event: React.MouseEvent) => {
            event.stopPropagation(); // Prevent gallery navigation
            event.preventDefault(); // Prevent any default behavior

            const favoriteGallery: FavoriteGallery = {
                path: getDirectoryPath(router.asPath, galleryFile.path).replace(/\/$/, ""),
                rootPath: fileProps.rootPath,
                thumbnailPath: getFilePath(router.asPath, galleryFile.icon!),
                imageWidth: galleryFile.imageWidth!,
                imageHeight: galleryFile.imageHeight!,
            };

            toggleFavorite(favoriteGallery);
        },
        [router.asPath, toggleFavorite, fileProps.rootPath]
    );

    const breadcrumbs = useMemo(() => {
        const urlPart: string[] = decode(fileProps.rootPath + router.asPath)
            .split("/")
            .filter(part => part !== "");

        return urlPart.map((part, index) => (
            <Typography key={index} color="text.primary" sx={{fontSize: "1.1rem"}} component="span">
                {part}
            </Typography>
        ));
    }, [fileProps.rootPath, router.asPath]);

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
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2}}>
                    <Breadcrumbs separator="/" sx={{flex: 1}}>
                        {breadcrumbs}
                    </Breadcrumbs>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        <Tooltip title="View Favorites">
                            <IconButton onClick={() => router.push("/_favorites")} color="inherit">
                                <Badge badgeContent={favoritesCount} color="secondary">
                                    <Favorite />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
                            <IconButton onClick={toggleTheme} color="inherit">
                                {mode === "light" ? <Brightness4 /> : <Brightness7 />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
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
                            images={displayedGalleries.map((_, _idx) => {
                                const galleryPath = getDirectoryPath(router.asPath, _.path).replace(/\/$/, "");
                                const isCurrentlyFavorited = isFavorited(galleryPath);

                                return {
                                    src: getFilePath(router.asPath, _.icon!),
                                    height: _.imageHeight!,
                                    width: _.imageWidth!,
                                    thumbnailCaption: _.path + (_.path.includes("P】") ? "" : `【${_.imageCount}P】`),
                                    customOverlay: (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 8,
                                                right: 8,
                                                zIndex: 10,
                                                pointerEvents: "auto",
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={event => handleFavoriteToggle(_, event)}
                                                onMouseDown={event => event.stopPropagation()}
                                                sx={{
                                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(255, 255, 255, 1)",
                                                    },
                                                    width: 36,
                                                    height: 36,
                                                    pointerEvents: "auto",
                                                }}
                                            >
                                                {isCurrentlyFavorited ? <Favorite sx={{color: "red", fontSize: 20}} /> : <FavoriteBorder sx={{color: "gray", fontSize: 20}} />}
                                            </IconButton>
                                        </Box>
                                    ),
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
