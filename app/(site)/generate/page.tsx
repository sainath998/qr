"use client";
import React from "react";
import QRCodeGenerator from "@/components/XX/Index";
import { getUserDetails } from "@/utils/auth";

export default function GeneratePage() {
  const user = getUserDetails();

  console.log("user", user);

  return (
    <div className="container mx-auto p-4" style={{ marginTop: "150px" }}>
      <QRCodeGenerator />
    </div>
  );
}
