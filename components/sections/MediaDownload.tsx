"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useStory } from "@/lib/context/AppContext";

export default function MediaDownload() {
  const {requestIpa, isPaid} = useStory();
  const [requestBlobId, setRequestBlobId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const AGGREGATOR = process.env.WALRUS_AGGREGATOR_ADDRESS || 'https://walrus-testnet-aggregator.nodes.guru';
  
  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AGGREGATOR}/v1/${requestBlobId}`);
      if (!response.ok) {
        throw new Error(`Error fetching video: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Temporary anchor tag for downloading
      const a = document.createElement('a');
      a.href = url;
      a.download = `${requestBlobId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Download Video</CardTitle>
          <CardDescription>
            Download a non-watermarked version of the video. Strict licensing terms apply as listed above. Find the Blob ID in the licensing terms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label htmlFor="requestBlobId" className="block text-sm font-medium">
              Walrus Blob ID:
            </label>
            <input
              type="text"
              id="requestBlobId"
              value={requestBlobId || ''}
              onChange={(e) => setRequestBlobId(e.target.value)}
              className="block w-full p-2 mt-1 border rounded-md"
              placeholder="Enter the Blob ID"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleDownload} disabled={ !isPaid || !requestBlobId || isLoading}>
            {isLoading ? "Downloading..." : "Download Video"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
