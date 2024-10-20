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
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

export default function DownloadWatermarkedVideo() {
  const { file, ipa, setIpa} = useStory();
  setIpa("0xEd5Cb0aC96c768af58c29119Aad2E4ec6A40dA4C"); // for debugging
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<string | null>(null);
  const ffmpeg = createFFmpeg({ log: true });

  const handleWatermark = async () => {
    setIsProcessing(true);
    const watermarkText = ipa ? `Story_IPA_${ipa}` : "0xWatermarkHere";

    try {
      if (!file) throw Error("No file");
      // lazy load ffmpeg
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      // Read the input file and watermark image
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));
      ffmpeg.FS('writeFile', 'logo.png', await fetchFile('/story-logo.png'));

      // overlay logo and text as watermark
      ffmpeg.FS('writeFile', 'roboto.ttf', await fetchFile('/Roboto/Roboto-Light.ttf'))
      await ffmpeg.run(
        '-i', 'input.mp4',
        '-i', 'logo.png',
        '-filter_complex', `[1:v]scale=iw*0.08:-1,format=rgba,colorchannelmixer=aa=0.7[logo];[0:v][logo]overlay=W-w-10:H-h-10,drawtext=fontfile=roboto.ttf:text='${watermarkText}':x=10:y=H-th-10:fontsize=14:fontcolor=white`,
        '-c:a', 'copy', 'output.mp4'
      );

      // get output video
      const data = ffmpeg.FS('readFile', 'output.mp4');
      const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);

      setOutputFile(url);
    } catch (error) {
      console.error('Error during watermarking', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!outputFile) {
        console.error("missing watermarked video")
        return;
    }
    const a = document.createElement('a');
    a.href = outputFile;
    a.download = `watermarked-${ipa}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(outputFile);
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Download Watermarked Video</CardTitle>
          <CardDescription>
            Watermark video with Story logo and IPA, then download it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <CardDescription>IP Asset Hash: {ipa || "IPA hash not available"}</CardDescription>
            {file ? (
              <video controls>
                <source src={URL.createObjectURL(file)} type={file.type} />
              </video>
            ) : (
              <p>No file available to watermark</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={handleWatermark} disabled={isProcessing || !file}>
            {isProcessing ? "Processing..." : "Watermark Video"}
          </Button>
          {outputFile && (
            <Button onClick={handleDownload}>
              Download Video
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
