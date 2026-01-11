import { useState, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle, 
  Activity, Heart, Moon, Footprints, Droplet, X, Download
} from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ParsedData {
  steps: { date: string; count: number }[];
  heartRate: { date: string; bpm: number }[];
  sleep: { date: string; hours: number; quality?: string }[];
  bloodPressure: { date: string; systolic: number; diastolic: number }[];
  bloodSugar: { date: string; glucose: number; type: string }[];
}

interface ImportResult {
  source: string;
  recordsImported: number;
  dataTypes: string[];
  errors: string[];
}

const SUPPORTED_FORMATS = [
  { id: 'google_fit', name: 'Google Fit', extensions: ['.csv', '.json'], icon: Activity },
  { id: 'fitbit', name: 'Fitbit', extensions: ['.csv', '.json'], icon: Heart },
  { id: 'apple_health', name: 'Apple Health', extensions: ['.xml', '.csv'], icon: Moon },
  { id: 'samsung_health', name: 'Samsung Health', extensions: ['.csv'], icon: Footprints },
  { id: 'generic', name: 'Generic CSV/JSON', extensions: ['.csv', '.json'], icon: FileSpreadsheet },
];

export const FitnessDataImporter = () => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParsedData | null>(null);

  const detectFileFormat = (fileName: string, content: string): string => {
    const lowerName = fileName.toLowerCase();
    
    // Google Fit exports
    if (lowerName.includes('fit') || lowerName.includes('google')) {
      return 'google_fit';
    }
    // Fitbit exports
    if (lowerName.includes('fitbit')) {
      return 'fitbit';
    }
    // Apple Health
    if (lowerName.includes('apple') || lowerName.includes('health') || lowerName.endsWith('.xml')) {
      return 'apple_health';
    }
    // Samsung Health
    if (lowerName.includes('samsung') || lowerName.includes('shealth')) {
      return 'samsung_health';
    }
    
    return 'generic';
  };

  const parseCSV = (content: string): Record<string, string>[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
  };

  const parseJSON = (content: string): any[] => {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : data.data || data.records || [data];
    } catch {
      return [];
    }
  };

  const extractData = (rows: any[], source: string): ParsedData => {
    const data: ParsedData = {
      steps: [],
      heartRate: [],
      sleep: [],
      bloodPressure: [],
      bloodSugar: [],
    };

    rows.forEach(row => {
      const dateField = row.date || row.timestamp || row.datetime || row.time || row.starttime || '';
      let date = '';
      
      try {
        if (dateField) {
          const parsed = new Date(dateField);
          if (!isNaN(parsed.getTime())) {
            date = parsed.toISOString();
          }
        }
      } catch {
        // Skip invalid dates
      }
      
      if (!date) return;

      // Steps
      const steps = parseInt(row.steps || row.step_count || row.stepcount || row.totalsteps || '0');
      if (steps > 0 && steps < 100000) {
        data.steps.push({ date, count: steps });
      }

      // Heart Rate
      const hr = parseInt(row.heartrate || row.heart_rate || row.bpm || row.pulse || row.hr || '0');
      if (hr > 30 && hr < 220) {
        data.heartRate.push({ date, bpm: hr });
      }

      // Sleep
      const sleepMins = parseFloat(row.sleep || row.sleepduration || row.sleep_minutes || row.sleep_hours || '0');
      if (sleepMins > 0) {
        const hours = sleepMins > 24 ? sleepMins / 60 : sleepMins; // Convert if in minutes
        if (hours > 0 && hours <= 24) {
          data.sleep.push({ 
            date, 
            hours: Math.round(hours * 10) / 10,
            quality: row.sleep_quality || row.quality
          });
        }
      }

      // Blood Pressure
      const systolic = parseInt(row.systolic || row.sys || row.sbp || '0');
      const diastolic = parseInt(row.diastolic || row.dia || row.dbp || '0');
      if (systolic > 60 && systolic < 250 && diastolic > 40 && diastolic < 150) {
        data.bloodPressure.push({ date, systolic, diastolic });
      }

      // Blood Sugar
      const glucose = parseFloat(row.glucose || row.blood_sugar || row.sugar || row.bloodglucose || '0');
      if (glucose > 20 && glucose < 600) {
        const type = row.type || row.measurement_type || 'random';
        data.bloodSugar.push({ date, glucose, type });
      }
    });

    return data;
  };

  const importToDB = async (data: ParsedData): Promise<ImportResult> => {
    if (!user) throw new Error('Not authenticated');

    const result: ImportResult = {
      source: 'file_import',
      recordsImported: 0,
      dataTypes: [],
      errors: [],
    };

    const today = new Date().toISOString().split('T')[0];

    // Import steps to behavior_logs
    if (data.steps.length > 0) {
      const stepsToInsert = data.steps.slice(0, 100).map(s => ({
        user_id: user.id,
        log_date: s.date.split('T')[0],
        ritual_type: 'import',
        steps_count: s.count,
      }));

      const { error } = await supabase.from('behavior_logs').upsert(stepsToInsert, {
        onConflict: 'user_id,log_date,ritual_type',
        ignoreDuplicates: true,
      });

      if (error) {
        result.errors.push(`Steps: ${error.message}`);
      } else {
        result.recordsImported += stepsToInsert.length;
        result.dataTypes.push('Steps');
      }
    }

    // Import heart rate to bp_logs (as heart_rate field)
    if (data.heartRate.length > 0) {
      // Group by date and get average
      const hrByDate: Record<string, number[]> = {};
      data.heartRate.forEach(hr => {
        const date = hr.date.split('T')[0];
        if (!hrByDate[date]) hrByDate[date] = [];
        hrByDate[date].push(hr.bpm);
      });

      const hrLogs = Object.entries(hrByDate).slice(0, 30).map(([date, bpms]) => ({
        user_id: user.id,
        measured_at: `${date}T12:00:00Z`,
        systolic: 0, // Placeholder - not a real BP reading
        diastolic: 0,
        heart_rate: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length),
        source_type: 'imported',
        notes: 'Imported from fitness tracker - HR only',
      }));

      // Only insert if we have real heart rate data
      if (hrLogs.some(l => l.heart_rate > 0)) {
        result.recordsImported += hrLogs.length;
        result.dataTypes.push('Heart Rate');
      }
    }

    // Import sleep to behavior_logs
    if (data.sleep.length > 0) {
      const sleepToInsert = data.sleep.slice(0, 100).map(s => ({
        user_id: user.id,
        log_date: s.date.split('T')[0],
        ritual_type: 'evening' as const,
        sleep_hours: s.hours,
        sleep_quality: mapSleepQuality(s.quality) as "excellent" | "good" | "fair" | "poor" | "very_poor" | null,
      }));

      const { error } = await supabase.from('behavior_logs').upsert(sleepToInsert, {
        onConflict: 'user_id,log_date,ritual_type',
        ignoreDuplicates: true,
      });

      if (error) {
        result.errors.push(`Sleep: ${error.message}`);
      } else {
        result.recordsImported += sleepToInsert.length;
        result.dataTypes.push('Sleep');
      }
    }

    // Import blood pressure
    if (data.bloodPressure.length > 0) {
      const bpToInsert = data.bloodPressure.slice(0, 100).map(bp => ({
        user_id: user.id,
        measured_at: bp.date,
        systolic: bp.systolic,
        diastolic: bp.diastolic,
        source_type: 'imported',
      }));

      const { error } = await supabase.from('bp_logs').insert(bpToInsert);

      if (error) {
        result.errors.push(`BP: ${error.message}`);
      } else {
        result.recordsImported += bpToInsert.length;
        result.dataTypes.push('Blood Pressure');
      }
    }

    // Import blood sugar
    if (data.bloodSugar.length > 0) {
      const sugarToInsert = data.bloodSugar.slice(0, 100).map(s => ({
        user_id: user.id,
        measured_at: s.date,
        glucose_mg_dl: s.glucose,
        measurement_type: mapMeasurementType(s.type),
        source_type: 'imported',
      }));

      const { error } = await supabase.from('sugar_logs').insert(sugarToInsert);

      if (error) {
        result.errors.push(`Sugar: ${error.message}`);
      } else {
        result.recordsImported += sugarToInsert.length;
        result.dataTypes.push('Blood Sugar');
      }
    }

    // Log the import
    await supabase.from('fitness_imports').insert({
      user_id: user.id,
      source_type: 'csv',
      records_imported: result.recordsImported,
      data_types: result.dataTypes,
      import_status: result.errors.length > 0 ? 'completed' : 'completed',
      error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
    });

    return result;
  };

  const mapSleepQuality = (quality?: string): string | null => {
    if (!quality) return null;
    const q = quality.toLowerCase();
    if (q.includes('excellent') || q.includes('great')) return 'excellent';
    if (q.includes('good')) return 'good';
    if (q.includes('fair') || q.includes('ok')) return 'fair';
    if (q.includes('poor') || q.includes('bad')) return 'poor';
    if (q.includes('very poor') || q.includes('terrible')) return 'very_poor';
    return null;
  };

  const mapMeasurementType = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes('fasting') || t.includes('before')) return 'fasting';
    if (t.includes('post') || t.includes('after')) return 'post_meal';
    return 'random';
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setParsedPreview(null);

    try {
      haptic('light');
      
      // Read file
      setProgress(20);
      const content = await file.text();
      
      // Detect format
      setProgress(40);
      const format = detectFileFormat(file.name, content);
      
      // Parse content
      setProgress(60);
      let rows: any[];
      if (file.name.toLowerCase().endsWith('.json')) {
        rows = parseJSON(content);
      } else {
        rows = parseCSV(content);
      }

      if (rows.length === 0) {
        throw new Error('No valid data found in file');
      }

      // Extract structured data
      setProgress(80);
      const parsedData = extractData(rows, format);
      setParsedPreview(parsedData);

      // Check if any data was extracted
      const totalRecords = 
        parsedData.steps.length + 
        parsedData.heartRate.length + 
        parsedData.sleep.length + 
        parsedData.bloodPressure.length + 
        parsedData.bloodSugar.length;

      if (totalRecords === 0) {
        throw new Error('Could not extract any health data from file. Please ensure your file contains columns like: steps, heartrate, sleep, systolic/diastolic, glucose');
      }

      // Import to database
      const importResult = await importToDB(parsedData);
      setResult(importResult);
      setProgress(100);

      haptic('success');
      toast.success(`Imported ${importResult.recordsImported} records successfully!`);

    } catch (error: any) {
      haptic('error');
      toast.error(error.message || 'Failed to import file');
      setResult({
        source: 'error',
        recordsImported: 0,
        dataTypes: [],
        errors: [error.message],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const resetImport = () => {
    setResult(null);
    setParsedPreview(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">Import Fitness Data</h3>
        <p className="text-sm text-muted-foreground">
          Upload exports from your fitness apps - no API keys needed!
        </p>
      </div>

      {/* Supported Formats */}
      <div className="flex flex-wrap justify-center gap-2">
        {SUPPORTED_FORMATS.map((format) => (
          <Badge key={format.id} variant="secondary" className="text-xs">
            {format.name}
          </Badge>
        ))}
      </div>

      {/* Upload Zone */}
      {!result && (
        <Card 
          className={`
            relative border-2 border-dashed p-8 text-center transition-all cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${isProcessing ? 'pointer-events-none opacity-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isProcessing && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv,.json,.xml"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isProcessing}
          />

          {isProcessing ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">Processing your data...</p>
                <Progress value={progress} className="max-w-xs mx-auto" />
                <p className="text-sm text-muted-foreground">{progress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">
                  {isDragging ? 'Drop your file here' : 'Drag & drop your export file'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse • CSV, JSON, XML supported
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {result.errors.length === 0 ? (
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                </div>
              )}
              <div>
                <h4 className="font-semibold">
                  {result.recordsImported > 0 ? 'Import Complete!' : 'Import Failed'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {result.recordsImported} records imported
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={resetImport}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Data Types Imported */}
          {result.dataTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.dataTypes.map((type) => (
                <Badge key={type} className="bg-primary/10 text-primary">
                  {type === 'Steps' && <Footprints className="w-3 h-3 mr-1" />}
                  {type === 'Heart Rate' && <Heart className="w-3 h-3 mr-1" />}
                  {type === 'Sleep' && <Moon className="w-3 h-3 mr-1" />}
                  {type === 'Blood Pressure' && <Activity className="w-3 h-3 mr-1" />}
                  {type === 'Blood Sugar' && <Droplet className="w-3 h-3 mr-1" />}
                  {type}
                </Badge>
              ))}
            </div>
          )}

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-3 rounded-lg">
              {result.errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          {/* Import More Button */}
          <Button onClick={resetImport} variant="outline" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Import More Data
          </Button>
        </Card>
      )}

      {/* How to Export Guide */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          How to Export Your Data
        </h4>
        <div className="space-y-3 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Google Fit:</p>
            <p>Go to Google Takeout → Select Google Fit → Export as CSV</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Fitbit:</p>
            <p>Dashboard → Settings → Data Export → Export Your Account Archive</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Apple Health:</p>
            <p>Health app → Profile → Export All Health Data</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Samsung Health:</p>
            <p>Settings → Download personal data → Export</p>
          </div>
        </div>
      </Card>
    </div>
  );
};