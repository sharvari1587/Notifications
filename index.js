import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
  },
});

let onlineUsers = [];

const addNewUser = (username, socketId) => {
  !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
  });

  socket.on("sendNotification", ({ senderName, receiverName, type }) => {
    const receiver = getUser(receiverName);
  
    // Check if receiver is found
    if (receiver) {
      io.to(receiver.socketId).emit("getNotification", {
        senderName,
        type,
      });
    } else {
      console.error(`User ${receiverName} not found`);
    }
  });
  
  socket.on("sendText", ({ senderName, receiverName, text }) => {
    const receiver = getUser(receiverName);
  
    // Check if receiver is found
    if (receiver) {
      io.to(receiver.socketId).emit("getText", {
        senderName,
        text,
      });
    } else {
      console.error(`User ${receiverName} not found`);
    }
  });
  

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen(5000);