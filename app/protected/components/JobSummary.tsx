'use client'
import {useState} from "react";
import { Collapse, Paper } from "@mui/material";

interface JobSummaryProps {
    job_summary: string;
    url: string;
}

export default function JobSummary({job_summary, url}: JobSummaryProps) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className='mb-4 mt-2 border text-black rounded-md p-2 bg-card'>
            <Collapse
                in={expanded}
                collapsedSize='6rem' 
                timeout="auto"
            >
                <div className="text-sm leading-snug">
                {job_summary ? job_summary : url}
                </div>
            </Collapse>
            <button
                size="small"
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-xs text-muted-foreground border-1"
            >
                {expanded ? "Show less" : "Show more"}
            </button>
        </div>
    )
}