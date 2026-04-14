import React from 'react';

import PropTypes from 'prop-types';

const BaseContainer = ({ children, showWelcomeBanner, fullName }) => (
  <div className="w-full min-h-screen bg-[#FDFDFB] relative overflow-hidden flex flex-col items-center justify-center font-sans">
    <div className="fixed top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 z-0" />
    <div className="fixed top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-action-gold/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 z-0" />

    <div className="relative z-10 w-full flex flex-col items-center p-4">
      {children}
    </div>
  </div>
);

BaseContainer.defaultProps = {
  showWelcomeBanner: false,
  fullName: null,
};

BaseContainer.propTypes = {
  children: PropTypes.node.isRequired,
  showWelcomeBanner: PropTypes.bool,
  fullName: PropTypes.string,
};

export default BaseContainer;
