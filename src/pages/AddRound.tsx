
import { useEffect, useState } from "react";
import { AddRoundModal } from "@/components/add-round/AddRoundModal";
import { useNavigate } from "react-router-dom";
import { useMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AddRound() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const isMobile = useMobile();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Navigate back to the dashboard when closed
      navigate('/dashboard');
    }
  };

  // Redirect desktop users to dashboard with modal open
  useEffect(() => {
    if (!isMobile) {
      navigate('/dashboard', { state: { openAddRound: true } });
    }
  }, [isMobile, navigate]);

  if (!isMobile) {
    // This should only show briefly before redirect
    return <div className="p-4 text-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen"
      style={{
        backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0">
          <AddRoundModal open={open} onOpenChange={handleOpenChange} isFullPage={true} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
