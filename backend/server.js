const express = require("express");
const http = require("http");

const app = express()
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: ["http://localhost:3000","http://localhost:3000/webchat"],
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    socket.emit("me", socket.id);

    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded");
    })

    socket.on("callUser", (data) => {
        //console.log("trying to call user")
        io.to(data.userToCall).emit("callUser", {signal: data.signalData, from: data.from, name: data.name})
    })

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data)
    })

    socket.on("message", (data) => {
        //console.log(data);
        //console.log("now sending this information to other user");
        io.to(data.to).emit("messageSent", data);
    })

    socket.on("endCall", (data) => {
        //console.log(data);
        io.to(data.to).emit("endCall");
    })
})

server.listen(5000, () => {
    console.log("server is running on port 5000")
}) 