import * as React from "react";
import "./App.css";

const logo = require("./logo.svg");

interface State {
  subscriptions: string[];
}

class App extends React.Component<{}, State> {
  private messageInput: HTMLInputElement | null;
  constructor(props: {}) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <label>SEND A MESAGE</label>
        <input type="text" ref={i => (this.messageInput = i)} />
        <button onClick={this.sendMessage}>SEND DAT MESSAGE</button>
      </div>
    );
  }

  private async sendMessage() {
    console.log(this.messageInput!.value);
  }
}

interface SubscriptionProps {
  subscription: {
    name: string;
  };
}

const SubscriptionCard: React.SFC<SubscriptionProps> = props => {
  return <h1>{props.subscription.name} is subscribed</h1>;
};

export default App;
