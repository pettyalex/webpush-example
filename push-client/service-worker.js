self.addEventListener("push", function(event) {
  if (event.data) {
    console.log("This push event has data: ", event.data.text());
  } else {
    console.log("This push event has no data.");
  }
});

self.addEventListener("push", function(event) {
  const promiseChain = self.registration.showNotification(
    `Got a message: ${event.data.text()}`
  );

  event.waitUntil(promiseChain);
});
