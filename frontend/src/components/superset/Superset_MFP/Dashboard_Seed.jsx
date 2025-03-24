import { useEffect, useState } from "react";
import axios from "axios";
import { embedDashboard } from "@superset-ui/embedded-sdk";
// import { Link } from "react-router-dom";
import SurveyForm from "../../SurveyForm/survey";
import SeedPlanFormNotification from "../../MFP_Workflow/SeedPlanForm";

const supersetUrl = "http://localhost:9004"; //http://f4e9a06.online-server.cloud:9004
const dashboardId = "92f5f5e3-ee9d-4d16-8e65-ed018f258791";

async function getAccessToken() {
  try {
    const loginBody = {
      username: "admin",
      password: "Welcome@123",
      provider: "db",
      refresh: true,
    };

    const { data } = await axios.post(
      `${supersetUrl}/api/v1/security/login`,
      loginBody,
      { headers: { "Content-Type": "application/json" }, withCredentials: true }
    );

    return data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    return null;
  }
}

async function getCsrfToken(accessToken) {
  try {
    const { data } = await axios.get(
      `${supersetUrl}/api/v1/security/csrf_token/`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      }
    );
    return data.result;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return null;
  }
}

async function getGuestToken() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.error("Access token retrieval failed.");
      return;
    }

    console.log("Access Token:", accessToken);

    const csrfToken = await getCsrfToken(accessToken);
    if (!csrfToken) {
      console.error("CSRF token retrieval failed.");
      return;
    }

    console.log("CSRF Token:", csrfToken);

    const guestTokenResponse = await axios.post(
      `${supersetUrl}/api/v1/security/guest_token/`,
      {
        resources: [{ type: "dashboard", id: dashboardId }],
        user: {
          username: "Ragunathan",
          first_name: "Ragunathan",
          last_name: "Umapathy",
        },
        rls: [],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      }
    );

    console.log("Guest Token Response:", guestTokenResponse.data);

    const guestToken = guestTokenResponse.data.token;

    if (!guestToken) {
      console.error("Guest token not returned.");
      return;
    }

    console.log("Guest Token:", guestToken);

    const container = document.getElementById("superset-container");
    if (!container) {
      console.error("Superset container not found");
      return;
    }

    embedDashboard({
      id: dashboardId,
      supersetDomain: supersetUrl,
      mountPoint: container,
      fetchGuestToken: () => guestToken,
      dashboardUiConfig: {
        hideTitle: true,
        hideChartControls: true,
        filters: { expanded: false },
      },
    });

    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.style.width = "100%";
      iframe.style.minHeight = "80vh";
    }
  } catch (error) {
    console.error("Error during guest token process:", error.response || error);
  }
}

export default function Dashboard_Seed() {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isSeedOpen, setIsSeedOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      getGuestToken();
    }
  }, []);

  return (
    <>
      <h1
        style={{ width: "100%", textAlign: "center" }}
        className="my-4 font-bold text-2xl"
      >
        KeystoneJS Superset Dashboard
      </h1>
      <p style={{ textAlign: "center" }} className="mb-5">
        Embedding Superset Dashboard in Keystone CMS
      </p>
      <button
        onClick={() => setIsSeedOpen(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded float-right mx-5"
      >
        Seed Plan
      </button>
      <button
        onClick={() => setIsSurveyOpen(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded float-right"
      >
        Take a Survey
      </button>
      <div id="superset-container"></div>

      {isSurveyOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-3/4 max-w-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSurveyOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <SurveyForm
              surveyId="cm8hi3iwb0000f2ywp6wek8p8"
              isSurveyOpen={isSurveyOpen}
              setIsSurveyOpen={setIsSurveyOpen}
            />
          </div>
        </div>
      )}
      {isSeedOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-3/4 max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSeedOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <SeedPlanFormNotification
              isSeedOpen={isSeedOpen}
              setIsSeedOpen={setIsSeedOpen}
            />
          </div>
        </div>
      )}
    </>
  );
}
