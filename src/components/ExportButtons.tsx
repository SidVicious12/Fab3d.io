import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportButtonsProps {
  stlBuffer: ArrayBuffer | null;
  scadCode: string | null;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

export function ExportButtons({ stlBuffer, scadCode }: ExportButtonsProps) {
  const handleDownloadSTL = () => {
    if (!stlBuffer) return;
    const blob = new Blob([stlBuffer], { type: 'model/stl' });
    downloadBlob(blob, `fab3d_${getTimestamp()}.stl`);
  };

  const handleDownloadSCAD = () => {
    if (!scadCode) return;
    const blob = new Blob([scadCode], { type: 'text/plain' });
    downloadBlob(blob, `fab3d_${getTimestamp()}.scad`);
  };

  if (!stlBuffer && !scadCode) return null;

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleDownloadSTL}
        disabled={!stlBuffer}
        variant="default"
        size="lg"
        className="flex-1"
      >
        <Download className="w-4 h-4" />
        Download STL
      </Button>
      <Button
        onClick={handleDownloadSCAD}
        disabled={!scadCode}
        variant="outline"
        size="lg"
        className="flex-1"
      >
        <Download className="w-4 h-4" />
        Download .SCAD
      </Button>
    </div>
  );
}
