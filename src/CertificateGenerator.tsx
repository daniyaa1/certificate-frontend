import React, { useState, useRef, useCallback } from 'react';

import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

import Button from './components/Button';
import Input from './components/Input';
import Label from './components/Label';
import Progress from './components/Progress';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from './components/Card';

import { cn } from './utils/cn';
import { CSVRow, UploadedFile } from './types';

const CertificateGenerator: React.FC = () => {
  const [csvFile, setCsvFile] = useState<UploadedFile | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<UploadedFile | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPdfs, setGeneratedPdfs] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const csvInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = useCallback((text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('student'));
    const courseIndex = headers.findIndex(h => h.includes('course') || h.includes('subject'));
    const dateIndex = headers.findIndex(h => h.includes('date') || h.includes('completion'));

    if (nameIndex === -1 || courseIndex === -1 || dateIndex === -1) {
      throw new Error('CSV must contain columns for student name, course name, and date');
    }

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        studentName: values[nameIndex] || '',
        courseName: values[courseIndex] || '',
        date: values[dateIndex] || ''
      };
    }).filter(row => row.studentName && row.courseName && row.date);
  }, []);

  const handleCSVUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        setCsvData(data);
        setCsvFile({ file, type: 'csv' });
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error parsing CSV file');
      }
    };
    reader.readAsText(file);
  }, [parseCSV]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const preview = URL.createObjectURL(file);
    setBackgroundImage({ file, preview, type: 'image' });
    setError('');
  }, []);

const generateCertificates = useCallback(async () => {
  if (!csvData.length) {
    setError('CSV data missing');
    return;
  }

  if (!backgroundImage?.file) {
    setError('Background image not uploaded');
    return;
  }

  setIsGenerating(true);
  setGenerationProgress(0);
  setGeneratedPdfs([]);

  try {
    const pdfs: string[] = [];

    for (let i = 0; i < csvData.length; i++) {
      const { studentName, courseName, date } = csvData[i];

      const formData = new FormData();
      formData.append('name', studentName);
      formData.append('course', courseName);
      formData.append('date', date);
      formData.append('bgImage', backgroundImage.file); // ✅ added uploaded image

      // Use local backend during development (localhost) and the deployed backend in production
      const backendBase = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:5051'
        : 'https://certificate-backend-production.up.railway.app';

      const response = await fetch(`${backendBase}/generate-certificate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to generate certificate for ${studentName}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      pdfs.push(url);
      setGenerationProgress(((i + 1) / csvData.length) * 100);
    }

    setGeneratedPdfs(pdfs);
  } catch (err) {
    console.error(err);
    setError('Error generating certificates');
  } finally {
    setIsGenerating(false);
  }
}, [csvData, backgroundImage]);






const downloadAllPdfs = useCallback(() => {
  generatedPdfs.forEach((url, index) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${csvData[index].studentName.replace(/\s+/g, '_')}_certificate.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}, [generatedPdfs]);


  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Certificate Generator</h1>
          <p className="text-muted-foreground">Upload a CSV file and background image to generate personalized certificates</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* CSV Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-upload">Student Data (CSV)</Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  ref={csvInputRef}
                  onChange={handleCSVUpload}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>CSV should contain columns for:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Student Name</li>
                  <li>Course Name</li>
                  <li>Date</li>
                </ul>
              </div>
              {csvData.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{csvData.length} records loaded</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Background Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Background Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">Certificate Background (PNG or JPG)</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/png, image/jpeg"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                />
              </div>
              {backgroundImage?.preview && (
                <div className="space-y-2">
                  <img
                    src={backgroundImage.preview}
                    alt="Background preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Background image loaded</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CSV Data Preview */}
        {csvData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Student Name</th>
                      <th className="border border-border p-2 text-left">Course Name</th>
                      <th className="border border-border p-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        <td className="border border-border p-2">{row.studentName}</td>
                        <td className="border border-border p-2">{row.courseName}</td>
                        <td className="border border-border p-2">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 5 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing 5 of {csvData.length} records
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Certificates */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Certificates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={generateCertificates}
              disabled={!csvData.length || !backgroundImage || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Certificates...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate {csvData.length} Certificates
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} />
              </div>
            )}

            {generatedPdfs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{generatedPdfs.length} certificates generated successfully!</span>
                </div>
                <Button onClick={downloadAllPdfs} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download All PDFs
                </Button>
                <div className="space-y-2">
                  <h4 className="font-medium">Generated Files:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {generatedPdfs.map((pdf, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {pdf}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-1">
              <li>Upload a CSV file containing student names, course names, and completion dates</li>
              <li>Upload a background image for the certificates (PNG, JPG, etc.)</li>
              <li>Click "Generate Certificates" to create individual PDFs for each student</li>
              <li>Download the generated certificates as PDF files</li>
            </ol>
            {/* <p className="mt-4 text-xs">
              <strong>Note:</strong> This is a frontend demo. In a real implementation, the PDF generation would be handled by a Python backend using libraries like Pillow or ReportLab.
            </p> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateGenerator;


