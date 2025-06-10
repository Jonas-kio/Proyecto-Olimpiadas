import ReactPlayer from 'react-player';

function VideoPlayer() {
  return (
    <ReactPlayer
      url="https://www.youtube.com/watch?v=_yEqJJEpgo0&t=3s"
      controls={true}
    />
  );
}

export default VideoPlayer;