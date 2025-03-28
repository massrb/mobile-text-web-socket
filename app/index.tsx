
import { View, Text, TextInput, Button } from "react-native";
import React, { useEffect, useState, useRef } from "react";

export default function Test() {
  const [wsUrl, setWsUrl] = useState("ws://localhost:3000/cable"); // State for WebSocket URL
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [serverMessages, setServerMessages] = useState([]);
  const [message, setMessage] = useState(""); // state for input text
  const ws = useRef<WebSocket | null>(null); // perdsist websocket 

  useEffect(() => {
    if (!wsUrl) return;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connection opened");
      // to send message you can use like that :   ws.send("Hello, server!"); 
      setIsConnected(true); // Update state to reflect successful connection
      const subscribeMessage = {
        command: "subscribe",
        identifier: JSON.stringify({ channel: "PhoneConnectChannel" }) // Change "ChatChannel" to your actual channel name
      };
      ws.current.send(JSON.stringify(subscribeMessage));
      console.log("Subscribed to ChatChannel");
    };

    ws.current.onmessage = (e) => {
      let obj = JSON.parse(e.data)
      if (obj?.type != 'ping') {
        let content = obj?.message?.content
        console.log(obj)
        setServerMessages((prevMessages) => [...prevMessages.slice(-9), content])
      }
    };

    ws.current.onerror = (e) => {
      console.log("WebSocket error:", e);
      setIsConnected(false); // Update state if there is an error
    };

    ws.current.onclose = (e) => {
      console.log("WebSocket connection closed:", e.code, e.reason);
      setIsConnected(false); // Update state if the connection closes
    };

    // Clean up WebSocket connection when the component unmounts
    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && ws.current?.readyState === WebSocket.OPEN) {
      const sendData = {
        command: "message",
        identifier: JSON.stringify({ channel: "PhoneConnectChannel" }),
        data: JSON.stringify({ action: "speak", message: {content: message.trim()} }),
      };
      ws.current.send(JSON.stringify(sendData));
      setMessage(""); // Clear input after sending
    }
  };

  return (
    <View>
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 10,
          paddingHorizontal: 10,
        }}
        placeholder="Enter WebSocket URL..."
        value={wsUrl}
        onChangeText={setWsUrl}
      />
      <Text style={{ color: "blue" }}>
        {isConnected ? "Connected to WebSocket" : "Not connected to WebSocket"}
      </Text>
      {(serverMessages.length > 0) ? (
        <>
        {console.log('length:', serverMessages.length)}
        {serverMessages.map((item, index) => (
          <Text key={index} style={{color: "green"}}>{item}</Text>
        ))}
        </>
      ) : (
        <Text style={{ color: "gray" }}>No message from server yet</Text>
      )}
    {/* Input for sending messages */}
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginTop: 20,
          paddingHorizontal: 10,
        }}
        placeholder="Type a message..."
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={sendMessage} // Send on enter
      />
      <Button title="Send" onPress={sendMessage} />  
    </View>
  );
}