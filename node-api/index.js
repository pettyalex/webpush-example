const restify = require("restify");
const webpush = require("web-push");

const privateKey = process.env.PRIVATE_KEY || "fake_private_key";
const publicKey = process.env.PUBLIC_KEY || "fake_public_key";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:example@example.com";

const subscriptions = [];

// webpush.setVapidDetails(vapidSubject, privateKey, publicKey);

function respond(req, res, next) {
  res.send("hello " + req.params.name);
  next();
}

var server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.get("/hello/:name", respond);
server.head("/hello/:name", respond);

server.get("publicKey", (req, res, next) => {
  res.send(publicKey);
  next();
});

server.post("subscribe", (req, res, next) => {
  console.log("got a message");
  console.log(`subscriptions is ${JSON.stringify(subscriptions)}`);
  subscriptions.push(req.body);
  res.send("got a new subscription: " + JSON.stringify(req.body));
  next();
});

server.get("subscriptions", (req, res, next) => {
  res.json(subscriptions.map(sub => sub.name));
  next();
});

server.post("sendMessageToAll", (req, res, next) => {
  subscriptions.forEach(wrappedSubscription => {
    webpush.sendNotification(
      wrappedSubscription.subscription,
      req.body.message
    );
  });
});

server.post("sendMessage", (req, res, next) => {
  subcriptions.forEach(wrappedSubscription => {
    if (wrappedSubscription.name == req.body.name) {
      webpush.sendNotification(
        wrappedSubscription.subscription,
        req.body.message
      );
    }
  });
});

server.server.listen(8080, function() {
  console.log("%s listening at %s", server.name, server.url);
});
