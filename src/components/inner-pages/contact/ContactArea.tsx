import ContactForm from "../../../forms/ContactForm"
import InjectableSvg from "../../../hooks/InjectableSvg"

const ContactArea = () => {
   return (
       <section className="contact-area section-py-120">
          <div className="container">
             <div className="row">
                <div className="col-lg-4">
                   <div className="contact-info-wrap">
                      <ul className="list-wrap">
                         <li>
                            <div className="icon">
                               <InjectableSvg src="assets/img/icons/map.svg" alt="img" className="injectable" />
                            </div>
                            <div className="content">
                               <h4 className="title">Address</h4>
                               <p>Esprit engereerig <br /> Tunis, TN</p>
                            </div>
                         </li>
                         <li>
                            <div className="icon">
                               <InjectableSvg src="assets/img/icons/contact_phone.svg" alt="img" className="injectable" />
                            </div>
                            <div className="content">
                               <h4 className="title">Phone</h4>
                               <a href="tel:+216 93038483">+216 93038483 </a>
                               <a href="tel:+216 93038483">+216 93038483</a>
                            </div>
                         </li>
                         <li>
                            <div className="icon">
                               <InjectableSvg src="assets/img/icons/emial.svg" alt="img" className="injectable" />
                            </div>
                            <div className="content">
                               <h4 className="title">E-mail Address</h4>
                               <a href="mailto:info@gmail.com">edAdvance@gmail.com</a>
                               <a href="mailto:info@gmail.com">edAdvance@gmail.com</a>
                            </div>
                         </li>
                      </ul>
                   </div>
                </div>

                <div className="col-lg-8">
                   <div className="contact-form-wrap">
                      <h4 className="title">Send Us Message</h4>
                      <p>Your email address will not be published. Required fields are marked *</p>
                      <ContactForm />
                      <p className="ajax-response mb-0"></p>
                   </div>
                </div>
             </div>
             <div className="contact-map">
                <iframe   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3190.5642858207013!2d10.186732415716457!3d36.89910507993609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12e2cb75abbb1733%3A0x557a99cdf6c13b7b!2sESPRIT!5e0!3m2!1sfr!2stn!4v1684309529719!5m2!1sfr!2stn"
                          style={{ border: '0' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
             </div>
          </div>
       </section>
   )
}

export default ContactArea
