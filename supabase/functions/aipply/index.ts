// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { GoogleGenerativeAI } from "npm:@google/generative-ai"; 

console.log("Hello from aipply Functions!")

Deno.serve(async (req) => {
  const { html } = await req.json()
  const data = {
    message: `Hello ${html}!`,
  }
  const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""  // MUST be service role
  );
  const apiKey = Deno.env.get("GOOGLE_GENAI_API_KEY");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const resumeText = Deno.env.get("RESUME") 
  const prompt = `
      You are given an HTML page and a resume with supplemental information.
      Using only the information provided, without making up values,
      Extract all user-facing form fields (input, select, textarea) and provide ONLY a JSON array
      in plain string/text format with:
      - id (or name if no id)
      - label (if present)
      - type
      - value filled using the provided information.
      It is crucial that the output generated is in valid JSON array format, with no extra information.
      Do NOT make up values; if you do not know the value after trying to extract from the given information,
      ignore the field and do not return it.
      This is how frontend will use it:
      if (type === 'checkbox') {
                // val should be boolean for checkbox
                field.checked = Boolean(val);
            } else if (type === 'radio') {
                // for radio, select the one with matching value
                const radios = document.querySelectorAll(name);
                radios.forEach(r => r.checked = r.value === val);
            } else if (field.tagName === 'SELECT' && [...field.options].some(o => o.value === val)) {
                field.value = val; // select the option with this value
            } else {
                field.value = val; // text, number, etc.
            }
      and output will be parsed to JSON. Hence, ensure the string has no unnecessary quotations as well.\n
      HTML:
      ${html}
      \n
      Resume text:
      ${resumeText}
    `;

  const result = await model.generateContent(prompt);
  let text = result.response.text();

  text = text
  .replace(/^```(?:json)?/i, "")   // remove opening ```json or ``` 
  .replace(/```$/, "")             // remove closing ```
  .trim();

  let replyJson;
  try {
    replyJson = JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI output as JSON:", text);
    return new Response(
      JSON.stringify({ error: "AI output is invalid JSON" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify(replyJson), {
    headers: { "Content-Type": "application/json" },
  });
})