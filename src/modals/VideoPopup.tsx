import React from "react";
import Modal from "react-modal";
import ReactPlayer from "react-player";

interface VideoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

Modal.setAppElement("#root");

const VideoPopup: React.FC<VideoPopupProps> = ({ isOpen, onClose, videoId }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Video Popup"
      className="video-modal"
      overlayClassName="video-modal-overlay"
    >
      <ReactPlayer
        src={`https://www.youtube.com/watch?v=${videoId}`}
        playing
        controls
        muted={true}
        width="100%"
        height="100%"
        onError={(e) => {
          console.error("Error playing video:", e);
        }}
      />

    </Modal>
  );
};

export default VideoPopup;
