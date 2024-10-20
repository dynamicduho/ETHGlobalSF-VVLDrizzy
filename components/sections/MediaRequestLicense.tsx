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

export default function MediaRequestLicense() {
  const {requestIpa, setRequestIpa} = useStory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestLicense = () => {
    if (!requestIpa) {
      setError('Please provide a valid IPA.');
      return;
    }
    setError(''); // Clear any previous errors
    
    // Open the Story Foundation explorer in a new tab
    const explorerUrl = `https://explorer.story.foundation/ipa/${requestIpa}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <div className="flex justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Request Licensing Terms</CardTitle>
          <CardDescription>
            Enter the IP Asset hash to verify the licensing terms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label htmlFor="requestIpa" className="block text-sm font-medium">
              IPA Hash:
            </label>
            <input
              type="text"
              id="requestIpa"
              value={requestIpa || ''}
              onChange={(e) => setRequestIpa(e.target.value)}
              className="block w-full p-2 mt-1 border rounded-md"
              placeholder="Enter the IPA hash (0xAbC...xYz)"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleRequestLicense} disabled={!requestIpa}>
            {isLoading ? "Processing..." : "View License Terms"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
