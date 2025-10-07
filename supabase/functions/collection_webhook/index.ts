// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

console.log("Hello from collection_webhook!")

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response({ status: "ok" }, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // or restrict to your domain
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "x-client-info, apikey, content-type",
      },
    })
  }
  try{
    // BrightData sends snapshot_id header to identify the scrape
    const scrape_id=req.headers.get("snapshot-id")||'';
    if (scrape_id==='') throw new Error("No snapshot_id header");
    const results=await req.json();
    console.log("results ",results)
    console.log("Received results for scrape_id:", scrape_id);
    console.log("Number of results:", results.length);
    console.log(results)
    const supabase=createClient (
      Deno.env.get("SUPABASE_URL")?? '',
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?? '',
    )
    const insertedRows=[]
    for (const r of results) {
      const normalize = (val) => (val === undefined ? null : val);
      const insertjson={      
        job_posting_id: (r.job_posting_id),
        company_name: normalize(r.company_name),
        company_logo: normalize(r.company_logo),
        company_url: normalize(r.company_url),
        job_title: normalize(r.job_title),
        job_location: normalize(r.job_location),
        job_seniority_level: normalize(r.job_seniority_level),
        job_employment_type: normalize(r.job_employment_type),
        job_function: normalize(r.job_function),
        job_industries: normalize(r.job_industries),
        job_posted_date: normalize(r.job_posted_date),
        job_base_pay_range: normalize(r.job_base_pay_range),
        currency: normalize(r.base_salary.currency),
        min_amount: normalize(r.base_salary.min_amount),
        max_amount: normalize(r.base_salary.max_amount),
        payment_period: normalize(r.base_salary.payment_period),
        job_summary: normalize(r.job_summary),
        job_num_applicants: normalize(r.job_num_applicants),
        application_availability: normalize(r.application_availability),
        apply_link: normalize(r.apply_link),
        url: (r.url),
        company_id: normalize(r.company_id),
        country_code: normalize(r.country_code),
        job_description_formatted: normalize(r.job_description_formatted),
        job_posted_time: normalize(r.job_posted_time),
        scrape_id: (scrape_id),
      }
      console.log(insertjson)
      const { data: insertData, error } = await supabase.from("Job").insert(insertjson);
      insertedRows.push(insertData);
    } 
    await supabase
      .from("Query")
      .update({ status: "ready" })
      .eq("scrape_id", scrape_id);
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  }
  return new Response(
    JSON.stringify({status: 'ok', insertedRows}),
    { headers: { "Content-Type": "application/json" } },
  )
})

