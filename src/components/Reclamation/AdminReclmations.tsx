import { useState, useEffect } from "react";
import HeaderOne from "../../layouts/headers/HeaderOne.tsx";
import FooterOne from "../../layouts/footers/FooterOne.tsx";
import DashboardSidebar from "../../dashboard/dashboard-common/DashboardSidebar.tsx";

interface Reclamation {
    _id: string;
    name: string;
    email: string;
    comment: string;
    createdAt: string;
    status: "pending" | "in_progress" | "resolved";
}

const AdminReclamations = () => {
    const [reclamations, setReclamations] = useState<Reclamation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null); // Ajout d'un état pour le message de toast

    // 🔹 Récupérer toutes les réclamations
    useEffect(() => {
        const fetchReclamations = async () => {
            try {
                const response = await fetch("http://localhost:3000/reclamation");
                if (!response.ok) throw new Error("Erreur serveur");
                const data = await response.json();
                setReclamations(data);
            } catch (err) {
                console.error(err);
                setError("Erreur lors de la récupération des réclamations.");
            } finally {
                setLoading(false);
            }
        };

        fetchReclamations();
    }, []);

    // 🔹 Mettre à jour le statut à "resolved"
    const handleMarkAsResolved = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3000/reclamation/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "resolved" }), // Envoi du statut "resolved"
            });

            if (!response.ok) throw new Error("Erreur serveur");

            const updated = await response.json();
            setReclamations((prev) =>
                prev.map((rec) =>
                    rec._id === id ? { ...rec, status: updated.status } : rec
                )
            );

            // Afficher un message de succès via Toast
            setToastMessage("Réclamation marquée comme traitée avec succès !");
            setTimeout(() => setToastMessage(null), 3000); // Supprimer le message après 3 secondes
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la mise à jour du statut.");
        }
    };

    return (
        <>
            <HeaderOne />

            <div className="d-flex" style={{ minHeight: '100vh' }}>
                <DashboardSidebar />

                <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f9f9f9' }}>
                    <div className="bg-white rounded shadow-sm p-4">
                        <h2 className="mb-4 text-primary fw-bold">📋 Liste des Réclamations</h2>

                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="d-flex justify-content-center my-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Chargement...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover align-middle">
                                    <thead className="table-dark text-center">
                                    <tr>
                                        <th>Nom</th>
                                        <th>Email</th>
                                        <th>Commentaire</th>
                                        <th>Date</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="text-center">
                                    {reclamations.map((rec) => (
                                        <tr key={rec._id}>
                                            <td>{rec.name}</td>
                                            <td>{rec.email}</td>
                                            <td>{rec.comment}</td>
                                            <td>{new Date(rec.createdAt).toLocaleString()}</td>
                                            <td>
                      <span
                          className={`badge px-3 py-2 rounded-pill text-uppercase fw-bold ${
                              rec.status === "resolved"
                                  ? "bg-success"
                                  : rec.status === "in_progress"
                                      ? "bg-warning text-dark"
                                      : "bg-secondary"
                          }`}
                      >
                        {rec.status}
                      </span>
                                            </td>
                                            <td>
                                                {rec.status !== "resolved" && (
                                                    <button
                                                        onClick={() => handleMarkAsResolved(rec._id)}
                                                        className="btn btn-outline-success btn-sm"
                                                    >
                                                        ✔ Marquer comme traité
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {toastMessage && (
                        <div className="toast-container position-fixed top-0 end-0 p-3">
                            <div
                                className="toast show"
                                style={{
                                    minWidth: "200px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                                }}
                            >
                                <div className="toast-body">{toastMessage}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FooterOne />
        </>


    );
};

export default AdminReclamations;
