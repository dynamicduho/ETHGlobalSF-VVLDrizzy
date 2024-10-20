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

export default function MediaPayLicense() {
  const {requestIpa, isPaid, setIsPaid} = useStory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestLicense = async () => {
    if (!requestIpa) {
      setError('Please provide a valid IPA.');
      return;
    }
    setIsLoading(true);
    setError(''); // Clear any previous errors
    
    // Mock payment process
    try {
      // Simulating payment request
      setTimeout(() => {
        setIsPaid(true); // Assume payment is successful
        setIsLoading(false);
      }, 2000); // Simulate payment processing delay
    } catch (error) {
      console.error("Failed to process payment:", error);
      setError('Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Accept Terms and Pay License Token Fee</CardTitle>
          <CardDescription>
            (Mock Feature - TODO) 
            <br/>By providing payment for license token, you agree to all terms outlined in the IPA license.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <CardDescription>
                IP Asset Hash:
                <br/>
                {requestIpa || "Please input an IP Asset hash in the form above"}
            </CardDescription>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {isPaid && <p className="text-green-500">Payment successful. License available.</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleRequestLicense} disabled={isLoading || isPaid || !requestIpa}>
            {isLoading ? "Processing..." : isPaid ? "License Paid" : "Pay License"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
