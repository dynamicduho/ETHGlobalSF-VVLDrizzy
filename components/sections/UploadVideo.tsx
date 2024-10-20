"use client";

import { useState } from "react";
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
import { useStory } from "@/lib/context/AppContext";

const VideoUploadCard = () => {
  const {
    blobId,
    setBlobId,
    file,
    setFile
  } = useStory();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState(false); // false for error, true for success

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    if (target?.files && target.files.length > 0) {
      setFile(target.files[0]);
    } else {
      console.error("Error changing file");
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadStatus(false);
    setUploadStatusMessage('');
    if (!file) {
      console.error("No file selected");
      setUploadStatus(false);
      setUploadStatusMessage("Error: no file selected");
      setIsUploading(false);
      return;
    }
    console.log("Uploading file to Walrus, please wait...");
    try {
      const PUBLISHER =
        process.env.WALRUS_PUBLISHER_ADDRESS ||
        "https://walrus-testnet-publisher.nodes.guru";

      const response = await fetch(`${PUBLISHER}/v1/store?epochs=5`, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      if (!response.ok) {
        setUploadStatus(false);  
        setUploadStatusMessage("Server error")
        throw new Error(`Server error: ${response.status}`);
        
      }

      const result = await response.json();
      console.log("Raw Response: ", result);

      if (result.newlyCreated && result.newlyCreated.blobObject.blobId) {
        const blobId = result.newlyCreated.blobObject.blobId;
        setUploadStatus(true)
        setUploadStatusMessage("Uploaded!")
        setBlobId(blobId);
      } else if (result.alreadyCertified && result.alreadyCertified.blobId) {
        console.log("File already certified");
        const blobId = result.alreadyCertified.blobId;
        setUploadStatus(true)
        setUploadStatusMessage("File already certified on Walrus!")
        setBlobId(blobId);
      } else {
        setUploadStatus(false)
        setUploadStatusMessage("Failed to retrieve blob id from response")
        console.error("Failed to retrieve blob id from response");
      }
    } catch (error) {
      console.error("Upload failed: ", error);
      setUploadStatus(false);  
      setUploadStatusMessage("Upload failed")
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Upload Your Video</CardTitle>
          <CardDescription>Choose and upload a video file to Walrus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Label htmlFor="videoUpload">Video File</Label>
            <Input type="file" id="videoUpload" accept="video/*" onChange={handleFileChange} />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={handleUpload} disabled={isUploading}>{isUploading ? 'Uploading...' : 'Upload Video'}</Button>
          {uploadStatusMessage && (
            <p className={uploadStatus ? "text-green-500" : "text-red-500"}>{uploadStatusMessage}</p> 
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VideoUploadCard;
