
import AppRouterAdmin from "../../routes/AppRouterAdmin";
import Sidebar from "../../components/Sidebar";

const DashboardAdmin = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="content">
                <AppRouterAdmin />
            </div>
        </div>
    );
};

export default DashboardAdmin;