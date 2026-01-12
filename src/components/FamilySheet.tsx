import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Heart, Activity, Bell, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFamilyLinks } from "@/hooks/useFamilyLinks";
import { useNavigate } from "react-router-dom";
import { haptic } from "@/lib/haptics";

interface FamilySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySheet = ({ isOpen, onClose }: FamilySheetProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { familyMembers, isLoading } = useFamilyLinks();

  const handleOpenFullFamily = () => {
    haptic('light');
    onClose();
    navigate('/app/family');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-500" />
              {language === 'hi' ? 'परिवार' : 'Family'}
            </SheetTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 rounded-xl"
              onClick={handleOpenFullFamily}
            >
              {language === 'hi' ? 'सभी देखें' : 'View All'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-100px)] pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : familyMembers?.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-violet-500" />
              </div>
              <p className="text-lg font-semibold mb-2">
                {language === 'hi' ? 'परिवार से जुड़ें' : 'Connect with Family'}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {language === 'hi' 
                  ? 'अपने प्रियजनों को जोड़ें और उनकी सेहत पर नज़र रखें'
                  : 'Add family members to monitor their health and stay connected'}
              </p>
              <Button onClick={handleOpenFullFamily} className="gap-2">
                <UserPlus className="w-4 h-4" />
                {language === 'hi' ? 'सदस्य जोड़ें' : 'Add Family Member'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {familyMembers?.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                      <span className="text-lg font-semibold text-violet-600">
                        {(member as any).member?.full_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {(member as any).member?.full_name || 'Family Member'}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {member.relationship || 'Family'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.can_view && (
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-secondary" />
                        </div>
                      )}
                      {member.can_nudge && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Bell className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Add More CTA */}
              <Button 
                variant="outline" 
                className="w-full h-14 gap-2 rounded-xl border-dashed"
                onClick={handleOpenFullFamily}
              >
                <UserPlus className="w-5 h-5" />
                {language === 'hi' ? 'और सदस्य जोड़ें' : 'Add More Family'}
              </Button>
            </div>
          )}

          {/* Family Features Info */}
          <Card className="p-4 bg-violet-500/5 border-violet-500/10">
            <p className="text-sm font-medium mb-3">
              {language === 'hi' ? 'परिवार सुविधाएँ' : 'Family Features'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-primary" />
                <span>{language === 'hi' ? 'प्रियजनों की सेहत देखें' : 'View loved ones\' health'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bell className="w-4 h-4 text-primary" />
                <span>{language === 'hi' ? 'प्यार भरे रिमाइंडर भेजें' : 'Send gentle nudges'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="w-4 h-4 text-primary" />
                <span>{language === 'hi' ? 'मिस्ड चेक-इन अलर्ट पाएं' : 'Get missed check-in alerts'}</span>
              </div>
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
