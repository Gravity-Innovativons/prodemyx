
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import ProductArea from "./ProductArea"

const Product = () => {
   return (
      <>
         <main className="main-area fix">
            <BreadcrumbOne title="Shop Page" sub_title="Shop Page" />
            <ProductArea />
         </main>
      </>
   )
}

export default Product
