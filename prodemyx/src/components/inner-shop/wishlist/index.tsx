
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import WishlistArea from "./WishlistArea"

const Wishlist = () => {
   return (
      <>
         
         <main className="main-area fix">
            <BreadcrumbOne title="Wishlist" sub_title="Wishlist" />
            <WishlistArea />
         </main>
      
      </>
   )
}

export default Wishlist
