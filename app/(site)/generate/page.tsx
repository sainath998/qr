"use client";
import React from "react";
import QRCodeGenerator from "@/components/XX/Index";

export default function GeneratePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">QR Code Generator</h1>
      <QRCodeGenerator />
    </div>
  );
}
