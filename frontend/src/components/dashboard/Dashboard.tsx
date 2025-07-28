import { StatCard } from './StatCard';

export const Dashboard = () => {
  return (
    <section className="">
      <h2 className="text-3xl font-bold text-purple-800 text-center mb-12">
        Invoice Analytics
      </h2>
      <div className="bg-purple-600 rounded-xl p-6 mb-8">
        <h3 className="text-2xl text-white mb-8">Invoice Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            value="152"
            label="Invoices Processed"
            bgColor="bg-blue-100"
            textColor="text-blue-600"
          />
          <StatCard
            value="₹45,678"
            label="Total Amount"
            bgColor="bg-green-100"
            textColor="text-green-600"
          />
          <StatCard
            value="98%"
            label="Accuracy Rate"
            bgColor="bg-yellow-100"
            textColor="text-yellow-600"
          />
        </div>
      </div>
    </section>
  );
};