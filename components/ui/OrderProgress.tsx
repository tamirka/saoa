import React from 'react';

interface OrderProgressProps {
  history: { status: string; date: string; }[];
  currentStatus: string;
}

const ALL_STATUSES = ['Pending', 'In Production', 'Shipped', 'Delivered'];

const OrderProgress: React.FC<OrderProgressProps> = ({ history, currentStatus }) => {
  const currentStatusIndex = ALL_STATUSES.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {ALL_STATUSES.map((status, index) => {
          const isActive = index <= currentStatusIndex;
          const isLast = index === ALL_STATUSES.length - 1;
          
          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                  {isActive ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <p className={`mt-2 text-xs text-center font-medium ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>{status}</p>
              </div>
              {!isLast && <div className={`flex-1 h-1 transition-colors ${isActive ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}></div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgress;