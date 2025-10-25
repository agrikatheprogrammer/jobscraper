"use client";
import Image from 'next/image';
export default function ApplyButton({ url, job_description }: { url: string , job_description: string}) {
  return (
    <button
      onClick={() =>
        fetch("/api/run_puppeteer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, job_description }),
        })
      }
    >
      <Image src="/puppeteericon.png" alt="puppeteer+gemini" width={10} height={10}/>
    </button>
  );
}