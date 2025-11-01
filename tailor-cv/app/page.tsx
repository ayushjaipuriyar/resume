"use client";
import React, { useEffect, useState } from "react";
import Tar from "tar-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/components/ui/card";
import { Button } from "@/components/components/ui/button";
import { Input } from "@/components/components/ui/input";
import { Label } from "@/components/components/ui/label";

export default function Page() {
  // Handler stubs to prevent errors
  const onTailor = async () => {
    setLoading(true);
    setError("");
    try {
      const texContent = result || baseTex;
      // Send the raw .tex to our server-side uploader which will create the proper archive
      const texBlob = new Blob([texContent], { type: "text/x-tex" });
      const form = new FormData();
      form.append("file", texBlob, "main.tex");

      // POST to our server-side helper which creates tar.bz2 and forwards to latexonline
      const res = await fetch("/api/compile/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        // Try to get error log from response
        const errorText = await res.text();
        setError(
          `PDF compilation failed.\n` +
          (errorText ? `\nLaTeX error log:\n${errorText}` : "")
        );
        return;
      }
      const pdfBlob = await res.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPreviewUrl(pdfUrl);
      setActiveTab("pdf");
    } catch (err) {
      setError("Failed to generate PDF preview.");
    } finally {
      setLoading(false);
    }
  };
  const onCopy = () => {};
  const onDownload = () => {};
  const [jd, setJd] = useState("");
  const [baseTex, setBaseTex] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>('latex');
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [lastPreviewContent, setLastPreviewContent] = useState<string>("");

  useEffect(() => {
    fetch("/base.tex")
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Failed to load base.tex"))))
      .then(setBaseTex)
      .catch(() => {});
  }, []);

  // ...existing logic for previewUrl effect and handlers...

  // Download link logic (hydration-safe)
  const [downloadUrl, setDownloadUrl] = useState<string>("#");
  const [tarBlobUrl, setTarBlobUrl] = useState<string>("");
  useEffect(() => {
    if (activeTab === "latex") {
      const blob = new Blob([result || baseTex], { type: "text/x-tex" });
      setDownloadUrl(URL.createObjectURL(blob));
      return () => {
        URL.revokeObjectURL(downloadUrl);
      };
    } else if (activeTab === "pdf" && previewUrl) {
      setDownloadUrl(previewUrl);
    } else {
      setDownloadUrl("#");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, result, baseTex, previewUrl]);

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-blue-400 drop-shadow">Tailor your CV</h1>
        <p className="text-neutral-400 mb-4 text-lg font-medium">Paste your job description below. Your tailored LaTeX resume will be generated using Gemini AI.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: JD input */}
        <div className="w-full">
          <Card className="bg-neutral-800 border border-neutral-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-neutral-100">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="jd-input" className="text-neutral-300">Paste your job description</Label>
              <textarea
                id="jd-input"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste job description here..."
                rows={18}
                className="w-full font-mono text-base bg-neutral-900 border border-neutral-700 rounded-lg p-4 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[320px] shadow-sm text-neutral-100 placeholder:text-neutral-500"
                style={{ minHeight: 320 }}
              />
              <div className="flex gap-3 mt-4 flex-wrap">
                <Button onClick={onTailor} disabled={loading || !jd} variant="default" className="w-full md:w-auto">
                  {loading ? "Tailoring..." : "Tailor CV"}
                </Button>
                <Button onClick={onCopy} disabled={!result} variant="outline" className="w-full md:w-auto">Copy .tex</Button>
                <a href={tarBlobUrl || '#'} download="archive.tar" className="w-full md:w-auto">
                  <Button variant="ghost" disabled={!tarBlobUrl} className="w-full">
                    Download tarball
                  </Button>
                </a>
              </div>
              {error && (
                <Card className="bg-red-900/30 border-red-700 mt-4">
                  <CardContent>
                    <span className="text-red-400 font-semibold">{error}</span>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Right: Tabs for LaTeX and PDF preview, with download button in tab bar */}
        <div className="w-full">
          <Card className="bg-neutral-800 border border-neutral-700 shadow-lg">
            <div className="flex items-center border-b border-neutral-700 bg-neutral-900 rounded-t-xl">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex gap-2 bg-neutral-900">
                  <TabsTrigger value="latex" className="text-neutral-100">LaTeX</TabsTrigger>
                  <TabsTrigger value="pdf" className="text-neutral-100">PDF Preview</TabsTrigger>
                </TabsList>
              </Tabs>
              <a
                href={downloadUrl}
                download={activeTab === "latex" ? "resume.tex" : "resume.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto mr-4"
              >
                <Button variant="secondary" size="sm" disabled={activeTab === "pdf" && !previewUrl} className="bg-blue-900 text-blue-200 border-blue-700 hover:bg-blue-800">
                  Download {activeTab === "latex" ? ".tex" : "PDF"}
                </Button>
              </a>
            </div>
            <div className="p-0">
              {activeTab === "latex" ? (
                <div className="p-4">
                  <textarea
                    value={result || baseTex}
                    onChange={(e) => setResult(e.target.value)}
                    placeholder="Tailored .tex will appear here..."
                    rows={20}
                    className="w-full font-mono text-sm bg-neutral-900 border border-neutral-700 rounded-lg p-4 min-h-[320px] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none shadow-sm text-neutral-100 placeholder:text-neutral-500"
                    style={{ minHeight: 320 }}
                  />
                </div>
              ) : (
                <div className="p-4">
                  {previewUrl ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-[600px] border rounded bg-neutral-900 text-neutral-100"
                    />
                  ) : (
                    <div className="text-neutral-400 mt-6">Preview will appear here once compiled.</div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      {(loading || compiling) && (
        <div className="fixed inset-0 bg-neutral-900/85 flex items-center justify-center z-50">
          <Card className="bg-neutral-800 rounded-xl p-8 shadow-xl min-w-[240px] text-center border border-neutral-700">
            <CardTitle className="mb-2 text-neutral-100">{loading ? "Tailoring" : "Compiling PDF"}</CardTitle>
            <CardDescription className="text-neutral-400">Please wait...</CardDescription>
          </Card>
        </div>
      )}
    </main>
  );
}

