import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import AppErrorBoundary from "./components/ui/AppErrorBoundary";
import store from "./store/store";
import "./index.scss";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <AppErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </AppErrorBoundary>,
  // </React.StrictMode>
);
