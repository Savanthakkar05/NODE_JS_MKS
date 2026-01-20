import React, { useEffect, useState } from "react";
import { Input } from "reactstrap";
import io from "socket.io-client";
import { SendHorizontal } from "lucide-react";
const socket = io.connect("http://localhost:3003");

function App() {
  const [message, setMessage] = useState("");
  const [data, setData] = useState([]);

  const sendMessage = async () => {
    if (message !== "") {
      const messageData = {
        author: "User",
        message: message,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
    }
    setMessage("");
  };

  useEffect(() => {
    const handleReceiveMessage = (newData) => {
      setData((list) => [...list, newData]);
    };
    socket.on("receive_message", handleReceiveMessage);
  }, []);

  console.log(data);
  return (
    <div>
      <h1 className="text-center my-4 text-success">Chat Application</h1>
      <div className="chat-box mx-auto position-relative">
        {/* <input type="text" placeholder="Message" className="chat-input" /> */}
        <Input
          className="chat-input"
          placeholder="Message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <div className="parent-box">
          {data.map((msg, index) => {
            console.log("==> ", msg);
            return (
              <div className="chat-content-box" key={index}>
                <div
                  className=""
                  style={{
                    backgroundColor: "#c9c9c7",
                    width: "100%",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "right",
                    padding: "0px 10px",
                  }}
                >
                  {
                    <p className="">
                      <span style={{ color: "red" }}>{msg.author}</span> :{" "}
                      <span style={{ color: "white" }}>{msg.message}</span>{" "}
                    </p>
                  }
                </div>

                <div className="">
                  <span
                    style={{
                      lineHeight: "40px",
                      color: "gray",
                      paddingLeft: "10px",
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <SendHorizontal className="send-icon" onClick={sendMessage} />
      </div>
    </div>
  );
}

export default App;
