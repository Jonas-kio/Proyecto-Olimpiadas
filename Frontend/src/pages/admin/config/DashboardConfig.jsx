import { useState } from 'react';


import MainContent from '../../../components/layout/MainContent';
import Tabs from '../../../components/ui/Tabs';
import ContentConfig from '../../../components/layout/ContentConfig';
import Areas from './Areas';
//import Configuracion from './Configuracion';
import CostosConfiguracion from './CostosConfiguracion';
import NivelesYCategorias from './NivelesYCategorias';

const DashboardConfig = () => {
    const [activeTab, setActiveTab] = useState('areas');

    // Definición de tabs
    const tabs = [
        { id: 'areas', label: 'Áreas' },
        { id: 'levels', label: 'Niveles o Categoria' },
        { id: 'costs', label: 'Costos' },
    ];

    const renderContent = () => {
    switch (activeTab) {
      case "areas":
        return <Areas />;
      case "levels":
        return <NivelesYCategorias/>;
      case "costs":
        return <CostosConfiguracion/>;
      default:
        return <Areas />;
    }
  };

    
    return (
        
        <div className="Config-Panel">
            <MainContent 
                title="Panel de Administración" 
                subtitle="Gestión de olimpiadas"
            >
                <Tabs 
                    tabs={tabs} 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                />
                <ContentConfig>
                    {renderContent()}
                </ContentConfig>
            </MainContent> 
        </div>
    );
}

export default DashboardConfig;