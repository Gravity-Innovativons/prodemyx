
import BreadcrumbOne from "../../../common/breadcrumb/BreadcrumbOne"
import EventArea from "./EventArea"

const Event = () => {
   return (
      <>
         <main className="main-area fix">
            <BreadcrumbOne title="All Events" sub_title="Events" />
            <EventArea />
         </main>
         
      </>
   )
}

export default Event

