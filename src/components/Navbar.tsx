import React from 'react';
import Logo from './Logo';
import ProfileMenu from './ProfileMenu';

const Navbar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <ProfileMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;