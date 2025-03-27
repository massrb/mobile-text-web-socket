
import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";

export default function Test() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/cable");

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      // to send message you can use like that :   ws.send("Hello, server!"); 
      setIsConnected(true); // Update state to reflect successful connection
      const subscribeMessage = {
        command: "subscribe",
        identifier: JSON.stringify({ channel: "PhoneConnectChannel" }) // Change "ChatChannel" to your actual channel name
      };
      ws.send(JSON.stringify(subscribeMessage));
      console.log("Subscribed to ChatChannel");
    };

    ws.onmessage = (e) => {
      let obj = JSON.parse(e.data)
      // console.log(obj.type)
      if (obj?.type != 'ping') {
        let content = obj?.message?.content
        console.log("Message from server:", content);
        setServerMessage(content); // Store the server message
      }
    };

    ws.onerror = (e) => {
      console.log("WebSocket error:", e);
      setIsConnected(false); // Update state if there is an error
    };

    ws.onclose = (e) => {
      console.log("WebSocket connection closed:", e.code, e.reason);
      setIsConnected(false); // Update state if the connection closes
    };

    // Clean up WebSocket connection when the component unmounts
    return () => {
      ws.close();
    };
  }, []);

  return (
    <View>
      <Text style={{ color: "blue" }}>
        {isConnected ? "Connected to WebSocket" : "Not connected to WebSocket"}
      </Text>
      {serverMessage ? (
        <Text style={{ color: "green" }}>Server: {serverMessage}</Text>
      ) : (
        <Text style={{ color: "gray" }}>No message from server yet</Text>
      )}
    </View>
  );
}