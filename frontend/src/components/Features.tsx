import { FeatureCard } from './FeatureCard';
import { DocumentIcon, LightningIcon } from './Icons';

export const Features = () => {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-purple-800 text-center mb-12">
        Why Choose InvoiceExtract?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        <FeatureCard
          icon={<DocumentIcon />}
          title="Accurate Extraction"
          description="Extract data from invoices with high accuracy using AI"
        />
        <FeatureCard
          icon={<LightningIcon />}
          title="Lightning Fast"
          description="Process hundreds of invoices in minutes, not hours"
        />
        {/* <FeatureCard
          icon={<CheckCircleIcon />}
          title="Easy Integration"
          description="Seamlessly integrate with your existing workflow"
        /> */}
      </div>
    </section>
  );
};