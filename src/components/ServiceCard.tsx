import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const ServiceCard = ({ icon: Icon, title, description, gradient }: ServiceCardProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-coral-glow/20">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-card-foreground mb-4">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default ServiceCard;