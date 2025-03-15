
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface FeatureInfo {
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
}

interface FeatureInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureInfo | null;
}

export const FeatureInfoModal = ({ isOpen, onClose, feature }: FeatureInfoModalProps) => {
  if (!feature) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-accent/20 rounded-full p-2">{feature.icon}</span>
            {feature.title}
          </DialogTitle>
          <DialogDescription>
            {feature.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground" 
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
