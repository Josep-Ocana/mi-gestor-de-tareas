import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/auth/AuthContext.tsx";
import { ProjectProvider } from "./context/projects/ProjectContext.tsx";
import { TagProvider } from "./context/tags/TagContext.tsx";
import { TaskProvider } from "./context/tasks/TaskContext.tsx";
import "./index.css";
import { AppRouter } from "./router/AppRouter.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <TaskProvider>
        <ProjectProvider>
          <TagProvider>
            <AppRouter />
          </TagProvider>
        </ProjectProvider>
      </TaskProvider>
    </AuthProvider>
  </StrictMode>,
);
