const { useState, useEffect } = require("react");

const usePeer = () => {
    const [peer,setPeer] = useState(null);
    const [myId,setMyId] = useState(null);


    useEffect(()=>{

        (async function initPeer() {
            const myPeer = new (await import('peerjs')).default()
            setPeer(myPeer)

            myPeer.on('open', (id)=>{
                console.log(`your peer id ${id}`)
                setMyId(id)
            })
        })()
    },[])
}


export default usePeer