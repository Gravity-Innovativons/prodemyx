
import BreadcrumbOne from "../../../common/breadcrumb/BreadcrumbOne"
import EventDetailsArea from "./EventDetailsArea"

const EventDetails = () => {
   return (
      <>
         <main className="main-area fix">
            <BreadcrumbOne title="Resolving Conflicts Between Designers" sub_title="Events" sub_title_2="Resolving Conflicts Between Designers" style={true} />
            <EventDetailsArea />
         </main>
      </>
   )
}

export default EventDetails

