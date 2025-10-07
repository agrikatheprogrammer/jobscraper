"use client";
import { redirect } from "next/navigation";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import Box from '@mui/material/Box'
import Link from "next/link";
import './styles.css'
import { useState, useEffect } from 'react'
import { createClient } from "@/lib/supabase/client";

export default function ProtectedPage() {
  const [selective_search, setSelectiveSearch] = useState(false);
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('');
  const [time_range, setTimeRange] = useState('');
  const [job_type, setJobType] = useState('');
  const [experience_level, setExperienceLevel] = useState('');
  const [remote, setRemote] = useState('');
  const [company, setCompany] = useState('');
  const [location_radius, setLocationRadius] = useState('');
  const [queries, setQueries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.from("Query").select().eq("status", "ready").order('created_at', { ascending: false });
        if (error) {
          setError(error.message);
        } else {
          setQueries(data || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, []);

  const startFetching = async () => {
    const supabase = await createClient();
    const {
    data: { session },
    } = await supabase.auth.getSession();
    console.log(session)
    const payload={
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
      }
    const { error, data } = await supabase.functions.invoke("trigger_scrape_api", {
      method: "POST",
      body: payload,
      headers: { "Authorization": `Bearer ${session.access_token}`
      },
    });
    console.log(error, data);
  };

  if (loading) return <div>Loading queries...</div>
  if (error) return <div>Error loading queries: {error}</div>

  return (
    <Box>
      <div className="filters-wrap">
        <form id="query_filters" method="POST" onSubmit={(e) => { e.preventDefault(); startFetching(); }}>
          <div className="filters-grid">
            <div className="field">
              <label className='required' htmlFor="location">Location</label>
              <input id="location" name="location" placeholder="" onChange={(e)=>setLocation(e.target.value)} required />
            </div>

            <div className="field wide">
              <label htmlFor="keyword">Keyword</label>
              <input id="keyword" name="keyword" placeholder='' onChange={e=>setKeyword(e.target.value)} />
            </div>

            <div className="field small">
              <label htmlFor="country">Country</label>
              <select id='country' name="country" onChange={e=>setCountry(e.target.value)} defaultValue=''> 
                <option value=''></option>
                <option value='US'>USA</option>
                <option value='SG'>Singapore</option>
                <option value='GB'>UK</option>
                <option value='FR'>France</option>
                <option value='DE'>Germany</option>
                <option value='IN'>India</option>
                <option value='AU'>Australia</option>
                <option value='JP'>Japan</option>
              </select>
            </div>

            <div className="field small">
              <label htmlFor="time_range">Time range</label>
              <select id="time_range" name="time_range" onChange={e=>setTimeRange(e.target.value)} defaultValue="">
                <option value=""></option>
                <option value="Anytime">Any time</option>
                <option value="Past 24 hours">Past 24 hours</option>
                <option value="Past Week">Past week</option>
                <option value="Past Month">Past month</option>
              </select>
            </div>

            <div className="field small">
              <label htmlFor="job_type">Job type</label>
              <select id="job_type" name="job_type" onChange={e=>setJobType(e.target.value)} defaultValue="">
                <option value=""></option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div className="field small">
              <label htmlFor="experience_level">Experience level</label>
              <select id="experience_level" name="experience_level" onChange={e=>setExperienceLevel(e.target.value)} defaultValue="">
                <option value=""></option>
                <option value="Entry level">Entry level</option>
                <option value="Mid-Senior level">Mid-Senior level</option>
                <option value="Internship">Internship</option>
                <option value='Associate'>Associate</option>
                <option value='Director'>Director</option>
                <option value='Executive'>Executive</option>
              </select>
            </div>

            <div className="field small">
              <label htmlFor="remote">Remote</label>
              <select id="remote" name="remote" onChange={e=>setRemote(e.target.value)} defaultValue="">
                <option value=""></option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" placeholder="" onChange={e=>setCompany(e.target.value)}/>
            </div>

            <div className="field small">
              <label htmlFor='location_radius'>Location radius</label>
              <select id='location_radius' name='location_radius' defaultValue='' onChange={e=>setLocationRadius(e.target.value)}>
                <option value=''></option>
                <option value='Exact location'>Exact location</option>
                <option value='5 miles (8 km)'>5 miles (8 km)</option>
                <option value='10 miles (16 km)'>10 miles (16 km)</option>
                <option value='25 miles (40 km)'>25 miles (40 km)</option>
                <option value='50 miles (80 km)'>50 miles (80 km)</option>
              </select>
            </div>

            <div className="field inline">
              <label htmlFor="selective_search">Selective</label>
              <input id="selective_search" type="checkbox" name="selective_search" onChange={e=>setSelectiveSearch(e.target.checked)}/>
            </div>

            <div className="field action">
              <button type="submit" className="discover">Discover</button>
            </div>
          </div>
        </form>
      </div>

      {queries?.map((query)=>(
        <div key={query.scrape_id} style={{marginBottom: '20px'}}>
        <Card key={query.scrape_id}>
          <CardHeader>
            <CardTitle>
              <Link key={query.scrape_id} href={`protected/results/${query.scrape_id}`}>Results for {query.scrape_id}</Link>
             </CardTitle>
          </CardHeader>
          <CardContent>
              <div>{query.location}</div>
              {query.keyword&&<div>Keyword: {query.keyword}</div>}
              {query.company&&<div>Company: {query.company}</div>}
              {query.country&&<div>Country: {query.country}</div>}
              {query.time_range&&<div>Time range: {query.time_range}</div>}
              {query.job_type&&<div>Job type: {query.job_type}</div>}
              {query.experience_level&&<div>Experience level: {query.experience_level}</div>}
              {query.remote&&<div>Remote: {query.remote}</div>}
              {query.location_radius&&<div>Location radius: {query.location_radius}</div>}
          </CardContent>
        </Card>
        </div>
      ))}
    </Box>
  );
}
