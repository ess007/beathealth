import { useState, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { 
  Camera, Upload, Utensils, Loader2, Sparkles,
  Sun, Sunset, Moon, Coffee, ChevronRight, X, ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DetectedFood {
  name: string;
  portion: string;
  calories: number;
  carbs: number;
  protein?: number;
  fat?: number;
  glycemicIndex?: string;
}

interface MealAnalysis {
  items: DetectedFood[];
  totalCalories: number;
  totalCarbs: number;
  glycemicLoad: number;
  healthTip?: string;
}

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: Sun, time: '6 AM - 10 AM' },
  { id: 'lunch', label: 'Lunch', icon: Sunset, time: '12 PM - 3 PM' },
  { id: 'dinner', label: 'Dinner', icon: Moon, time: '7 PM - 10 PM' },
  { id: 'snack', label: 'Snack', icon: Coffee, time: 'Any time' },
];

export const MealLogger = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mealType, setMealType] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Please use an image under 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      haptic('light');
    };
    reader.readAsDataURL(file);
  };

  const analyzeWithAI = async () => {
    if (!imagePreview && !description) {
      toast.error('Please add an image or description');
      return;
    }

    if (!mealType) {
      toast.error('Please select a meal type');
      return;
    }

    setIsAnalyzing(true);
    haptic('light');

    try {
      const { data, error } = await supabase.functions.invoke('analyze-meal-image', {
        body: { 
          imageBase64: imagePreview,
          description,
          mealType,
        },
      });

      if (error) throw error;

      setAnalysis(data);
      haptic('success');
      toast.success('Meal analyzed successfully!');

    } catch (error: any) {
      console.error('Analysis error:', error);
      haptic('error');
      toast.error(error.message || 'Failed to analyze meal');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveMealLog = async () => {
    if (!user || !analysis || !mealType) return;

    setIsSaving(true);
    haptic('light');

    try {
      // Upload image to storage if exists
      let imageUrl = null;
      if (imagePreview) {
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const base64Data = imagePreview.split(',')[1];
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars') // Using existing bucket
          .upload(`meals/${fileName}`, decode(base64Data), {
            contentType: 'image/jpeg',
          });
        
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`meals/${fileName}`);
          imageUrl = publicUrl;
        }
      }

      // Save meal log
      const { error } = await supabase.from('meal_logs').insert([{
        user_id: user.id,
        meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        image_url: imageUrl,
        description,
        ai_detected_items: analysis.items as any,
        estimated_calories: analysis.totalCalories,
        estimated_carbs: analysis.totalCarbs,
        estimated_glycemic_load: analysis.glycemicLoad,
        logged_at: new Date().toISOString(),
      }]);

      if (error) throw error;

      haptic('success');
      toast.success('Meal logged successfully!');
      
      // Reset form
      setMealType('');
      setImagePreview(null);
      setDescription('');
      setAnalysis(null);

    } catch (error: any) {
      console.error('Save error:', error);
      haptic('error');
      toast.error(error.message || 'Failed to save meal');
    } finally {
      setIsSaving(false);
    }
  };

  const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const getGlycemicColor = (load: number) => {
    if (load <= 10) return 'text-green-500';
    if (load <= 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGlycemicLabel = (load: number) => {
    if (load <= 10) return 'Low GI';
    if (load <= 20) return 'Medium GI';
    return 'High GI';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center">
          <Utensils className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold">Log Your Meal</h3>
        <p className="text-sm text-muted-foreground">
          AI-powered nutrition analysis for Indian foods
        </p>
      </div>

      {/* Meal Type Selection */}
      <div className="grid grid-cols-2 gap-2">
        {MEAL_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setMealType(type.id);
              haptic('light');
            }}
            className={`
              flex items-center gap-3 p-3 rounded-xl border-2 transition-all
              ${mealType === type.id 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <type.icon className={`w-5 h-5 ${mealType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="text-left">
              <p className="font-medium text-sm">{type.label}</p>
              <p className="text-xs text-muted-foreground">{type.time}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Image Upload */}
      <Card className="p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageSelect}
        />

        {imagePreview ? (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Meal preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => setImagePreview(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-24 flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs">Take Photo</span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-24 flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">Upload</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description (optional)</label>
        <Textarea
          placeholder="e.g., 2 rotis with dal and sabzi, small bowl of rice..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px]"
        />
        <p className="text-xs text-muted-foreground">
          Describe your meal for better AI analysis, especially if no image
        </p>
      </div>

      {/* Analyze Button */}
      {!analysis && (
        <Button 
          className="w-full gap-2" 
          onClick={analyzeWithAI}
          disabled={isAnalyzing || (!imagePreview && !description) || !mealType}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze with AI
            </>
          )}
        </Button>
      )}

      {/* Analysis Results */}
      {analysis && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Analysis
            </h4>
            <Badge variant="outline" className={getGlycemicColor(analysis.glycemicLoad)}>
              {getGlycemicLabel(analysis.glycemicLoad)}
            </Badge>
          </div>

          {/* Detected Items */}
          <div className="space-y-2">
            {analysis.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.portion}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.calories} cal</p>
                  <p className="text-xs text-muted-foreground">{item.carbs}g carbs</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-lg font-bold text-primary">{analysis.totalCalories}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-lg font-bold text-blue-500">{analysis.totalCarbs}g</p>
              <p className="text-xs text-muted-foreground">Carbs</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className={`text-lg font-bold ${getGlycemicColor(analysis.glycemicLoad)}`}>
                {analysis.glycemicLoad}
              </p>
              <p className="text-xs text-muted-foreground">GL</p>
            </div>
          </div>

          {/* Health Tip */}
          {analysis.healthTip && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm">
                <span className="font-medium text-primary">💡 Tip:</span> {analysis.healthTip}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setAnalysis(null)}
            >
              Edit
            </Button>
            <Button 
              className="flex-1 gap-2"
              onClick={saveMealLog}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Save Meal
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MealLogger;
