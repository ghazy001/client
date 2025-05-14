import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Overview from "./Overview";
import Sidebar from "./Sidebar";
import Curriculum from "./Curriculum";
import Reviews from "./Reviews";
import Instructors from "./Instructors";
import Chatbot from "../../chatbot/Chatbot";
import { Course } from "../../../types/course";
import QuizComponent from "../../Quiz/Quiz";

const tab_title: string[] = ["Overview", "Curriculum", "Instructors", "Reviews"];

const voiceOptions = [
  { id: "en-US-JennyNeural", name: "Jenny (English, US, Cheerful)" },
  { id: "en-US-GuyNeural", name: "Guy (English, US, Neutral)" },
  { id: "en-GB-SoniaNeural", name: "Sonia (English, UK, Friendly)" },
  { id: "es-ES-ElviraNeural", name: "Elvira (Spanish, Spain, Warm)" },
];

interface CourseDetailsAreaProps {
  single_course: Course | null;
}

const CourseDetailsArea = ({ single_course }: CourseDetailsAreaProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [zoomMeetingUrl, setZoomMeetingUrl] = useState<string | null>(null);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const [script, setScript] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [voiceId, setVoiceId] = useState("en-US-JennyNeural");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const handleTabClick = (index: number) => setActiveTab(index);
  const toggleChatbot = () => setIsChatbotOpen((prev) => !prev);

  const fetchQuizForCourse = async () => {
    if (!single_course?._id) return;

    setIsLoadingQuiz(true);
    setError(null);
    setQuizId(null);

    try {
      console.log(`Fetching quizzes for course ID: ${single_course._id}`);
      const response = await fetch(`http://localhost:3000/quiz/byCourse/${single_course._id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Quizzes API Response:", result);

      if (result.status === "SUCCESS") {
        if (result.data && result.data.length > 0) {
          setQuizId(result.data[0]._id);
        } else {
          setError("No quizzes available for this course.");
        }
      } else {
        throw new Error(result.message || "Failed to fetch quizzes.");
      }
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError(`Failed to load quiz: ${err.message}`);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const toggleQuiz = () => {
    if (!isQuizOpen) {
      fetchQuizForCourse();
    } else {
      setQuizId(null);
      setError(null);
    }
    setIsQuizOpen((prev) => !prev);
  };

  const launchZoomMeeting = async () => {
    setIsLoadingMeeting(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/zoom/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId: single_course?._id }),
      });

      const data = await response.json();
      if (response.ok) {
        setZoomMeetingUrl(data.join_url);
        window.open(data.join_url, "_blank");
      } else {
        setError(data.message || "Failed to create Zoom meeting");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while creating the Zoom meeting");
    } finally {
      setIsLoadingMeeting(false);
    }
  };

  const isValidUrl = (url: string) => {
    const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*\.(jpg|jpeg|png))$/i;
    return urlPattern.test(url);
  };

  const generateAITutorVideo = async () => {
    if (!single_course?._id || !script || !sourceUrl) {
      setVideoError("Course ID, script, and image URL are required.");
      return;
    }

    if (!isValidUrl(sourceUrl)) {
      setVideoError("Invalid image URL. Please provide a valid URL to a JPEG or PNG image (e.g., https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d).");
      return;
    }

    if (script.length > 1000) {
      setVideoError("Script is too long. Please use a script with 1000 characters or fewer to reduce processing time.");
      return;
    }

    setIsGeneratingVideo(true);
    setVideoError(null);
    setVideoStatus("Initiating...");
    setVideoId(null);
    setVideoUrl(null);

    const payload = {
      courseId: single_course._id,
      script,
      source_url: sourceUrl,
      voiceId,
    };

    console.log("Sending video generation request:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch("http://localhost:3000/course/generateAITutorVideo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Video generation response:", JSON.stringify(data, null, 2));

      if (response.ok && data.status === "SUCCESS") {
        setVideoId(data.data.videoData.videoId);
        setVideoStatus(data.data.videoData.status);
      } else {
        throw new Error(data.error || "Failed to initiate video generation");
      }
    } catch (err) {
      console.error("Error generating video:", err);
      const errorMsg = err.message.includes("Insufficient credits")
          ? "Failed to generate video: Insufficient credits. Please add credits in your D-ID account at https://studio.d-id.com/."
          : `Failed to generate video: ${err.message}. Ensure the image URL is valid and accessible.`;
      setVideoError(errorMsg);
      setIsGeneratingVideo(false);
    }
  };

  useEffect(() => {
    if (!videoId || videoStatus === "done") return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3000/course/checkAITutorVideoStatus/${videoId}`);
        const data = await response.json();
        console.log("Video status response:", JSON.stringify(data, null, 2));

        if (response.ok && data.status === "SUCCESS") {
          setVideoStatus(data.data.status);
          if (data.data.status === "done") {
            setVideoUrl(data.data.videoUrl);
            setIsGeneratingVideo(false);
          }
        } else {
          throw new Error(data.error || "Failed to check video status");
        }
      } catch (err) {
        console.error("Error checking video status:", err);
        setVideoError(`Failed to check video status: ${err.message}`);
        setIsGeneratingVideo(false);
      }
    };

    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [videoId, videoStatus]);

  return (
      <section className="courses__details-area section-py-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-9 col-lg-8">
              <div className="courses__details-thumb">
                <img
                    src={
                      single_course?.thumb?.startsWith("http")
                          ? single_course.thumb
                          : `http://localhost:3000${single_course?.thumb || "/Uploads/default.jpg"}`
                    }
                    alt={single_course?.title || "Course Image"}
                    onError={(e) => {
                      e.currentTarget.src = "http://localhost:3000/uploads/default.jpg";
                    }}
                    style={{ width: "100%", maxWidth: "900px", height: "auto" }}
                />
              </div>

              <div className="courses__details-content">
                <ul className="courses__item-meta list-wrap">
                  <li className="courses__item-tag">
                    <Link to="/courses">{single_course?.category || "Development"}</Link>
                  </li>
                  <li className="avg-rating">
                    <i className="fas fa-star"></i> ({single_course?.rating || "0"} Reviews)
                  </li>
                </ul>

                <h2 className="title">
                  {single_course?.title || "Resolving Conflicts Between Designers And Engineers"}
                  <button className="chatbot-trigger-btn" onClick={toggleChatbot}>
                    <i className="fas fa-comment-alt"></i>
                    <span>Chat Now</span>
                  </button>
                </h2>

                <div className="courses__details-meta">
                  <ul className="list-wrap">
                    <li className="author-two">
                      <img src="/assets/img/courses/course_author001.png" alt="Author" />
                      By <Link to="#">{single_course?.instructors || "David Millar"}</Link>
                    </li>
                    <li className="date">
                      <i className="flaticon-calendar"></i>
                      {single_course?.createdAt
                          ? new Date(single_course.createdAt).toLocaleDateString()
                          : "24/07/2024"}
                    </li>
                    <li>
                      <i className="flaticon-mortarboard"></i>2,250 Students
                    </li>
                  </ul>
                </div>

                {single_course?._id && (
                    <div className="video-generation-section" style={{ margin: "20px 0", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
                      <h4 className="mb-3">Generate AI Tutor Video</h4>
                      <div className="mb-3">
                        <label className="form-label">Script</label>
                        <textarea
                            className="form-control"
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="Enter a short script for the AI tutor video (e.g., 'Welcome to our course on web development!') Max 1000 characters."
                            rows={4}
                            maxLength={1000}
                        />
                        <small className="form-text text-muted">
                          {script.length}/1000 characters. Use a concise script to reduce processing time.
                        </small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Image URL</label>
                        <input
                            type="url"
                            className="form-control"
                            value={sourceUrl}
                            onChange={(e) => setSourceUrl(e.target.value)}
                            placeholder="Enter a URL to a JPEG/PNG portrait image (e.g., https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d)"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Voice</label>
                        <select
                            className="form-select"
                            value={voiceId}
                            onChange={(e) => setVoiceId(e.target.value)}
                        >
                          {voiceOptions.map((voice) => (
                              <option key={voice.id} value={voice.id}>
                                {voice.name}
                              </option>
                          ))}
                        </select>
                      </div>
                      <button
                          className="btn btn-primary"
                          onClick={generateAITutorVideo}
                          disabled={isGeneratingVideo}
                      >
                        {isGeneratingVideo ? "Generating Video..." : "Generate Video"}
                      </button>
                      {isGeneratingVideo && (
                          <div className="progress mt-2">
                            <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: "50%" }}>
                              Generating...
                            </div>
                          </div>
                      )}
                      {videoStatus && (
                          <p className="mt-2">
                            Status: <span className={videoStatus === "done" ? "text-success" : "text-info"}>{videoStatus}</span>
                          </p>
                      )}
                      {videoUrl && (
                          <div className="mt-3">
                            <p className="text-success">Video generated successfully!</p>
                            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-success">
                              View Video
                            </a>
                          </div>
                      )}
                      {videoError && (
                          <div className="alert alert-danger mt-2">
                            {videoError}
                            {videoError.includes("Insufficient credits") && (
                                <p className="mt-1 mb-0">
                                  Please add credits in your <a href="https://studio.d-id.com/billing" target="_blank" rel="noopener noreferrer">D-ID account</a>.
                                  Contact <a href="mailto:support@d-id.com">support@d-id.com</a> if the issue persists.
                                </p>
                            )}
                            <p className="mt-1 mb-0">
                              Ensure the image is a publicly accessible JPEG/PNG portrait, e.g., https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d
                            </p>
                          </div>
                      )}
                    </div>
                )}

                <div className="zoom-meeting-button" style={{ marginBottom: "20px" }}>
                  <button
                      className="btn btn-primary"
                      onClick={launchZoomMeeting}
                      disabled={isLoadingMeeting}
                  >
                    {isLoadingMeeting ? "Creating Meeting..." : "Launch Zoom Meeting"}
                  </button>
                  {error && <p className="text-danger mt-2">{error}</p>}
                  {zoomMeetingUrl && !error && (
                      <p className="text-success mt-2">
                        Meeting created!{" "}
                        <a href={zoomMeetingUrl} target="_blank" rel="noopener noreferrer">
                          Join here
                        </a>
                      </p>
                  )}
                </div>

                {single_course?._id && (
                    <div style={{ margin: "20px 0" }}>
                      <button
                          className="btn btn-success"
                          onClick={toggleQuiz}
                          disabled={isLoadingQuiz}
                      >
                        {isLoadingQuiz ? "Loading Quiz..." : isQuizOpen ? "Close Quiz" : "Start Quiz"}
                      </button>
                    </div>
                )}

                {isQuizOpen && isLoadingQuiz && (
                    <div className="alert alert-info mt-3">Loading quiz...</div>
                )}
                {isQuizOpen && !quizId && error && (
                    <div className="alert alert-danger mt-3">{error}</div>
                )}
                {isQuizOpen && quizId && (
                    <div className="quiz-section" style={{ marginBottom: "30px" }}>
                      <QuizComponent quizId={quizId} />
                    </div>
                )}

                <ul className="nav nav-tabs" role="tablist">
                  {single_course?._id && (
                      <li className="nav-item" role="presentation">
                        <Link
                            to={`/lesson/${single_course._id}`}
                            className={`nav-link ${activeTab === -1 ? "active" : ""}`}
                            onClick={() => console.log("Navigating to lesson:", single_course._id)}
                        >
                          Start Lessons Now
                        </Link>
                      </li>
                  )}
                  {tab_title.map((tab, index) => (
                      <li
                          key={index}
                          className="nav-item"
                          role="presentation"
                          onClick={() => handleTabClick(index)}
                      >
                        <button className={`nav-link ${activeTab === index ? "active" : ""}`}>
                          {tab}
                        </button>
                      </li>
                  ))}
                </ul>

                <div className="tab-content" id="myTabContent">
                  {activeTab === 0 && <Overview single_course={single_course} />}
                  {activeTab === 1 && <Curriculum single_course={single_course} />}
                  {activeTab === 2 && <Instructors single_course={single_course} />}
                  {activeTab === 3 && <Reviews singlecourse={single_course} />}
                </div>
              </div>
            </div>

            <Sidebar singlecourse={single_course} />
          </div>
        </div>

        {isChatbotOpen && (
            <>
              <div className="chatbot-overlay" onClick={toggleChatbot}></div>
              <div className="chatbot-panel">
                <div className="chatbot-panel-header">
                  <h3>Course Assistant</h3>
                  <button className="chatbot-close-btn" onClick={toggleChatbot}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <Chatbot />
              </div>
            </>
        )}
      </section>
  );
};

export default CourseDetailsArea;