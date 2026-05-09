import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "../src/context/auth/AuthContext.tsx";
import { TaskProvider } from "./context/tasks/TaskContext.tsx";
import "./index.css";
import { AppRouter } from "./router/AppRouter.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <TaskProvider>
        <AppRouter />
      </TaskProvider>
    </AuthProvider>
  </StrictMode>,
);
