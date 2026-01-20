// import React, { useState, useEffect } from "react";
// import io from "socket.io-client";
// import { Container, Row, Col, Input, Button, Card, CardBody } from "reactstrap";
// import { SendHorizontal, User, Hash } from "lucide-react";
// import "./App.scss"; // Import your SCSS

// const USER_TOKEN = "eyJhbGciOiJIUzI1NiIsIn....";

// function App() {
//   const [username, setUsername] = useState("");
//   const [socketInstance, setSocketInstance] = useState(null);
//   const [isconnected, setIsconnected] = useState(false);
//   const [room, setRoom] = useState("");
//   const [showChat, setShowChat] = useState(false);

//   const [currentMessage, setCurrentMessage] = useState("");
//   const [messageList, setMessageList] = useState([]);

//   useEffect(() => {
//     const socket = io("http://localhost:3003", {
//       auth: {
//         token: USER_TOKEN,
//       },
//       autoConnect: true,
//     });

//     socket.on("connect", () => {
//       console.log("Connected to server : ", socket.id);
//       setIsconnected(true);
//     });

//     socket.on("connect_error", (err) => {
//       console.error("Connection failed : ", err.message);
//       setIsconnected(false);
//     });

//     setSocketInstance(socket);

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const joinRoom = () => {
//     if (socketInstance && isconnected) {
//       if (username !== "" && room !== "") {
//         socketInstance.emit("join_room", room);
//         setShowChat(true);
//       }
//     }
//   };

//   const sendMessage = async () => {
//     if (socketInstance && isconnected) {
//       if (currentMessage !== "") {
//         const messageData = {
//           room: room, // Important: Send room ID with message
//           author: username,
//           message: currentMessage,
//           time:
//             new Date(Date.now()).getHours() +
//             ":" +
//             new Date(Date.now()).getMinutes(),
//         };

//         await socketInstance.emit("send_message", messageData);

//         // Add message to our own list immediately
//         setMessageList((list) => [...list, messageData]);
//         setCurrentMessage("");
//       }
//     }
//   };

//   useEffect(() => {
//     if (!socketInstance) return;
//     const handleReceive = (data) => {
//       setMessageList((list) => [...list, data]);
//     };

//     socketInstance.on("receive_message", handleReceive);

//     return () => {
//       socketInstance.off("receive_message", handleReceive);
//     };
//   }, [socketInstance]);

//   return (
//     <Container className="d-flex align-items-center justify-content-center vh-100">
//       {
//         isconnected ? (
//           !showChat ? (
//         // === JOIN ROOM SCREEN ===
//         <Card className="shadow p-4 text-center" style={{ width: "350px" }}>
//           <h3 className="mb-4 text-primary">Join A Chat</h3>
//           <div className="mb-3">
//             <div className="input-group mb-2">
//               <span className="input-group-text">
//                 <User size={18} />
//               </span>
//               <Input
//                 type="text"
//                 placeholder="Enter Username.."
//                 onChange={(event) => setUsername(event.target.value)}
//               />
//             </div>
//             <div className="input-group">
//               <span className="input-group-text">
//                 <Hash size={18} />
//               </span>
//               <Input
//                 type="text"
//                 placeholder="Room Name..."
//                 onChange={(event) => setRoom(event.target.value)}
//               />
//             </div>
//           </div>
//           <Button color="success" onClick={joinRoom}>
//             Join Room
//           </Button>
//         </Card>
//       ) : (
//         // === CHAT SCREEN ===
//         <div className="chat-container w-100">
//           <div className="chat-header d-flex justify-content-between align-items-center">
//             <span className="fw-bold">Live Chat</span>
//             <span className="badge bg-success">Room: {room}</span>
//           </div>

//           <div className="chat-body d-flex flex-column">
//             {messageList.map((messageContent, index) => {
//               const isMyMessage = username === messageContent.author;
//               return (
//                 <div key={index} className="w-100 d-flex flex-column">
//                   <div
//                     className={`message-bubble ${
//                       isMyMessage ? "you" : "other"
//                     }`}
//                   >
//                     <div className="fw-bold small mb-1">
//                       {messageContent.author}
//                     </div>
//                     <div>{messageContent.message}</div>
//                   </div>
//                   <div
//                     className={`message-meta mb-2 ${
//                       isMyMessage ? "text-end" : "text-start"
//                     }`}
//                   >
//                     {messageContent.time}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="chat-footer p-3 border-top d-flex">
//             <Input
//               type="text"
//               value={currentMessage}
//               placeholder="Type a message..."
//               className="me-2"
//               onChange={(event) => setCurrentMessage(event.target.value)}
//               onKeyPress={(event) => event.key === "Enter" && sendMessage()}
//             />
//             <Button color="primary" onClick={sendMessage}>
//               <SendHorizontal size={20} />
//             </Button>
//           </div>
//         </div>
//       )}
//      ) : (<p>No connection made</p>)
//       }
//     </Container>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Container, Input, Button, Card } from "reactstrap";
import { SendHorizontal, User, Hash } from "lucide-react";
import "./App.scss";

// ⚠️ MAKE SURE THIS IS THE VALID TOKEN GENERATED BY YOUR NODE SCRIPT
const USER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlRlc3RVc2VyIiwiaWQiOjEyMywiaWF0IjoxNzY3MTU3OTcxLCJleHAiOjE3NjcxNjE1NzF9.0LqKX4S0FBABIv5-zQHOeUokxCiKnxBOutsl-TMlPS4";

function App() {
  const [username, setUsername] = useState("");
  const [socketInstance, setSocketInstance] = useState(null);
  const [isconnected, setIsconnected] = useState(false);
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:3003", {
      auth: {
        token: USER_TOKEN,
      },
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("Connected to server : ", socket.id);
      setIsconnected(true);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection failed : ", err.message);
      setIsconnected(false);
    });

    // setIsconnected(true);
    setSocketInstance(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = () => {
    if (socketInstance && isconnected) {
      if (username !== "" && room !== "") {
        socketInstance.emit("join_room", room);
        setShowChat(true);
      }
    }
  };

  const sendMessage = async () => {
    if (socketInstance && isconnected) {
      if (currentMessage !== "") {
        const messageData = {
          room: room,
          author: username,
          message: currentMessage,
          time:
            new Date(Date.now()).getHours() +
            ":" +
            new Date(Date.now()).getMinutes(),
        };

        await socketInstance.emit("send_message", messageData);

        setMessageList((list) => [...list, messageData]);
        setCurrentMessage("");
      }
    }
  };

  useEffect(() => {
    if (!socketInstance) return;

    const handleReceive = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socketInstance.on("receive_message", handleReceive);

    return () => {
      socketInstance.off("receive_message", handleReceive);
    };
  }, [socketInstance]);

  return (
    <Container className="d-flex align-items-center justify-content-center vh-100">
      {isconnected ? (
        !showChat ? (
          // === JOIN ROOM SCREEN ===
          <Card className="shadow p-4 text-center" style={{ width: "350px" }}>
            <h3 className="mb-4 text-primary">Join A Chat</h3>
            <div className="mb-3">
              <div className="input-group mb-2">
                <span className="input-group-text">
                  <User size={18} />
                </span>
                <Input
                  type="text"
                  placeholder="Enter Username.."
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <div className="input-group">
                <span className="input-group-text">
                  <Hash size={18} />
                </span>
                <Input
                  type="text"
                  placeholder="Room Name..."
                  onChange={(event) => setRoom(event.target.value)}
                />
              </div>
            </div>
            <Button color="success" onClick={joinRoom}>
              Join Room
            </Button>
          </Card>
        ) : (
          // === CHAT SCREEN ===
          <div className="chat-container w-100">
            <div className="chat-header d-flex justify-content-between align-items-center">
              <span className="fw-bold">Live Chat</span>
              <span className="badge bg-success">Room: {room}</span>
            </div>

            <div className="chat-body d-flex flex-column">
              {messageList.map((messageContent, index) => {
                const isMyMessage = username === messageContent.author;
                return (
                  <div key={index} className="w-100 d-flex flex-column">
                    <div
                      className={`message-bubble ${
                        isMyMessage ? "you" : "other"
                      }`}
                    >
                      <div className="fw-bold small mb-1">
                        {messageContent.author}
                      </div>
                      <div>{messageContent.message}</div>
                    </div>
                    <div
                      className={`message-meta mb-2 ${
                        isMyMessage ? "text-end" : "text-start"
                      }`}
                    >
                      {messageContent.time}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="chat-footer p-3 border-top d-flex">
              <Input
                type="text"
                value={currentMessage}
                placeholder="Type a message..."
                className="me-2"
                onChange={(event) => setCurrentMessage(event.target.value)}
                onKeyPress={(event) => event.key === "Enter" && sendMessage()}
              />
              <Button color="primary" onClick={sendMessage}>
                <SendHorizontal size={20} />
              </Button>
            </div>
          </div>
        )
      ) : (
        // === LOADING / ERROR STATE ===
        <div className="text-center">
          <h3>Connecting to server...</h3>
          <p className="text-danger">Ensure Backend is running on Port 3003</p>
        </div>
      )}
    </Container>
  );
}

export default App;
