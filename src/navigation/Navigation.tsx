import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Home from '../pages/Home';
import HomeTwo from '../pages/HomeTwo';
import HomeEight from '../pages/HomeEight';
import HomeSeven from '../pages/HomeSeven';
import HomeSix from '../pages/HomeSix';
import HomeFive from '../pages/HomeFive';
import HomeFour from '../pages/HomeFour';
import HomeThree from '../pages/HomeThree';
import Course from '../pages/Course';
import Lesson from '../pages/Lesson';
import CourseDetails from '../pages/CourseDetails';
import About from '../pages/About';
import Instructor from '../pages/Instructor';
import InstructorDetails from '../pages/InstructorDetails';
import Event from '../components/inner-pages/events/event/index.tsx';
import EventDetails from '../pages/EventDetails';
import Shop from '../pages/Shop';
import ShopDetails from '../pages/ShopDetails';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import QuizForm from '../dashboard/instructor-dashboard/instructor-enrolled-courses/AddQuiz';
import QuizComponent from '../components/Quiz/Quiz.tsx';
import CheckOut from '../pages/CheckOut';
import Blog from '../pages/Blog';
import BlogTwo from '../pages/BlogTwo';
import BlogThree from '../pages/BlogThree';
import BlogDetails from '../pages/BlogDetails';
import Login from '../pages/Login';
import Registration from '../pages/Registration';
import Contact from '../pages/Contact';
import InstructorDashboard from '../pages/InstructorDashboard';
import InstructorProfile from '../pages/InstructorProfile';
import InstructorEnrollCourse from '../pages/InstructorEnrolledCourses';
import InstructorWishlist from '../pages/InstructorWishlist';
import InstructorReview from '../pages/InstructorReview';
import InstructorQuiz from '../pages/InstructorQuiz';
import InstructorHistory from '../pages/InstructorHistory';
import InstructorCourses from '../pages/InstructorCourses';
import InstructorAnnouncement from '../pages/InstructorAnnouncement';
import InstructorAssignment from '../pages/InstructorAssignment';
import InstructorSetting from '../pages/InstructorSetting';
import InstructorAttempt from '../pages/InstructorAttempt';
import StudentDashboard from '../pages/StudentDashboard';
import StudentProfile from '../pages/StudentProfile';
import StudentEnrollCourse from '../pages/StudentEnrolledCourses';
import StudentWishlist from '../pages/StudentWishlist';
import StudentReview from '../pages/StudentReview';
import StudentAttempt from '../pages/StudentAttempt';
import StudentHistory from '../pages/StudentHistory';
import StudentSetting from '../pages/StudentSetting';
import NotFound from '../pages/NotFound';
import Forbidden from '../pages/Forbidden';
import ForgotPassword from "../forms/ForgotPasswordForm.tsx";
import ResetPassword from "../forms/ResetPasswordForm.tsx";
import FaceRegister from "../forms/FaceRegister.tsx";
import FaceLogin from "../forms/FaceLoginForm.tsx";
import JitsiMeet from "../components/meeting/Meeting.tsx";
import GitHubRepos from "../components/external-lms/GitHubRepos.tsx";
import ClassroomCourses from "../components/external-lms/ClassroomCourses.tsx";
import GlobalChat from "../components/external-lms/GlobalChat.tsx";
import  ResumePage from '../components/inner-pages/resume/resume.tsx';
import AdminReclamations from '../components/Reclamation/AdminReclmations.tsx';

const AppNavigation = () => {
  return (
    <AuthProvider>
      <Router basename="/">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home-two" element={<HomeTwo />} />
          <Route path="/home-three" element={<HomeThree />} />
          <Route path="/AddQuiz/:courseId" element={<QuizForm />} />
          <Route path="/quiz/:id" element={<QuizComponent />} />
          <Route path="/home-four" element={<HomeFour />} />
          <Route path="/home-five" element={<HomeFive />} />
          <Route path="/home-six" element={<HomeSix />} />
          <Route path="/home-seven" element={<HomeSeven />} />
          <Route path="/home-eight" element={<HomeEight />} />
          <Route path="/courses" element={<Course />} />
          <Route path="/course-details" element={<CourseDetails />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/instructors" element={<Instructor />} />
          <Route path="/instructor-details" element={<InstructorDetails />} />
          <Route path="/event" element={<Event />} />
          <Route path="/events-details/:id" element={<EventDetails />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop-details" element={<ShopDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/check-out" element={<CheckOut />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog-2" element={<BlogTwo />} />
          <Route path="/blog-3" element={<BlogThree />} />
          <Route path="/blog-details" element={<BlogDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/FaceRegister" element={<FaceRegister setIsRegistering={() => {}} />} />
          <Route path="/FaceLogin" element={<FaceLogin />} />
          <Route path="/Meet" element={<JitsiMeet />} />
          <Route path="/GitHubRepos" element={<GitHubRepos />} />
          <Route path="/ClassroomCourses" element={<ClassroomCourses />} />
          <Route path="/Chat" element={<GlobalChat />} />
          <Route path="/course-details/:id" element={<CourseDetails />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          {/* <Route path="/blog-details/:id" element={<DynamicBlogDeatils />} /> */}
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/Reclamations" element={<AdminReclamations />} />

          {/* Instructor Dashboard Routes */}
          <Route
            path="/instructor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-profile"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-enrolled-courses"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorEnrollCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-wishlist"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorWishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-review"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-attempts"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorAttempt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-history"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-courses"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-announcement"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorAnnouncement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-quiz"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-assignment"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-setting"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]} redirectTo="/not-found">
                <InstructorSetting />
              </ProtectedRoute>
            }
          />

          {/* Student Dashboard Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]} redirectTo="/not-found">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-profile"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]} redirectTo="/not-found">
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-enrolled-courses"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]} redirectTo="/not-found">
                <StudentEnrollCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-wishlist"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]} redirectTo="/not-found">
                <StudentWishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-review"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]} redirectTo="/not-found">
                <StudentReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-attempts"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]} redirectTo="/not-found">
                <StudentAttempt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-history"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]} redirectTo="/not-found">
                <StudentHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-setting"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]} redirectTo="/not-found">
                <StudentSetting />
              </ProtectedRoute>
            }
          />

          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppNavigation;