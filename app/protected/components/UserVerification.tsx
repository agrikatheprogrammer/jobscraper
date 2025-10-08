import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
export default async function UserVerification() {
    const supabase = await createClient();

    // You can also use getUser() which will be slower.
    const { data } = await supabase.auth.getClaims();

    const user = data?.claims;

    return <Link href={user?'/protected':'/'}>JobAI</Link>
}