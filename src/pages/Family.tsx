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
import { Users, UserPlus, AlertCircle, Settings, Shield, Heart, Bell } from "lucide-react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFamilyLinks } from "@/hooks/useFamilyLinks";
import { FamilyMemberPermissionsDialog } from "@/components/FamilyMemberPermissionsDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/Logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureGate } from "@/components/FeatureGate";

const Family = () => {
  const { t, language } = useLanguage();
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
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Header />

      <main className="container mx-auto px-4 py-5 max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {language === 'hi' ? 'परिवार डैशबोर्ड' : 'Family Dashboard'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'hi' ? 'अपने प्रियजनों की सेहत पर नज़र रखें' : "Keep track of your loved ones' health"}
            </p>
          </div>
          
          <FeatureGate feature="family_dashboard" requiredTier="basic">
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  {language === 'hi' ? 'सदस्य जोड़ें' : 'Add Member'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === 'hi' ? 'परिवार सदस्य जोड़ें' : 'Add Family Member'}</DialogTitle>
                  <DialogDescription>
                    {language === 'hi' 
                      ? 'परिवार के सदस्य का ईमेल दर्ज करें। उनका Beat अकाउंट होना चाहिए।'
                      : 'Enter the email address of your family member. They must have a Beat account.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{language === 'hi' ? 'ईमेल' : 'Email Address'}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="family@example.com"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">{language === 'hi' ? 'रिश्ता' : 'Relationship'}</Label>
                    <Select value={relationship} onValueChange={setRelationship}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'hi' ? 'रिश्ता चुनें' : 'Select relationship'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">{language === 'hi' ? 'माता-पिता' : 'Parent'}</SelectItem>
                        <SelectItem value="spouse">{language === 'hi' ? 'पति/पत्नी' : 'Spouse'}</SelectItem>
                        <SelectItem value="child">{language === 'hi' ? 'बच्चा' : 'Child'}</SelectItem>
                        <SelectItem value="sibling">{language === 'hi' ? 'भाई-बहन' : 'Sibling'}</SelectItem>
                        <SelectItem value="grandparent">{language === 'hi' ? 'दादा-दादी' : 'Grandparent'}</SelectItem>
                        <SelectItem value="other">{language === 'hi' ? 'अन्य' : 'Other'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleInvite}
                    disabled={!memberEmail || !relationship || isCreating}
                    className="w-full"
                  >
                    {isCreating ? (language === 'hi' ? 'जोड़ रहे हैं...' : 'Adding...') : (language === 'hi' ? 'सदस्य जोड़ें' : 'Add Family Member')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </FeatureGate>
        </div>

        {/* Info Alert */}
        {familyMembers?.length === 0 && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              {language === 'hi' 
                ? 'परिवार के सदस्यों को जोड़ें और उनके स्वास्थ्य की निगरानी करें। उनका Beat अकाउंट होना चाहिए।'
                : "Add family members to monitor their health journey. They'll need a Beat account first."}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <FeatureGate feature="family_dashboard" requiredTier="basic">
          <Tabs defaultValue="family" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 mb-6">
              <TabsTrigger value="family" className="gap-2">
                <Users className="w-4 h-4" />
                <span>{language === 'hi' ? 'परिवार' : 'Family'} ({familyMembers?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="caregivers" className="gap-2">
                <Shield className="w-4 h-4" />
                <span>{language === 'hi' ? 'देखभालकर्ता' : 'Caregivers'} ({myCaregivers?.length || 0})</span>
              </TabsTrigger>
            </TabsList>

            {/* Family Members Tab */}
            <TabsContent value="family" className="space-y-4">
              {familyMembers && familyMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {familyMembers.map((link: any) => (
                    <Card key={link.id} className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
                      <div className="p-5">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                            {link.member?.full_name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{link.member?.full_name || 'Unknown'}</h3>
                            <p className="text-sm text-muted-foreground truncate">{link.member?.email}</p>
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                              {link.relationship || 'Family'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 mb-4 flex-wrap">
                          {link.can_view && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-lg text-xs">
                              <Heart className="w-3 h-3" />
                              View
                            </span>
                          )}
                          {link.can_nudge && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-lg text-xs">
                              <Bell className="w-3 h-3" />
                              Nudge
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
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
                              if (confirm(language === 'hi' ? 'इस सदस्य को हटाएं?' : 'Remove this family member?')) {
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
                <Card className="p-8 text-center border-dashed">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'hi' ? 'कोई परिवार सदस्य नहीं' : 'No Family Members Yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'hi' 
                      ? 'परिवार के सदस्यों को जोड़ें और उनकी सेहत पर नज़र रखें'
                      : "Add family members to track their health journey"}
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* Caregivers Tab */}
            <TabsContent value="caregivers" className="space-y-4">
              {myCaregivers && myCaregivers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myCaregivers.map((link: any) => (
                    <Card key={link.id} className="overflow-hidden border-border/50">
                      <div className="p-5">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{link.caregiver?.full_name || 'Unknown'}</h3>
                            <p className="text-sm text-muted-foreground truncate">{link.caregiver?.email}</p>
                            <span className="text-xs text-muted-foreground capitalize mt-1 inline-block">
                              Your {link.relationship}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 mb-4 flex-wrap">
                          {link.can_view && (
                            <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-lg text-xs">
                              Viewing your data
                            </span>
                          )}
                          {link.can_nudge && (
                            <span className="px-2 py-1 bg-accent/10 text-accent rounded-lg text-xs">
                              Can send reminders
                            </span>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            if (confirm(language === 'hi' ? "इस देखभालकर्ता की पहुंच हटाएं?" : "Remove this caregiver's access?")) {
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
                <Card className="p-8 text-center border-dashed">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'hi' ? 'कोई देखभालकर्ता नहीं' : 'No Caregivers'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hi' 
                      ? 'आपके देखभालकर्ता यहां दिखाई देंगे'
                      : "Family members caring for you will appear here"}
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </FeatureGate>

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