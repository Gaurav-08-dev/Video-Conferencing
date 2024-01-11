import { cloneDeep } from "lodash";

const { useState } = require("react")

const usePlayer = (myId) =>{
    const [player,setPlayer] = useState({});

    const playerCopy = cloneDeep(player);

    const playerHighlighted = playerCopy[myId]
    delete playerCopy[myId]

    const nonHighlighted = playerCopy

    return {player,setPlayer, playerHighlighted,nonHighlighted};

}


export default usePlayer;