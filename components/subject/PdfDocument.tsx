"use client";

import { useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Must be configured in the same module that renders <Document> (see react-pdf README).
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const Message = ({ children }: { children: string }) => (
  <p className="px-6 py-16 text-center text-[12px] text-subtle">{children}</p>
);

/** Renders a single page of a PDF. Loaded with `ssr: false` because PDF.js needs the browser. */
export default function PdfDocument({
  url,
  pageNumber,
  width,
  highlight,
  onLoad,
  onError,
}: {
  url: string;
  pageNumber: number;
  width: number;
  highlight: string;
  onLoad: (pdf: PDFDocumentProxy) => void;
  onError: (message: string) => void;
}) {
  const term = highlight.trim();
  const textRenderer = useCallback(
    ({ str }: { str: string }) => {
      const safe = escapeHtml(str);
      if (!term) return safe;
      return safe.replace(new RegExp(escapeRegExp(escapeHtml(term)), "gi"), (match) => `<mark>${match}</mark>`);
    },
    [term],
  );

  return (
    <Document
      file={url}
      onLoadSuccess={onLoad}
      onLoadError={(error) => onError(error.message)}
      onSourceError={(error) => onError(error.message)}
      loading={<Message>Loading document…</Message>}
      error={<Message>This document could not be displayed.</Message>}
      className="flex justify-center"
    >
      <Page
        pageNumber={pageNumber}
        width={width}
        customTextRenderer={textRenderer}
        loading={<Message>Rendering page…</Message>}
        className="border border-[#cbd0d6] [&_mark]:bg-review/50 [&_mark]:text-transparent"
      />
    </Document>
  );
}
