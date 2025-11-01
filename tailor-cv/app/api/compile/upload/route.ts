import { NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";
import { pipeline } from "stream/promises";
import { execSync } from "child_process";

export const runtime = "nodejs";

// Accepts multipart/form-data with a `file` field. The file may be:
// - a .tex file -> we will tar+bzip2 it into archive.tar.bz2 containing main.tex
// - a .tar or .tar.bz2 archive -> we will forward it as-is

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new NextResponse("Expected multipart/form-data", { status: 400 });
    }

    // Use web-standard form parsing (available in Node 18+ / Next.js runtime)
    const form = await req.formData();
    const file = form.get("file") as any;
    if (!file) return new NextResponse("Missing file field", { status: 400 });

    // create temp working dir
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "latex-upload-"));
    const receivedPath = path.join(tmp, file.name || "upload");

    // write uploaded file to disk
    const stream = file.stream();
    const out = fs.createWriteStream(receivedPath);
    await pipeline(stream, out);

    // Determine what to send to latexonline
    let archivePath = receivedPath;
    const lower = (file.name || "").toLowerCase();
    if (lower.endsWith(".tex")) {
      // create archive.tar.bz2 with main.tex
      const tarPath = path.join(tmp, "archive.tar.bz2");
      try {
        // Ensure file is named main.tex inside tar
        const workdir = path.join(tmp, "work");
        fs.mkdirSync(workdir);
        const mainPath = path.join(workdir, "main.tex");
        fs.copyFileSync(receivedPath, mainPath);
        execSync(`tar -cjf ${tarPath} -C ${workdir} main.tex`);
        archivePath = tarPath;
      } catch (e: any) {
        cleanup();
        return new NextResponse(`Failed to create tarball: ${e?.message || e}`, { status: 500 });
      }
    } else if (lower.endsWith(".tar.bz2") || lower.endsWith(".tbz2") || lower.endsWith(".tar.bz") ) {
      // already compressed tar
      archivePath = receivedPath;
    } else if (lower.endsWith(".tar")) {
      // plain tar - we can forward as-is but some services expect bzip2; try forwarding as-is
      archivePath = receivedPath;
    } else {
      // Unknown extension: assume it's an archive; forward as-is
      archivePath = receivedPath;
    }

    // Post to latexonline /data endpoint
    const formOut = new FormData();
    const readStream = fs.createReadStream(archivePath);
    formOut.append("file", readStream as any, path.basename(archivePath));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);
    const resp = await fetch(
      `https://latexonline.cc/data?target=main.tex&force=true&command=pdflatex`,
      { method: "POST", body: formOut as any, signal: controller.signal }
    );
    clearTimeout(timeout);

    const buf = await resp.arrayBuffer();
    const ct = resp.headers.get("content-type") || "";
    const isPdfHeader = buf.byteLength > 4 && new TextDecoder("ascii").decode(new Uint8Array(buf.slice(0, 4))) === "%PDF";

    // cleanup temp files
    try {
      readStream.destroy();
    } catch {}
    cleanup();

    if (resp.ok && (isPdfHeader || /pdf/i.test(ct))) {
      return new NextResponse(Buffer.from(buf), { status: 200, headers: { "Content-Type": "application/pdf" } });
    }

    // return the log text for debugging
    const text = new TextDecoder("utf-8").decode(new Uint8Array(buf));
    return new NextResponse(text, { status: resp.status });

    function cleanup() {
      try {
        fs.rmSync(tmp, { recursive: true, force: true });
      } catch {}
    }
  } catch (e: any) {
    return new NextResponse(e?.message || String(e), { status: 500 });
  }
}
