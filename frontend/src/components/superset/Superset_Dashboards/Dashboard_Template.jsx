import { useEffect } from "react";
import axios from "axios";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import PropTypes from "prop-types";

const supersetUrl = "http://localhost:9004";  //http://f4e9a06.online-server.cloud:9004
// const dashboardId = "92f5f5e3-ee9d-4d16-8e65-ed018f258791"; //1bed1b5b-77c7-4652-b193-d2cde7972ce8  c02b3467-caf2-402d-973d-5a2b407c3036

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

async function getGuestToken(dashboardId) {
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

export default function EmbedDashboardCharts({dashboardId,title}) {
    // const dashboardId = "92f5f5e3-ee9d-4d16-8e65-ed018f258791";
  useEffect(() => {
    if (typeof window !== "undefined") {
      getGuestToken(dashboardId);
    }
  }, []);

  return (
    <>
        <h1 style={{ width: "100%", textAlign: "center" }} className="my-4 font-bold text-2xl">
          KeystoneJS Superset Dashboard
        </h1>
        <p style={{ textAlign: "center" }} className="mb-5">
          {title}
        </p>
        <div id="superset-container"></div>
    </>
  );
}

EmbedDashboardCharts.propTypes = {
    dashboardId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
}