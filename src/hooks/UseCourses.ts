import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCourses } from "../redux/features/courseSlice";

const BASE_URL = "http://localhost:3000";

const UseCourses = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${BASE_URL}/course/getCoursesByRole`, {
          method: "GET",
          credentials: "include", // Include session cookies
        });
        const data = await response.json();
        console.log("Fetched courses by role:", data);

        if (response.ok) {
          dispatch(setCourses(data));
        } else {
          console.error("Failed to fetch courses:", data.message || data.error);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [dispatch]);
};

export default UseCourses;