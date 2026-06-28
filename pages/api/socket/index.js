import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};
export default function SocketHandler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      credentials: true,
      allowEIO4: true,
      cors: {
        origin: ["http://localhost:3001", "http://localhost:3000"],
      },
    });

    io.on("connection", (socket) => {
      console.log("newUser connected", socket.id);
      socket.on("send-message", (obj) => {
        io.emit("receive-message", obj);
      });
      socket.on("check-socket", (obj) => {
        io.emit("get-socket", obj);
      });
      socket.on("send-products", (obj) => {
        io.emit("get-products", obj);
      });
      socket.on("send-order", (obj) => {
        io.emit("latest-order", obj);
      });
    });

    res.socket.server.io = io;

    // console.log("socket_main", res.socket.server.io);
  } else {
    console.log("socket.io already running");
  }
  res.end();
}
