interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

const TestimonialCard = ({ quote, author, role, avatar }: TestimonialCardProps) => {
  return (
    <div className="bg-card rounded-3xl shadow-soft p-8 relative">
      <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <span className="text-primary-foreground text-lg font-bold">"</span>
      </div>
      <p className="text-muted-foreground italic mb-6 leading-relaxed">
        {quote}
      </p>
      <div className="flex items-center">
        <img 
          src={avatar} 
          alt={author}
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <div className="text-card-foreground font-medium">{author}</div>
          <div className="text-muted-foreground text-sm">{role}</div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;