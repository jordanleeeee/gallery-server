import ReactPlayer from 'react-player';

export interface VideoProps {
    url: string
}

const VideoPlayer = (video: VideoProps) => {
    return <ReactPlayer
        url={video.url}
        controls={true}
        width="90%"
        height="90%"
    />
};

export default VideoPlayer;
