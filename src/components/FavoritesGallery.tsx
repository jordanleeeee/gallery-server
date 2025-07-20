import React, {useEffect, useState, useCallback, useRef} from "react";
import {useRouter} from "next/router";
import {Gallery} from "react-grid-gallery";
import {useFavorites} from "@/hooks/useFavorites";
import {useThemeMode} from "@/contexts/ThemeContext";
import {Container, Typography, Box, Paper, IconButton, Tooltip, Card, CardContent, useMediaQuery, useTheme, Chip, Button, CircularProgress} from "@mui/material";
import {ArrowBack, Favorite, Brightness4, Brightness7, FolderOpen, PhotoLibrary} from "@mui/icons-material";

interface FavoritesGalleryProps {
    rootPath: string;
}

export const FavoritesGallery: React.FC<FavoritesGalleryProps> = ({rootPath}) => {
    const router = useRouter();
    const {favorites, removeFromFavorites} = useFavorites(rootPath);
    const {mode, toggleTheme} = useThemeMode();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [isClient, setIsClient] = useState(false);
    const restorationAttempted = useRef(false);
    const initializationAttempted = useRef(false);

    // Responsive page size
    const FAVORITES_PER_PAGE = isMobile ? 10 : 30;

    // Pagination state for favorites
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [displayedFavorites, setDisplayedFavorites] = useState<typeof favorites>([]);

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // clear displayed favorites when page changes
        setDisplayedFavorites([]);
        setCurrentPage(1);
        restorationAttempted.current = false; // Reset restoration flag when page changes
        initializationAttempted.current = false; // Reset initialization flag when page changes
    }, [router.asPath]);

    // Handle restoration and initialization logic
    useEffect(() => {
        if (favorites.length === 0) return;

        const previousScrollPosition = sessionStorage.getItem("favoritesScrollPosition");
        const previousFavoriteCount = sessionStorage.getItem("favoriteCount");
        const restore = sessionStorage.getItem("restore");

        // Handle restoration
        if (restore && previousScrollPosition && previousFavoriteCount && !restorationAttempted.current) {
            console.log("restoring favorites");
            restorationAttempted.current = true; // Mark that restoration has been attempted
            const targetFavoriteCount = Number.parseInt(previousFavoriteCount);
            const targetScrollPosition = Number.parseInt(previousScrollPosition);

            // Load the same number of favorites that were previously loaded
            const favoritesNeeded = Math.min(targetFavoriteCount, favorites.length);
            setDisplayedFavorites(favorites.slice(0, favoritesNeeded));
            setCurrentPage(Math.ceil(favoritesNeeded / FAVORITES_PER_PAGE));

            // Restore scroll position after favorites are loaded
            setTimeout(() => {
                window.scrollTo(0, targetScrollPosition);
                sessionStorage.removeItem("favoritesScrollPosition");
                sessionStorage.removeItem("favoriteCount");
                sessionStorage.removeItem("restore");
            }, 100);
        }
        // Handle normal initialization
        else if (!restore && !initializationAttempted.current && displayedFavorites.length === 0) {
            console.log("initializing favorites");
            initializationAttempted.current = true; // Mark that initialization has been attempted
            setDisplayedFavorites(favorites.slice(0, FAVORITES_PER_PAGE));
            setCurrentPage(1);
        }

        // Clear restore record if not used
        if (!restore) {
            sessionStorage.removeItem("favoritesScrollPosition");
            sessionStorage.removeItem("favoriteCount");
            sessionStorage.removeItem("restore");
        }
    }, [favorites, FAVORITES_PER_PAGE, displayedFavorites.length]);

    // Sync displayedFavorites with favorites when favorites change (e.g., when items are removed)
    useEffect(() => {
        if (displayedFavorites.length === 0) return;

        // Filter out removed favorites from displayedFavorites
        const favoritePaths = new Set(favorites.map(fav => fav.path));
        const updatedDisplayedFavorites = displayedFavorites.filter(fav => favoritePaths.has(fav.path));

        // Only update if there's a difference
        if (updatedDisplayedFavorites.length !== displayedFavorites.length) {
            setDisplayedFavorites(updatedDisplayedFavorites);
            // Update current page if needed
            const newCurrentPage = Math.max(1, Math.ceil(updatedDisplayedFavorites.length / FAVORITES_PER_PAGE));
            setCurrentPage(newCurrentPage);
        }
    }, [favorites, displayedFavorites, FAVORITES_PER_PAGE]);

    // Handle router events for saving scroll position
    useEffect(() => {
        const onUnload = () => {
            sessionStorage.setItem("favoritesScrollPosition", String(window.scrollY));
            sessionStorage.setItem("favoriteCount", String(displayedFavorites.length));
            sessionStorage.setItem("restore", "true");
        };

        router.events.on("routeChangeStart", onUnload);

        return () => {
            router.events.off("routeChangeStart", onUnload);
        };
    }, [router.events, displayedFavorites.length]);

    // Load more favorites function
    const loadMoreFavorites = useCallback(() => {
        if (isLoadingMore || displayedFavorites.length >= favorites.length) return;

        setIsLoadingMore(true);

        // Simulate loading delay for better UX
        setTimeout(
            () => {
                const nextPage = currentPage + 1;
                const startIndex = (nextPage - 1) * FAVORITES_PER_PAGE;
                const endIndex = startIndex + FAVORITES_PER_PAGE;
                const newFavorites = favorites.slice(startIndex, endIndex);

                setDisplayedFavorites(prev => [...prev, ...newFavorites]);
                setCurrentPage(nextPage);
                setIsLoadingMore(false);
            },
            isMobile ? 10 : 500
        );
    }, [isLoadingMore, displayedFavorites.length, favorites, currentPage, FAVORITES_PER_PAGE, isMobile]);

    // Scroll event listener for infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            // Check if user is near the bottom (within 200px)
            if (scrollTop + windowHeight >= docHeight - 200) {
                loadMoreFavorites();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loadMoreFavorites]);

    // Helper to get display name from path
    const getDisplayName = (path: string) => {
        return decodeURIComponent(path.split("/").pop() || path);
    };

    // Handle gallery click
    const handleGalleryClick = (index: number) => {
        const gallery = displayedFavorites[index];
        router.push(gallery.path);
    };

    // Don't render until client-side hydration is complete
    if (!isClient) {
        return (
            <Container maxWidth="lg" sx={{py: 3}}>
                <Typography variant="h6">Loading favorites...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{py: 3}}>
            {/* Header */}
            <Box sx={{mb: 4}}>
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2}}>
                    <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                        <Tooltip title="Back to Gallery">
                            <IconButton onClick={() => router.back()} color="inherit">
                                <ArrowBack />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="h4" component="h1" sx={{display: "flex", alignItems: "center", gap: 1}}>
                            <Favorite sx={{color: "red"}} />
                            Favorites
                            <Chip label={favorites.length} size="small" color="secondary" sx={{ml: 1}} />
                        </Typography>
                    </Box>
                    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
                        <IconButton onClick={toggleTheme} color="inherit">
                            {mode === "light" ? <Brightness4 /> : <Brightness7 />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Content */}
            {favorites.length === 0 ? (
                <Card>
                    <CardContent sx={{textAlign: "center", py: 6}}>
                        <FolderOpen sx={{fontSize: 64, color: "text.secondary", mb: 2}} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No favorites yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Start exploring galleries and add your favorites by clicking the heart icon.
                        </Typography>
                        <Button variant="contained" onClick={() => router.push("/")} startIcon={<FolderOpen />}>
                            Browse Galleries
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{mb: 4}}>
                    <Typography variant="h6" sx={{mb: 2, display: "flex", alignItems: "center"}}>
                        <PhotoLibrary sx={{mr: 1, color: "primary.main"}} />
                        Image Galleries
                    </Typography>
                    <Paper sx={{px: 0.25, py: 2, bgcolor: "background.paper"}}>
                        <Gallery
                            images={displayedFavorites.map((fav, _idx) => ({
                                src: fav.thumbnailPath,
                                height: fav.imageHeight,
                                width: fav.imageWidth,
                                thumbnailCaption: getDisplayName(fav.path),
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
                                            onClick={_ => removeFromFavorites(fav.path)}
                                            sx={{
                                                backgroundColor: "rgba(45, 25, 25, 0.9)",
                                                "&:hover": {
                                                    backgroundColor: "rgba(255, 255, 255, 1)",
                                                },
                                                width: 36,
                                                height: 36,
                                                pointerEvents: "auto",
                                            }}
                                        >
                                            <Favorite sx={{color: "red", fontSize: 20}} />
                                        </IconButton>
                                    </Box>
                                ),
                            }))}
                            rowHeight={288}
                            onClick={handleGalleryClick}
                            enableImageSelection={false}
                        />

                        {isLoadingMore && (
                            <Box sx={{display: "flex", justifyContent: "center", mt: 2}}>
                                <CircularProgress size={24} />
                                <Typography variant="body2" sx={{ml: 1, alignSelf: "center"}}>
                                    Loading more favorites...
                                </Typography>
                            </Box>
                        )}

                        {displayedFavorites.length >= favorites.length && favorites.length > FAVORITES_PER_PAGE && (
                            <Box sx={{display: "flex", justifyContent: "center", mt: 2}}>
                                <Typography variant="body2" color="text.secondary">
                                    All favorites loaded
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            )}
        </Container>
    );
};
