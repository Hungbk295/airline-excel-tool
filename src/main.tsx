import ReactDOM from "react-dom/client";
import { persistor, store } from "./store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";
import Routers from "./app/routers";
import "./styles/index.scss";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routers />
        </BrowserRouter>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  // </React.StrictMode>
);
