import React from 'react';

interface StatCardProps {
  value: string;
  label: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, bgColor }) => {
  return (
    <div className={`${bgColor} p-6 rounded-lg text-center transition-transform hover:scale-105`}>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-lg">{label}</div>
    </div>
  );
};

export const Dashboard = () => {
  return (
    <section className="">
      <h2 className="text-3xl font-bold text-purple-800 text-center mb-12">
        Invoice Analytics
      </h2>
      <div className="bg-purple-500 rounded-xl p-6 mb-8">
        <h3 className="text-2xl text-white mb-8">Invoice Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            value="152"
            label="Invoices Processed"
            bgColor="bg-blue-100 text-blue-600"
          />
          <StatCard
            value="₹45,678"  // Use ₹ instead of $  
            label="Total Amount"
            bgColor="bg-green-100 text-green-600"
          />
          <StatCard
            value="98%"
            label="Accuracy Rate"
            bgColor="bg-yellow-100 text-yellow-600"
          />
        </div>
      </div>
    </section>
  );
};