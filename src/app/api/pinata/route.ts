import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json({ error: "Missing PINATA_JWT environment variable." }, { status: 500 });
    }

    const incoming = await req.formData();
    const file = incoming.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const title = String(incoming.get("title") || "Untitled dataset");
    const description = String(incoming.get("description") || "");
    const category = String(incoming.get("category") || "General");
    const tags = String(incoming.get("tags") || "");
    const priceEth = String(incoming.get("priceEth") || "0");
    const owner = String(incoming.get("owner") || "");
    const fileHash = String(incoming.get("fileHash") || "");

    const fileForm = new FormData();
    fileForm.append("file", file, file.name);
    fileForm.append(
      "pinataMetadata",
      JSON.stringify({
        name: `${Date.now()}-${file.name}`,
        keyvalues: { app: "DataMintAI", title, category, owner },
      }),
    );

    const fileRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: fileForm,
    });

    if (!fileRes.ok) {
      const detail = await fileRes.text();
      return NextResponse.json({ error: "Pinata file upload failed.", detail }, { status: fileRes.status });
    }

    const fileJson = await fileRes.json();
    const fileCid = fileJson.IpfsHash as string;

    const metadata = {
      name: title,
      description,
      category,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      priceEth,
      owner,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileHash,
      dataCid: fileCid,
      createdAt: new Date().toISOString(),
      app: "DataMintAI",
    };

    const jsonRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataMetadata: {
          name: `${title}-metadata.json`,
          keyvalues: { app: "DataMintAI", type: "dataset-metadata", owner },
        },
        pinataContent: metadata,
      }),
    });

    if (!jsonRes.ok) {
      const detail = await jsonRes.text();
      return NextResponse.json({ error: "Pinata metadata upload failed.", detail }, { status: jsonRes.status });
    }

    const json = await jsonRes.json();
    const metadataCid = json.IpfsHash as string;

    return NextResponse.json({
      fileCid,
      metadataCid,
      fileUrl: `https://gateway.pinata.cloud/ipfs/${fileCid}`,
      metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataCid}`,
      sizeLabel: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected upload error." }, { status: 500 });
  }
}
