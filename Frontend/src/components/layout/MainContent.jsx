import React from 'react';
import Header from './Header';

const MainContent = ({ title, subtitle, children }) => {
  return (
    <div className="main-content">
      <Header title={title} subtitle={subtitle} />
      {children}
    </div>
  );
};

export default MainContent;