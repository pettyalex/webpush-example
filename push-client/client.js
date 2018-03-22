window.onload = doStuff;

let registration;
let publicKey;
let nameInput;

async function doStuff() {
  registration = registerServiceWorker();
  document.getElementById("submitButton").onclick = subscribe;
  document.getElementById("unsubscribeButton").onclick = unsubscribe;
  nameInput = document.getElementById("nameInput");

  publicKey = await (await fetch("api/publicKey")).json();
  document.getElementById("key").innerHTML = publicKey;
}

async function unsubscribe() {
  const reg = await navigator.serviceWorker.register("service-worker.js");
  const subscription = await reg.pushManager.getSubscription();
  await subscription.unsubscribe();
  addMessageToBody(`UNSUBSCRIBED`);
}

async function subscribe() {
  try {
    await askPermission();
    const subscription = await subscribeUserToPush();
    addMessageToBody(`SUBSCRIBING: ${JSON.stringify(subscription)}`);
    await sendSubscriptionToBackEnd(subscription);
    addMessageToBody("DONE SUBSCRIBING!");
  } catch (error) {
    addMessageToBody(`OH SNAP: ${error}`);
  }
}

function addMessageToBody(message) {
  const doneSubbing = document.createElement("h2");
  doneSubbing.innerHTML = message;
  document.body.appendChild(doneSubbing);
}

function registerServiceWorker() {
  return navigator.serviceWorker
    .register("service-worker.js")
    .then(function(registration) {
      console.log("Service worker successfully registered.");
      return registration;
    })
    .catch(function(err) {
      console.error("Unable to register service worker.", err);
    });
}

function askPermission() {
  return new Promise(function(resolve, reject) {
    const permissionResult = Notification.requestPermission(function(result) {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  }).then(function(permissionResult) {
    if (permissionResult !== "granted") {
      throw new Error("We weren't granted permission.");
    }
  });
}

function subscribeUserToPush() {
  return navigator.serviceWorker
    .register("service-worker.js")
    .then(function(registration) {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      };

      return registration.pushManager.subscribe(subscribeOptions);
    })
    .then(function(pushSubscription) {
      console.log(
        "Received PushSubscription: ",
        JSON.stringify(pushSubscription)
      );
      return pushSubscription;
    });
}

function sendSubscriptionToBackEnd(subscription) {
  const wrappedSubscription = {
    name: nameInput.value,
    subscription: subscription
  };
  return fetch("/api/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(wrappedSubscription)
  })
    .then(function(response) {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} from server`);
      }

      return response.json();
    })
    .then(function(responseData) {
      if (!responseData) {
        throw new Error("Empty response from server");
      }
    });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
