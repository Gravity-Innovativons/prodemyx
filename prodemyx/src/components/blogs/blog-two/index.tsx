
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne";
import BlogArea from "../blog/BlogArea"

const BlogTwo = () => {
   return (
      <>
         
         <main className="main-area fix">
            <BreadcrumbOne title="Blog Left Sidebar" sub_title="Blogs" />
            <BlogArea style_1={true} />
         </main>
        
      </>
   )
}

export default BlogTwo;

