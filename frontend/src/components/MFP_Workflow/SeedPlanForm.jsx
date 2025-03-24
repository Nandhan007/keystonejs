import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

function SeedPlanFormNotification({ isSeedOpen, setIsSeedOpen }) {
  const [version, setVersion] = useState("Test Version");
  const [businessUnit, setBusinessUnit] = useState("Accessories");
  const [seedSource, setSeedSource] = useState("LY");
  const [polling, setPolling] = useState(false); // To track the polling state
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tasksComplete, setTasksComplete] = useState(false); // Separate state for task completion

  const pollTaskInstances = async (dagRunId) => {
    const interval = 5000; // Polling interval (5 seconds)
    const endpoint = `http://localhost:8080/api/v1/dags/mfp_seeding_from_previous_dataset/dagRuns/${dagRunId}/taskInstances`;

    const fetchTaskInstances = async () => {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("airflow:airflow"), // Replace with Airflow credentials
          },
        });

        if (response.ok) {
          const data = await response.json();
          const allSuccessful = data.task_instances.every(
            (task) => task.state === "success"
          );

          if (allSuccessful) {
            setTasksComplete(true); // Mark tasks as complete
            setNotification("Seeding Plan successfully!");
            setPolling(false); // Stop polling
            setLoading(false);
          } else {
            setTimeout(fetchTaskInstances, interval); // Continue polling
          }
        } else {
          console.error("Error fetching task instances:", response.statusText);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error during task instance polling:", err);
        setLoading(false);
      }
    };

    fetchTaskInstances();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = {
      version,
      businessUnit,
      seedSource,
    };

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/dags/mfp_seeding_from_previous_dataset/dagRuns",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("airflow:airflow"), // Replace with Airflow credentials
          },
          body: JSON.stringify({
            conf: formData, // Pass form data as `conf`
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success("DAG Triggered successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setPolling(true); // Start polling
        pollTaskInstances(result.dag_run_id); // Start monitoring tasks
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error triggering DAG:", err);
      toast.error("DAG Trigger unsuccessful!", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
    }
  };

  // Trigger effect when tasks are complete
  useEffect(() => {
    if (tasksComplete) {
      toast.success(notification, {
        position: "top-right",
        autoClose: 3000,
      });
      setTasksComplete(false); // Reset after notification
      setIsSeedOpen(false);
    }
  }, [tasksComplete, notification, setIsSeedOpen]);

  return (
    isSeedOpen && (
      <div
        className="formContainer"
        style={{ width: "75%", margin: "20px auto" }}
      >
        <h2 className="formTitle">Seed Plan</h2>

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label className="formLabel">Version *</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="formInput"
              disabled={loading}
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">Business Unit *</label>
            <select
              value={businessUnit}
              onChange={(e) => setBusinessUnit(e.target.value)}
              className="formSelect"
              disabled={loading}
            >
              <option value="Accessories">Accessories</option>
              <option value="Apparel">Apparel</option>
              <option value="Footwear">Footwear</option>
            </select>
          </div>

          <div className="formGroup">
            <label className="formLabel">Select Seed Source *</label>
            <select
              value={seedSource}
              onChange={(e) => setSeedSource(e.target.value)}
              className="formSelect"
              disabled={loading}
            >
              <option value="LY">LY</option>
              <option value="LLY">LLY</option>
              <option value="LLLY">LLLY</option>
            </select>
          </div>

          <div className="buttonGroup">
            <button type="submit" className="submitButton" disabled={loading}>
              Submit
            </button>
            <button
              type="reset"
              className="resetButton"
              onClick={() => {
                setVersion("Test Version");
                setBusinessUnit("Accessories");
                setSeedSource("LY");
              }}
            >
              Reset
            </button>
            <button
              type="button"
              className="closeButton"
              onClick={() => setIsSeedOpen(false)}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    )
  );
}

SeedPlanFormNotification.propTypes = {
  isSeedOpen: PropTypes.bool.isRequired,
  setIsSeedOpen: PropTypes.func.isRequired,
};

export default SeedPlanFormNotification;
