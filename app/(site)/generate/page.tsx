"use client";
import { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import html2canvas from "html2canvas";

export default function QRCodeGenerator() {
  // State for QR code customization
  const [text, setText] = useState("Sample text ✨");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgTransparent, setBgTransparent] = useState(false);
  const [size, setSize] = useState(256);
  const [innerEye, setInnerEye] = useState("square");
  const [outerEye, setOuterEye] = useState("square");
  const [eyeColor, setEyeColor] = useState("#000000");
  const [qrStyle, setQrStyle] = useState("squares");
  const [gradient, setGradient] = useState(false);
  const [gradientStart, setGradientStart] = useState("#000000");
  const [gradientEnd, setGradientEnd] = useState("#ffffff");
  const [gradientDirection, setGradientDirection] = useState("horizontal");
  const [errorLevel, setErrorLevel] = useState("H");
  const [margin, setMargin] = useState(4);
  const [shadow, setShadow] = useState(false);
  const [threeD, setThreeD] = useState(false);

  // State for frame customization
  const [frameText, setFrameText] = useState("");
  const [frameTextSize, setFrameTextSize] = useState(16);
  const [frameTextFont, setFrameTextFont] = useState("Arial");
  const [frameTextColor, setFrameTextColor] = useState("#000000");
  const [framePadding, setFramePadding] = useState(20);
  const [frameStyle, setFrameStyle] = useState("none");
  const [frameColor, setFrameColor] = useState("#ffffff");
  const [frameBorderRadius, setFrameBorderRadius] = useState(0);

  // State for logo customization
  const [logo, setLogo] = useState("");
  const [logoSize, setLogoSize] = useState(50);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [logoPosition, setLogoPosition] = useState({ x: 50, y: 50 });

  // Handle logo upload
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Download QR code as PNG
  const downloadQRCode = async () => {
    const qrElement = document.getElementById("qr-container");
    const canvas = await html2canvas(qrElement);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-5"
      style={{ marginTop: "150px" }}
    >
      <div className="w-full rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-bold text-purple-600">
          Text QR Code Generator
        </h1>
        <div
          className="flex"
          style={{ minWidth: "80vw", marginInline: "100px" }}
        >
          <div className="flex-1">
            {/* Text Content */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Text Content
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-2 w-full rounded border p-2"
              />
            </div>

            {/* QR Code Customization */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Foreground & Background Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Foreground Color
                </label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full rounded border p-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Background Color
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full rounded border p-1"
                />
              </div>

              {/* Gradient */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={gradient}
                    onChange={() => setGradient(!gradient)}
                    className="mr-2"
                  />
                  Enable Gradient
                </label>
                {gradient && (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Color
                      </label>
                      <input
                        type="color"
                        value={gradientStart}
                        onChange={(e) => setGradientStart(e.target.value)}
                        className="w-full rounded border p-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Color
                      </label>
                      <input
                        type="color"
                        value={gradientEnd}
                        onChange={(e) => setGradientEnd(e.target.value)}
                        className="w-full rounded border p-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Gradient Direction
                      </label>
                      <select
  value={gradientDirection}
  onChange={(e) => setGradientDirection(e.target.value)}
  className="w-full rounded border p-2"
>
  <option value="horizontal">Horizontal</option>
  <option value="vertical">Vertical</option>
  <option value="diagonal">Diagonal</option>
</select>
                    </div>
                  </div>
                )}
              </div>

              {/* Eye Customization */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inner Eye Shape
                </label>
                <select
                  value={innerEye}
                  onChange={(e) => setInnerEye(e.target.value)}
                  className="mt-2 w-full rounded border p-2"
                >
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Outer Eye Shape
                </label>
                <select
                  value={outerEye}
                  onChange={(e) => setOuterEye(e.target.value)}
                  className="mt-2 w-full rounded border p-2"
                >
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Eye Color
                </label>
                <input
                  type="color"
                  value={eyeColor}
                  onChange={(e) => setEyeColor(e.target.value)}
                  className="w-full rounded border p-1"
                />
              </div>

              {/* QR Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  QR Style
                </label>
                <select
                  value={qrStyle}
                  onChange={(e) => setQrStyle(e.target.value)}
                  className="mt-2 w-full rounded border p-2"
                >
                  <option value="squares">Squares</option>
                  <option value="dots">Dots</option>
                  <option value="rounded">Rounded</option>
                </select>
              </div>

              {/* Error Correction Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Error Correction Level
                </label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value)}
                  className="mt-2 w-full rounded border p-2"
                >
                  <option value="L">Low (L)</option>
                  <option value="M">Medium (M)</option>
                  <option value="Q">Quartile (Q)</option>
                  <option value="H">High (H)</option>
                </select>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Margin
                </label>
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full rounded border p-2"
                />
              </div>

              {/* Shadow Effect */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={shadow}
                    onChange={() => setShadow(!shadow)}
                    className="mr-2"
                  />
                  Shadow Effect
                </label>
              </div>

              {/* 3D Effect */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={threeD}
                    onChange={() => setThreeD(!threeD)}
                    className="mr-2"
                  />
                  3D Effect
                </label>
              </div>
            </div>

            {/* Frame Customization */}
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-gray-700">
                Frame Customization
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frame Text
                  </label>
                  <input
                    type="text"
                    value={frameText}
                    onChange={(e) => setFrameText(e.target.value)}
                    className="w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frame Text Size
                  </label>
                  <input
                    type="number"
                    value={frameTextSize}
                    onChange={(e) => setFrameTextSize(parseInt(e.target.value))}
                    className="w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frame Text Font
                  </label>
                  <select
                    value={frameTextFont}
                    onChange={(e) => setFrameTextFont(e.target.value)}
                    className="w-full rounded border p-2"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frame Text Color
                  </label>
                  <input
                    type="color"
                    value={frameTextColor}
                    onChange={(e) => setFrameTextColor(e.target.value)}
                    className="w-full rounded border p-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frame Padding
                  </label>
                  <input
                    type="number"
                    value={framePadding}
                    onChange={(e) => setFramePadding(parseInt(e.target.value))}
                    className="w-full rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frame Border Radius
                  </label>
                  <input
                    type="number"
                    value={frameBorderRadius}
                    onChange={(e) =>
                      setFrameBorderRadius(parseInt(e.target.value))
                    }
                    className="w-full rounded border p-2"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-gray-700">Logo Upload</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full rounded border p-2"
              />
              {logo && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Logo Size
                  </label>
                  <input
                    type="number"
                    value={logoSize}
                    onChange={(e) => setLogoSize(parseInt(e.target.value))}
                    className="w-full rounded border p-2"
                  />
                  <label className="block text-sm font-medium text-gray-700">
                    Logo Opacity
                  </label>
                  <input
                    type="number"
                    value={logoOpacity}
                    onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
                    className="w-full rounded border p-2"
                    min="0"
                    max="1"
                    step="0.1"
                  />
                </div>
              )}
            </div>
          </div>

          <div style={{ minWidth: "30vw" }}>
            {/* QR Code Preview */}
            <div
              id="qr-container"
              className="relative mt-6 flex justify-center rounded border bg-gray-100 p-4"
              style={{
                padding: `${framePadding}px`,
                borderRadius: `${frameBorderRadius}px`,
                backgroundColor: frameColor,
              }}
            >
              {frameText && (
                <div
                  className="absolute left-1/2 top-0 -translate-x-1/2 transform rounded-md bg-white px-4 py-2 shadow"
                  style={{
                    fontSize: `${frameTextSize}px`,
                    fontFamily: frameTextFont,
                    color: frameTextColor,
                  }}
                >
                  {frameText}
                </div>
              )}
<QRCode
  value={text}
  size={size}
  bgColor={bgTransparent ? "transparent" : bgColor}
  eyeColor={eyeColor}
  qrStyle={qrStyle} // Keep the style selector
  eyeRadius={{
    outer: outerEye === "circle" ? 50 : 0,
    inner: innerEye === "circle" ? 10 : 0,
  }}
  logoImage={logo}
  logoWidth={logoSize}
  logoOpacity={logoOpacity}
  ecLevel={errorLevel}
  enableCORS={true}
  fgColor={gradient ? undefined : fgColor}
  gradient={
    gradient
      ? {
          type: "linear",
          rotation: gradientDirection === "horizontal" 
            ? 0 
            : gradientDirection === "vertical" 
              ? 90 
              : 45,
          colorStops: [
            { offset: 0, color: gradientStart || "#000000" },
            { offset: 1, color: gradientEnd || "#ffffff" }
          ]
        }
      : undefined
  }
  options={{
    dotsOptions: {
      type: qrStyle,
      color: gradient ? undefined : fgColor,
      gradient: gradient ? {
        type: "linear",
        rotation: gradientDirection === "horizontal" 
          ? 0 
          : gradientDirection === "vertical" 
            ? 90 
            : 45,
        colorStops: [
          { offset: 0, color: gradientStart || "#000000" },
          { offset: 1, color: gradientEnd || "#ffffff" }
        ]
      } : undefined
    }
  }}
/>

            </div>

            {/* Download Button */}
            <button
              onClick={downloadQRCode}
              className="mt-6 w-full rounded bg-purple-600 p-3 text-white"
            >
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
