import { Link } from "react-router-dom"

const FooterCommon = () => {
   return (
      <>
         <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="footer__widget">
               <div className="logo mb-35">
                  <Link to="/"><img src="/assets/img/logo/secondary_logo.svg" alt="img" /></Link>
               </div>
               <div className="footer__content">
                  <p>a smart system that links our LMS with Moodle, Blackboard, and GitHub Classroom to track progress and offer personalized recommendations.</p>
                  <ul className="list-wrap">
                     <li>Ariana , Tunisia</li>
                     <li>+216 34 900 456</li>
                  </ul>
               </div>
            </div>
         </div>
         <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">

         </div>
         <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <div className="footer__widget">
               <h4 className="footer__widget-title">Our Company</h4>
               <div className="footer__link">
                  <ul className="list-wrap">
                     <li><Link to="/contact">Contact Us</Link></li>
                     <li><Link to="/instructor-details">Become Teacher</Link></li>

                     <li><Link to="/instructor-details">Instructor</Link></li>
                     <li><Link to="/events-details">Events</Link></li>
                  </ul>
               </div>
            </div>
         </div>
      </>
   )
}

export default FooterCommon
