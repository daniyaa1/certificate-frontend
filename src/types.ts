export interface CSVRow {
  studentName: string;
  courseName: string;
  date: string;
}

export interface UploadedFile {
  file: File;
  preview?: string;
  type: 'csv' | 'image';
}

