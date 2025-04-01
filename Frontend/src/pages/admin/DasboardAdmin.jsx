
import AppRouterAdmin from "../../routes/AppRouterAdmin";
import Sidebar from "../../components/Sidebar";
import MainContent from "../../components/layout/MainContent";

const DashboardAdmin = () => {
    return (
        <div className="app-container">

            <Sidebar />
            
            <div className="content">
                <MainContent 
                    title="Panel de Administración" 
                    subtitle="Gestión de olimpiadas"
                >
                    <AppRouterAdmin />
                </MainContent>
            </div>
        </div>
    );
};

export default DashboardAdmin;