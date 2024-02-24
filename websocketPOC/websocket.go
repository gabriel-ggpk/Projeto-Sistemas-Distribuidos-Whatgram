package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool) // connected clients
var broadcast = make(chan string)            // broadcast channel
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
	var payload struct {
		Message string `json:"message"`
	}

	// Decode the JSON body into the payload
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, "Error parsing JSON body", http.StatusBadRequest)
		return
	}

	msg := payload.Message
	broadcast <- msg
	w.Write([]byte("Notification sent."))
}

// quando o front de um user chama /ws é criada uma conexão websocket entre ele e o sistema de notificação
func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer ws.Close()
	clients[ws] = true

	for {
		var msg string
		// Read message as JSON and map it to a Message object
		_, _, err := ws.ReadMessage()
		if err != nil {
			fmt.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		broadcast <- msg
	}
}

// manda mensagem ao websocket quando existe algo a ser transmitido
func handleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast
		// Send it out to every client that is currently connected
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, []byte(msg))
			if err != nil {
				fmt.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
