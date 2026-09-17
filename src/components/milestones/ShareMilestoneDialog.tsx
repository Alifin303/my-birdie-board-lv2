import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { Milestone, getMilestoneIcon, getMilestoneLabel } from "@/utils/milestonesCalculator";

interface ShareMilestoneDialogProps {
  milestone: Milestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CARD_ID = "milestone-share-card";

export function ShareMilestoneDialog({ milestone, open, onOpenChange }: ShareMilestoneDialogProps) {
  const [isWorking, setIsWorking] = useState(false);

  const canNativeShare =
    typeof navigator !== "undefined" && typeof (navigator as any).canShare === "function";

  const renderCanvas = async () => {
    const element = document.getElementById(CARD_ID);
    if (!element) return null;
    return html2canvas(element, { backgroundColor: "#ffffff", scale: 2 });
  };

  const fileName = (m: Milestone) =>
    `mybirdieboard-${m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.png`;

  const handleDownload = async () => {
    if (!milestone) return;
    setIsWorking(true);
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = fileName(milestone);
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating milestone card:", error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleShare = async () => {
    if (!milestone) return;
    setIsWorking(true);
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) return;
      const file = new File([blob], fileName(milestone), { type: "image/png" });
      const nav = navigator as any;
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: milestone.title });
      } else {
        await handleDownload();
      }
    } catch (error) {
      // User cancelling the share sheet lands here too — nothing to report.
      console.log("Milestone share not completed:", error);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share this milestone</DialogTitle>
          <DialogDescription>
            Nothing is posted anywhere. The image is created on your device and only goes where you send it.
          </DialogDescription>
        </DialogHeader>

        {milestone && (
          <>
            <div
              id={CARD_ID}
              className="rounded-xl overflow-hidden border"
              style={{ backgroundColor: "#0b3d2c" }}
            >
              <div className="p-8 text-center space-y-4" style={{ color: "#ffffff" }}>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#a7d3bf" }}>
                  {getMilestoneLabel(milestone.type)}
                </p>
                <div className="text-6xl leading-none">{getMilestoneIcon(milestone.type)}</div>
                <h3 className="text-2xl font-bold">{milestone.title}</h3>
                <p className="text-sm" style={{ color: "#d8ece3" }}>
                  {milestone.description}
                </p>
                <p className="text-xs" style={{ color: "#a7d3bf" }}>
                  {format(new Date(milestone.date), "d MMMM yyyy")}
                </p>
                <div
                  className="pt-4 text-sm font-semibold"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}
                >
                  MyBirdieBoard
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleDownload} disabled={isWorking} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download image
              </Button>
              {canNativeShare && (
                <Button
                  onClick={handleShare}
                  disabled={isWorking}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
