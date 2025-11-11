import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ServiceCard from "@/components/ServiceCard";
import TestimonialCard from "@/components/TestimonialCard";
import MediatorCard from "@/components/MediatorCard";
import { 
  Heart, 
  Home, 
  Building2, 
  Users, 
  Scale, 
  Shield,
  Clock,
  Award,
  CheckCircle,
  MessageCircle,
  Ear,
  Handshake,
  TrendingUp
} from "lucide-react";

import heroMediationImage from "@/assets/hero-mediation.jpg";
import mediator1Image from "@/assets/mediator-1.jpg";
import mediator2Image from "@/assets/mediator-2.jpg";
import handshakeImage from "@/assets/handshake-success.jpg";

const ConflictMediationLanding = () => {
  const { openAuthModal, user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="min-h-screen bg-hero-gradient flex items-center relative overflow-hidden">
        {/* Organic blob decorations */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[400px] bg-gradient-to-br from-lavender/25 to-coral/20 rounded-[100px] opacity-60 blur-2xl rotate-12" />
        <div className="absolute top-20 right-10 w-64 h-48 bg-gradient-to-bl from-mint/30 to-coral/15 rounded-[80px] opacity-70 rotate-45" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-mint/25 to-lavender/20 rounded-[120px] opacity-50 blur-xl -rotate-12" />
        <div className="absolute bottom-32 left-20 w-48 h-32 bg-gradient-to-r from-coral/25 to-mint/15 rounded-[60px] opacity-60 rotate-12" />
        <div className="absolute top-1/2 left-1/4 w-32 h-24 bg-gradient-to-br from-lavender/20 to-mint/15 rounded-[40px] opacity-40 -rotate-45" />
        
        {/* Peace dove illustration using CSS */}
        <div className="absolute top-20 left-1/3 w-20 h-16 opacity-30">
          <div className="relative">
            <div className="absolute w-10 h-8 bg-gradient-to-r from-coral/50 to-mint/40 rounded-full transform rotate-12 blur-sm"></div>
            <div className="absolute top-2 left-3 w-8 h-6 bg-gradient-to-l from-lavender/45 to-coral/35 rounded-full transform -rotate-45 blur-sm"></div>
            <div className="absolute top-1 left-6 w-6 h-4 bg-gradient-to-r from-mint/40 to-lavender/30 rounded-full transform rotate-30 blur-sm"></div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-tight">
                  Resolve Conflicts <span className="text-primary">Peacefully</span>, Privately, and Professionally
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Connect with certified mediators to solve disputes outside court. Confidential, affordable, and effective conflict resolution for families, relationships, and businesses.
                </p>
              </div>
              
              <div className="space-y-4">
                {user ? (
                  <Button variant="hero" onClick={() => navigate('/submit-case')}>
                    Submit Your Case
                  </Button>
                ) : (
                  <Button variant="hero" onClick={() => openAuthModal('register')}>
                    Start Free Consultation
                  </Button>
                )}
                
                <div className="flex flex-wrap gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Over 500 conflicts resolved
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    98% success rate
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Complete confidentiality
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroMediationImage} 
                alt="Professional mediation consultation"
                className="w-full rounded-2xl shadow-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Decorative organic shapes */}
        <div className="absolute -top-20 right-10 w-72 h-48 bg-gradient-to-bl from-coral/20 to-lavender/15 rounded-[80px] opacity-60 rotate-45 blur-xl" />
        <div className="absolute bottom-10 -left-20 w-64 h-40 bg-gradient-to-tr from-mint/25 to-coral/15 rounded-[90px] opacity-50 -rotate-12 blur-lg" />
        <div className="absolute top-1/2 right-1/4 w-40 h-28 bg-gradient-to-br from-lavender/18 to-mint/12 rounded-[50px] opacity-45 rotate-12" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative overflow-hidden rounded-2xl bg-soft-pink p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4">
                Court battles are expensive, public, and emotionally draining
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-coral rounded-full mt-2 flex-shrink-0" />
                  Average legal fees: $15,000-$50,000+ per case
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-coral rounded-full mt-2 flex-shrink-0" />
                  Public court records damage privacy
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-coral rounded-full mt-2 flex-shrink-0" />
                  Process takes 6 months to 2+ years
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-coral rounded-full mt-2 flex-shrink-0" />
                  Adversarial approach destroys relationships
                </li>
              </ul>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl bg-soft-blue p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4">
                Our platform offers a better way
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-mint mt-0.5 flex-shrink-0" />
                  80% less expensive than court proceedings
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-mint mt-0.5 flex-shrink-0" />
                  Completely private and confidential
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-mint mt-0.5 flex-shrink-0" />
                  Average resolution in 4-6 weeks
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-mint mt-0.5 flex-shrink-0" />
                  Win-win solutions that preserve relationships
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-secondary relative overflow-hidden">
        {/* Organic background elements */}
        <div className="absolute top-20 -left-32 w-80 h-56 bg-gradient-to-r from-lavender/18 to-mint/15 rounded-[100px] opacity-70 rotate-12 blur-2xl" />
        <div className="absolute -bottom-20 right-20 w-96 h-64 bg-gradient-to-l from-coral/20 to-lavender/15 rounded-[120px] opacity-60 -rotate-12 blur-xl" />
        <div className="absolute top-1/2 right-10 w-40 h-28 bg-gradient-to-bl from-mint/20 to-coral/10 rounded-[50px] opacity-50 rotate-45" />
        <div className="absolute top-10 left-1/3 w-56 h-36 bg-gradient-to-tr from-coral/15 to-mint/12 rounded-[70px] opacity-45 -rotate-30" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
              Conflicts We Resolve
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our certified mediators specialize in various types of disputes, providing expert guidance for lasting resolution.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={Heart}
              title="Marriage & Relationship Conflicts"
              description="Save your relationship with professional guidance through communication challenges and personal disputes."
              gradient="from-coral to-coral-light"
            />
            <ServiceCard
              icon={Home}
              title="Family Disputes"
              description="Resolve sibling, inheritance, and family business conflicts with compassionate mediation."
              gradient="from-mint to-mint-light"
            />
            <ServiceCard
              icon={Building2}
              title="Property & Land Issues"
              description="Settle boundary, ownership, and property disputes without lengthy court battles."
              gradient="from-lavender to-lavender-light"
            />
            <ServiceCard
              icon={Users}
              title="Business Conflicts"
              description="Partnership, contract, and workplace mediation for professional relationships."
              gradient="from-coral-light to-coral"
            />
            <ServiceCard
              icon={Home}
              title="Neighbor Disputes"
              description="Peaceful resolution for community conflicts and neighborhood disagreements."
              gradient="from-mint-light to-mint"
            />
            <ServiceCard
              icon={Scale}
              title="Divorce & Custody"
              description="Child-focused mediation for separating families with minimal emotional trauma."
              gradient="from-lavender-light to-lavender"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 relative overflow-hidden">
        {/* Flowing organic decorations */}
        <div className="absolute -top-16 left-1/4 w-60 h-40 bg-gradient-to-br from-mint/22 to-coral/18 rounded-[70px] opacity-65 -rotate-12 blur-lg" />
        <div className="absolute bottom-20 right-1/3 w-48 h-32 bg-gradient-to-tl from-lavender/25 to-mint/20 rounded-[60px] opacity-55 rotate-45 blur-md" />
        <div className="absolute top-10 left-10 w-36 h-24 bg-gradient-to-r from-coral/18 to-lavender/15 rounded-[40px] opacity-50 rotate-12" />
        
        {/* Subtle dove shapes */}
        <div className="absolute top-32 right-20 w-16 h-12 opacity-40">
          <div className="w-8 h-6 bg-gradient-to-r from-coral/40 to-mint/30 rounded-full blur-sm transform rotate-12"></div>
          <div className="absolute top-1 left-2 w-6 h-4 bg-gradient-to-l from-lavender/35 to-coral/25 rounded-full blur-sm transform -rotate-30"></div>
          <div className="absolute top-0.5 left-4 w-4 h-3 bg-gradient-to-r from-mint/30 to-lavender/20 rounded-full blur-sm transform rotate-45"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, secure, and effective process designed to get you results quickly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  1. Book Consultation
                </h3>
                <p className="text-muted-foreground">
                  Share your conflict details securely online through our protected platform.
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  2. Meet Your Mediator
                </h3>
                <p className="text-muted-foreground">
                  Get matched with a qualified professional based on your specific conflict type.
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Handshake className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  3. Resolve Together
                </h3>
                <p className="text-muted-foreground">
                  Guided sessions to reach mutual agreement and restore harmony.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-soft-purple relative overflow-hidden">
        {/* Layered organic shapes */}
        <div className="absolute -top-24 -right-24 w-88 h-60 bg-gradient-to-bl from-coral/18 to-lavender/15 rounded-[110px] opacity-65 rotate-12 blur-2xl" />
        <div className="absolute bottom-16 -left-16 w-72 h-48 bg-gradient-to-tr from-mint/22 to-coral/18 rounded-[80px] opacity-55 -rotate-45 blur-xl" />
        <div className="absolute top-1/3 left-20 w-36 h-24 bg-gradient-to-r from-lavender/20 to-mint/15 rounded-[40px] opacity-50 rotate-30" />
        <div className="absolute bottom-32 right-16 w-44 h-28 bg-gradient-to-bl from-coral/16 to-lavender/12 rounded-[55px] opacity-45 -rotate-15" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
              Why Choose ResolvePeace
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 text-center shadow-card">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Certified Mediators
              </h3>
              <p className="text-muted-foreground">
                Professional credentials and proven experience in conflict resolution.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 text-center shadow-card">
              <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                100% Confidential
              </h3>
              <p className="text-muted-foreground">
                Private process with secure platform and no public records.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 text-center shadow-card">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                98% Success Rate
              </h3>
              <p className="text-muted-foreground">
                Proven track record of successful conflict resolution.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 text-center shadow-card">
              <Clock className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Faster Results
              </h3>
              <p className="text-muted-foreground">
                Average resolution in 4-6 weeks vs months or years in court.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 text-center shadow-card">
              <Scale className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Cost Effective
              </h3>
              <p className="text-muted-foreground">
                80% less expensive than traditional court proceedings.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 text-center shadow-card">
              <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Emotional Support
              </h3>
              <p className="text-muted-foreground">
                Trained professionals who understand conflict psychology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 relative overflow-hidden">
        {/* Soft background elements */}
        <div className="absolute top-10 right-16 w-56 h-36 bg-gradient-to-bl from-mint/20 to-lavender/16 rounded-[70px] opacity-60 rotate-45 blur-lg" />
        <div className="absolute -bottom-16 left-10 w-64 h-44 bg-gradient-to-tr from-coral/22 to-mint/18 rounded-[90px] opacity-55 -rotate-12 blur-xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-26 bg-gradient-to-br from-lavender/18 to-coral/14 rounded-[50px] opacity-45 rotate-30" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real people, real results. See how mediation transformed these conflicts.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="After 15 years of marriage, we were on the brink of divorce. The mediation process helped us rediscover our communication and saved our relationship. We're stronger than ever now."
              author="Sarah & Michael Chen"
              role="Marriage Mediation"
              avatar={"https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"}
            />
            
            <TestimonialCard
              quote="Our family business was being torn apart by sibling disputes. The mediator helped us find common ground and establish clear boundaries. We're working together better than ever."
              author="The Johnson Family"
              role="Family Business Dispute"
              avatar={"https://wac-cdn.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg?cdnVersion=2981"}
            />
            
            <TestimonialCard
              quote="The property boundary dispute with our neighbor lasted 3 years. Mediation resolved it in just 5 weeks, and we actually became friends through the process."
              author="Robert Martinez"
              role="Property Dispute Resolution"
              avatar={handshakeImage}
            />
          </div>
        </div>
      </section>

      {/* Mediator Team Section */}
      <section id="mediators" className="py-16 md:py-24 bg-secondary relative overflow-hidden">
        {/* Professional organic accents */}
        <div className="absolute top-24 -left-20 w-68 h-44 bg-gradient-to-r from-lavender/7 to-coral/4 rounded-[85px] opacity-30 rotate-12 blur-xl" />
        <div className="absolute -bottom-24 right-16 w-80 h-52 bg-gradient-to-l from-mint/6 to-lavender/3 rounded-[100px] opacity-25 -rotate-45 blur-2xl" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
              Meet Our Qualified Professionals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Certified mediators with proven expertise in conflict resolution.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <MediatorCard
              name="Dr. Sarah Williams"
              credentials="M.A. Conflict Resolution, Certified Mediator"
              specialization="Marriage & Family Disputes"
              experience="15 years"
              image={mediator1Image}
            />
            <MediatorCard
              name="James Rodriguez"
              credentials="J.D., Certified Commercial Mediator"
              specialization="Business & Commercial Disputes"
              experience="12 years"
              image={mediator2Image}
            />
            <MediatorCard
              name="Dr. Emily Foster"
              credentials="Ph.D. Psychology, Family Mediator"
              specialization="Divorce & Custody"
              experience="18 years"
              image={"https://substackcdn.com/image/fetch/$s_!Tngn!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7b1b4e97-6a9e-45a6-b308-3b74f24a10cf_2800x3312.jpeg"}
            />
            <MediatorCard
              name="Michael Thompson"
              credentials="M.A. Mediation, Property Specialist"
              specialization="Property & Neighbor Disputes"
              experience="10 years"
              image={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSA14U_r-AarEYtzMZEC_mXaP2_H5WpgnnftuKe6Ip3Y9tKavuk3djo51Wq9qUldzC8yeY&usqp=CAU"}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-card rounded-2xl px-6 border-0 shadow-soft">
              <AccordionTrigger className="text-left hover:no-underline">
                How is mediation different from court?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Mediation is private, confidential, and collaborative. Unlike court, there's no judge making decisions for you. Instead, a neutral mediator helps facilitate communication so you can reach your own agreement. It's faster, less expensive, and preserves relationships.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-card rounded-2xl px-6 border-0 shadow-soft">
              <AccordionTrigger className="text-left hover:no-underline">
                Is the mediation process legally binding?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The mediation process itself is not binding, but any agreement you reach can be made legally binding if both parties choose. We help you document agreements in a way that can be enforced if needed, while maintaining the collaborative spirit of mediation.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="bg-card rounded-2xl px-6 border-0 shadow-soft">
              <AccordionTrigger className="text-left hover:no-underline">
                How much does mediation cost?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Mediation typically costs 80% less than court proceedings. Our fees range from $150-300 per hour depending on the mediator and complexity of the case. Most cases resolve in 3-8 sessions, making the total cost significantly lower than legal fees.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="bg-card rounded-2xl px-6 border-0 shadow-soft">
              <AccordionTrigger className="text-left hover:no-underline">
                How long does mediation take?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Most conflicts are resolved within 4-6 weeks, compared to 6 months to 2+ years in court. The exact timeline depends on the complexity of your situation and how quickly both parties can meet for sessions.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5" className="bg-card rounded-2xl px-6 border-0 shadow-soft">
              <AccordionTrigger className="text-left hover:no-underline">
                What if we can't reach an agreement?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                While 98% of our cases reach successful resolution, if an agreement isn't possible, you haven't lost anything. The mediation process often clarifies issues and can make any future legal proceedings more efficient. You always retain the right to pursue other options.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-hero-gradient">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
            Ready to Resolve Your Conflict?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take the first step toward peaceful resolution. Our certified mediators are ready to help you find a solution that works for everyone.
          </p>
          
          <div className="space-y-4">
            {user ? (
              <Button variant="hero" size="lg" onClick={() => navigate('/submit-case')}>
                Submit Your Case Now
              </Button>
            ) : (
              <Button variant="hero" size="lg" onClick={() => openAuthModal('register')}>
                Book Free Consultation
              </Button>
            )}
            <p className="text-sm text-muted-foreground">
              Free 15-minute consultation • No obligation • 100% confidential
            </p>
            <p className="text-sm text-muted-foreground">
              📞 Call us: (555) 123-PEACE • ✉️ hello@resolvepeace.com • Response within 2 hours
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">ResolvePeace</div>
              <p className="text-background/80 text-sm">
                Professional conflict resolution for families, businesses, and communities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>Family Mediation</li>
                <li>Business Disputes</li>
                <li>Property Conflicts</li>
                <li>Divorce Mediation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>About Us</li>
                <li>Our Mediators</li>
                <li>Success Stories</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>(555) 123-PEACE</li>
                <li>hello@resolvepeace.com</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/60">
            © 2024 ResolvePeace. All rights reserved. • Privacy Policy • Terms of Service
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConflictMediationLanding;