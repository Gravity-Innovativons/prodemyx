import { Link } from "react-router-dom"

const FooterCommon = () => {
   return (
      <>
         <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="footer__widget">
               <div className="logo mb-35">
                  <Link to="/"><img src="/assets/img/logo/logo.png" alt="img" /></Link>
               </div>
               <div className="footer__content">
                  <p>when an unknown printer took galley of type and scrambled it to make pspecimen bookt has.</p>
                  <ul className="list-wrap">
                     <li>463 7th Ave, NY 10018, USA</li>
                     <li>+123 88 9900 456</li>
                  </ul>
               </div>
            </div>
         </div>
         <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <div className="footer__widget">
               <h4 className="footer__widget-title">Useful Links</h4>
               <div className="footer__link">
                  <ul className="list-wrap">
                     <li><Link to="/">Our values</Link></li>
                     <li><Link to="/">Our advisory board</Link></li>
                     <li><Link to="/">Our partners</Link></li>
                     <li><Link to="/">Become a partner</Link></li>
                     <li><Link to="/">Work at Future Learn</Link></li>
                     <li><Link to="/">Quizlet Plus</Link></li>
                  </ul>
               </div>
            </div>
         </div>
         <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <div className="footer__widget">
               <h4 className="footer__widget-title">Our Company</h4>
               <div className="footer__link">
                  <ul className="list-wrap">
                     <li><Link to="/">Contact Us</Link></li>
                     <li><Link to="/">Become Teacher</Link></li>
                     <li><Link to="/">Blog</Link></li>
                     <li><Link to="/">Instructor</Link></li>
                     <li><Link to="/">Events</Link></li>
                  </ul>
               </div>
            </div>
         </div>
      </>
   )
}

export default FooterCommon
