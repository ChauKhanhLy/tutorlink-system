import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // đổi theo BE của bạn

export default socket;