/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // needed for client-side interactivity in Next.js App Router
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [n8nResponse, setN8nResponse] = useState<string>("No response yet");

  async function triggerWebhook() {
    try {
      const res = await fetch(
        "http://192.168.1.74:5678/webhook-test/699eab3c-1af1-4959-94e7-bbe1adcf9f72"
      );

      const text = await res.text();
      setN8nResponse(text);
      console.log("n8n response:", text);
    } catch (err: any) {
      setN8nResponse("Error: " + err.message);
    }
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/assets/vector01.png"
          alt="Vector Logo"
          width={380}
          height={38}
          priority
        />

        {/* Button to trigger webhook */}
        <button
          onClick={triggerWebhook}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
        >
          Trigger n8n Webhook
        </button>

        {/* Show n8n response */}
        <div className="mt-4 p-3 border rounded bg-gray-100 text-sm">
          <strong>N8N RESPONSE:</strong> {n8nResponse}
        </div>

        <Image
          className="dark:invert mt-8"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
      </main>
    </div>
  );
}
