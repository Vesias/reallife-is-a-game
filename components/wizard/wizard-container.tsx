"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WizardContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function WizardContainer({ 
  children, 
  className, 
  title, 
  subtitle 
}: WizardContainerProps) {
  return (
    <Card className={cn("mx-auto max-w-3xl", className)}>
      {(title || subtitle) && (
        <CardHeader className="text-center">
          {title && (
            <h2 className="text-2xl font-semibold text-gray-900">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 mt-2">
              {subtitle}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}