import { useSocket } from "@/context/socket";
import useMediaStream from "@/hooks/useMediaStream";
import usePeer from "@/hooks/usePeer";
import Player from "@/component/Player";
import { useEffect, useId, useState } from "react";
import usePlayer from "@/hooks/usePlayer";
import styles from "@/styles/room.module.css";
import { useRouter } from "next/router";
import Bottom from "@/component/Bottom";
import { cloneDeep } from "lodash";

const Room = () => {
  const socket = useSocket();
  const { peer, myId } = usePeer();
  const { roomId } = useRouter().query;
  const { stream } = useMediaStream();

  const {
    player,
    setPlayer,
    playerHighlighted,
    nonHighlighted,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer);

  const [users, setUsers] = useState();

  useEffect(() => {
    if (!socket || !peer || !stream) return;

    const handleUserConnected = (newUser) => {
      console.log(`User Connected with Id ${newUser}`);

      const call = peer.call(newUser, stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from new user => ${newUser}`);

        setPlayer((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: false,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
      });
    };

    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, stream, socket, setPlayer]);

  useEffect(() => {
    if (!peer || !stream) return;

    peer.on("call", (call) => {
      const { peer: callerId } = call;
      call.answer(stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${callerId}`);

        setPlayer((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: false,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call,
        }));

      });
    });
    return () => {};
  }, [peer, setPlayer, stream]);

  useEffect(() => {
    if (!stream || !setPlayer || !myId) return;

    console.log(` Setting my stream ${myId}`);
    setPlayer((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: false,
        playing: true,
      },
    }));
  }, [myId, setPlayer, stream]);

  useEffect(() => {
    if (!socket) return;

    const handleToggleAudio = (userId) => {
      setPlayer((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };

    const handleToggleVideo = (userId) => {
      setPlayer((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };

    const handleUserLeave = (userId) => {
      users[userId]?.close();
      const playersCopy = cloneDeep(player);
      delete playersCopy[userId];
      setPlayer(playersCopy);
    }

    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave-room", handleUserLeave);
    

    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave-room", handleUserLeave);
    };
  }, [socket, setPlayer, users]);

  return (
    <>
      <div className={styles.activePlayerContainer}>
        {playerHighlighted && (
          <Player
            url={playerHighlighted.url}
            muted={playerHighlighted.muted}
            playing={playerHighlighted.playing}
            isActive={true}
          />
        )}
      </div>

      <div className={styles.inActivePlayerContainer}>
        {Object.keys(nonHighlighted).map((playerId) => {
          const { url, muted, playing } = nonHighlighted[playerId];
          return (
            <Player
              key={playerId}
              url={url}
              muted={muted}
              playing={playing}
              isActive={false}
            />
          );
        })}
      </div>
      <Bottom
        muted={playerHighlighted?.muted}
        playing={playerHighlighted?.playing}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        leaveRoom={leaveRoom}
      />
    </>
  );
};

export default Room;
