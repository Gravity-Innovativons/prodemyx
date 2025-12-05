import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import BlogDetailsArea from "./BlogDetailsArea"

const BlogDetails = () => {
   return (
      <>
         <main className="main-area fix">
            <BreadcrumbOne title="Blog Details" sub_title="Blogs" sub_title_2="How To Become idiculously Self-Aware In 20 Minutes" style={true} />
            <BlogDetailsArea />
         </main>
      </>
   )
}

export default BlogDetails

