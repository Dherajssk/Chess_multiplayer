import { WebSocketServer } from 'ws';
import {Gamemanager} from './Gamemanager'

const wss = new WebSocketServer({ port: 8080 });
const gameManager=new Gamemanager();

wss.on('connection', function connection(ws) {
  gameManager.addUser(ws);
  ws.on("close", () => gameManager.removeuser(ws)); // <-- use "close" event
});