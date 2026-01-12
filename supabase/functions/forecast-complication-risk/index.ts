import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RiskFactors {
  age: number;
  isMale: boolean;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasHeartDisease: boolean;
  bmi: number;
  avgSystolicBP: number;
  avgDiastolicBP: number;
  avgFastingGlucose: number;
  estimatedHbA1c: number;
  medicationAdherence: number;
  dailySteps: number;
  smokingStatus: string;
  cholesterolRatio: number;
}

function calculateCardiovascularRisk(factors: RiskFactors): number {
  // Simplified Framingham-inspired risk calculation
  let risk = 0;

  // Age factor (risk increases with age)
  if (factors.age >= 65) risk += 20;
  else if (factors.age >= 55) risk += 15;
  else if (factors.age >= 45) risk += 10;
  else if (factors.age >= 35) risk += 5;

  // Gender factor
  if (factors.isMale) risk += 5;

  // Blood pressure factor
  if (factors.avgSystolicBP >= 160) risk += 25;
  else if (factors.avgSystolicBP >= 140) risk += 15;
  else if (factors.avgSystolicBP >= 130) risk += 8;
  else if (factors.avgSystolicBP >= 120) risk += 3;

  // Diabetes factor
  if (factors.hasDiabetes) {
    risk += 15;
    if (factors.estimatedHbA1c >= 9) risk += 15;
    else if (factors.estimatedHbA1c >= 8) risk += 10;
    else if (factors.estimatedHbA1c >= 7) risk += 5;
  }

  // Heart disease history
  if (factors.hasHeartDisease) risk += 20;

  // BMI factor
  if (factors.bmi >= 35) risk += 10;
  else if (factors.bmi >= 30) risk += 7;
  else if (factors.bmi >= 25) risk += 3;

  // Activity level (protective factor)
  if (factors.dailySteps >= 10000) risk -= 10;
  else if (factors.dailySteps >= 7500) risk -= 7;
  else if (factors.dailySteps >= 5000) risk -= 4;
  else if (factors.dailySteps < 2500) risk += 5;

  // Medication adherence (protective factor)
  if (factors.medicationAdherence >= 90) risk -= 10;
  else if (factors.medicationAdherence >= 70) risk -= 5;
  else if (factors.medicationAdherence < 50) risk += 10;

  return Math.max(0, Math.min(100, risk));
}

function calculateDiabeticComplicationRisk(factors: RiskFactors): number {
  if (!factors.hasDiabetes) return 5; // Minimal baseline risk

  let risk = 20; // Baseline for diabetics

  // Glycemic control
  if (factors.estimatedHbA1c >= 10) risk += 40;
  else if (factors.estimatedHbA1c >= 9) risk += 30;
  else if (factors.estimatedHbA1c >= 8) risk += 20;
  else if (factors.estimatedHbA1c >= 7.5) risk += 10;
  else if (factors.estimatedHbA1c < 7) risk -= 5;

  // Blood pressure impact on diabetic complications
  if (factors.avgSystolicBP >= 140) risk += 15;
  else if (factors.avgSystolicBP >= 130) risk += 8;

  // Duration proxy (age as proxy since we don't track duration)
  if (factors.age >= 60) risk += 10;
  else if (factors.age >= 50) risk += 5;

  // Activity level
  if (factors.dailySteps >= 7500) risk -= 10;
  else if (factors.dailySteps < 3000) risk += 10;

  return Math.max(0, Math.min(100, risk));
}

function calculateKidneyDiseaseRisk(factors: RiskFactors): number {
  let risk = 5; // Baseline

  // Diabetes is a major risk factor
  if (factors.hasDiabetes) {
    risk += 20;
    if (factors.estimatedHbA1c >= 8) risk += 15;
  }

  // Hypertension impact on kidneys
  if (factors.hasHypertension || factors.avgSystolicBP >= 140) {
    risk += 15;
    if (factors.avgSystolicBP >= 160) risk += 15;
  }

  // Age factor
  if (factors.age >= 65) risk += 15;
  else if (factors.age >= 55) risk += 10;

  // Heart disease often correlates with kidney disease
  if (factors.hasHeartDisease) risk += 10;

  return Math.max(0, Math.min(100, risk));
}

function calculateStrokeRisk(factors: RiskFactors): number {
  let risk = 5; // Baseline

  // Blood pressure is the major factor
  if (factors.avgSystolicBP >= 180) risk += 35;
  else if (factors.avgSystolicBP >= 160) risk += 25;
  else if (factors.avgSystolicBP >= 140) risk += 15;
  else if (factors.avgSystolicBP >= 130) risk += 8;

  // Age
  if (factors.age >= 75) risk += 20;
  else if (factors.age >= 65) risk += 15;
  else if (factors.age >= 55) risk += 10;

  // Diabetes
  if (factors.hasDiabetes) risk += 10;

  // Heart disease
  if (factors.hasHeartDisease) risk += 15;

  // Gender
  if (factors.isMale && factors.age < 75) risk += 5;

  return Math.max(0, Math.min(100, risk));
}

function generateMitigationActions(risks: any, factors: RiskFactors): any[] {
  const actions: any[] = [];

  // BP-related actions
  if (factors.avgSystolicBP >= 130) {
    actions.push({
      action: 'Reduce sodium intake to less than 2300mg daily',
      impact: '-5 to -10 mmHg systolic BP',
      category: 'diet',
      priority: 'high',
    });
    actions.push({
      action: 'Increase potassium-rich foods (bananas, spinach, sweet potatoes)',
      impact: '-3 to -5 mmHg systolic BP',
      category: 'diet',
      priority: 'medium',
    });
  }

  // Activity-related actions
  if (factors.dailySteps < 7500) {
    actions.push({
      action: 'Increase daily walking to 7,500+ steps',
      impact: '-4 to -8 mmHg BP, -5% cardiovascular risk',
      category: 'activity',
      priority: 'high',
    });
  }

  // Diabetes-related actions
  if (factors.hasDiabetes && factors.estimatedHbA1c >= 7.5) {
    actions.push({
      action: 'Take 15-minute post-meal walks after each main meal',
      impact: '-20 to -30 mg/dL post-meal glucose',
      category: 'activity',
      priority: 'high',
    });
    actions.push({
      action: 'Reduce refined carbohydrates and increase fiber intake',
      impact: '-0.5% HbA1c over 3 months',
      category: 'diet',
      priority: 'high',
    });
  }

  // Weight-related actions
  if (factors.bmi >= 25) {
    actions.push({
      action: 'Aim for 5-7% weight loss over 6 months',
      impact: '-5 mmHg BP, -15% diabetes risk, improved insulin sensitivity',
      category: 'weight',
      priority: 'medium',
    });
  }

  // Medication adherence
  if (factors.medicationAdherence < 80) {
    actions.push({
      action: 'Set daily medication reminders and use pill organizer',
      impact: '-10 to -15% complication risk',
      category: 'medication',
      priority: 'high',
    });
  }

  return actions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, horizonMonths = 6 } = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    console.log(`Forecasting ${horizonMonths}-month risk for user:`, userId);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get recent health data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [bpResult, sugarResult, activityResult, medsResult, medLogsResult] = await Promise.all([
      supabase.from('bp_logs').select('systolic, diastolic')
        .eq('user_id', userId)
        .gte('measured_at', thirtyDaysAgo.toISOString()),
      supabase.from('sugar_logs').select('glucose_mg_dl, measurement_type')
        .eq('user_id', userId)
        .gte('measured_at', thirtyDaysAgo.toISOString()),
      supabase.from('activity_sessions').select('steps_count')
        .eq('user_id', userId)
        .gte('started_at', thirtyDaysAgo.toISOString()),
      supabase.from('medications').select('id')
        .eq('user_id', userId).eq('active', true),
      supabase.from('medication_logs').select('taken_at, skipped')
        .eq('user_id', userId)
        .gte('scheduled_at', thirtyDaysAgo.toISOString()),
    ]);

    // Calculate averages
    const bpLogs = bpResult.data || [];
    const avgSystolic = bpLogs.length > 0 
      ? Math.round(bpLogs.reduce((s, b) => s + b.systolic, 0) / bpLogs.length)
      : 120;
    const avgDiastolic = bpLogs.length > 0
      ? Math.round(bpLogs.reduce((s, b) => s + b.diastolic, 0) / bpLogs.length)
      : 80;

    const sugarLogs = sugarResult.data || [];
    const fastingSugar = sugarLogs.filter(s => s.measurement_type === 'fasting');
    const avgFastingGlucose = fastingSugar.length > 0
      ? Math.round(fastingSugar.reduce((s, g) => s + g.glucose_mg_dl, 0) / fastingSugar.length)
      : 100;
    
    // Estimate HbA1c from fasting glucose (simplified formula)
    const estimatedHbA1c = (avgFastingGlucose + 46.7) / 28.7;

    const activities = activityResult.data || [];
    const totalSteps = activities.reduce((s, a) => s + (a.steps_count || 0), 0);
    const daysWithActivity = activities.length > 0 ? Math.min(activities.length, 30) : 30;
    const dailySteps = Math.round(totalSteps / daysWithActivity);

    // Medication adherence
    const medLogs = medLogsResult.data || [];
    const takenCount = medLogs.filter(l => l.taken_at && !l.skipped).length;
    const medicationAdherence = medLogs.length > 0 
      ? Math.round((takenCount / medLogs.length) * 100)
      : 80; // Default assumption

    // Calculate BMI
    const heightM = (profile.height_cm || 165) / 100;
    const bmi = (profile.weight_kg || 70) / (heightM * heightM);

    // Calculate age
    const birthDate = profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(1970, 0, 1);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    const factors: RiskFactors = {
      age,
      isMale: profile.gender === 'male',
      hasDiabetes: profile.has_diabetes || false,
      hasHypertension: profile.has_hypertension || false,
      hasHeartDisease: profile.has_heart_disease || false,
      bmi,
      avgSystolicBP: avgSystolic,
      avgDiastolicBP: avgDiastolic,
      avgFastingGlucose,
      estimatedHbA1c,
      medicationAdherence,
      dailySteps,
      smokingStatus: 'unknown',
      cholesterolRatio: 4.0, // Default, could be tracked in future
    };

    // Calculate risks
    const currentRisks = {
      cardiovascular: calculateCardiovascularRisk(factors),
      diabeticComplications: calculateDiabeticComplicationRisk(factors),
      kidneyDisease: calculateKidneyDiseaseRisk(factors),
      stroke: calculateStrokeRisk(factors),
    };

    // Project risks forward (risks tend to increase without intervention)
    const monthlyIncrease = horizonMonths === 12 ? 0.8 : 0.5; // % per month
    const projectedRisks = {
      cardiovascular: Math.min(100, currentRisks.cardiovascular + (monthlyIncrease * horizonMonths)),
      diabeticComplications: Math.min(100, currentRisks.diabeticComplications + (monthlyIncrease * horizonMonths * (factors.hasDiabetes ? 1.5 : 0.5))),
      kidneyDisease: Math.min(100, currentRisks.kidneyDisease + (monthlyIncrease * horizonMonths * 0.8)),
      stroke: Math.min(100, currentRisks.stroke + (monthlyIncrease * horizonMonths)),
    };

    // Generate mitigation actions
    const mitigationActions = generateMitigationActions(currentRisks, factors);

    // Identify key risk factors
    const keyRiskFactors: string[] = [];
    if (factors.avgSystolicBP >= 130) keyRiskFactors.push('elevated_bp');
    if (factors.hasDiabetes && factors.estimatedHbA1c >= 7) keyRiskFactors.push('suboptimal_glucose');
    if (factors.medicationAdherence < 80) keyRiskFactors.push('poor_medication_adherence');
    if (factors.dailySteps < 5000) keyRiskFactors.push('low_activity');
    if (factors.bmi >= 25) keyRiskFactors.push('overweight');
    if (factors.age >= 60) keyRiskFactors.push('age_risk');

    // Save forecasts to database
    const riskTypes = ['cardiovascular_event', 'diabetic_complications', 'kidney_disease', 'stroke'];
    const currentRiskValues = [currentRisks.cardiovascular, currentRisks.diabeticComplications, currentRisks.kidneyDisease, currentRisks.stroke];
    const projectedRiskValues = [projectedRisks.cardiovascular, projectedRisks.diabeticComplications, projectedRisks.kidneyDisease, projectedRisks.stroke];

    for (let i = 0; i < riskTypes.length; i++) {
      await supabase.from('risk_forecasts').insert({
        user_id: userId,
        forecast_date: new Date().toISOString().split('T')[0],
        forecast_horizon_months: horizonMonths,
        risk_type: riskTypes[i],
        current_risk_percent: currentRiskValues[i],
        projected_risk_percent: projectedRiskValues[i],
        key_risk_factors: keyRiskFactors,
        mitigation_actions: mitigationActions.filter(a => 
          a.category === (riskTypes[i].includes('diabetic') ? 'diet' : 'all') || a.priority === 'high'
        ),
        confidence_score: Math.min(90, 50 + (bpLogs.length * 2) + (sugarLogs.length)),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        horizonMonths,
        currentRisks,
        projectedRisks,
        keyRiskFactors,
        mitigationActions,
        dataQuality: {
          bpReadings: bpLogs.length,
          sugarReadings: sugarLogs.length,
          activityDays: activities.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in forecast-complication-risk:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Forecast failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
