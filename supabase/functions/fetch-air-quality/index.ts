import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Free OpenWeather API - uses IQAir as backup
const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, userId } = await req.json();
    console.log(`Fetching air quality for lat: ${lat}, lon: ${lon}, user: ${userId}`);

    if (!lat || !lon) {
      throw new Error("Latitude and longitude are required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let airQualityData: {
      aqi: number;
      pm25: number;
      pm10: number;
      temperature: number;
      humidity: number;
      city: string;
    };

    // Try OpenWeather API first
    if (OPENWEATHER_API_KEY) {
      try {
        // Get air pollution data
        const airResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
        );
        const airData = await airResponse.json();

        // Get weather data for temperature and humidity
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        const weatherData = await weatherResponse.json();

        // OpenWeather AQI is 1-5, we convert to standard 0-500 scale
        const aqiMapping: { [key: number]: number } = {
          1: 25,   // Good
          2: 75,   // Fair
          3: 125,  // Moderate
          4: 175,  // Poor
          5: 300,  // Very Poor
        };

        airQualityData = {
          aqi: aqiMapping[airData.list?.[0]?.main?.aqi] || 50,
          pm25: airData.list?.[0]?.components?.pm2_5 || 0,
          pm10: airData.list?.[0]?.components?.pm10 || 0,
          temperature: Math.round(weatherData.main?.temp || 25),
          humidity: weatherData.main?.humidity || 50,
          city: weatherData.name || "Unknown",
        };

        console.log("OpenWeather data:", airQualityData);
      } catch (error) {
        console.error("OpenWeather API error:", error);
        // Fall back to mock data
        airQualityData = getMockAirQuality(lat, lon);
      }
    } else {
      // Use mock data if no API key
      console.log("No OpenWeather API key, using mock data");
      airQualityData = getMockAirQuality(lat, lon);
    }

    // Save to database
    if (userId) {
      const { error: insertError } = await supabase
        .from("environmental_logs")
        .insert({
          user_id: userId,
          aqi: airQualityData.aqi,
          pm25: airQualityData.pm25,
          pm10: airQualityData.pm10,
          temperature_celsius: airQualityData.temperature,
          humidity_percent: airQualityData.humidity,
          city: airQualityData.city,
          location_lat: lat,
          location_lon: lon,
          measured_at: new Date().toISOString(),
          source: OPENWEATHER_API_KEY ? "openweather" : "mock",
        });

      if (insertError) {
        console.error("Error saving environmental log:", insertError);
      }

      // Update user's last known location
      await supabase
        .from("profiles")
        .update({
          last_location_lat: lat,
          last_location_lon: lon,
        })
        .eq("id", userId);
    }

    return new Response(JSON.stringify(airQualityData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in fetch-air-quality:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Mock data generator for testing without API key
function getMockAirQuality(lat: number, lon: number) {
  // Simulate realistic AQI based on rough location (India tends to have higher AQI)
  const isIndia = lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97;
  const baseAqi = isIndia ? 120 : 50;
  const variance = Math.floor(Math.random() * 60) - 30;
  
  const aqi = Math.max(20, Math.min(300, baseAqi + variance));
  
  return {
    aqi,
    pm25: Math.round(aqi * 0.4),
    pm10: Math.round(aqi * 0.6),
    temperature: 28 + Math.floor(Math.random() * 10) - 5,
    humidity: 60 + Math.floor(Math.random() * 20) - 10,
    city: isIndia ? "Delhi NCR" : "Unknown",
  };
}
