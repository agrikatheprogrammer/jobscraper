import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import JobSummary from "@/app/protected/components/JobSummary";
function formatDate(input?: string | null) {
  if (!input) return null;
  try {
    const d = new Date(input);
    const datePart = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // set to true for AM/PM
    });
    return `${datePart} ${timePart}`; // just a space, no comma
  } catch {
    return input;
  }
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
    .eq("scrape_id", scrape_id)
    .order('job_posted_date', { ascending: false });

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
                    job_base_pay_range,
                    job_num_applicants,
                    job_seniority_level,
                    job_posted_date,
                    min_amount,
                    max_amount,
                    currency,
                    apply_link,
                    job_title,
                    url,
                } = job;

                const date = formatDate(job_posted_date);
                const detailHref = job_posting_id
                    ? `/protected/jobs/${encodeURIComponent(job_posting_id)}`
                    : url
                        ? `${encodeURIComponent(url)}`
                        : '#';

                return (
                    <Card key={job_posting_id} className="overflow-hidden">
                        <CardHeader className="flex items-start gap-2 pb-0">
                            <div className='flex flex-row gap-4 items-center'>
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
                                <Link href={detailHref} className="text-lg font-semibold leading-tight">{job_title}</Link>
                            </div>
                            <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                                {company_name && <span className="py-0.5 rounded-md bg-muted/60">{company_name}</span>}
                                {job_location && <span className="px-2 py-0.5 rounded-md bg-muted/60">{job_location}</span>}
                                {job_employment_type && <span className="px-2 py-0.5 rounded-md bg-muted/60">{job_employment_type}</span>}
                                {job_seniority_level && <span className="px-2 py-0.5 rounded-md bg-muted/60">{job_seniority_level}</span>}
                            </div>
                            </div>

                            <div className="text-xs text-black">
                            {date && <div>{date}</div>}
                            {job.job_base_pay_range && <div className="mt-1">{job_base_pay_range}</div>}
                            </div>
                        </CardHeader>

                        <CardContent>
                            <JobSummary job_summary={job_summary?job_summary:''} url={url?url:''} />
                            <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-2 text-sm">
                                {apply_link ? (
                                <a href={apply_link} target="_blank" rel="noopener noreferrer" className="text-primary underline">Apply</a>
                                ) : url ? (
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>
                                ) : null}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Applicants: {job_num_applicants ?? "—"}
                            </div>
                            </div>
                        </CardContent>
                        </Card>
                );
            })}
        </div>
    );
}