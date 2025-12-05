
import BreadcrumbOne from "../../../common/breadcrumb/BreadcrumbOne"
import InstructorArea from "./InstructorArea"

const Instructors = () => {
   return (
      <>
         <main className="main-area fix">
            <BreadcrumbOne title="All Instructors" sub_title="Instructors" />
            <InstructorArea />
         </main>
      </>
   )
}

export default Instructors
