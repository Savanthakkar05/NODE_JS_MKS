import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [data, setData] = useState();

  // console.log(data);
  const sendMessage = () => {
    socket.emit("send_message", { message });
    setMessage("");
  };

  useEffect(() => {
    socket.on("receive_message", (message) => {
      console.log(message);
      setData(message);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Socket.io Example</h2>
      <input
        type="text"
        value={message}
        placeholder="Type message.."
        onChange={(e) => {
          setMessage(e.target.value);
        }}
      />

      <button onClick={sendMessage}>Send Message</button>

      <h3>Message From Server : </h3>
      {data ? (
        <p>
          {data.username} : {data.message.message}
        </p>
      ) : (
        <p>No message yet...</p>
      )}
    </div>
  );
}

export default App;
