import React from "react";
import dynamic from "next/dynamic";

const VideoPlayer = dynamic(() => import('../components/VideoPlayer'), { ssr: false })

const VideoPage = () => {
    return (
        <div>
            <h1>Video Streaming App</h1>
            <VideoPlayer url={"/api/demo.m3u8"} />
        </div>
    );
};

export default VideoPage;
