import React from 'react';

const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`flex justify-center items-center p-8 ${className}`}>
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );
};

export default LoadingSpinner;
