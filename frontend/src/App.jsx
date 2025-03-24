import "./App.css";
import PostWithContent from "./components/GQ_Sample/PostWithContent";
import Sidebar from "./components/MenuBars/sideBar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmbedDashboardCharts from "./components/superset/Superset_Dashboards/Dashboard_Template";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard_Seed from "./components/superset/Superset_MFP/Dashboard_Seed";

function App() {
  return (
    <Router>
      <div className="flex">
        <ToastContainer theme="dark" />
        <Routes>
          <Route
            path="/"
            element={
              <Sidebar>
                <PostWithContent />
              </Sidebar>
            }
          />
          <Route
            path="/strategic-summary"
            element={
              <Sidebar>
                <PostWithContent />
              </Sidebar>
            }
          />
          <Route
            path="/strategic-planning"
            element={
              <Sidebar>
                <EmbedDashboardCharts
                  dashboardId={"c9338be8-2a86-42dc-ba9f-ffdc6cc20e87"}
                  title={"PLANNING & APPROVAL STAGE REPORTS"}
                />
              </Sidebar>
            }
          />
          <Route
            path="/strategic-summary/dashboard"
            element={
              <Sidebar>
                <EmbedDashboardCharts
                  dashboardId={"92f5f5e3-ee9d-4d16-8e65-ed018f258791"}
                  title={"OVERALL DASHBOARD ANALYSIS"}
                />
              </Sidebar>
            }
          />
          <Route
            path="/reconciliation"
            element={
              <Sidebar>
                <EmbedDashboardCharts
                  dashboardId={"ca99e9c5-ed47-4948-920b-4fbad8892118"}
                  title={"REPORTS FOR RECONCILIATION STAGE"}
                />
              </Sidebar>
            }
          />
          <Route
            path="/strategic-summary/demo"
            element={
              <Sidebar>
                <Dashboard_Seed />
              </Sidebar>
            }
          />
          <Route
            path="/approval"
            element={
              <Sidebar>
                <EmbedDashboardCharts
                  dashboardId={"92f5f5e3-ee9d-4d16-8e65-ed018f258791"}
                  title={"REPORTS FOR FINAL APPROVAL STAGE"}
                />
              </Sidebar>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
