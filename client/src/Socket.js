import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_MODE === 'test' ? 'http://localhost:8080' : window.location);

export { socket };