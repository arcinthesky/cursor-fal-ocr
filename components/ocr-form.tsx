"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText } from "lucide-react";

import { fal } from "@fal-ai/client";

// เพิ่ม type สำหรับ API response
interface OcrResponse {
  text: string;
}

export default function OCRForm() {
  const [file, setFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  fal.config({
    credentials: process.env.NEXT_PUBLIC_FAL_KEY,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setOcrResult("");

    const result = await fal.subscribe("fal-ai/florence-2-large/ocr", {
      input: {
        image_url: file,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    setOcrResult(result.data.results);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          OCR Image Processing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="image-upload"
              className="text-sm font-medium text-gray-300"
            >
              Upload Image
            </Label>
            <div className="flex items-center">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Image
              </Label>
            </div>
          </div>
          {file && (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="mx-auto w-auto h-auto rounded-lg object-contain max-h-[400px]"
              />
            </div>
          )}
          <Button
            type="submit"
            disabled={!file || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 hover:from-purple-700 hover:via-purple-600 hover:to-fuchsia-600 focus:ring-purple-500 text-white shadow-lg shadow-purple-500/30 transition-all duration-200"
          >
            {isLoading ? "Processing..." : "Process Image"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Label
          htmlFor="ocr-result"
          className="text-sm font-medium text-gray-300 mb-2"
        >
          OCR Result
        </Label>
        <Textarea
          id="ocr-result"
          value={ocrResult}
          readOnly
          placeholder="OCR results will appear here..."
          className="w-full h-32 bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
        />
      </CardFooter>
    </Card>
  );
}
