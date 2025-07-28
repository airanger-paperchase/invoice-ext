import React from 'react';

interface StatCardProps {
  value: string;
  label: string;
  bgColor: string;
  textColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} p-6 rounded-lg text-center transition-transform hover:scale-105`}>
      <div className={`text-3xl font-bold ${textColor} mb-2`}>{value}</div>
      <div className={`text-lg ${textColor}`}>{label}</div>
    </div>
  );
};