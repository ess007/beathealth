import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Target, Shield, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const team = [
    {
      name: "Dr. Priya Sharma",
      role: "Chief Medical Officer",
      bio: "Cardiologist with 15+ years experience in preventive heart care. Former Director at AIIMS Cardiology Department.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Rahul Mehta",
      role: "CEO & Co-Founder",
      bio: "Former McKinsey healthcare consultant. Passionate about democratizing health tech for Indian families.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Ananya Krishnan",
      role: "Head of Product",
      bio: "Ex-Google product lead. Expert in building senior-friendly digital experiences.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Dr. Vikram Patel",
      role: "Chief AI Officer",
      bio: "AI researcher from IIT Bombay. Pioneer in health AI applications for emerging markets.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Heart-First Health",
      description: "Every feature we build starts with one question: will this help Indian families live healthier, longer lives?"
    },
    {
      icon: Users,
      title: "Family-Centric",
      description: "Health is a family affair. We design for caregivers, parents, and grandparents alike."
    },
    {
      icon: Shield,
      title: "Privacy & Trust",
      description: "Your health data is sacred. We follow DPDP Act compliance and never sell your information."
    },
    {
      icon: Target,
      title: "Accessible to All",
      description: "Senior-friendly design, Hindi support, and affordable pricing so everyone can benefit."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <Logo size="sm" showText={true} />
            <Button onClick={() => navigate("/auth")} size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Making Heart Health
            <span className="font-serif italic bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#FF8C7A] to-accent"> Simple for Every Indian Family</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Beat was born from a simple observation: managing BP, sugar, and heart health shouldn't require a medical degree. We're building the health companion every Indian family deserves.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                India faces a silent epidemic. Heart disease and diabetes affect over 200 million Indians, yet most lack access to proper monitoring and guidance. We're changing that.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Beat combines cutting-edge AI with simple, senior-friendly design to help families track, understand, and improve their metabolic health—one ritual at a time.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                  <Heart className="w-4 h-4" />
                  <span className="font-medium">50,000+ Users</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">15,000+ Families</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
                <Heart className="w-32 h-32 text-primary animate-pulse" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-accent/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-3xl font-bold text-accent">❤️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide every decision we make
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              World-class experts committed to transforming Indian healthcare
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="border-0 bg-card overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Join the Beat Family
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your heart health journey today. Free to try, no credit card required.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="h-14 px-8 text-lg rounded-full">
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© 2024 Beat Health Inc.</span>
            <span className="hidden sm:inline">•</span>
            <span>Built by <a href="https://bwestudios.com" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:text-primary transition-colors">BWE Studio</a></span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => navigate("/privacy")} className="hover:text-primary transition-colors">Privacy</button>
            <button onClick={() => navigate("/terms")} className="hover:text-primary transition-colors">Terms</button>
            <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
