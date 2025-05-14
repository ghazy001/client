import React, { useState, useEffect, useRef, FormEvent } from "react";
import Webcam from "react-webcam";
import { Quiz, Question, Reponse } from "../../types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BASE_URL = "http://localhost:3000";

interface QuizComponentProps {
  quizId: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  profilePicture?: string;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quizId }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const emotionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [emotionLog, setEmotionLog] = useState<string[]>([]);
  const [report, setReport] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [webcamEnabled, setWebcamEnabled] = useState<boolean>(true);
  const [webcamReady, setWebcamReady] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoadingUser(true);
        const response = await fetch(`${BASE_URL}/user/current-user`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setUser({
          id: data.id,
          name: data.name,
          role: data.role,
          profilePicture: data.profilePicture,
        });
        setError(null);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError("Could not load user data.");
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Generate sessionId and fetch quiz when component mounts
  useEffect(() => {
    if (!quizId || !quizId.match(/^[0-9a-fA-F]{24}$/)) {
      setError("No valid quiz ID found in URL");
      return;
    }

    // Generate a consistent sessionId that won't change on re-renders
    const newSessionId = `session_${quizId}_${Date.now()}`;
    console.log("Setting sessionId for quizId:", quizId, "sessionId:", newSessionId);
    setSessionId(newSessionId);

    // Fetch quiz data
    getQuizById(quizId);
  }, [quizId]);

  const getQuizById = async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching quiz with ID:", quizId);
      const response = await fetch(`${BASE_URL}/quiz/${quizId}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      console.log("Quiz fetch response:", result);

      if (result.status === "SUCCESS") {
        const questionsData = result.data.questions || [];

        if (!questionsData.length) {
          setError("No questions available for this quiz.");
          return;
        }

        const updatedQuestions = questionsData.map((q: Question) => ({
          ...q,
          selectedAnswer: "",
          reponses: q.reponses?.map((r, index) => ({
            ...r,
            answernum: String.fromCharCode(65 + index),
          })) || [],
        }));

        setQuiz({
          ...result.data,
          questions: updatedQuestions,
          titre: result.data.titre || "Quiz",
        });

        const totalPossibleScore = updatedQuestions.reduce(
            (sum: number, q: Question) => sum + (q.score || 0),
            0
        );
        setMaxScore(totalPossibleScore);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(`Error fetching quiz: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (isSubmitted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current!);
          console.log("Timer expired, submitting quiz");
          setIsSubmitted(true);
          submitAnswers(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSubmitted]);

  // Setup emotion detection when all prerequisites are met
  useEffect(() => {
    // Clear previous emotion interval if it exists
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
      emotionIntervalRef.current = null;
    }

    // Check if all conditions are met to start emotion tracking
    const canStartEmotionTracking =
        webcamEnabled &&
        !isSubmitted &&
        !!quizId &&
        !!sessionId &&
        webcamReady &&
        !!user;

    if (!canStartEmotionTracking) {
      console.log("Skipping emotion capture:", {
        webcamEnabled,
        isSubmitted,
        quizId,
        sessionId,
        webcamReady,
        hasUser: !!user
      });
      return;
    }

    console.log("Starting emotion capture with sessionId:", sessionId);

    // Capture immediately on setup then set interval
    captureAndAnalyzeEmotion();

    emotionIntervalRef.current = setInterval(() => {
      captureAndAnalyzeEmotion();
    }, 10000);

    return () => {
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current);
      }
    };
  }, [webcamEnabled, isSubmitted, quizId, sessionId, webcamReady, user]);

  // Fetch report after submission
  useEffect(() => {
    if (isSubmitted && sessionId) {
      console.log("Quiz submitted, fetching report for sessionId:", sessionId);
      fetchEmotionReport();
    }
  }, [isSubmitted, sessionId]);

  const captureAndAnalyzeEmotion = async () => {
    if (!webcamRef.current || !user) {
      console.warn("Webcam not available or user not authenticated");
      return;
    }

    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        console.warn("Failed to capture screenshot");
        return;
      }

      console.log("Screenshot captured successfully");

      const base64Image = screenshot.split(",")[1];
      const blob = new Blob(
          [new Uint8Array(atob(base64Image).split("").map((char) => char.charCodeAt(0)))],
          { type: "image/jpeg" }
      );
      const formData = new FormData();
      formData.append("image_file", blob, "image.jpg");
      formData.append("api_key", "jzgXwXuwHh0xrjV-EG3aAo6G9fvjleK8");
      formData.append("api_secret", "YzsRe5onLZElJlp0IeevyhNKASKJLSec");
      formData.append("return_attributes", "emotion");

      console.log("Sending image to Face++ API");

      const response = await fetch("https://api-us.faceplusplus.com/facepp/v3/detect", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Face++ response:", result);

      if (result.faces && result.faces.length > 0) {
        const face = result.faces[0];
        if (face.attributes && face.attributes.emotion) {
          const emotionScores = face.attributes.emotion;
          const validEmotions = ['happiness', 'neutral', 'surprise', 'sadness', 'anger', 'disgust', 'fear'];
          const dominantEmotion = Object.keys(emotionScores).reduce((prev, current) =>
              emotionScores[prev] > emotionScores[current] ? prev : current
          );
          const intensity = emotionScores[dominantEmotion];

          if (!validEmotions.includes(dominantEmotion)) {
            console.warn("Invalid emotion detected:", dominantEmotion);
            setEmotionLog((prev) => [...prev, "Émotion non reconnue"]);
            return;
          }

          const emotionData = {
            quizId,
            userId: user.id,
            emotion: dominantEmotion,
            intensity,
            sessionId,
          };

          if (!quizId || !emotionData.userId || !dominantEmotion || !sessionId) {
            console.error("Missing required fields:", emotionData);
            setEmotionLog((prev) => [...prev, "Erreur: Données incomplètes"]);
            return;
          }

          console.log("Sending to backend with sessionId:", sessionId, emotionData);

          const backendResponse = await fetch(`${BASE_URL}/emotion/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emotionData),
          });
          const backendResult = await backendResponse.json();
          console.log("Backend response:", backendResult);

          if (backendResult.status === "SUCCESS" && backendResult.data.engagementDrop.detected) {
            alert(backendResult.data.engagementDrop.suggestion);
            window.location.href = 'https://www.youtube.com/watch?v=H3KiuXhsx70&t=19s';
          }

          setEmotionLog((prev) => [...prev, dominantEmotion]);
        } else {
          setEmotionLog((prev) => [...prev, "Aucune émotion"]);
        }
      } else {
        setEmotionLog((prev) => [...prev, "Aucun visage"]);
      }
    } catch (err) {
      console.error("Erreur d'analyse émotionnelle :", err);
      setEmotionLog((prev) => [...prev, "Erreur API"]);
    }
  };

  const fetchEmotionReport = async () => {
    if (!sessionId) {
      console.error("No sessionId available for report fetch");
      setError("Erreur: Aucune session active pour le rapport");
      return;
    }
    console.log("Fetching report for sessionId:", sessionId);
    try {
      const response = await fetch(`${BASE_URL}/emotion/report/${sessionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Emotion report response:", result);
      if (result.status === "SUCCESS") {
        setReport(result.data);
        console.log("Report set:", result.data);
      } else {
        setError(`Erreur lors de la récupération du rapport: ${result.message}`);
      }
    } catch (err) {
      console.error("Report fetch error:", err);
      setError(`Erreur serveur lors de la récupération du rapport: ${(err as Error).message}`);
    }
  };

  const downloadReportAsPDF = async () => {
    if (!reportRef.current) {
      console.error("Report section not found");
      setError("Erreur: Section du rapport non trouvée");
      return;
    }

    try {
      console.log("Generating PDF for report");

      const downloadButton = reportRef.current.querySelector('.no-pdf');
      if (downloadButton) {
        downloadButton.style.display = 'none';
      }

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      if (downloadButton) {
        downloadButton.style.display = '';
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Constants
      const pageWidth = 210;  // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const marginTop = 30;   // Margin below header
      const headerHeight = 40; // Rough header space

      // Calculate image dimensions
      const imgWidth = 190; // You can adjust (max 190mm to keep margins)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = marginTop;

      const centerX = (pageWidth - imgWidth) / 2;

      // Add header
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("SkillGrow : Comprendre les Émotions pour Mieux Apprendre", pageWidth / 2, 15, { align: "center" });
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 22, { align: "center" });
      pdf.line(10, 25, 200, 25);

      // Add image centered
      pdf.addImage(imgData, "PNG", centerX, position, imgWidth, imgHeight);

      // Handle multiple pages
      heightLeft -= pageHeight - headerHeight;
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("SkillGrow : Comprendre les Émotions pour Mieux Apprendre (Suite)", pageWidth / 2, 15, { align: "center" });
        pdf.line(10, 25, 200, 25);

        position = marginTop - heightLeft;
        pdf.addImage(imgData, "PNG", centerX, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - headerHeight;
      }

      // Add signature
      const signatureImg = new Image();
      signatureImg.src = "/assets/img/sig/signature.png"; // Correct path

      signatureImg.onload = () => {
        const signatureWidth = 50;
        const signatureHeight = 20;
        const signatureX = (pageWidth - signatureWidth) / 2;
        const signatureY = 270; // Bottom

        pdf.addImage(signatureImg, "PNG", signatureX, signatureY, signatureWidth, signatureHeight);

        // Save the PDF after adding signature
        pdf.save(`Emotional_Analysis_Report_${sessionId}.pdf`);
        console.log("PDF generated with signature and downloaded");
      };

      signatureImg.onerror = () => {
        console.error("Erreur de chargement de la signature");
        setError("Erreur lors du chargement de la signature");
      };

    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Erreur lors de la génération du PDF");
    }
  };

  const selectAnswer = (question: Question, reponse: Reponse) => {
    if (!isSubmitted && quiz) {
      const updatedQuestions = quiz.questions.map((q) =>
          q._id === question._id ? { ...q, selectedAnswer: reponse._id } : q
      );
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const submitAnswers = async (isTimedOut: boolean = false) => {
    if (!quizId || !quiz || !user) {
      console.error("Cannot submit: quizId or quiz missing or user not authenticated");
      setError("Erreur: Quiz non chargé ou utilisateur non authentifié");
      return;
    }

    const userId = user.id; // Using the current user's ID
    const userAnswers: { [key: string]: string } = {};
    quiz.questions.forEach((q) => {
      if (q._id) userAnswers[q._id] = q.selectedAnswer || "";
    });

    try {
      console.log("Submitting quiz with answers:", userAnswers, "isTimedOut:", isTimedOut);
      const response = await fetch(`${BASE_URL}/quiz/${quizId}/user/${userId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAnswers, isTimedOut }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      console.log("Quiz submission response:", result);
      if (result.status === "SUCCESS") {
        setTotalScore(result.data.score || 0);
        setIsSubmitted(true);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Quiz submission error:", err);
      setError("Error submitting quiz: " + (err as Error).message);
    }
  };

  const submitQuiz = (e: FormEvent) => {
    e.preventDefault();
    if (!isSubmitted && quiz && areAllQuestionsAnswered()) {
      console.log("Submitting quiz manually");
      submitAnswers(false);
    } else {
      console.warn("Submission blocked: isSubmitted:", isSubmitted, "allAnswered:", areAllQuestionsAnswered());
      setError("Please answer all questions before submitting.");
    }
  };

  const getFormattedTime = (): string => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const isAnswerCorrect = (question: Question): boolean => {
    if (!question.selectedAnswer) return false;
    const selectedReponse = question.reponses.find(
        (r) => r._id === question.selectedAnswer
    );
    return selectedReponse ? selectedReponse.texte === question.correctAnswer : false;
  };

  const areAllQuestionsAnswered = (): boolean =>
      quiz?.questions.every((q) => q.selectedAnswer !== "") || false;

  // Function to handle webcam ready state
  const handleWebcamUserMedia = (mediaStream: MediaStream) => {
    console.log("Webcam is ready and has access to media stream");
    setWebcamReady(true);
  };

  if (isLoadingUser) {
    return (
        <div className="container mt-5 text-center">
          <p>Chargement des informations utilisateur...</p>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="container mt-5">
          <div className="alert alert-warning">
            <h4>Authentification requise</h4>
            <p>Veuillez vous connecter pour accéder à ce quiz.</p>
            <a href="/login" className="btn btn-primary">Se connecter</a>
          </div>
        </div>
    );
  }

  return (
      <main className="main-area fix">
        <style>{`
        .report-container {
          background-color: #ffffff;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .report-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .report-table th, .report-table td {
          border: 1px solid #dee2e6;
          padding: 10px;
          text-align: left;
        }
        .report-table th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .no-pdf {
          /* No additional styles needed; will be hidden via JS */
        }
        .webcam-container {
          position: relative;
          width: 320px;
          margin: 0 auto;
        }
        .webcam-status {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: rgba(0,0,0,0.5);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
        }
      `}</style>
        <section
            className="breadcrumb__area breadcrumb__bg"
            style={{ backgroundImage: "url(assets/img/bg/breadcrumb_bg.jpg)" }}
        >
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="breadcrumb__content">
                  <h2>{quiz?.titre || "Loading..."}</h2>
                  <nav className="breadcrumb">
                  <span>
                    <a href="index.html">courses</a>
                  </span>
                    <span className="breadcrumb-separator">
                    <i className="fas fa-angle-right"></i>
                  </span>
                    <span>final Audit</span>
                  </nav>
                </div>
              </div>
            </div>
          </div>
          <div className="breadcrumb__shape-wrap"></div>
        </section>

        <div className="container mt-5">
          <div className="user-info mb-4">
            <h5>Utilisateur: {user.name}</h5>
          </div>

          {quiz?.description && <p>{quiz.description}</p>}

          {!isSubmitted && quiz && (
              <div className="text-center mb-4">
                <h4>
                  Temps restant: <span className="badge bg-primary">{getFormattedTime()}</span>
                </h4>
              </div>
          )}

          {webcamEnabled && (
              <div className="text-center mb-3">
                <p>📷 Veuillez vous assurer d'être dans un environnement bien éclairé pour l'analyse émotionnelle.</p>
                <div className="webcam-container">
                  <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width={320}
                      height={240}
                      style={{ borderRadius: "10px" }}
                      onUserMedia={handleWebcamUserMedia}
                      onUserMediaError={() => {
                        console.error("Failed to access webcam");
                        setError("Impossible d'accéder à la webcam. Veuillez vérifier vos paramètres de permission.");
                        setWebcamEnabled(false);
                      }}
                  />
                  <div className="webcam-status">
                    {webcamReady ? "Webcam active" : "Initialisation..."}
                  </div>
                </div>
              </div>
          )}

          <div className="mt-3">
            <h5>Journal des émotions :</h5>
            {emotionLog.length > 0 ? (
                <ul>
                  {emotionLog.map((emotion, index) => (
                      <li key={index}>{emotion}</li>
                  ))}
                </ul>
            ) : (
                <p>Aucune émotion détectée pour le moment.</p>
            )}
          </div>

          {loading && <div className="text-center"><p>Chargement des questions...</p></div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}

          {!loading && quiz && quiz.questions && quiz.questions.length > 0 ? (
              <form onSubmit={submitQuiz}>
                {quiz.questions.map((question, index) => (
                    <div key={question._id || index} className="question-item mb-4">
                      <h4>{`${index + 1}. ${question.contenu || "No content available"}`}</h4>
                      <div className="form-group">
                        {question.reponses && question.reponses.length > 0 ? (
                            question.reponses.map((reponse) => (
                                <div key={reponse._id || reponse.answernum} className="form-check">
                                  <input
                                      type="radio"
                                      className="form-check-input"
                                      id={`reponse-${question._id || index}-${reponse._id}`}
                                      name={`question-${question._id || index}`}
                                      value={reponse._id}
                                      checked={question.selectedAnswer === reponse._id}
                                      disabled={isSubmitted}
                                      onChange={() => selectAnswer(question, reponse)}
                                  />
                                  <label
                                      className="form-check-label"
                                      htmlFor={`reponse-${question._id || index}-${reponse._id}`}
                                  >
                                    {`${reponse.answernum}: ${reponse.texte || "No response text"}`}
                                  </label>
                                </div>
                            ))
                        ) : (
                            <p>No responses available for this question.</p>
                        )}
                        {isSubmitted && question.selectedAnswer && (
                            <div className="mt-2">
                      <span
                          className={`badge ${isAnswerCorrect(question) ? "bg-success" : "bg-danger"}`}
                      >
                        {isAnswerCorrect(question) ? "Correct" : "Incorrect"}
                      </span>
                            </div>
                        )}
                      </div>
                    </div>
                ))}
                <button
                    type="submit"
                    className="btn btn-primary m-5"
                    disabled={!areAllQuestionsAnswered() || isSubmitted}
                >
                  {isSubmitted ? "Quiz Submitted" : "Submit Quiz"}
                </button>
                {report ? (
                    <div className="report-container" ref={reportRef}>
                      <div className="report-header">
                        <h3>Rapport Émotionnel - Analyse de l'Engagement</h3>
                        <p>Généré le: {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
                      </div>
                      <table className="report-table">
                        <tbody>
                        <tr>
                          <th>Engagement moyen</th>
                          <td>{report.engagementScore ?? 'N/A'}%</td>
                        </tr>
                        <tr>
                          <th>Émotion dominante</th>
                          <td>{report.dominantEmotion ?? 'N/A'}</td>
                        </tr>
                        </tbody>
                      </table>
                      <h4>Périodes de fatigue</h4>
                      {report.fatiguePeriods && report.fatiguePeriods.length > 0 ? (
                          <table className="report-table">
                            <thead>
                            <tr>
                              <th>Début</th>
                              <th>Fin</th>
                              <th>Durée (min)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {report.fatiguePeriods.map((period: any, index: number) => (
                                <tr key={index}>
                                  <td>{new Date(period.start).toLocaleTimeString('fr-FR')}</td>
                                  <td>{new Date(period.end).toLocaleTimeString('fr-FR')}</td>
                                  <td>{period.duration}</td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                      ) : (
                          <p>Aucune période de fatigue détectée.</p>
                      )}
                      <h4>Recommandations</h4>
                      <ul>
                        {(report.recommendations ?? []).map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                        ))}
                      </ul>
                      <button
                          className="btn btn-primary mt-3 no-pdf"
                          onClick={downloadReportAsPDF}
                      >
                        Télécharger en PDF
                      </button>
                    </div>
                ) : (
                    isSubmitted && <p className="mt-5">Rapport en cours de chargement...</p>
                )}
              </form>
          ) : (
              <p>No quiz available.</p>
          )}
        </div>
      </main>
  );
};

export default QuizComponent;