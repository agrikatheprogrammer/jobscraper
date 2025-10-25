"use client";
import Image from 'next/image';
export default function ApplyButton({ url }: { url: string }) {
  return (
    <button
      onClick={() =>
        fetch("/api/run_puppeteer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
      }
    >
      <Image src="/puppeteericon.png" width={10} height={10}/>
    </button>
  );
}