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

export default function DownloadVideo() {
  const {blobId} = useStory();
  const [isLoading, setIsLoading] = useState(false);
  const AGGREGATOR = process.env.VITE_AGGREGATOR_ADDRESS || 'https://walrus-testnet-aggregator.nodes.guru';

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AGGREGATOR}/v1/${blobId}`);
      if (!response.ok) {
        throw new Error(`Error fetching video: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Temporary anchor tag for downloading
      const a = document.createElement('a');
      a.href = url;
      a.download = `${blobId}.mp4`;
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
    blobId ? 
    <div className="flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Download and Verify Video</CardTitle>
          <CardDescription>
            Walrus video blobId: {blobId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Click below to download video from Walrus:</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleDownload} disabled={isLoading}>
            {isLoading ? "Downloading..." : "Download Video"}
          </Button>
        </CardFooter>
      </Card>
    </div>
    :
    <div className="flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Download Video</CardTitle>
          <CardDescription>
            Please upload a video first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>You can verify your video by downloading it after upload:</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleDownload} disabled={!blobId || isLoading}>
            {isLoading ? "Downloading..." : "Download Video"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
