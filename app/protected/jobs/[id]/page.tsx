import Link from 'next/link';
import {createClient} from "@/lib/supabase/server";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import formatDate from '@/app/helpers/dateTimeFormatter';
import ApplyButton from '@/app/protected/components/ApplyButton'

interface JobPageProps {
  params: { id: string };
}


export default async function JobPage({params}: JobPageProps) {
    const {id}=await params;
    const supabase = await createClient();
    const { data: job, error } = await supabase
    .from("Job")
    .select("*")
    .eq("job_posting_id", id)
    .single();
    if (!job) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
                <p className="mb-4">The job you are looking for does not exist.</p>
                <Link href="/protected" className="text-sm text-primary underline">← Back</Link>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{job.job_title}</h1>
                    <div className="text-sm text-muted-foreground mt-1">{job.company_name} · {job.job_location}</div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {job.job_seniority_level && <span className="text-xs px-2 py-1 rounded bg-muted/60">{job.job_seniority_level}</span>}
                        {job.job_employment_type && <span className="text-xs px-2 py-1 rounded bg-muted/60">{job.job_employment_type}</span>}
                        {job.job_base_pay_range && <span className="text-xs px-2 py-1 rounded bg-muted/60">{job.job_base_pay_range}</span>}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="text-sm text-muted-foreground">Posted: {formatDate(job.job_posted_date)}</div>
                    <a href={job.apply_link || job.url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground">Apply</a>
                    <ApplyButton url={job.apply_link || job.url} />
                </div>
            </div>

            <Card>
                <CardHeader className="flex gap-6 items-start">
                    <div className="h-24 w-24 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={job.company_logo} alt={job.company_name} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">{job.job_title}</CardTitle>
                        <CardDescription className="mt-1">{job.job_summary}</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <div>Applicants: {job.job_num_applicants ?? '—'}</div>
                        {job.application_availability&&<div className="mt-1">Application Availability: {job.application_availability==true?'true':'false'}</div>}
                        {!job.application_availability&&<div className="mt-1">Application Availability: Unknown</div>}
                    </div>
                </CardHeader>

                <CardContent>
                    
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium">Company</h4>
                            <div className="text-sm"><a className="text-primary underline" href={job.company_url} target="_blank" rel="noreferrer">{job.company_name}</a></div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium">Details</h4>
                            <div className="text-sm">Location: {job.job_location}</div>
                            <div className="text-sm">Function: {job.job_function ?? '—'}</div>
                            <div className="text-sm">Industries: {(job.job_industries || [])+(', ') || '—'}</div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <details className="w-full">
                        <summary className="cursor-pointer text-sm text-muted-foreground">View raw JSON</summary>
                        <pre className="mt-2 max-h-72 overflow-auto bg-muted/20 p-3 rounded text-xs">{JSON.stringify(job, null, 2)}</pre>
                    </details>
                </CardFooter>
            </Card>

            <div>
                <Link href="/protected" className="text-sm text-primary underline">← Back</Link>
            </div>
        </div>
    );
}