import { useEffect, useState, ChangeEvent } from 'react';
import ReactPaginate from 'react-paginate';
import CourseSidebar from './CourseSidebar';
import CourseTop from './CourseTop';
import UseCourses from '../../../hooks/UseCourses';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCourses, selectCart, addToCart, clearCart, setCourses, Course } from '../../../redux/features/courseSlice';
import axios from "axios";
const BASE_URL = 'http://localhost:3000';

interface FilterCriteria {
    category: string;
    language: string;
    price: string;
    rating: number | null;
    skill: string;
    instructor: string;
}

const CourseArea = () => {
    UseCourses();
    const allCourses = useSelector(selectCourses);
    const cart = useSelector(selectCart);
    const dispatch = useDispatch();

    const itemsPerPage = 12;
    const [itemOffset, setItemOffset] = useState(0);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>(allCourses);
    const [filters, setFilters] = useState<FilterCriteria>({
        category: '',
        language: '',
        price: '',
        rating: null,
        skill: '',
        instructor: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
    const fetchRecommendedCourses = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3000/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ratings: [5, 3, 0, 1] // à remplacer dynamiquement selon l'utilisateur
                })
            });
            if (!response.ok) throw new Error('Failed to fetch recommendations');
            const data = await response.json();
            const recommendedTitles: string[] = data.recommendations;

            const recommendedCourses = allCourses.filter(course =>
                recommendedTitles.includes(course.title)
            );
            setFilteredCourses(recommendedCourses);
            setItemOffset(0);
        } catch (error) {
            console.error('Error fetching recommended courses:', error);
            alert('Failed to fetch recommended courses');
        } finally {
            setIsLoading(false);
        }
    };
    // Voice search setup with proper typing
    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        start: () => void;
        onresult: (event: SpeechRecognitionEvent) => void;
        onerror: (event: SpeechRecognitionErrorEvent) => void;
        onend: () => void;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() as SpeechRecognition : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
    }

    useEffect(() => {
        let result = [...allCourses];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(course =>
                course.title.toLowerCase().includes(query) ||
                course.category.toLowerCase().includes(query) ||
                course.instructors.toLowerCase().includes(query)
            );
        }

        if (filters.category) result = result.filter(course => course.category === filters.category);
        if (filters.language) result = result.filter(course => course.language === filters.language);
        if (filters.price) {
            result = result.filter(course => {
                const price = course.price;
                switch(filters.price) {
                    case 'Free': return price === 0;
                    case '$0 - $50': return price > 0 && price <= 50;
                    case '$50 - $100': return price > 50 && price <= 100;
                    case '$100 - $200': return price > 100 && price <= 200;
                    case '$200+': return price > 200;
                    default: return true;
                }
            });
        }
        // Handle nullable rating with type guard
        if (filters.rating !== null) {
            result = result.filter(course => course.rating >= (filters.rating as number));
        }
        if (filters.skill) result = result.filter(course => course.skill_level === filters.skill);
        if (filters.instructor) result = result.filter(course => course.instructors === filters.instructor);

        setFilteredCourses(result);
        setItemOffset(0);
    }, [filters, allCourses, searchQuery]);

    const endOffset = itemOffset + itemsPerPage;
    const currentItems = filteredCourses.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(filteredCourses.length / itemsPerPage);
    const startOffset = itemOffset + 1;
    const totalItems = filteredCourses.length;

    const handlePageClick = (event: { selected: number }) => {
        const newOffset = (event.selected * itemsPerPage) % filteredCourses.length;
        setItemOffset(newOffset);
    };

    const handleTabClick = (index: number) => {
        setActiveTab(index);
    };

    const getRecommendedCourses = async () => {
        try {
            setIsLoading(true);
            const languages = ['php'];  // un seul langage dans une liste

            const response = await axios.post('http://localhost:5000/recommend', { languages });

            const recommendedCourses = response.data?.recommendations || [];
            console.log('Recommended Courses:', recommendedCourses);

            if (Array.isArray(recommendedCourses)) {
                setFilteredCourses(recommendedCourses);
            } else {
                console.error('Error: The response did not contain valid recommendations.');
            }
        } catch (error) {
            console.error('Recommendation fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCoursesByLocation = async () => {
        const userConfirmed = window.confirm('Do you want to share your location to fetch location-based courses?');
        if (!userConfirmed) return;

        try {
            setIsLoading(true);
            const response = await fetch(`${BASE_URL}/course/courses-by-location`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include session cookies
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            const locationBasedCourses = await response.json();
            dispatch(setCourses(locationBasedCourses));
            setItemOffset(0);
        } catch (error) {
            console.error('Error fetching location-based courses:', error);
            alert('Failed to fetch courses by location');
        } finally {
            setIsLoading(false);
        }
    };

    const proceedToCheckout = async () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/course/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include session cookies
                body: JSON.stringify({ courses: cart }),
            });
            const result = await response.json();
            if (result.status === 'SUCCESS') {
                window.location.href = result.url;
                dispatch(clearCart());
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Checkout failed!');
        }
    };

    const handleVoiceSearch = () => {
        if (!recognition) {
            alert('Speech recognition is not supported in your browser');
            return;
        }

        setIsListening(true);
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            setIsListening(false);
        };
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            alert('Error occurred in voice recognition. Please try again.');
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleTextSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <section className="all-courses-area section-py-120">
            <div className="container">
                <div className="row">
                    <CourseSidebar setFilters={setFilters} />
                    <div className="col-xl-9 col-lg-8">
                        <CourseTop
                            startOffset={startOffset}
                            endOffset={Math.min(endOffset, totalItems)}
                            totalItems={totalItems}
                            handleTabClick={handleTabClick}
                            activeTab={activeTab}
                            setCourses={(courses) => dispatch(setCourses(courses))}
                        />
                        <div className="search-container mb-3">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={handleTextSearch}
                                />
                                <button
                                    className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
                                    onClick={handleVoiceSearch}
                                    disabled={isListening || isLoading}
                                >
                                    {isListening ? (
                                        <span>Listening...</span>
                                    ) : (
                                        <i className="fas fa-microphone"></i>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button onClick={proceedToCheckout} className="btn m-4" disabled={isLoading}>
                                Proceed to Checkout ({cart.length} items)
                            </button>
                            <button
                                onClick={getCoursesByLocation}
                                className="btn"
                                disabled={isLoading}
                                title="Filter by Location"
                            >
                                {isLoading ? (
                                    <i className="fas fa-spinner fa-spin"> Get courses by location</i>
                                ) : (
                                    <i className="fas fa-map-marker-alt"> Get courses by location</i>
                                )}
                            </button>

                            {/* ✅ Bouton de recommandation IA */}
                            <button
                                onClick={getRecommendedCourses}

                                className="btn btn-success m-4"
                                disabled={isLoading}
                                title="Get AI-based course recommendations"
                            >
                                {isLoading ? (
                                    <i className="fas fa-spinner fa-spin"> Recommending...</i>
                                ) : (
                                    <i className="fas fa-brain"> Recommended for You</i>
                                )}
                            </button>
                        </div>
                        <div className="tab-content" id="myTabContent">
                            <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`} id="grid" role="tabpanel" aria-labelledby="grid-tab">
                                {isLoading ? (
                                    <div>Loading courses...</div>
                                ) : currentItems.length === 0 ? (
                                    <p>No courses available.</p>
                                ) : (
                                    <div className="row courses__grid-wrap row-cols-1 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-1">
                                        {currentItems.map((item) => (
                                            <div key={item._id} className="col">
                                                <div className="courses__item shine__animate-item">
                                                    <div className="courses__item-thumb">
                                                        <Link to={`/course-details/${item._id}`} className="shine__animate-link">
                                                            <img
                                                                src={item.thumb?.startsWith('http') ? item.thumb : `${BASE_URL}${item.thumb}`}
                                                                alt={item.title}
                                                                onError={(e) => (e.currentTarget.src = `${BASE_URL}/Uploads/default.jpg`)}
                                                            />
                                                        </Link>
                                                    </div>
                                                    <div className="courses__item-content">
                                                        <ul className="courses__item-meta list-wrap">
                                                            <li className="courses__item-tag">
                                                                <Link to="/courses">{item.category}</Link>
                                                            </li>
                                                            <li className="avg-rating"><i className="fas fa-star"></i> ({item.rating} Reviews)</li>
                                                        </ul>
                                                        <h5 className="title"><Link to={`/course-details/${item._id}`}>{item.title}</Link></h5>
                                                        <p className="author">By <Link to="#">{item.instructors}</Link></p>
                                                        <div className="courses__item-bottom">
                                                            <div className="button">
                                                                <button onClick={() => dispatch(addToCart(item))} className="btn">
                                                                    Buy
                                                                </button>
                                                            </div>
                                                            <h5 className="price">${item.price}.00</h5>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <nav className="pagination__wrap mt-30">
                                    <ReactPaginate
                                        breakLabel="..."
                                        onPageChange={handlePageClick}
                                        pageRangeDisplayed={3}
                                        pageCount={pageCount}
                                        renderOnZeroPageCount={null}
                                        className="list-wrap"
                                    />
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CourseArea;