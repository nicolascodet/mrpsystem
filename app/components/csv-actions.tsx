import { Button } from "@tremor/react";
import { Upload, Download } from "lucide-react";

interface CSVActionsProps {
  entityType: string;
  onRefresh?: () => void;
}

export function CSVActions({ entityType, onRefresh }: CSVActionsProps) {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csv/import/${entityType}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to import CSV");
      }

      const result = await response.json();
      alert(result.message);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      alert(error.message);
    }

    // Reset the file input
    event.target.value = "";
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/csv/export/${entityType}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export CSV");
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename=(.+)$/);
      const filename = filenameMatch ? filenameMatch[1] : `${entityType}_export.csv`;

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("CSV exported successfully");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="xs"
        className="flex items-center gap-2"
        icon={Upload}
      >
        <label className="cursor-pointer">
          Import CSV
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </Button>
      <Button
        variant="secondary"
        size="xs"
        className="flex items-center gap-2"
        icon={Download}
        onClick={handleExport}
      >
        Export CSV
      </Button>
    </div>
  );
}
