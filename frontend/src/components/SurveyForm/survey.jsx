import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

// Ensure you create and import this CSS file

// GraphQL Queries and Mutations
const FETCH_SURVEY_QUERY = `
  query FetchSurvey($id: ID!) {
    survey(where: { id: $id }) {
      id
      title
      description
      questions {
        id
        text
        options
        type
        required
      }
    }
  }
`;

const SUBMIT_RESPONSE_MUTATION = `
  mutation SubmitResponse($data: ResponseCreateInput!) {
    createResponse(data: $data) {
      id
    }
  }
`;

function SurveyForm({ surveyId, isSurveyOpen, setIsSurveyOpen }) {
  const [survey, setSurvey] = useState(null);

  useEffect(() => {
    axios
      .post(
        "http://localhost:3000/api/graphql",
        {
          query: FETCH_SURVEY_QUERY,
          variables: { id: surveyId },
        },
        { withCredentials: true }
      )
      .then((response) => {
        setSurvey(response.data.data.survey);
      })
      .catch((error) => console.error("Error fetching survey:", error));
  }, [surveyId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const answers = Array.from(e.target.elements).reduce((acc, el) => {
      if (el.type === "select-multiple") {
        acc[el.name] = Array.from(el.selectedOptions).map(
          (option) => option.value
        );
      } else if (el.name) {
        acc[el.name] = el.value;
      }
      return acc;
    }, {});

    axios
      .post(
        "http://localhost:3000/api/graphql",
        {
          query: SUBMIT_RESPONSE_MUTATION,
          variables: {
            data: {
              survey: { connect: { id: surveyId } },
              answers: JSON.stringify(answers),
            },
          },
        },
        { withCredentials: true }
      )
      .then(() => {
        toast.success("Response submitted successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      })
      .catch((error) => {
        console.error("Error submitting response:", error);
        toast.error("Failed to submit response. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      });

    setIsSurveyOpen(false);
  };

  if (!survey) return <p className="loading">Loading...</p>;

  return (
    isSurveyOpen && (
      <div className="survey-form-container">
        <form onSubmit={handleSubmit} className="survey-form">
          <h1 className="survey-title">{survey.title}</h1>
          <p className="survey-description">{survey.description}</p>
          <div className="survey-questions-grid">
            {survey.questions.map((question) => (
              <React.Fragment key={question.id}>
                <div className="survey-question">
                  <label className="question-label">{question.text}</label>
                </div>
                <div className="survey-answer">
                  {question.type === "multi-select" ? (
                    <select
                      name={`question-${question.id}`}
                      className="question-input"
                      multiple
                      required={question.required}
                    >
                      {JSON.parse(question.options).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={question.type}
                      name={`question-${question.id}`}
                      className="question-input"
                      required={question.required}
                    />
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    )
  );
}

SurveyForm.propTypes = {
  surveyId: PropTypes.string.isRequired,
  isSurveyOpen: PropTypes.bool.isRequired,
  setIsSurveyOpen: PropTypes.func.isRequired,
};

export default SurveyForm;
