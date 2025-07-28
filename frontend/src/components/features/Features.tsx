import { FeatureCard } from './FeatureCard';
import { FileIconPurple, LightningIcon, CheckIcon } from '../../components/Icons';
import IconWrapper from './IconWrapper';


export const Features = () => {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-purple-800 text-center mb-12">
        Why Choose InvoiceExtract?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={
            <IconWrapper color="#9B51E0">
              <FileIconPurple />
            </IconWrapper>
          }
          title="Accurate Extraction"
          description="Extract data from invoices with high accuracy using AI"
        />
        <FeatureCard
          icon={
            <IconWrapper color="#F2C94C">
              <LightningIcon />
            </IconWrapper>
          }
          title="Lightning Fast"
          description="Process hundreds of invoices in minutes, not hours"
        />
        <FeatureCard
          icon={
            <IconWrapper color="#27AE60">
              <CheckIcon />
            </IconWrapper>
          }
          title="Easy Integration"
          description="Seamlessly integrate with your existing workflow"
        />
      </div>
    </section>
  );
};
