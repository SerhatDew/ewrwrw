import React from 'react';

interface DashboardCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  loading?: boolean;
}

const DashboardCard = ({
  title,
  value,
  description,
  icon,
  loading = false,
}: DashboardCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              {loading ? (
                <div className="animate-pulse mt-1">
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              )}
            </dd>
          </dl>
        </div>
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;