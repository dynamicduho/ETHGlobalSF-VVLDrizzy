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
import { useStory } from "@/lib/context/AppContext";
import { useState } from "react";

export default function Summary() {
  const { blobId, ipa, nftTokenId} = useStory();

  return (
    <div className="flex justify-center items-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            Here's a summary of everything you setup:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <CardDescription>Story IP Asset Hash: <br/>{ipa || "IPA hash not available"}</CardDescription>
            <br/>
            <CardDescription>Walrus Blob ID: <br/>{blobId || "Blob id not available"}</CardDescription>
            <br/>
            <CardDescription>NFT Token ID: <br/>{nftTokenId || "Token id not available"}</CardDescription>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
        </CardFooter>
      </Card>
    </div>
  );
}
