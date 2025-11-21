import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log("Generating PDF report for user:", user.id);

    // Rate limiting: 5 PDF generations per hour
    const supabaseServiceRole = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: rateLimitOk, error: rateLimitError } = await supabaseServiceRole
      .rpc('check_rate_limit', {
        _user_id: user.id,
        _endpoint: 'generate-pdf-report',
        _max_requests: 5,
        _window_seconds: 3600
      });

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Too many PDF reports generated. Please try again in an hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch last 30 days of health data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    const [bpData, sugarData, heartScoreData] = await Promise.all([
      supabase.from('bp_logs').select('*').eq('user_id', user.id).gte('measured_at', thirtyDaysAgoStr).order('measured_at'),
      supabase.from('sugar_logs').select('*').eq('user_id', user.id).gte('measured_at', thirtyDaysAgoStr).order('measured_at'),
      supabase.from('heart_scores').select('*').eq('user_id', user.id).gte('score_date', thirtyDaysAgo.toISOString().split('T')[0]).order('score_date')
    ]);

    const bpLogs = bpData.data || [];
    const sugarLogs = sugarData.data || [];
    const heartScores = heartScoreData.data || [];

    // Calculate statistics
    const avgSystolic = bpLogs.length > 0 ? (bpLogs.reduce((sum, log) => sum + log.systolic, 0) / bpLogs.length).toFixed(1) : 'N/A';
    const avgDiastolic = bpLogs.length > 0 ? (bpLogs.reduce((sum, log) => sum + log.diastolic, 0) / bpLogs.length).toFixed(1) : 'N/A';
    const avgSugar = sugarLogs.length > 0 ? (sugarLogs.reduce((sum, log) => sum + log.glucose_mg_dl, 0) / sugarLogs.length).toFixed(1) : 'N/A';
    const avgHeartScore = heartScores.length > 0 ? Math.round(heartScores.reduce((sum, s) => sum + s.heart_score, 0) / heartScores.length) : 'N/A';

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 40px; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 3px solid #E63946;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #E63946;
      margin-bottom: 5px;
    }
    .tagline {
      font-size: 14px;
      color: #666;
    }
    .patient-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .patient-info h3 {
      margin: 0 0 10px 0;
      color: #E63946;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #E63946;
      margin-bottom: 4px;
    }
    .metric-sub {
      font-size: 11px;
      color: #999;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #E63946;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .data-table th {
      background: #f8f9fa;
      padding: 10px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #666;
      border-bottom: 2px solid #e9ecef;
    }
    .data-table td {
      padding: 8px 10px;
      font-size: 12px;
      border-bottom: 1px solid #e9ecef;
    }
    .disclaimer {
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      margin-top: 30px;
      font-size: 11px;
      color: #856404;
    }
    .disclaimer-title {
      font-weight: bold;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
      font-size: 11px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Beat</div>
    <div class="tagline">Keep Your Beat Strong</div>
    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">30-Day Health Summary Report</p>
    <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="patient-info">
    <h3>Patient Information</h3>
    <p style="margin: 5px 0;"><strong>Name:</strong> ${profile?.full_name || 'N/A'}</p>
    <p style="margin: 5px 0;"><strong>Email:</strong> ${profile?.email || user.email}</p>
    <p style="margin: 5px 0;"><strong>Report Period:</strong> ${thirtyDaysAgo.toLocaleDateString('en-IN')} - ${new Date().toLocaleDateString('en-IN')}</p>
  </div>

  <div class="metrics">
    <div class="metric-card">
      <div class="metric-label">Average Blood Pressure</div>
      <div class="metric-value">${avgSystolic}/${avgDiastolic}</div>
      <div class="metric-sub">${bpLogs.length} readings</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Average Blood Sugar</div>
      <div class="metric-value">${avgSugar} mg/dL</div>
      <div class="metric-sub">${sugarLogs.length} readings</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Average HeartScore</div>
      <div class="metric-value">${avgHeartScore}/100</div>
      <div class="metric-sub">30-day average</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Data Completeness</div>
      <div class="metric-value">${Math.round(((bpLogs.length + sugarLogs.length) / 60) * 100)}%</div>
      <div class="metric-sub">${bpLogs.length + sugarLogs.length} total logs</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Blood Pressure Readings</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Systolic</th>
          <th>Diastolic</th>
          <th>Heart Rate</th>
          <th>Ritual</th>
        </tr>
      </thead>
      <tbody>
        ${bpLogs.slice(-20).map(log => `
          <tr>
            <td>${new Date(log.measured_at).toLocaleDateString('en-IN')}</td>
            <td>${new Date(log.measured_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${log.systolic}</td>
            <td>${log.diastolic}</td>
            <td>${log.heart_rate || 'N/A'}</td>
            <td>${log.ritual_type || 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">Blood Sugar Readings</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Glucose (mg/dL)</th>
          <th>Type</th>
          <th>Ritual</th>
        </tr>
      </thead>
      <tbody>
        ${sugarLogs.slice(-20).map(log => `
          <tr>
            <td>${new Date(log.measured_at).toLocaleDateString('en-IN')}</td>
            <td>${new Date(log.measured_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${log.glucose_mg_dl}</td>
            <td>${log.measurement_type}</td>
            <td>${log.ritual_type || 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  ${heartScores.length > 0 ? `
  <div class="section">
    <h2 class="section-title">HeartScore Trend</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>HeartScore</th>
          <th>BP Score</th>
          <th>Sugar Score</th>
          <th>Consistency</th>
        </tr>
      </thead>
      <tbody>
        ${heartScores.slice(-15).map(score => `
          <tr>
            <td>${new Date(score.score_date).toLocaleDateString('en-IN')}</td>
            <td><strong>${score.heart_score}</strong></td>
            <td>${score.bp_score || 'N/A'}</td>
            <td>${score.sugar_score || 'N/A'}</td>
            <td>${score.consistency_score || 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="disclaimer">
    <div class="disclaimer-title">⚠️ Important Medical Disclaimer</div>
    <p style="margin: 0;">
      This report is generated from self-reported health data and is intended for informational purposes only. 
      It should NOT be used as a substitute for professional medical advice, diagnosis, or treatment. 
      Always consult with a qualified healthcare provider regarding any medical questions or conditions. 
      The data presented may not be medically accurate and should be verified by clinical measurements.
    </p>
  </div>

  <div class="footer">
    <p>Generated by Beat Health App • www.beat.health</p>
    <p>This report is confidential and intended solely for the patient and their healthcare provider.</p>
  </div>
</body>
</html>
    `;

    // Convert HTML to PDF using external API
    const pdfResponse = await fetch('https://api.html2pdf.app/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: html,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      })
    });

    if (!pdfResponse.ok) {
      throw new Error('Failed to generate PDF');
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    return new Response(JSON.stringify({ pdf: base64Pdf }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating PDF report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
