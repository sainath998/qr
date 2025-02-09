"use client";

// @ts-nocheck

import React, { useState, useEffect, useRef, useMemo } from "react";
import StyledQRCode from "@/components/StyledQRCode";
import Combobox from "@/components/ui/ComboBox";
import {
  copyImageToClipboard,
  downloadPngElement,
  downloadSvgElement,
  getPngElement,
  getSvgString,
  IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED,
} from "@/utils/convertToImage";
import JSZip from "jszip";
import {
  type CornerDotType,
  type CornerSquareType,
  type DotType,
  type ErrorCorrectionLevel,
  type Options as StyledQRCodeProps,
} from "qr-code-styling";
import { useI18n } from "./usei18n";
import { createRandomColor, getRandomItemInArray } from "@/utils/color";
import { getNumericCSSValue } from "@/utils/formatting";
import { sortedLocales } from "@/utils/language";
import { allPresets, type Preset } from "@/utils/presets";
import useDarkModePreference from "@/utils/useDarkModePreference";

// Types
enum ExportMode {
  Single = "single",
  Batch = "batch",
}

// Type mapping for options
const typeOptions: Record<string, string[]> = {
  dots: [
    "dots",
    "rounded",
    "classy",
    "classy-rounded",
    "square",
    "extra-rounded",
  ],
  cornersSquare: ["dot", "square", "extra-rounded"],
  cornersDot: ["dot", "square"],
};

// Type mapping for state handlers
type StateHandler = (value: string) => void;

// Type mapping for checked conditions
const isChecked = (
  type: string,
  option: string,
  state: Record<string, string>,
) => {
  switch (type) {
    case "dots":
      return state.dotsOptionsType === option;
    case "cornersSquare":
      return state.cornersSquareOptionsType === option;
    case "cornersDot":
      return state.cornersDotOptionsType === option;
    default:
      return false;
  }
};

// Radio group component
const RadioGroup = ({
  type,
  options,
  value,
  onChange,
  label,
}: {
  type: string;
  options: string[];
  value: string;
  onChange: StateHandler;
  label: string;
}) => (
  <fieldset className="flex-1" role="radiogroup" tabIndex={0}>
    <legend>{label}</legend>
    {options.map((option) => (
      <div key={option} className="radiogroup">
        <input
          id={`${type}-${option}`}
          type="radio"
          value={option}
          checked={value === option}
          onChange={(e) => {
            console.log("type", type, "option", option);
            onChange(e.target.value);
          }}
        />
        <label htmlFor={`${type}-${option}`}>{option}</label>
      </div>
    ))}
  </fieldset>
);

type QRCodeGeneratorProps = {
  initialData?: string;
  initialImage?: string;
  initialWidth?: number;
  initialHeight?: number;
  initialMargin?: number;
  initialImageMargin?: number;
};

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  initialData = "hii",
  initialImage = "",
  initialWidth = 200,
  initialHeight = 200,
  initialMargin = 0,
  initialImageMargin = 0,
}) => {
  // State management
  const [data, setData] = useState<string>("sai");
  const [image, setImage] = useState<string>(initialImage);
  const [width, setWidth] = useState<number>(initialWidth);
  const [height, setHeight] = useState<number>(initialHeight);
  const [margin, setMargin] = useState<number>(initialMargin);
  const [imageMargin, setImageMargin] = useState<number>(initialImageMargin);
  const [dotsOptionsColor, setDotsOptionsColor] = useState<string>("#000000");
  const [dotsOptionsType, setDotsOptionsType] = useState<DotType>("dots");
  const [cornersSquareOptionsColor, setCornersSquareOptionsColor] =
    useState<string>("#000000");
  const [cornersSquareOptionsType, setCornersSquareOptionsType] =
    useState<CornerSquareType>("dot");
  console.log("cornersSquareOptionsType", cornersSquareOptionsType);

  const [cornersDotOptionsColor, setCornersDotOptionsColor] =
    useState<string>("#000000");
  const [cornersDotOptionsType, setCornersDotOptionsType] =
    useState<CornerDotType>("dot");
  const [styleBorderRadius, setStyleBorderRadius] = useState<number>(24);
  const [styleBackground, setStyleBackground] = useState<string>("#ffffff");
  const [includeBackground, setIncludeBackground] = useState<boolean>(true);
  const [lastBackground, setLastBackground] = useState<string>("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>("Q");
  const [exportMode, setExportMode] = useState<ExportMode>(ExportMode.Single);
  const [dataStringsFromCsv, setDataStringsFromCsv] = useState<string[]>([]);
  const [isValidCsv, setIsValidCsv] = useState<boolean>(true);
  const [ignoreHeaderRow, setIgnoreHeaderRow] = useState<boolean>(false);
  const [isExportingBatchQRs, setIsExportingBatchQRs] =
    useState<boolean>(false);
  const [isBatchExportSuccess, setIsBatchExportSuccess] =
    useState<boolean>(false);
  const [currentExportedQrCodeIndex, setCurrentExportedQrCodeIndex] = useState<
    number | null
  >(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [usedFilenames, setUsedFilenames] = useState<Set<string>>(new Set());
  const [selectedPreset, setSelectedPreset] = useState<
    Preset & { key?: string }
  >(allPresets[0]);
  const [isPresetSelectOpen, setIsPresetSelectOpen] = useState<boolean>(false);
  const [isLocaleSelectOpen, setIsLocaleSelectOpen] = useState<boolean>(false);
  const [selectedPresetKey, setSelectedPresetKey] =
    useState<string>("Default (lyqht)");
  console.log("selectedPresetKey", selectedPresetKey);
  const [lastCustomLoadedPreset, setLastCustomLoadedPreset] = useState<Preset>(
    {},
  );

  const typeHandlers: Record<string, StateHandler> = {
    dots: setDotsOptionsType,
    cornersSquare: (val) => {
      console.log("setting  ", val);
      setCornersSquareOptionsType(val);
    },
    cornersDot: setCornersDotOptionsType,
  };

  // Refs
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Constants
  const ERROR_CORRECTION_LEVEL_LABELS: Record<ErrorCorrectionLevel, string> = {
    L: `Low (7%)`,
    M: `Medium (15%)`,
    Q: `High (25%)`,
    H: `Highest (30%)`,
  };

  // Hooks
  const { t } = useI18n();

  const [locale, setLocale] = useState<string>("en");
  const [errorCorrectionLevels, setErrorCorrectionLevels] = useState([
    "L",
    "M",
    "Q",
    "H",
  ]);

  const recommendedErrorCorrectionLevel =
    useMemo<ErrorCorrectionLevel | null>(() => {
      if (!data) return null;
      if (data.length <= 50) {
        return "H";
      } else if (data.length <= 150) {
        return "Q";
      } else if (data.length <= 500) {
        return "M";
      } else {
        return "L";
      }
    }, [data]);

  const {
    isDarkMode,
    isDarkModePreferenceSetBySystem,
    toggleDarkModePreference,
  } = useDarkModePreference();

  // Computed values
  const locales = sortedLocales.map((loc) => ({
    value: loc,
    label: t(loc),
  }));

  const allPresetOptions = useMemo(() => {
    const options = lastCustomLoadedPreset.value
      ? [lastCustomLoadedPreset.value, ...allPresets]
      : allPresets;
    return options.map((preset) => ({
      value: preset.name,
      label: t(preset.name),
    }));
  }, [lastCustomLoadedPreset, allPresets]);

  const dotsOptions = useMemo(
    () => ({
      color: dotsOptionsColor,
      type: dotsOptionsType,
    }),
    [dotsOptionsColor, dotsOptionsType],
  );

  const cornersSquareOptions = useMemo(
    () => ({
      color: cornersSquareOptionsColor,
      type: cornersSquareOptionsType,
    }),
    [cornersSquareOptionsColor, cornersSquareOptionsType],
  );

  const cornersDotOptions = useMemo(
    () => ({
      color: cornersDotOptionsColor,
      type: cornersDotOptionsType,
    }),
    [cornersDotOptionsColor, cornersDotOptionsType],
  );

  const style = useMemo(
    () => ({
      borderRadius: `${styleBorderRadius}px`,
      background: styleBackground,
    }),
    [styleBorderRadius, styleBackground],
  );

  const imageOptions = useMemo(
    () => ({
      margin: imageMargin,
    }),
    [imageMargin],
  );

  const qrOptions = useMemo(
    () => ({
      errorCorrectionLevel: errorCorrectionLevel,
    }),
    [errorCorrectionLevel],
  );

  const qrCodeProps = useMemo<StyledQRCodeProps>(
    () => ({
      data: data,
      image: image,
      width: width,
      height: height,
      margin: margin,
      dotsOptions: dotsOptions,
      cornersSquareOptions: cornersSquareOptions,
      cornersDotOptions: cornersDotOptions,
      imageOptions: imageOptions,
      qrOptions: qrOptions,
    }),
    [
      data,
      image,
      width,
      height,
      margin,
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      imageOptions,
      qrOptions,
    ],
  );

  // Effects
  useEffect(() => {
    if (!includeBackground) {
      setLastBackground(styleBackground);
      setStyleBackground("transparent");
    } else {
      setStyleBackground(lastBackground);
    }
  }, [includeBackground]);

  useEffect(() => {
    const preset = allPresets.find((p) => p.name === selectedPresetKey);
    if (preset) {
      setSelectedPreset(preset);
    }
  }, [selectedPresetKey]);

  useEffect(() => {
    if (selectedPreset) {
      setData(selectedPreset.data);
      setImage(selectedPreset.image);
      setWidth(selectedPreset.width);
      setHeight(selectedPreset.height);
      setMargin(selectedPreset.margin);
      setImageMargin(selectedPreset.imageOptions.margin);
      setDotsOptionsColor(selectedPreset.dotsOptions.color);
      setDotsOptionsType(selectedPreset.dotsOptions.type);
      setCornersSquareOptionsColor(selectedPreset.cornersSquareOptions.color);
      setCornersSquareOptionsType(selectedPreset.cornersSquareOptions.type);
      setCornersDotOptionsColor(selectedPreset.cornersDotOptions.color);
      setCornersDotOptionsType(selectedPreset.cornersDotOptions.type);
      setStyleBorderRadius(
        getNumericCSSValue(selectedPreset.style.borderRadius as string),
      );
      setStyleBackground(selectedPreset.style.background);
      setIncludeBackground(selectedPreset.style.background !== "transparent");
      setErrorCorrectionLevel(
        selectedPreset.qrOptions?.errorCorrectionLevel || "Q",
      );
    }
  }, [selectedPreset]);

  useEffect(() => {
    const qrCodeConfig = {
      props: qrCodeProps,
      style: style,
    };
    localStorage.setItem("qrCodeConfig", JSON.stringify(qrCodeConfig));
  }, [qrCodeProps, style]);

  // Functions
  const randomizeStyleSettings = () => {
    const dotTypes: DotType[] = [
      "dots",
      "rounded",
      "classy",
      "classy-rounded",
      "square",
      "extra-rounded",
    ];
    const cornerSquareTypes: CornerSquareType[] = [
      "dot",
      "square",
      "extra-rounded",
    ];
    const cornerDotTypes: CornerDotType[] = ["dot", "square"];

    setDotsOptionsType(getRandomItemInArray(dotTypes));
    setDotsOptionsColor(createRandomColor());
    setCornersSquareOptionsType(getRandomItemInArray(cornerSquareTypes));
    setCornersSquareOptionsColor(createRandomColor());
    setCornersDotOptionsType(getRandomItemInArray(cornerDotTypes));
    setCornersDotOptionsColor(createRandomColor());
    setStyleBackground(createRandomColor());
  };

  const copyQRToClipboard = async () => {
    if (qrCodeRef.current && IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED) {
      await copyImageToClipboard(qrCodeRef.current, { width, height });
    }
  };

  console.log("style", style);

  const downloadQRImageAsPng = () => {
    if (exportMode === ExportMode.Single && qrCodeRef.current) {
      downloadPngElement(
        qrCodeRef.current,
        "qr-code.png",
        { width, height },
        `${styleBorderRadius}px`,
      );
    } else {
      generateBatchQRCodes("png");
    }
  };

  const downloadQRImageAsSvg = () => {
    if (exportMode === ExportMode.Single && qrCodeRef.current) {
      downloadSvgElement(
        qrCodeRef.current,
        "qr-code.svg",
        { width, height },
        `${styleBorderRadius}px`,
      );
    } else {
      generateBatchQRCodes("svg");
    }
  };

  const uploadImage = () => {
    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*";
    imageInput.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files?.[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const result = event.target?.result as string;
          setImage(result);
        };
        reader.readAsDataURL(file);
      }
    };
    imageInput.click();
  };

  const downloadQRConfig = () => {
    const qrCodeConfig = {
      props: qrCodeProps,
      style: style,
    };
    const blob = new Blob([JSON.stringify(qrCodeConfig)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code-config.json";
    link.click();
  };

  const loadQrConfigFromFile = () => {
    const qrCodeConfigInput = document.createElement("input");
    qrCodeConfigInput.type = "file";
    qrCodeConfigInput.accept = "application/json";
    qrCodeConfigInput.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files?.[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const result = event.target?.result as string;
          loadQRConfig(result, "Loaded from file");
        };
        reader.readAsText(file);
      }
    };
    qrCodeConfigInput.click();
  };

  const loadQRConfig = (jsonString: string, key?: string) => {
    const qrCodeConfig = JSON.parse(jsonString);
    const preset = {
      ...qrCodeConfig.props,
      style: qrCodeConfig.style,
    };
    if (key) {
      preset.name = key;
      setLastCustomLoadedPreset(preset);
    }
    setSelectedPreset(preset);
  };

  const generateBatchQRCodes = async (format: "png" | "svg") => {
    if (!qrCodeRef.current) return;

    setIsExportingBatchQRs(true);
    const zip = new JSZip();
    let numQrCodesCreated = 0;

    try {
      for (let index = 0; index < dataStringsFromCsv.length; index++) {
        setCurrentExportedQrCodeIndex(index);
        const url = dataStringsFromCsv[index];
        setData(url);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        let dataUrl: string = "";
        if (format === "png") {
          dataUrl = await getPngElement(
            qrCodeRef.current,
            { width, height },
            `${styleBorderRadius}px`,
          );
        } else {
          dataUrl = await getSvgString(
            qrCodeRef.current,
            { width, height },
            `${styleBorderRadius}px`,
          );
        }

        const fileName = url.trim();
        if (usedFilenames.has(fileName)) {
          const pathSegments = fileName.split("/");
          const lastPathSegment = pathSegments[pathSegments.length - 1];
          const isValidFileName = /^[a-zA-Z0-9_]+$/.test(lastPathSegment);
          const newFileName = isValidFileName
            ? `${fileName}-${index}`
            : `qr_code_${index}`;
          usedFilenames.add(newFileName);
          if (format === "png") {
            zip.file(`${newFileName}.${format}`, dataUrl.split(",")[1], {
              base64: true,
            });
          } else {
            zip.file(`${newFileName}.${format}`, dataUrl);
          }
        } else {
          usedFilenames.add(fileName);
          if (format === "png") {
            zip.file(`${fileName}.${format}`, dataUrl.split(",")[1], {
              base64: true,
            });
          } else {
            zip.file(`${fileName}.${format}`, dataUrl);
          }
        }
        numQrCodesCreated++;
      }

      while (numQrCodesCreated !== dataStringsFromCsv.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `qr-codes.zip`;
      link.click();
      setIsBatchExportSuccess(true);
    } catch (error) {
      console.error("Error generating batch QR codes", error);
      setIsBatchExportSuccess(false);
    } finally {
      setIsExportingBatchQRs(false);
      setCurrentExportedQrCodeIndex(null);
    }
  };

  const onCsvFileUpload = (event: Event) => {
    setIsBatchExportSuccess(false);
    let file: File | null = null;

    if (
      event.type === "change" &&
      (event.target as HTMLInputElement).files?.[0]
    ) {
      file = (event.target as HTMLInputElement).files[0];
    } else if (
      event.type === "drop" &&
      (event as DragEvent).dataTransfer?.files?.[0]
    ) {
      file = (event as DragEvent).dataTransfer.files[0];
    }

    if (!file || file.type !== "text/csv") {
      setIsValidCsv(false);
      return;
    }

    setCsvFile(file);
    setIsValidCsv(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (typeof content !== "string") {
        setIsValidCsv(false);
        return;
      }
      let links = content.split("\n").filter((link) => link.trim() !== "");
      links = links.map((link) => link.replace("\r", ""));
      if (ignoreHeaderRow && links.length > 0) {
        links.shift();
      }
      setDataStringsFromCsv(links);
    };
    reader.readAsText(file);
  };

  const resetBatchExportProgress = () => {
    setIsExportingBatchQRs(false);
    setCurrentExportedQrCodeIndex(null);
    usedFilenames.clear();
  };

  const resetData = () => {
    setData("sai");
    setCsvFile(null);
    setDataStringsFromCsv([]);
    setIsValidCsv(true);
    resetBatchExportProgress();
    setIsBatchExportSuccess(false);
  };

  useEffect(() => {
    resetData();
  }, [exportMode]);

  const types = ["dots", "cornersSquare", "cornersDot"];

  // Render
  return (
    <div className="relative grid place-items-center bg-white p-8 dark:bg-zinc-900 md:px-6">
      <div className="mb-8 flex w-full flex-row flex-wrap justify-between gap-4 md:mb-4 md:w-5/6 md:ps-4">
        <div className="flex items-center gap-2"></div>
        <div className="flex flex-row items-center justify-end gap-4">
          <div className="flex flex-row items-center gap-2">
            <a
              href="https://github.com/lyqht/styled-qr-code-generator"
              target="_blank"
              aria-label={t("GitHub repository for this project")}
              className="icon-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
              >
                {/* GitHub icon SVG */}
              </svg>
            </a>
            <div className="vertical-border" />
            <button
              onClick={toggleDarkModePreference}
              aria-label={t("Toggle dark mode")}
              className="icon-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
              >
                {/* Dark mode icon SVG */}
              </svg>
            </button>
          </div>
          {/* <Combobox
            items={locales}
            value={locale}
            open={isLocaleSelectOpen}
            onOpenChange={setIsLocaleSelectOpen}
            onValueChange={setLocale}
            buttonLabel={t("Select language")}
          /> */}
        </div>
      </div>
      <div className="w-full md:w-5/6">
        <div className="flex flex-col-reverse items-start justify-center gap-4 md:flex-row md:gap-12">
          <div
            id="main-content"
            className="sticky top-0 flex w-full shrink-0  justify-center p-4 md:w-fit"
          >
            <div id="qr-code-container" ref={qrCodeRef}>
              <div
                className="grid place-items-center overflow-hidden"
                style={{
                  ...style,
                  width: "200px",
                  height: "200px",
                }}
              >
                {true ? (
                  <>
                    <StyledQRCode
                      {...qrCodeProps}
                      cornersSquareOptionsType={cornersSquareOptionsType}
                      backgroundOptions={{ color: styleBackground }}
                      width={200}
                      height={200}
                      role="img"
                      aria-label="QR code"
                    />
                    <div>
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <button
                            id="copy-qr-image-button"
                            onClick={copyQRToClipboard}
                            disabled={exportMode === ExportMode.Batch}
                            title={t(
                              "There are too many QR codes to be copied to the clipboard at once. Please download them as SVG or PNG instead.",
                            )}
                            aria-label={t("Copy QR Code to clipboard")}
                            className="button flex w-fit max-w-[200px] flex-row items-center gap-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              {/* Copy icon SVG */}
                            </svg>
                            <p>{t("Copy QR Code to clipboard")}</p>
                          </button>
                          <button
                            id="save-qr-code-config-button"
                            onClick={downloadQRConfig}
                            aria-label={t("Save QR Code configuration")}
                            className="button flex w-fit max-w-[200px] flex-row items-center gap-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              {/* Save icon SVG */}
                            </svg>
                            <p>{t("Save QR Code configuration")}</p>
                          </button>
                          <button
                            id="load-qr-code-config-button"
                            onClick={loadQrConfigFromFile}
                            aria-label={t("Load QR Code configuration")}
                            className="button flex w-fit max-w-[200px] flex-row items-center gap-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              {/* Load icon SVG */}
                            </svg>
                            <p>{t("Load QR Code configuration")}</p>
                          </button>
                        </div>
                        <div id="export-options" className="pt-4">
                          <p className="pb-2 text-zinc-900 dark:text-zinc-100">
                            {t("Export as")}
                          </p>
                          <div className="flex flex-row items-center justify-center gap-2">
                            <button
                              id="download-qr-image-button-png"
                              onClick={downloadQRImageAsPng}
                              aria-label={t("Download QR Code as PNG")}
                              className="button"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                              >
                                {/* SVG icon */}
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p>{t("No data!")}</p>
                )}
              </div>
            </div>

            <div
              id="settings"
              className="flex w-full grow flex-col items-start gap-8 text-start"
            >
              <div>
                <label>{t("Preset")}</label>
                <div className="flex flex-row items-center justify-start gap-2">
                  <Combobox
                    items={allPresetOptions}
                    value={selectedPresetKey}
                    open={isPresetSelectOpen}
                    onOpenChange={setIsPresetSelectOpen}
                    onChange={setSelectedPresetKey}
                    buttonLabel={t("Select preset")}
                    insertDividerAtIndexes={[0, 2]}
                  />
                  <button
                    onClick={randomizeStyleSettings}
                    aria-label={t("Randomize style")}
                    className="icon-button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="32"
                      viewBox="0 0 640 512"
                    >
                      {/* Randomize icon SVG */}
                    </svg>
                  </button>
                </div>
              </div>
              <div className="w-full">
                <div className="mb-2 flex items-center gap-4">
                  <label htmlFor="data">{t("Data to encode")}</label>
                  <div className="flex grow items-center gap-2">
                    <button
                      className={`secondary-button ${
                        exportMode !== ExportMode.Single ? "opacity-50" : ""
                      }`}
                      onClick={() => setExportMode(ExportMode.Single)}
                    >
                      {t("Single export")}
                    </button>
                    <button
                      className={`secondary-button ${
                        exportMode !== ExportMode.Batch ? "opacity-50" : ""
                      }`}
                      onClick={() => setExportMode(ExportMode.Batch)}
                    >
                      {t("Batch export")}
                    </button>
                    {exportMode === ExportMode.Batch && (
                      <div className="flex flex-row items-center justify-end gap-2">
                        <input
                          id="ignore-header"
                          type="checkbox"
                          className="checkbox mr-2"
                          checked={ignoreHeaderRow}
                          onChange={(e) => {
                            setIgnoreHeaderRow(e.target.checked);
                            onCsvFileUpload({} as Event);
                          }}
                        />
                        <label
                          htmlFor="ignore-header"
                          className="!text-sm !font-normal"
                        >
                          {t("Ignore header row")}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                {exportMode === ExportMode.Single ? (
                  <textarea
                    id="data"
                    className="text-input"
                    rows={2}
                    placeholder={t("data to encode e.g. a URL or a string")}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                  />
                ) : (
                  <div>
                    {!csvFile ? (
                      <button
                        className="w-full rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
                        onClick={() => fileInput?.click()}
                        onKeyUp={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            fileInput?.click();
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          onCsvFileUpload(e);
                        }}
                        aria-label={t("Click to select and upload a CSV file")}
                      >
                        <p aria-hidden="true">
                          {t(
                            "Drag and drop a CSV file here or click to select",
                          )}
                        </p>
                        <input
                          ref={setFileInput}
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={onCsvFileUpload}
                        />
                      </button>
                    ) : isValidCsv ? (
                      <div className="p-4 text-center">
                        {isBatchExportSuccess ? (
                          <>
                            <p>
                              {t("QR codes have been successfully exported.")}
                            </p>
                            <button
                              className="button mt-4"
                              onClick={() => setCsvFile(null)}
                            >
                              {t("Start new batch export")}
                            </button>
                          </>
                        ) : !isExportingBatchQRs ? (
                          <p>
                            {t("{count} piece(s) of data detected", {
                              count: dataStringsFromCsv.length,
                            })}
                          </p>
                        ) : (
                          <>
                            <p>
                              {t("Creating QR codes... This may take a while.")}
                            </p>
                            <p>
                              {t(
                                "{index} / {count} QR codes have been created.",
                                {
                                  index: currentExportedQrCodeIndex! + 1,
                                  count: dataStringsFromCsv.length,
                                },
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-red-500">
                        <p>{t("Invalid CSV")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <fieldset className="flex-1" role="radiogroup" tabIndex={0}>
                <div className="flex flex-row items-center gap-2">
                  <legend>{t("Error correction level")}</legend>
                  <a
                    href="https://docs.uniqode.com/en/articles/7219782-what-is-the-recommended-error-correction-level-for-printing-a-qr-code"
                    target="_blank"
                    className="icon-button flex flex-row items-center"
                    aria-label={t("What is error correction level?")}
                  >
                    <svg
                      className="me-1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      {/* Info icon SVG */}
                    </svg>
                    <span className="text-sm text-gray-500">
                      {t("What is this?")}
                    </span>
                  </a>
                </div>
                {errorCorrectionLevels.map((level) => (
                  <div key={level} className="radiogroup">
                    <input
                      id={`errorCorrectionLevel-${level}`}
                      type="radio"
                      value={level}
                      checked={errorCorrectionLevel === level}
                      onChange={(e) =>
                        setErrorCorrectionLevel(
                          e.target.value as ErrorCorrectionLevel,
                        )
                      }
                      aria-describedby={
                        level === recommendedErrorCorrectionLevel
                          ? "recommended-text"
                          : undefined
                      }
                    />
                    <div className="flex items-center gap-2">
                      <label htmlFor={`errorCorrectionLevel-${level}`}>
                        {ERROR_CORRECTION_LEVEL_LABELS[level]}
                      </label>
                      {level === recommendedErrorCorrectionLevel && (
                        <span className="text-sm text-gray-500">
                          <span aria-hidden="true" className="me-1">
                            ✓
                          </span>
                          <span id="recommended-text">{t("Recommended")}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </fieldset>
              <div className="w-full">
                <div className="mb-2 flex items-center gap-4">
                  <label htmlFor="image-url">{t("Logo image URL")}</label>
                  <div className="flex grow items-center gap-2">
                    <textarea
                      id="image-url"
                      className="text-input"
                      rows={1}
                      placeholder={t("Logo image URL")}
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                    <button
                      onClick={uploadImage}
                      className="icon-button flex flex-row items-center"
                      aria-label={t("Upload image")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        {/* Upload icon SVG */}
                      </svg>
                      <span>{t("Upload image")}</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <label htmlFor="with-background">
                    {t("With background")}
                  </label>
                  <input
                    id="with-background"
                    type="checkbox"
                    className="checkbox"
                    checked={includeBackground}
                    onChange={(e) => setIncludeBackground(e.target.checked)}
                  />
                </div>
                <div
                  id="color-settings"
                  className="flex w-full flex-row flex-wrap gap-4"
                >
                  <div
                    className={`flex flex-row items-center gap-2 ${
                      !includeBackground ? "opacity-30" : ""
                    }`}
                  >
                    <label htmlFor="background-color">
                      {t("Background color")}
                    </label>
                    <input
                      id="background-color"
                      type="color"
                      className="color-input"
                      value={styleBackground}
                      onChange={(e) => setStyleBackground(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <label htmlFor="dots-color">{t("Dots color")}</label>
                    <input
                      id="dots-color"
                      type="color"
                      className="color-input"
                      value={dotsOptionsColor}
                      onChange={(e) => setDotsOptionsColor(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <label htmlFor="corners-square-color">
                      {t("Corners Square color")}
                    </label>
                    <input
                      id="corners-square-color"
                      type="color"
                      className="color-input"
                      value={cornersSquareOptionsColor}
                      onChange={(e) =>
                        setCornersSquareOptionsColor(e.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <label htmlFor="corners-dot-color">
                      {t("Corners Dot color")}
                    </label>
                    <input
                      id="corners-dot-color"
                      type="color"
                      className="color-input"
                      value={cornersDotOptionsColor}
                      onChange={(e) =>
                        setCornersDotOptionsColor(e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label htmlFor="width">{t("Width (px)")}</label>
                  <input
                    id="width"
                    className="text-input"
                    type="number"
                    placeholder={t("width in pixels")}
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="height">{t("Height (px)")}</label>
                  <input
                    id="height"
                    className="text-input"
                    type="number"
                    placeholder={t("height in pixels")}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="margin">{t("Margin (px)")}</label>
                  <input
                    id="margin"
                    className="text-input"
                    type="number"
                    placeholder="0"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="image-margin">{t("Image margin (px)")}</label>
                  <input
                    id="image-margin"
                    className="text-input"
                    type="number"
                    placeholder="0"
                    value={imageMargin}
                    onChange={(e) => setImageMargin(Number(e.target.value))}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="border-radius">
                    {t("Border radius (px)")}
                  </label>
                  <input
                    id="border-radius"
                    className="text-input"
                    type="number"
                    placeholder="24"
                    value={styleBorderRadius}
                    onChange={(e) =>
                      setStyleBorderRadius(Number(e.target.value))
                    }
                  />
                </div>
                <div
                  id="dots-squares-settings"
                  className="mb-4 flex w-full flex-col flex-wrap gap-6 md:flex-row"
                >
                  <div>
                    {types.map((type) => (
                      <RadioGroup
                        key={type}
                        type={type}
                        options={typeOptions[type]}
                        value={
                          type === "dots"
                            ? dotsOptionsType
                            : type === "cornersSquare"
                            ? cornersSquareOptionsType
                            : cornersDotOptionsType
                        }
                        onChange={typeHandlers[type]}
                        label={`${
                          type.charAt(0).toUpperCase() + type.slice(1)
                        } type`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
