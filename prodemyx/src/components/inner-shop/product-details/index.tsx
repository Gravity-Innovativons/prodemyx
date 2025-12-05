
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import ProductDetailsArea from "./ProductDetailsArea"

const ProductDetails = () => {
  return (
    <>
     
      <main className="main-area fix">
        <BreadcrumbOne title="Shop Details" sub_title="Shop Details" />
        <ProductDetailsArea />
      </main>
      
    </>
  )
}

export default ProductDetails
