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
import { Users, UserPlus, AlertCircle, Settings, Shield } from "lucide-react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFamilyLinks } from "@/hooks/useFamilyLinks";
import { FamilyMemberPermissionsDialog } from "@/components/FamilyMemberPermissionsDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/Logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Family = () => {
  const { t } = useLanguage();
  const { 
    familyMembers, 
    myCaregivers, 
    isLoading, 
    createLink, 
    isCreating, 
    removeLink,
    updateLink,
    isUpdating
  } = useFamilyLinks();
  
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

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

  const handleEditPermissions = (member: any) => {
    setSelectedMember(member);
    setPermissionsDialogOpen(true);
  };

  const handleSavePermissions = (linkId: string, updates: any) => {
    updateLink({ linkId, updates });
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
            Keep track of your loved ones health and manage permissions
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
                      <SelectItem value="grandchild">Grandchild</SelectItem>
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

        {/* Tabs for Family Members and Caregivers */}
        <Tabs defaultValue="family" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="family" className="gap-2">
              <Users className="w-4 h-4" />
              Family Members ({familyMembers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="caregivers" className="gap-2">
              <Shield className="w-4 h-4" />
              My Caregivers ({myCaregivers?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Family Members Tab */}
          <TabsContent value="family" className="space-y-6">
            {familyMembers && familyMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {familyMembers.map((link: any) => (
                  <Card key={link.id} className="p-6 hover:shadow-elevated transition-all">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {link.member?.full_name || "Unknown"}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {link.member?.email}
                          </p>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            {link.relationship || "Family"}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 text-xs flex-wrap">
                        {link.can_view && (
                          <span className="px-2 py-1 bg-secondary/10 text-secondary rounded">
                            Can View
                          </span>
                        )}
                        {link.can_nudge && (
                          <span className="px-2 py-1 bg-accent/10 text-accent rounded">
                            Can Remind
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditPermissions(link)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Manage
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Remove this family member?")) {
                              removeLink(link.id);
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 md:p-12 text-center">
                <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">No Family Members Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by adding your first family member to track their health
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Caregivers Tab */}
          <TabsContent value="caregivers" className="space-y-6">
            {myCaregivers && myCaregivers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCaregivers.map((link: any) => (
                  <Card key={link.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {link.caregiver?.full_name || "Unknown"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {link.caregiver?.email}
                          </p>
                          <div className="text-xs text-muted-foreground capitalize mt-1">
                            Your {link.relationship}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 text-xs flex-wrap">
                        {link.can_view && (
                          <span className="px-2 py-1 bg-secondary/10 text-secondary rounded">
                            Viewing your data
                          </span>
                        )}
                        {link.can_nudge && (
                          <span className="px-2 py-1 bg-accent/10 text-accent rounded">
                            Can send reminders
                          </span>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (confirm("Remove this caregiver's access?")) {
                            removeLink(link.id);
                          }
                        }}
                      >
                        Remove Access
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Caregivers</h3>
                <p className="text-muted-foreground">
                  Family members you add will appear here if they're caring for you
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Permissions Dialog */}
        {selectedMember && (
          <FamilyMemberPermissionsDialog
            open={permissionsDialogOpen}
            onOpenChange={setPermissionsDialogOpen}
            member={selectedMember}
            onSave={handleSavePermissions}
            isUpdating={isUpdating}
          />
        )}
      </main>
    </div>
  );
};

export default Family;
