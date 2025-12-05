
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import CourseArea from "./CourseArea"

const Course = () => {
   return (
      <>
         <main className="main-area fix">
            <BreadcrumbOne title="All Courses" sub_title="Courses" sub_title_2="" style={false} />
            <CourseArea />
         </main>
      </>
   )
}

export default Course
