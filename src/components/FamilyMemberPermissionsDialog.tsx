import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FamilyMemberPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    id: string;
    relationship: string;
    can_view: boolean;
    can_nudge: boolean;
    member?: {
      full_name: string;
      email: string;
    };
  };
  onSave: (linkId: string, updates: {
    relationship?: string;
    can_view?: boolean;
    can_nudge?: boolean;
  }) => void;
  isUpdating?: boolean;
}

export const FamilyMemberPermissionsDialog = ({
  open,
  onOpenChange,
  member,
  onSave,
  isUpdating,
}: FamilyMemberPermissionsDialogProps) => {
  const [relationship, setRelationship] = useState(member.relationship || "");
  const [canView, setCanView] = useState(member.can_view ?? true);
  const [canNudge, setCanNudge] = useState(member.can_nudge ?? true);

  const handleSave = () => {
    onSave(member.id, {
      relationship,
      can_view: canView,
      can_nudge: canNudge,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Update relationship and permissions for {member.member?.full_name || member.member?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Relationship */}
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="grandparent">Grandparent</SelectItem>
                <SelectItem value="grandchild">Grandchild</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Permissions */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <h4 className="text-sm font-semibold">Access Permissions</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="can-view" className="text-sm font-normal">
                  View Health Data
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow viewing BP, sugar, medications, and health metrics
                </p>
              </div>
              <Switch
                id="can-view"
                checked={canView}
                onCheckedChange={setCanView}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="can-nudge" className="text-sm font-normal">
                  Send Reminders
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow sending health reminders and check-in nudges
                </p>
              </div>
              <Switch
                id="can-nudge"
                checked={canNudge}
                onCheckedChange={setCanNudge}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <strong>Privacy Notice:</strong> Family members can only view data, not modify it. All access is logged for security.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
