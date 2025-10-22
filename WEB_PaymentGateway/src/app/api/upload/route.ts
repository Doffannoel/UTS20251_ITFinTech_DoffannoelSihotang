import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

function safeFilename(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ts = Date.now();
  const [n, ext] = (() => {
    const i = base.lastIndexOf(".");
    return i > -1 ? [base.slice(0, i), base.slice(i)] : [base, ""];
  })();
  return `${n}-${ts}${ext}`;
}

export async function POST(req: Request) {
  try {
    // terima multipart form-data
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file)
      return new Response(JSON.stringify({ message: "No file" }), {
        status: 400,
      });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = safeFilename(file.name || "upload.bin");
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, buffer);

    // URL publik
    const url = `/uploads/${filename}`;
    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ message: e.message || "Upload error" }),
      { status: 500 }
    );
  }
}
