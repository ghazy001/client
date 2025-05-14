import { useEffect, useState } from "react";
import LessonFaq from "./LessonFaq";
import LessonNavTav from "./LessonNavTav";
import LessonVideo from "./LessonVideo";

interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  duration: string;
  isLocked: boolean;
  order: number;
  summary: string;
}

interface LessonAreaProps {
  courseId: string;
}

const LessonArea = ({ courseId }: LessonAreaProps) => {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [manualSummary, setManualSummary] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const BASE_URL = "http://localhost:3000";

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const [lessonsResponse, userResponse] = await Promise.all([
          fetch(`${BASE_URL}/course/getLessons/${courseId}`, { credentials: "include" }),
          fetch(`${BASE_URL}/auth/current_user`, { credentials: "include" }),
        ]);

        if (!lessonsResponse.ok) {
          throw new Error(`Failed to fetch lessons: ${lessonsResponse.statusText}`);
        }

        const lessonsData = await lessonsResponse.json();
        if (!lessonsData || lessonsData.length === 0) {
          throw new Error("No lessons found for this course");
        }

        setLessons(lessonsData);
        const firstUnlocked = lessonsData.find((lesson: Lesson) => !lesson.isLocked) || lessonsData[0];
        setCurrentLesson(firstUnlocked);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setIsAdmin(userData.role === "admin");
        }

        setError(null);
      } catch (err: any) {
        console.error("Error fetching lessons:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchLessons();
    else setError("No course ID provided");
  }, [courseId]);

  const handlePrev = () => {
    const currentIndex = lessons.findIndex((lesson) => lesson._id === currentLesson?._id);
    if (currentIndex > 0) setCurrentLesson(lessons[currentIndex - 1]);
  };

  const handleNext = () => {
    const currentIndex = lessons.findIndex((lesson) => lesson._id === currentLesson?._id);
    if (currentIndex < lessons.length - 1) setCurrentLesson(lessons[currentIndex + 1]);
  };

  const handleRegenerateSummary = async () => {
    if (!currentLesson) return;
    setIsRegenerating(true);
    try {
      const response = await fetch(`${BASE_URL}/course/regenerateSummary/${currentLesson._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to regenerate summary");
      }
      const updatedLesson = await response.json();
      setCurrentLesson(updatedLesson.data);
      setLessons(lessons.map((l) => (l._id === updatedLesson.data._id ? updatedLesson.data : l)));
      alert("Summary regenerated successfully!");
    } catch (err: any) {
      console.error("Error regenerating summary:", err);
      alert("Failed to regenerate summary: " + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSetManualSummary = async () => {
    if (!currentLesson || !manualSummary.trim()) {
      alert("Please enter a valid summary.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/course/setManualSummary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId: currentLesson._id, summary: manualSummary.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to set manual summary");
      }
      const updatedLesson = await response.json();
      setCurrentLesson(updatedLesson.data);
      setLessons(lessons.map((l) => (l._id === updatedLesson.data._id ? updatedLesson.data : l)));
      setManualSummary("");
      alert("Manual summary set successfully!");
    } catch (err: any) {
      console.error("Error setting manual summary:", err);
      alert("Failed to set manual summary: " + err.message);
    }
  };

  const handleDownloadPDF = () => {
    if (!currentLesson) return;
    window.location.href = `${BASE_URL}/course/generateSummaryPDF/${currentLesson._id}`;
  };

  const handlePlayAudio = () => {
    if (!currentLesson || !currentLesson.summary || currentLesson.summary.includes("Summary unavailable")) {
      alert("No valid summary available to play.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentLesson.summary);
    const selectedVoiceObj = voices.find((voice) => voice.name === selectedVoice);
    if (selectedVoiceObj) {
      utterance.voice = selectedVoiceObj;
    }
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const currentIndex = lessons.findIndex((lesson) => lesson._id === currentLesson?._id);

  if (loading) return <div className="loading">Loading lessons...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
      <section className="lesson__area section-pb-120">
        <div className="container-fluid p-0">
          <div className="row gx-0">
            <div className="col-xl-3 col-lg-4">
              <div className="lesson__content">
                <h2 className="title">Course Content</h2>
                <LessonFaq lessons={lessons} />
              </div>
            </div>
            <div className="col-xl-9 col-lg-8">
              <div className="lesson__video-wrap">
                <div className="lesson__video-wrap-top">
                  <div className="lesson__video-wrap-top-left">
                    <span>{currentLesson?.title || "No Lesson Selected"}</span>
                  </div>
                </div>

                {/* ✅ VIDEO FULL WIDTH & HEIGHT */}
                <LessonVideo
                    videoUrl={currentLesson?.videoUrl || ""}
                    className="w-full h-[400px] md:h-[500px] lg:h-[600px]"
                />

                <div className="lesson__summary">
                  <h3>Lesson Summary</h3>
                  {currentLesson?.summary && !currentLesson.summary.includes("Summary unavailable") && !currentLesson.summary.includes("Failed to generate summary") ? (
                      <p className="summary-text">{currentLesson.summary}</p>
                  ) : (
                      <p className="summary-error">
                        {isAdmin
                            ? "Unable to generate summary. The video may lack subtitles or have an incorrect URL."
                            : "No summary available for this lesson."}
                      </p>
                  )}
                  <div className="lesson__summary-actions">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={!currentLesson?.summary || currentLesson.summary.includes("Summary unavailable")}
                        className="btn"
                    >
                      Download Summary as PDF
                    </button>
                    <button
                        onClick={handlePlayAudio}
                        disabled={!currentLesson?.summary || currentLesson.summary.includes("Summary unavailable")}
                        className="btn"
                    >
                      {isSpeaking ? "Stop Audio" : "Play Summary as Audio"}
                    </button>
                    <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="form-select form-select-lg m-4"
                        disabled={voices.length === 0}
                    >
                      {voices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                      ))}
                    </select>
                  </div>

                  {isAdmin && (
                      <div className="lesson__summary-admin-actions">
                        <button
                            onClick={handleRegenerateSummary}
                            disabled={isRegenerating || !currentLesson?.videoUrl}
                            className="btn"
                        >
                          {isRegenerating ? "Regenerating..." : "Regenerate Summary"}
                        </button>
                        <div className="manual-summary-input">
                      <textarea
                          value={manualSummary}
                          onChange={(e) => setManualSummary(e.target.value)}
                          placeholder="Enter manual summary"
                          className="summary-input"
                          rows={4}
                      />
                          <button
                              onClick={handleSetManualSummary}
                              disabled={!manualSummary.trim()}
                              className="btn"
                          >
                            Set Manual Summary
                          </button>
                        </div>
                      </div>
                  )}
                </div>

                <div className="lesson__next-prev-button">
                  <button
                      className="btn"
                      title={lessons[currentIndex - 1]?.title || "Previous"}
                      onClick={handlePrev}
                      disabled={currentIndex <= 0}
                  >
                    <i className="flaticon-arrow-left"></i> Previous
                  </button>
                  <button
                      className="btn"
                      title={lessons[currentIndex + 1]?.title || "Next"}
                      onClick={handleNext}
                      disabled={currentIndex >= lessons.length - 1}
                  >
                    Next <i className="flaticon-arrow-right"></i>
                  </button>
                </div>
              </div>

              <LessonNavTav />
            </div>
          </div>
        </div>
      </section>
  );
};

export default LessonArea;
