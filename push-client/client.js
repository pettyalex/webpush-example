window.onload = doStuff;

let registration;

async function doStuff() {
  registration = registerServiceWorker();
  document.getElementById("submitButton").onclick = subscribe;

  const publicKey = await (await fetch(
    "http://localhost:8001/getPublicKey"
  )).text();
  document.getElementById("key").innerHTML = publicKey;
}

async function subscribe() {
  try {
    await askPermission();
    const subscription = await subscribeUserToPush();
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
        applicationServerKey: urlBase64ToUint8Array(
          "BHkLurGX6RXGkMRAvpaDSn_P8_GakpYl_WSaoGi5CzUeO44uBf0FRe6_m0Os4lS6JQwlDtu3Hm1kGTuDIRRzL7Y"
        )
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
  return fetch("/api/save-subscription/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(subscription)
  })
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Bad status code from server.");
      }

      return response.json();
    })
    .then(function(responseData) {
      if (!(responseData.data && responseData.data.success)) {
        throw new Error("Bad response from server.");
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
