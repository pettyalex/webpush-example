package main

import (
	//"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
	webpush "github.com/sherclockholmes/webpush-go"
)

type Keys struct {
	P256dh string `json:"p256dh"`
	Auth   string `json:"auth"`
}

type Subscription struct {
	ID       int    `json:"id"`
	Endpoint string `json:"endpoint"`
	Keys     `json:"keys"`
}

var (
	subscriptions []webpush.Subscription

	vapidPrivateKey = os.Getenv("VAPID_PRIVATE")
	vapidPublicKey = os.Getenv("VAPID_PUBLIC")
	sequence int = 0
)

// our main function
func main() {
	PopulateSubscriptions()

	router := mux.NewRouter()
	router.HandleFunc("/pushClients", GetPushClients).Methods("GET")
	router.HandleFunc("/pushClients", CreateSubscription).Methods("POST")
	router.HandleFunc("/pushClients/{id}", SendPushToClient).Methods("POST")
	router.HandleFunc("/getPublicKey", GetPublicKey).Methods("GET")
	log.Fatal(http.ListenAndServe(":8001", router))
}

func GetPushClients(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(subscriptions)
}

func CreateSubscription(w http.ResponseWriter, r *http.Request) {
	var sub webpush.Subscription
	_ = json.NewDecoder(r.Body).Decode(&sub)
	//sub.ID = sequence
	sequence++
	subscriptions = append(subscriptions, sub)
	json.NewEncoder(w).Encode(sub)
}

func SendPushToClient(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if (err != nil) {
		log.Fatal(err)
	}
	// subJSON := `{<YOUR SUBSCRIPTION JSON>}`

	// Decode subscription
	// s := webpush.Subscription{}
	// if err := json.NewDecoder(bytes.NewBufferString(subJSON)).Decode(&s); err != nil {
	// 	log.Fatal(err)
	// }

	// Send Notification
	_, err = webpush.SendNotification([]byte("Test"), &subscriptions[id], &webpush.Options{
		Subscriber:      "<EMAIL@EXAMPLE.COM>",
		VAPIDPrivateKey: vapidPrivateKey,
	})
	if err != nil {
		log.Fatal(err)
	}
}

func GetPublicKey(w http.ResponseWriter, r *http.Request) {
	// username, password, _ := r.BasicAuth()
	// if (username != "name" || password != "pass") {
	// 	w.WriteHeader(401)
	// 	return
	// }

	w.Header().Set("Access-Control-Allow-Origin", "*")
	io.WriteString(w, vapidPublicKey)
}

func PopulateSubscriptions() {
	subscriptions = append(subscriptions, webpush.Subscription{Endpoint: "test", Keys: webpush.Keys{P256dh: "256key", Auth: "authkey"}})
	subscriptions = append(subscriptions, webpush.Subscription{Endpoint: "test2", Keys: webpush.Keys{P256dh: "256key2", Auth: "authkey2"}})
}
