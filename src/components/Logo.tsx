import React from 'react';
import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <Gift className="w-6 h-6 text-rose-500" />
      <span className="text-xl font-semibold text-gray-900 dark:text-white">Gifta</span>
    </Link>
  );
};

export default Logo;