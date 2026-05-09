import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "../src/context/auth/AuthContext.tsx";
import { ProjectProvider } from "./context/projects/ProjectContext.tsx";
import { TaskProvider } from "./context/tasks/TaskContext.tsx";
import "./index.css";
import { AppRouter } from "./router/AppRouter.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <TaskProvider>
        <ProjectProvider>
          <AppRouter />
        </ProjectProvider>
      </TaskProvider>
    </AuthProvider>
  </StrictMode>,
);
