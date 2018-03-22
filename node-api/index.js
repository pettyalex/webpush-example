const restify = require("restify");
const webpush = require("web-push");

const vapidKeys = webpush.generateVAPIDKeys();

const privateKey = process.env.PRIVATE_KEY || vapidKeys.privateKey;
const publicKey = process.env.PUBLIC_KEY || vapidKeys.publicKey;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:example@example.com";

const subscriptions = [];

webpush.setVapidDetails(vapidSubject, publicKey, privateKey);

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
  subscriptions.push(req.body);
  console.log(`subscriptions is ${JSON.stringify(subscriptions)}`);
  res.send("got a new subscription: " + JSON.stringify(req.body));
  next();
});

server.get("subscriptions", (req, res, next) => {
  res.json(subscriptions.map(sub => sub.name));
  next();
});

server.post("sendMessageToAll", async (req, res, next) => {
  for (let i = 0; i < subscriptions.length; i++) {
    try {
      await webpush.sendNotification(
        subscriptions[i].subscription,
        req.body.message
      );
    } catch (error) {
      console.error(error);
    }
  }
  res.send(200);
  next();
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

server.server.listen(8089, function() {
  console.log("%s listening at %s", server.name, server.url);
});
