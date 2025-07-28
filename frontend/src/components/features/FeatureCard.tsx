import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-purple-600 mb-4 text-3xl">{icon}</div>
      <h3 className="text-xl font-semibold text-purple-600 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};