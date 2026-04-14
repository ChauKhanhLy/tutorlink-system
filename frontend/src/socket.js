import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // đổi theo BE của bạn

export default socket;