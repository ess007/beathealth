import { useState, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Upload, CheckCircle2, AlertCircle, 
  Activity, Droplets, TrendingUp, TrendingDown, Minus, X
} from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CGMReading {
  glucose: number;
  timestamp: string;
  trend?: string;
}

interface ImportResult {
  source: string;
  recordsImported: number;
  avgGlucose: number;
  timeInRange: number;
  errors: string[];
}

const SUPPORTED_SOURCES = [
  { id: 'librelink', name: 'LibreLink', description: 'FreeStyle Libre app export' },
  { id: 'dexcom', name: 'Dexcom Clarity', description: 'Dexcom CGM export' },
  { id: 'nightscout', name: 'Nightscout', description: 'Nightscout JSON export' },
  { id: 'generic', name: 'Generic CSV', description: 'Any CSV with glucose data' },
];

export const CGMDataImporter = () => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const detectTrend = (readings: CGMReading[], index: number): string => {
    if (index < 2) return 'stable';
    const current = readings[index].glucose;
    const prev1 = readings[index - 1].glucose;
    const prev2 = readings[index - 2].glucose;
    
    const rate = (current - prev2) / 2; // mg/dL per reading
    
    if (rate > 3) return 'rising_fast';
    if (rate > 1) return 'rising';
    if (rate < -3) return 'falling_fast';
    if (rate < -1) return 'falling';
    return 'stable';
  };

  const parseLibreLinkCSV = (content: string): CGMReading[] => {
    const lines = content.trim().split('\n');
    const readings: CGMReading[] = [];
    
    // LibreLink CSVs typically have headers with 'Glucose Value' or similar
    let glucoseIndex = -1;
    let timeIndex = -1;
    
    // Find header line
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('glucose') || line.includes('value')) {
        const headers = lines[i].split(',').map(h => h.toLowerCase().trim());
        glucoseIndex = headers.findIndex(h => 
          h.includes('glucose') || h.includes('value') || h.includes('reading')
        );
        timeIndex = headers.findIndex(h => 
          h.includes('time') || h.includes('date') || h.includes('timestamp')
        );
        
        if (glucoseIndex === -1 && headers.some(h => /^\d+$/.test(h.replace(/['"]/g, '')))) {
          glucoseIndex = headers.findIndex(h => /^\d+$/.test(h.replace(/['"]/g, '')));
        }
        
        // Start processing from next line
        for (let j = i + 1; j < lines.length; j++) {
          const values = lines[j].split(',').map(v => v.replace(/['"]/g, '').trim());
          const glucose = parseFloat(values[glucoseIndex] || values[1] || '');
          
          if (!isNaN(glucose) && glucose > 20 && glucose < 600) {
            let timestamp = values[timeIndex] || values[0];
            try {
              const date = new Date(timestamp);
              if (!isNaN(date.getTime())) {
                readings.push({ glucose, timestamp: date.toISOString() });
              }
            } catch {
              // Use current time with offset for ordering
              readings.push({ 
                glucose, 
                timestamp: new Date(Date.now() - (lines.length - j) * 15 * 60000).toISOString() 
              });
            }
          }
        }
        break;
      }
    }
    
    return readings;
  };

  const parseDexcomCSV = (content: string): CGMReading[] => {
    const lines = content.trim().split('\n');
    const readings: CGMReading[] = [];
    
    let startLine = 0;
    // Dexcom files often have metadata at the start
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      if (lines[i].toLowerCase().includes('glucose value') || 
          lines[i].toLowerCase().includes('timestamp')) {
        startLine = i + 1;
        break;
      }
    }
    
    for (let i = startLine; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/['"]/g, '').trim());
      
      // Dexcom format: Index, Timestamp, Event Type, Event Subtype, Patient Info, Device Info, Source Device ID, Glucose Value (mg/dL), ...
      const glucose = parseFloat(values[7] || values[1] || '');
      const timestamp = values[1] || values[0];
      
      if (!isNaN(glucose) && glucose > 20 && glucose < 600) {
        try {
          const date = new Date(timestamp);
          if (!isNaN(date.getTime())) {
            readings.push({ glucose, timestamp: date.toISOString() });
          }
        } catch {
          continue;
        }
      }
    }
    
    return readings;
  };

  const parseGenericCSV = (content: string): CGMReading[] => {
    const lines = content.trim().split('\n');
    const readings: CGMReading[] = [];
    
    if (lines.length < 2) return readings;
    
    const headers = lines[0].split(',').map(h => h.toLowerCase().trim().replace(/['"]/g, ''));
    const glucoseIndex = headers.findIndex(h => 
      h.includes('glucose') || h.includes('sugar') || h.includes('value') || h.includes('reading')
    );
    const timeIndex = headers.findIndex(h => 
      h.includes('time') || h.includes('date') || h.includes('timestamp')
    );
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/['"]/g, '').trim());
      const glucose = parseFloat(values[glucoseIndex !== -1 ? glucoseIndex : 1] || '');
      const timestamp = values[timeIndex !== -1 ? timeIndex : 0];
      
      if (!isNaN(glucose) && glucose > 20 && glucose < 600) {
        try {
          const date = new Date(timestamp);
          if (!isNaN(date.getTime())) {
            readings.push({ glucose, timestamp: date.toISOString() });
          }
        } catch {
          continue;
        }
      }
    }
    
    return readings;
  };

  const parseNightscoutJSON = (content: string): CGMReading[] => {
    try {
      const data = JSON.parse(content);
      const entries = Array.isArray(data) ? data : data.entries || data.data || [];
      
      return entries
        .filter((e: any) => e.sgv || e.glucose || e.value)
        .map((e: any) => ({
          glucose: e.sgv || e.glucose || e.value,
          timestamp: new Date(e.dateString || e.date || e.timestamp).toISOString(),
          trend: e.direction || e.trend,
        }))
        .filter((r: CGMReading) => r.glucose > 20 && r.glucose < 600);
    } catch {
      return [];
    }
  };

  const importToDB = async (readings: CGMReading[]): Promise<ImportResult> => {
    if (!user) throw new Error('Not authenticated');

    const result: ImportResult = {
      source: 'cgm_import',
      recordsImported: 0,
      avgGlucose: 0,
      timeInRange: 0,
      errors: [],
    };

    if (readings.length === 0) {
      result.errors.push('No valid CGM readings found');
      return result;
    }

    // Sort by timestamp
    readings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Add trends
    const readingsWithTrends = readings.map((r, i) => ({
      ...r,
      trend: r.trend || detectTrend(readings, i),
    }));

    // Calculate statistics
    const glucoseValues = readings.map(r => r.glucose);
    result.avgGlucose = Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length);
    
    // Time in range (70-180 mg/dL)
    const inRange = glucoseValues.filter(g => g >= 70 && g <= 180).length;
    result.timeInRange = Math.round((inRange / glucoseValues.length) * 100);

    // Insert in batches
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < readingsWithTrends.length; i += batchSize) {
      batches.push(readingsWithTrends.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const toInsert = batch.map(r => ({
        user_id: user.id,
        glucose_mg_dl: Math.round(r.glucose),
        trend_arrow: r.trend,
        measured_at: r.timestamp,
        source: 'imported',
        time_in_range: r.glucose >= 70 && r.glucose <= 180,
      }));

      const { error } = await supabase.from('cgm_readings').insert(toInsert);

      if (error) {
        result.errors.push(`Batch insert error: ${error.message}`);
      } else {
        result.recordsImported += toInsert.length;
      }
    }

    // Log the import
    await supabase.from('fitness_imports').insert({
      user_id: user.id,
      source_type: 'cgm',
      records_imported: result.recordsImported,
      data_types: ['CGM'],
      import_status: 'completed',
      raw_data: { avgGlucose: result.avgGlucose, timeInRange: result.timeInRange },
    });

    return result;
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      haptic('light');
      
      setProgress(20);
      const content = await file.text();
      const fileName = file.name.toLowerCase();
      
      setProgress(40);
      let readings: CGMReading[] = [];
      
      if (fileName.includes('libre') || fileName.includes('freestyle')) {
        readings = parseLibreLinkCSV(content);
      } else if (fileName.includes('dexcom') || fileName.includes('clarity')) {
        readings = parseDexcomCSV(content);
      } else if (fileName.endsWith('.json')) {
        readings = parseNightscoutJSON(content);
      } else {
        readings = parseGenericCSV(content);
      }

      setProgress(60);
      
      if (readings.length === 0) {
        throw new Error('No valid CGM readings found. Please ensure your file contains glucose values.');
      }

      setProgress(80);
      const importResult = await importToDB(readings);
      setResult(importResult);
      setProgress(100);

      haptic('success');
      toast.success(`Imported ${importResult.recordsImported} CGM readings!`);

    } catch (error: any) {
      haptic('error');
      toast.error(error.message || 'Failed to import CGM data');
      setResult({
        source: 'error',
        recordsImported: 0,
        avgGlucose: 0,
        timeInRange: 0,
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising_fast':
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'falling_fast':
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      default:
        return <Minus className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center">
          <Activity className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold">Import CGM Data</h3>
        <p className="text-sm text-muted-foreground">
          Upload exports from your continuous glucose monitor
        </p>
      </div>

      {/* Supported Sources */}
      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED_SOURCES.map((source) => (
          <div key={source.id} className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-sm font-medium">{source.name}</p>
            <p className="text-xs text-muted-foreground">{source.description}</p>
          </div>
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
          onClick={() => !isProcessing && document.getElementById('cgm-file-input')?.click()}
        >
          <input
            id="cgm-file-input"
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isProcessing}
          />

          {isProcessing ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Droplets className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">Processing CGM data...</p>
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
                  {isDragging ? 'Drop your CGM export here' : 'Drag & drop CGM export file'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse • CSV, JSON supported
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
                  {result.errors.length === 0 ? 'Import Successful' : 'Import Completed with Errors'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {result.recordsImported} CGM readings imported
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setResult(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats */}
          {result.recordsImported > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-blue-500">{result.avgGlucose}</p>
                <p className="text-xs text-muted-foreground">Avg Glucose (mg/dL)</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className={`text-2xl font-bold ${result.timeInRange >= 70 ? 'text-green-500' : result.timeInRange >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {result.timeInRange}%
                </p>
                <p className="text-xs text-muted-foreground">Time in Range</p>
              </div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {result.errors.join(', ')}
              </p>
            </div>
          )}

          <Button onClick={() => setResult(null)} variant="outline" className="w-full">
            Import More Data
          </Button>
        </Card>
      )}

      {/* Instructions */}
      <div className="space-y-3 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground">How to export:</h4>
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-medium text-foreground">FreeStyle Libre / LibreLink</p>
            <p>Open LibreLink app → Menu → Share → Export data as CSV</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-medium text-foreground">Dexcom Clarity</p>
            <p>Log into clarity.dexcom.com → Reports → Export → CSV</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-medium text-foreground">Nightscout</p>
            <p>Access your Nightscout URL → Reports → Export JSON</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGMDataImporter;
