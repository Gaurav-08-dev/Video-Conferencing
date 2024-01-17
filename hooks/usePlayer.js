import { useSocket } from "@/context/socket";
import { cloneDeep } from "lodash";
import { useRouter } from "next/router";

const { useState } = require("react");

const usePlayer = (myId, roomId, peer) => {

  const router = useRouter();
  const socket = useSocket();
  const [player, setPlayer] = useState({});

  const playerCopy = cloneDeep(player);
  const playerHighlighted = playerCopy[myId];
  delete playerCopy[myId];

  const nonHighlighted = playerCopy;

  const leaveRoom = () => {
    socket.emit("user-leave-room", myId, roomId);
    peer?.disconnect();
    router.push("/");
  };

  const toggleAudio = () => {
    setPlayer((prev) => {
      const copy = cloneDeep(prev);
      copy[myId].muted = !copy[myId].muted;
      
      return { ...copy };
    });

    socket.emit("user-toggle-audio", myId, roomId);
  };

  const toggleVideo = () => {
    setPlayer((prev) => {
      const copy = cloneDeep(prev);
      copy[myId].playing = !copy[myId].playing;

      return { ...copy };
    });

    socket.emit("user-toggle-video", myId, roomId);
  };

  return {
    player,
    setPlayer,
    playerHighlighted,
    nonHighlighted,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  };
};

export default usePlayer;
