package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
	"gopkg.in/mgo.v2/bson"
)

type Message struct {
	OriginId string `json:"originId"`
	UserId   string `json:"destinationId"`
	Content  string `json:"content"`
}

var clients = make(map[string]*websocket.Conn)
var broadcast = make(chan Message) // broadcast channel
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
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Create a new message struct to hold the user ID and message.
	var payload Message
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
	userId := r.URL.Query().Get("userId")

	// Validate the userID is a valid MongoDB ObjectId hex value.
	if !bson.IsObjectIdHex(userId) {
		http.Error(w, "User ID must be a valid MongoDB ObjectId", http.StatusBadRequest)
		return
	}

	// Upgrade the HTTP server connection to the WebSocket protocol.
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Could not open websocket connection", http.StatusInternalServerError)
		return
	}
	// defer ws.Close()

	// Associate the user ID with the WebSocket connection.
	// Assuming clients is a map that stores WebSocket connections with userID as the key.
	clients[userId] = ws

	// More logic to handle the WebSocket connection...
}

// manda mensagem ao websocket quando existe algo a ser transmitido
func handleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast

		// Create a JSON object that includes both content and originId
		messageData := map[string]string{
			"content":  msg.Content,
			"originId": msg.OriginId,
		}
		messageJSON, err := json.Marshal(messageData)
		if err != nil {
			fmt.Printf("error marshalling message data: %v", err)
			continue
		}

		// Send the message to the specific user.
		if client, ok := clients[msg.UserId]; ok {
			err := client.WriteMessage(websocket.TextMessage, messageJSON)
			if err != nil {
				fmt.Printf("error: %v", err)
				client.Close()
				delete(clients, msg.UserId)
			}
		}
	}

}
