import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const InstructorArea = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const response = await axios.get("http://localhost:3000/user/instructors", {
                    withCredentials: true,
                });
                setInstructors(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching instructors:", err);
                setError("Failed to load instructors");
                setLoading(false);
            }
        };
        fetchInstructors();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <section className="instructor__area">
            <div className="container">
                <div className="row">
                    {instructors.map((item) => (
                        <div key={item._id} className="col-xl-4 col-sm-6">
                            <div className="instructor__item">
                                <div className="instructor__thumb">
                                    <Link to={`/instructor-details/${item._id}`}>
                                        <img
                                            src={`http://localhost:3000/uploads/${item.profilePicture}`}
                                            alt={item.name}
                                        />
                                    </Link>

                                </div>
                                <div className="instructor__content">
                                    <h2 className="title">
                                        <Link to={`/instructor-details/${item._id}`}>
                                            {item.name}
                                        </Link>
                                    </h2>
                                    <p className="avg-rating">
                                        <i className="fas fa-star"></i>
                                        ({item.rating || 4.8} Ratings)
                                    </p>
                                    <div className="instructor__social">
                                        <ul className="list-wrap">
                                            <li>
                                                <Link to="#">
                                                    <i className="fab fa-facebook-f"></i>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="#">
                                                    <i className="fab fa-twitter"></i>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="#">
                                                    <i className="fab fa-whatsapp"></i>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="#">
                                                    <i className="fab fa-instagram"></i>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InstructorArea;