import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, UserPlus, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFamilyLinks } from "@/hooks/useFamilyLinks";
import FamilyMemberCard from "@/components/FamilyMemberCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/Logo";

const Family = () => {
  const { t } = useLanguage();
  const { familyMembers, myCaregivers, isLoading, createLink, isCreating, removeLink } =
    useFamilyLinks();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [relationship, setRelationship] = useState("");

  const handleInvite = () => {
    if (!memberEmail || !relationship) return;

    createLink(
      { memberEmail, relationship },
      {
        onSuccess: () => {
          setInviteOpen(false);
          setMemberEmail("");
          setRelationship("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Logo size="md" showText={false} className="animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Family Dashboard</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Keep track of your loved ones' health
          </p>
        </div>

        {/* Info Alert */}
        {familyMembers?.length === 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Add family members to monitor their health journey. They'll need to create a Beat
              account first using their email address.
            </AlertDescription>
          </Alert>
        )}

        {/* Add Member Button */}
        <div className="mb-6">
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Family Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
                <DialogDescription>
                  Enter the email address of your family member. They must have a Beat account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="family@example.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select value={relationship} onValueChange={setRelationship}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInvite}
                  disabled={!memberEmail || !relationship || isCreating}
                  className="w-full"
                >
                  {isCreating ? "Adding..." : "Add Family Member"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Family Members Grid */}
        {familyMembers && familyMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {familyMembers.map((link: any) => (
              <FamilyMemberCard
                key={link.id}
                memberId={link.member_id}
                memberName={link.member?.full_name}
                memberEmail={link.member?.email}
                relationship={link.relationship}
                canNudge={link.can_nudge}
                onRemove={() => removeLink(link.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 md:p-12 text-center">
            <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No Family Members Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first family member to track their health
            </p>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Your First Member
                </Button>
              </DialogTrigger>
            </Dialog>
          </Card>
        )}

        {/* My Caregivers Section */}
        {myCaregivers && myCaregivers.length > 0 && (
          <div className="mt-8 md:mt-12">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">People Caring for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCaregivers.map((link: any) => (
                <Card key={link.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {link.caregiver?.full_name || link.caregiver?.email.split("@")[0]}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        Your {link.relationship}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Family;
