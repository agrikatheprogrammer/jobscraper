import { createClient } from "@/lib/supabase/server";

export default async function Queries() {
  const supabase = await createClient();
  const { data: queries } = await supabase.from("query").select();

  return <pre>{JSON.stringify(queries, null, 2)}</pre>
}