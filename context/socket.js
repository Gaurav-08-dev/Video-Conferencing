import { createContext, useContext, useEffect } from "react";
import { io } from "socket.io-client";


const SocketContext = createContext(null);

export const useSocket = ()=>{
    const socket = useContext(SocketContext)
    return socket
}
export const SocketProvider = (props) => {

    const { children } = props;
    const [socket, setSocket] = useState(null)


    useEffect(() => {
        const connection = io();
        setSocket(connection);
    }, [])


    return (<SocketContext.Provider
        value={socket}
    >
        {children}
    </SocketContext.Provider>)
}
