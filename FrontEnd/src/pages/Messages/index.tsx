import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../service/api";

interface Message {
  content: string;
  originId: string;
}

const MessagesPage: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(event.target.value);
  };

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here, you would send the message to the specified user ID
    console.log(`Sending message to user ID ${userId}: ${message}`);
    try {
      await api.post("/chats", {
        destinationId: userId,
        content: message,
      });
      // Reset the form fields after submission
    } catch (error) {
      alert("Failed to send message");
    }
    setUserId("");
    setMessage("");
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const ws = new WebSocket("ws://localhost:4000/ws?userId=" + userId);
    ws.onopen = () => {
      console.log("Connected to websocket");
    };
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await api.get("/chats");
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    // WebSocket: listen for new messages
    ws.onmessage = (event) => {
      console.log(event);
      const message: Message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    // Clean up function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <Box
      sx={{
        marginTop: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Messages
      </Typography>
      <List>
        {messages.map((message) => (
          <ListItem key={1}>
            <ListItemText primary={`${message.originId}: ${message.content}`} />
          </ListItem>
        ))}
      </List>
      {/* ... your messages list ... */}

      {/* Add the form to send a message */}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="destinationId"
          label="User ID"
          name="destinationId"
          value={userId}
          onChange={handleUserIdChange}
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="message"
          label="Message"
          name="message"
          value={message}
          onChange={handleMessageChange}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Send Message
        </Button>
      </Box>
    </Box>
  );
};

export default MessagesPage;
