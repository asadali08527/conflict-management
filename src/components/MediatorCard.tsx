interface MediatorCardProps {
  name: string;
  credentials: string;
  specialization: string;
  experience: string;
  image: string;
}

const MediatorCard = ({ name, credentials, specialization, experience, image }: MediatorCardProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card p-6 text-center transition-all duration-300 hover:-translate-y-1">
      <img 
        src={image} 
        alt={name}
        className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-primary/10"
      />
      <h3 className="text-xl font-semibold text-card-foreground mb-2">
        {name}
      </h3>
      <p className="text-primary font-medium mb-3">
        {credentials}
      </p>
      <p className="text-muted-foreground text-sm mb-2">
        <strong>Specialization:</strong> {specialization}
      </p>
      <p className="text-muted-foreground text-sm">
        <strong>Experience:</strong> {experience}
      </p>
    </div>
  );
};

export default MediatorCard;