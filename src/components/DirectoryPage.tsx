import React, {useEffect, useState} from "react";
import {File, FileProps} from "@/type/file";
import Link from "next/link";
import {decode, getDirectoryPath, getFilePath, getResourcesPath} from "@/util/urlUtil";
import {useRouter} from "next/router";
import {Gallery} from "react-grid-gallery";
import {Container, Typography, Breadcrumbs, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Box, Grid, Chip, Paper, Avatar} from "@mui/material";
import {Folder, InsertDriveFile, ArrowBack, Image as ImageIcon, PhotoLibrary} from "@mui/icons-material";

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
    const [scrollPosition, setScrollPosition] = useState<null | number>(null);
    const [isClient, setIsClient] = useState(false);

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        if (scrollPosition) {
            window.scrollTo(0, scrollPosition);
        }
    }, [scrollPosition, isClient]);

    useEffect(() => {
        if (!isClient) return;

        const previousScrollPosition = sessionStorage.getItem("scrollPosition");
        if (previousScrollPosition) {
            setScrollPosition(Number.parseInt(previousScrollPosition));
            sessionStorage.removeItem("scrollPosition");
        }

        const onUnload = () => {
            sessionStorage.setItem("scrollPosition", String(window.scrollY));
        };
        router.events.on("routeChangeStart", onUnload);

        return () => {
            router.events.off("routeChangeStart", onUnload);
        };
    }, [router.events, isClient]);

    const galleryDirectors = fileProps.files.filter(_ => _.type === "imageDirectory").sort((a, b) => b.lastModify.localeCompare(a.lastModify));
    const fileAndDirectory = fileProps.files.filter(_ => _.type !== "imageDirectory").sort((a, b) => b.lastModify.localeCompare(a.lastModify));

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
                            images={galleryDirectors.map(_ => {
                                return {
                                    src: getFilePath(router.asPath, _.icon!),
                                    height: _.imageHeight!,
                                    width: _.imageWidth!,
                                    thumbnailCaption: _.path + (_.path.includes("P】") ? "" : `【${_.imageCount}P】`),
                                };
                            })}
                            rowHeight={288}
                            onClick={idx => router.push(getDirectoryPath(router.asPath, galleryDirectors[idx].path)).then()}
                            enableImageSelection={false}
                        />
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
