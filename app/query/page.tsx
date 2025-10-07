import { createClient } from "@/lib/supabase/server";

export default async function Query() {
  const supabase = await createClient();
  const { data: queries } = await supabase.from("Query").select();
  
  return <pre>{JSON.stringify(queries, null, 2)}</pre>
}