"use client";
import { useEffect } from "react";

export default function QRRedirectPage({ params }) {
  const { qrId } = params;

  useEffect(() => {
    async function trackAndRedirect() {
      try {
        // const res = await fetch(`/api/qr/track`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ qrId }),
        // });

        // const data = await res.json();
        // if (data.destinationUrl) {
        //   window.location.replace(data.destinationUrl);
        // }

        window.location.replace("https://placemantra.com");
      } catch (error) {
        console.error("Tracking error:", error);
      }
    }

    trackAndRedirect();
  }, [qrId]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>🔄 Redirecting...</h2>
    </div>
  );
}
