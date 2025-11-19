import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, UserPlus, Heart } from "lucide-react";
import { toast } from "sonner";

const Family = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/home")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-secondary" />
            <span className="font-semibold">Family Dashboard</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center space-y-6 py-12">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-secondary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-3">Invite Your Family</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Keep an eye on your parents' health. Get notified when they need support.
            </p>
          </div>

          <Card className="p-8 shadow-elevated max-w-md mx-auto">
            <div className="space-y-4">
              <Button
                className="w-full h-14 gradient-primary text-white shadow-card"
                onClick={() => toast.info("Invite feature coming soon!")}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Invite Family Member
              </Button>
              <p className="text-sm text-muted-foreground">
                Share via WhatsApp, Email, or SMS
              </p>
            </div>
          </Card>

          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
            <div className="p-6 bg-card rounded-xl border">
              <Heart className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-1">Monitor Health</h3>
              <p className="text-sm text-muted-foreground">
                Track family members' vitals
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border">
              <Users className="w-8 h-8 text-secondary mb-3 mx-auto" />
              <h3 className="font-semibold mb-1">Stay Connected</h3>
              <p className="text-sm text-muted-foreground">
                Send nudges and reminders
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border">
              <UserPlus className="w-8 h-8 text-accent mb-3 mx-auto" />
              <h3 className="font-semibold mb-1">Care Together</h3>
              <p className="text-sm text-muted-foreground">
                All family in one place
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Family;
