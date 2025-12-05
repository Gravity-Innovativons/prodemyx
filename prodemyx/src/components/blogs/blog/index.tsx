import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import BlogArea from "./BlogArea"

const Blog = () => {
   return (
      <>
        
         <main className="main-area fix">
            <BreadcrumbOne title="Latest Right Sidebar" sub_title="Blogs" />
            <BlogArea style_1={false} />
         </main>
      </>
   )
}

export default Blog

