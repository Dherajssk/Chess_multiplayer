import {useState, useEffect} from 'react';
const WS_URL= 'https://chessmultiplayer4.onrender.com'; // Adjust the URL as needed

export const useSocket =() =>{
    const [socket, setSocket] = useState<WebSocket | null>(null);
    //const [connected, setConnected] = useState(false);
    
    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        
    
        ws.onopen = () => {
            setSocket(ws);
            //setConnected(true);
            console.log('WebSocket connected');
        };
    
        ws.onclose = () => {
            //setConnected(false);
            console.log('WebSocket disconnected');
        };
    
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    
        return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
        }
   };
    }, []);
    
    return socket;
}
