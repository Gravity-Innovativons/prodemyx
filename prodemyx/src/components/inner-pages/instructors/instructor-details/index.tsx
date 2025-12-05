
import BreadcrumbTwo from "../../../common/breadcrumb/BreadcrumbTwo"
import InstructorDetailsArea from "./InstructorDetailsArea"

const InstructorsDetails = () => {
   return (
      <>
         <main className="main-area fix">
            <BreadcrumbTwo title="Robert Fox" sub_title="Instructors" />
            <InstructorDetailsArea />
         </main>
      </>
   )
}

export default InstructorsDetails
