import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function formatDate(input?: string | null) {
    if (!input) return null;
    try {
        const d = new Date(input);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return input;
    }
}

function formatSalary(min?: number | null, max?: number | null, currency?: string | null) {
    if (min == null && max == null) return null;
    const c = currency || '';
    if (min != null && max != null) return `${c}${min.toLocaleString()} - ${c}${max.toLocaleString()}`;
    if (min != null) return `${c}${min.toLocaleString()}+`;
    return `${c}${(max ?? 0).toLocaleString()}`;
}

interface ResultsPageProps {
  params: { scrape_id: string };
}

export default async function Results({ params }: ResultsPageProps) {
  const { scrape_id } = await params;

  const supabase = await createClient();

  const { data: jobs, error: jerror } = await supabase
    .from("Job")
    .select("*")
    .eq("scrape_id", scrape_id);

  if (jerror) {
    return <div>Error: {jerror.message}</div>;
  }

  if (!jobs || jobs.length === 0) {
    return <div className="text-sm text-muted-foreground">No jobs found.</div>;
  }
    return (
        <div className="flex flex-col gap-4">
            {jobs.map((job: any) => {
                const {
                    job_posting_id,
                    company_name,
                    company_logo,
                    job_summary,
                    job_location,
                    job_employment_type,
                    job_seniority_level,
                    job_posted_date,
                    min_amount,
                    max_amount,
                    currency,
                    apply_link,
                    url,
                } = job;

                const date = formatDate(job_posted_date);
                const salary = formatSalary(min_amount, max_amount, currency);
                const detailHref = job_posting_id
                    ? `/protected/jobs/${encodeURIComponent(job_posting_id)}`
                    : url
                        ? `${encodeURIComponent(url)}`
                        : '#';

                return (
                    <Card key={job_posting_id} className="overflow-hidden">
                        <CardHeader className="flex items-start gap-4 pb-0">
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            {company_logo ? (
                                <img
                                src={company_logo}
                                alt={`${company_name || "company"} logo`}
                                className="h-full w-full object-contain"
                                />
                            ) : (
                                <div className="text-xs text-muted-foreground px-2">No logo</div>
                            )}
                            </div>

                            <div className="flex-1 min-w-0">
                            <Link href={detailHref} className="text-lg font-semibold leading-tight">{job.job_title}</Link>
                            <CardTitle className="text-sm font-semibold mt-1">
                                <div className="truncate text-inherit block">
                                {job_summary ? job_summary.split("\n")[0] : url}
                                </div>
                            </CardTitle>
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                                {company_name && <span className="px-2 py-0.5 rounded-md bg-muted/60">{company_name}</span>}
                                {job_location && <span className="px-2 py-0.5 rounded-md bg-muted/60">{job_location}</span>}
                                {job_employment_type && <span className="px-2 py-0.5 rounded-md bg-muted/60">{job_employment_type}</span>}
                                {job_seniority_level && <span className="px-2 py-0.5 rounded-md bg-muted/60">{job_seniority_level}</span>}
                            </div>
                            </div>

                            <div className="text-right text-xs text-muted-foreground">
                            {date && <div>{date}</div>}
                            {salary && <div className="mt-1">{salary}</div>}
                            </div>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-foreground/90 mb-3 line-clamp-3">
                            {job_summary || "No description available."}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-2 text-sm">
                                {apply_link ? (
                                <a href={apply_link} target="_blank" rel="noopener noreferrer" className="text-primary underline">Apply</a>
                                ) : url ? (
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>
                                ) : null}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Applicants: {job.job_num_applicants ?? "—"}
                            </div>
                            </div>
                        </CardContent>
                        </Card>
                );
            })}
        </div>
    );
}