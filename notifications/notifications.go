package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

type message struct {
	UserId  int    `json:"userId"`
	Message string `json:"message"`
}

var clients = make(map[int]*websocket.Conn)
var broadcast = make(chan message) // broadcast channel
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	fs := http.FileServer(http.Dir("./public"))
	http.Handle("/", fs)
	http.HandleFunc("/notify", handleNotifications)
	http.HandleFunc("/ws", handleConnections)

	go handleMessages()

	fmt.Println("Notification Module started on :4000")
	err := http.ListenAndServe(":4000", nil)
	if err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}

// recebe chamada post com a notificação adiciona à fila de mensagens
// no produto final havera distinção entre webhooks de cada usuario
func handleNotifications(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Create a new message struct to hold the user ID and message.
	var payload message
	// Decode the JSON body into the payload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Error parsing JSON body", http.StatusBadRequest)
		return
	}

	// Send the message to the broadcast channel, including the user ID.
	broadcast <- payload
	w.Write([]byte("Notification queued."))
}

// quando o front de um user chama /ws é criada uma conexão websocket entre ele e o sistema de notificação
func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Extract the user ID from the query string.
	userId, err := strconv.Atoi(r.URL.Query().Get("userId"))
	if err != nil {
		http.Error(w, "User ID must be an integer", http.StatusBadRequest)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer ws.Close()

	// Associate the user ID with the WebSocket connection.
	clients[userId] = ws
}

// manda mensagem ao websocket quando existe algo a ser transmitido
func handleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast

		// Send the message to the specific user.
		if client, ok := clients[msg.UserId]; ok {
			err := client.WriteMessage(websocket.TextMessage, []byte(msg.Message))
			if err != nil {
				fmt.Printf("error: %v", err)
				client.Close()
				delete(clients, msg.UserId)
			}
		}
	}
}
