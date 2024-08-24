"use client";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Switch,
  useTheme,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { useState } from "react";
import { keyframes } from "@emotion/react";

// Keyframes for background animation
const backgroundAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState("");

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#90caf9" : "#1976d2",
      },
      secondary: {
        main: darkMode ? "#f48fb1" : "#d81b60",
      },
      background: {
        default: darkMode ? "#121212" : "#f0f0f0",
        paper: darkMode ? "#1d1d1d" : "#ffffff",
      },
    },
  });

  const formatContent = (content) => {
    return content
      .replace(/(\d+\.\s)/g, "\n$1")
      .replace(/(\. \w+)/g, ".\n\n$1");
  };

  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: formatContent(lastMessage.content + text),
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor={theme.palette.background.default}
        color={theme.palette.text.primary}
        sx={{
          backgroundImage: darkMode
            ? "linear-gradient(135deg, #1e1e1e 25%, #2a2a2a 75%)"
            : "linear-gradient(135deg, #e0e0e0 25%, #ffffff 75%)",
          backgroundSize: "400% 400%",
          animation: `${backgroundAnimation} 15s ease infinite`,
        }}
      >
        <Stack
          direction={"column"}
          width="80%"
          maxWidth="800px"
          height="80%"
          maxHeight="800px"
          border="1px solid"
          borderColor={theme.palette.divider}
          borderRadius={2}
          p={3}
          spacing={4}
          bgcolor={theme.palette.background.paper}
          boxShadow={
            darkMode
              ? "0px 0px 20px rgba(0, 0, 0, 0.5)"
              : "0px 0px 20px rgba(0, 0, 0, 0.1)"
          }
          sx={{
            backdropFilter: darkMode ? "blur(5px)" : "none",
            border: darkMode ? "1px solid #333" : "1px solid #ddd",
          }}
        >
          <Stack
            direction={"row"}
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">AI Rate My Professor</Typography>
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              inputProps={{ "aria-label": "Dark Mode Toggle" }}
            />
          </Stack>
          <Stack
            direction={"column"}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
              >
                <Box
                  bgcolor={
                    message.role === "assistant"
                      ? theme.palette.primary.main
                      : theme.palette.secondary.main
                  }
                  color="white"
                  borderRadius={16}
                  p={2}
                  whiteSpace="pre-line"
                >
                  {message.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack direction={"row"} spacing={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              InputLabelProps={{
                style: { color: theme.palette.text.primary },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              sx={{
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: `0px 5px 15px ${
                    darkMode
                      ? "rgba(144, 202, 249, 0.5)"
                      : "rgba(25, 118, 210, 0.3)"
                  }`,
                  transform: "translateY(-2px)",
                },
              }}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
