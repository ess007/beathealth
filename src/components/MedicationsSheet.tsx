import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, Plus, Check, Clock, AlertTriangle, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMedications } from "@/hooks/useMedications";
import { useState } from "react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import {
  Dialog,
  DialogContent,
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

interface MedicationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicationsSheet = ({ isOpen, onClose }: MedicationsSheetProps) => {
  const { language } = useLanguage();
  const { medications, isLoading, addMedication, deleteMedication } = useMedications();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
  });

  const handleAddMedication = async () => {
    if (!newMed.name.trim()) {
      toast.error(language === 'hi' ? 'दवा का नाम दर्ज करें' : 'Please enter medication name');
      return;
    }

    haptic('light');
    addMedication(newMed);
    toast.success(language === 'hi' ? 'दवा जोड़ी गई' : 'Medication added');
    setNewMed({ name: "", dosage: "", frequency: "daily" });
    setAddDialogOpen(false);
  };

  const handleDeleteMedication = (id: string) => {
    haptic('light');
    deleteMedication(id);
    toast.success(language === 'hi' ? 'दवा हटाई गई' : 'Medication removed');
  };

  const activeMeds = medications?.filter(m => m.active) || [];
  const inactiveMeds = medications?.filter(m => !m.active) || [];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-secondary" />
              {language === 'hi' ? 'दवाइयाँ' : 'Medications'}
            </SheetTitle>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" />
                  {language === 'hi' ? 'जोड़ें' : 'Add'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'hi' ? 'नई दवा जोड़ें' : 'Add New Medication'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{language === 'hi' ? 'दवा का नाम' : 'Medication Name'}</Label>
                    <Input
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      placeholder={language === 'hi' ? 'जैसे: Amlodipine' : 'e.g., Amlodipine'}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'hi' ? 'खुराक' : 'Dosage'}</Label>
                    <Input
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      placeholder={language === 'hi' ? 'जैसे: 5mg' : 'e.g., 5mg'}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'hi' ? 'कितनी बार' : 'Frequency'}</Label>
                    <Select
                      value={newMed.frequency}
                      onValueChange={(v) => setNewMed({ ...newMed, frequency: v })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{language === 'hi' ? 'रोज़' : 'Daily'}</SelectItem>
                        <SelectItem value="twice_daily">{language === 'hi' ? 'दिन में दो बार' : 'Twice daily'}</SelectItem>
                        <SelectItem value="weekly">{language === 'hi' ? 'हफ्ते में एक बार' : 'Weekly'}</SelectItem>
                        <SelectItem value="as_needed">{language === 'hi' ? 'जरूरत पर' : 'As needed'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleAddMedication} 
                    className="w-full h-12"
                  >
                    {language === 'hi' ? 'दवा जोड़ें' : 'Add Medication'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-100px)] pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : medications?.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Pill className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">
                {language === 'hi' ? 'कोई दवाइयाँ नहीं जोड़ी गई' : 'No medications added yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'hi' 
                  ? 'अपनी दवाइयाँ जोड़ें और रिमाइंडर पाएं'
                  : 'Add your medications to get reminders'}
              </p>
            </div>
          ) : (
            <>
              {/* Active Medications */}
              {activeMeds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground px-1">
                    {language === 'hi' ? 'सक्रिय दवाइयाँ' : 'Active Medications'}
                  </p>
                  {activeMeds.map((med) => (
                    <Card key={med.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                          <Pill className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{med.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {med.dosage && <span>{med.dosage}</span>}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {med.frequency}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteMedication(med.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Inactive Medications */}
              {inactiveMeds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground px-1">
                    {language === 'hi' ? 'निष्क्रिय' : 'Inactive'}
                  </p>
                  {inactiveMeds.map((med) => (
                    <Card key={med.id} className="p-4 opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <Pill className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{med.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {med.dosage && <span>{med.dosage}</span>}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleMedication(med.id, med.active || false)}
                        >
                          {language === 'hi' ? 'सक्रिय करें' : 'Activate'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Drug Interaction Warning */}
          {activeMeds.length >= 2 && (
            <Card className="p-4 bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {language === 'hi' ? 'दवा इंटरेक्शन चेक' : 'Drug Interaction Check'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'hi' 
                      ? 'Beat स्वचालित रूप से आपकी दवाओं के बीच संभावित इंटरेक्शन की जाँच करता है।'
                      : 'Beat automatically checks for potential interactions between your medications.'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
