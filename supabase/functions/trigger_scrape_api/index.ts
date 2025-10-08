// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'


console.log("Hello from trigger_scrape!")

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response({ status: "ok" }, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // or restrict to your domain
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    })
  }
  try {
    const body = await req.json();
    const {
      location,
      keyword,
      selective_search,
      country,
      time_range,
      job_type,
      experience_level,
      remote,
      company,
      location_radius,
      num_requested
    } = body;
    console.log("Request body:", body)
    const input_json = {}
    if (location) input_json.location = location;
    if (keyword) input_json.keyword = keyword;
    if (selective_search) input_json.selective_search = selective_search;
    if (country) input_json.country = country;
    if (time_range) input_json.time_range = time_range;
    if (job_type) input_json.job_type = job_type;
    if (experience_level) input_json.experience_level = experience_level;
    if (remote) input_json.remote = remote;
    if (company) input_json.company = company;
    if (location_radius) input_json.location_radius = location_radius;
    const input_json_array = [input_json];
    console.log(input_json)
    // Trigger BrightData scrape
    const bd_response = await fetch(
      `https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_lpfll7v5hcqtkxl6l&endpoint=https%3A%2F%2Faffrofwhuqporiyygjbd.supabase.co%2Ffunctions%2Fv1%2Fcollection_webhook&format=json&uncompressed_webhook=true&include_errors=true&type=discover_new&discover_by=keyword&limit_per_input=${num_requested===''?1:num_requested}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("BRIGHTDATA_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input_json_array),
      }
    );

    const text = await bd_response.text();
    console.log("BrightData raw response:", text);

    let data_results;
    try {
      data_results = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse BrightData JSON:", e);
      throw new Error(`BrightData returned invalid JSON: ${text.slice(0,200)}`);
    }


    // Insert into Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""  // MUST be service role
    );



    const normalize = (val: any) => (val === undefined ? null : val);

    const { data, error } = await supabase.from("Query").insert({
      ...input_json,
      scrape_id: data_results.snapshot_id!,
      num_requested: num_requested===''?1:num_requested,
      status: "running",
    });

    if (error) {console.log(error);throw error;}
    return new Response(JSON.stringify(data), {
      headers: {
        "Access-Control-Allow-Origin": "*",  // <-- allow frontend
        "Content-Type": "application/json",
      },
  })} catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  }
})

 
