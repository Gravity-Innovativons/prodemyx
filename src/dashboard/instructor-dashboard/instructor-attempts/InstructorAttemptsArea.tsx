import DashboardBanner from "../../dashboard-common/DashboardBanner"
import DashboardSidebar from "../../dashboard-common/DashboardSidebar"
import InstructorAttemptsContent from "./InstructorAttemptsContent"

const InstructorAttemptsArea = () => {
  return (
    <section className="dashboard__area section-pb-120">
         <div className="dashboard__bg"><img src="/assets/img/bg/dashboard_bg.jpg" alt=""/></div>
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <InstructorAttemptsContent />
          </div>
        </div>
      </div>
    </section>
  )
}

export default InstructorAttemptsArea
