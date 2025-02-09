import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

interface QRCodeProps {
  data?: string;
  width?: number;
  height?: number;
  type?: "svg" | "canvas";
  image?: string;
  margin?: number;
  dotsOptions?: {
    color: string;
    type:
      | "rounded"
      | "dots"
      | "classy"
      | "classy-rounded"
      | "square"
      | "extra-rounded";
  };
  backgroundOptions?: {
    color: string;
  };
  imageOptions?: {
    margin: number;
    crossOrigin: "anonymous" | "use-credentials";
  };
  cornersSquareOptions?: {
    color: string;
    type: "dot" | "square" | "extra-rounded";
  };
  cornersDotOptions?: {
    color: string;
    type: "dot" | "square";
  };
  qrOptions?: {
    errorCorrectionLevel: "L" | "M" | "Q" | "H";
  };
}

const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  image:
    "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
  dotsOptions: {
    color: "#4267b2",
    type: "rounded",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 20,
  },
});

export default function App(props) {
  const ref = useRef(null);

  useEffect(() => {
    qrCode.append(ref.current);
  }, []);

  const {
    data,
    width = 200,
    height = 200,
    type = "svg",
    image,
    margin = 0,
    dotsOptions = { color: "#000000", type: "rounded" },
    imageOptions = { margin: 0, crossOrigin: "anonymous" },
    cornersSquareOptions = { color: "#000000", type: "extra-rounded" },
    cornersDotOptions = { color: "#000000", type: "dot" },
    qrOptions = { errorCorrectionLevel: "Q" },
    backgroundOptions = { color: "#ffffff" },
  } = props;

  useEffect(() => {
    if (!qrCode) return;
    qrCode.update({
      data: props.data || "sai",
      width,
      height,
      type,
      image,
      margin,
      dotsOptions,
      backgroundOptions,
      imageOptions,
      cornersSquareOptions,
      cornersDotOptions,
      qrOptions,
      backgroundOptions,
    });
  }, [
    data,
    width,
    height,
    type,
    image,
    margin,
    dotsOptions,
    backgroundOptions,
    imageOptions,
    cornersSquareOptions,
    cornersDotOptions,
    qrOptions,
    backgroundOptions,
  ]);

  return (
    <div className="App">
      <div ref={ref} />
    </div>
  );
}
