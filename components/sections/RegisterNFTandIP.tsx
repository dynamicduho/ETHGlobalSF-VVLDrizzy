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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { PIL_TYPE } from '@story-protocol/core-sdk';
import { useStory } from "@/lib/context/AppContext"; // If you use AppContext
import RegisterIP from "@/lib/functions/registerIP";

export default function RegisterIPDiv() {
  const {blobId} = useStory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [revSharePercentage, setRevSharePercentage] = useState(50);
  const [mintingFee, setMintingFee] = useState(0);
  const [pilType, setPilType] = useState(PIL_TYPE.COMMERCIAL_USE);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterIP = async () => {
    if (!title || !description || !blobId) {
      alert('Please fill in all the fields and mint the video NFT first.');
      return;
    }
    setIsRegistering(true);
    try {
      const response = await RegisterIP(title, description, hashtag, pilType, mintingFee, revSharePercentage, blobId);
      if (!response) {
        throw new Error("No response object received from IP registration");
      }
      alert('IP registration successful!');
    } catch (error) {
      console.error('Error registering IP:', error);
      alert('Failed to register IP');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Register Your IP</CardTitle>
          <CardDescription>
            Register your video as an Intellectual Property (IP) Asset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              value={title}
              placeholder="Enter title"
              onChange={(e) => setTitle(e.target.value)}
            />

            <Label htmlFor="description">Description</Label>
            <Input
              type="text"
              id="description"
              value={description}
              placeholder="Enter description"
              onChange={(e) => setDescription(e.target.value)}
            />

            <Label htmlFor="hashtag">Hashtag</Label>
            <Input
              type="text"
              id="hashtag"
              value={hashtag}
              placeholder="Enter hashtag"
              onChange={(e) => setHashtag(e.target.value)}
            />

            <Label htmlFor="revShare">Revenue Share Percentage</Label>
            <Input
              type="number"
              id="revShare"
              value={revSharePercentage}
              placeholder="Revenue Share"
              onChange={(e) => setRevSharePercentage(parseFloat(e.target.value))}
            />

            <Label htmlFor="mintingFee">Minting Fee</Label>
            <Input
              type="number"
              id="mintingFee"
              value={mintingFee}
              placeholder="Minting Fee"
              onChange={(e) => setMintingFee(parseFloat(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleRegisterIP} disabled={isRegistering}>
            {isRegistering ? 'Registering...' : 'Register IP'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
