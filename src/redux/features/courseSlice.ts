import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Define Course interface matching the backend Course model
export interface Course {
  id: string; // Maps to _id from backend
  _id: string; // Keep _id for consistency
  title: string;
  price: number;
  description: string;
  category: string;
  instructors: string;
  rating: number;
  thumb: string;
  skill_level: string;
  price_type: string;
  language: string;
  popular: boolean;
  programmingLanguage: string;
  aiTutorVideo?: string;
}

interface CourseState {
  courses: Course[];
  cart: Course[];
}

const initialState: CourseState = {
  courses: [],
  cart: [],
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<Course[]>) => {
      // Map backend courses to include `id` as `_id`
      state.courses = action.payload.map(course => ({
        ...course,
        id: course._id,
      }));
    },
    addToCart: (state, action: PayloadAction<Course>) => {
      state.cart.push({ ...action.payload, id: action.payload._id });
    },
    clearCart: (state) => {
      state.cart = [];
    },
  },
});

export const { setCourses, addToCart, clearCart } = courseSlice.actions;

export const selectCourses = (state: RootState) => state.courses.courses;
export const selectCart = (state: RootState) => state.courses.cart;

export default courseSlice.reducer;