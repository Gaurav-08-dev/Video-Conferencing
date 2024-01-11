import { useSocket } from "@/context/socket";
import useMediaStream from "@/hooks/useMediaStream";
import usePeer from "@/hooks/usePeer";
import Player from "@/component/Player";
import { useEffect } from "react";
import usePlayer from "@/hooks/usePlayer";
import styles from "@/styles/room.module.css";
const Room = () => {
  const socket = useSocket();
  const { peer, myId } = usePeer();
  const { stream } = useMediaStream();
  const { player, setPlayer, playerHighlighted, nonHighlighted } =
    usePlayer(myId);

  useEffect(() => {
    if (!socket || !peer || !stream) return;

    const handleUserConnected = (newUser) => {
      console.log(`User Connected with Id ${newUser} `);

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

  return (
    <>
      <div>
        {playerHighlighted && (
          <Player
            url={playerHighlighted.url}
            muted={playerHighlighted.muted}
            playing={playerHighlighted.playing}
            isActive={true}
          />
        )}
      </div>

      <div>
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
    </>
  );
};

export default Room;
