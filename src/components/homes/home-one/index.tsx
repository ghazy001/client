import Banner from "./Banner"
import CourseArea from "./CourseArea"
import Instructor from "./Instructor"
import Counter from "./Counter"

import Categories from "./Categories"
import HeaderOne from "../../../layouts/headers/HeaderOne"

import FooterOne from "../../../layouts/footers/FooterOne"
import Leaderboard from "../Leaderboard";

const HomeOne = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <Banner />

            <Leaderboard />
             <Categories />

            <CourseArea style={false} />







         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default HomeOne
