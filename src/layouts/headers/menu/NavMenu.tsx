import { Link } from "react-router-dom";
import menu_data from "../../../data/home-data/MenuData";
import { useEffect, useState } from "react";

const NavMenu = () => {
   const [navClick, setNavClick] = useState<boolean>(false);

   useEffect(() => {
      window.scrollTo(0, 0);
   }, [navClick]);

   return (
      <ul className="navigation">
         {menu_data.map((menu) => (
            <li key={menu.id} >
               <Link style={{color:"#fff"}} onClick={() => setNavClick(!navClick)} to={menu.link}>{menu.title}</Link>
             
            </li>
         ))}
      </ul>
   );
};

export default NavMenu;
