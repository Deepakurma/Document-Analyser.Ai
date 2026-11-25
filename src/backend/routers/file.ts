import { PDFParse } from "pdf-parse";
import type { FastifyInstance } from "fastify";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { ChromaClient } from "chromadb";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import fastifyMultipart from "@fastify/multipart";
import { Document } from "@langchain/core/documents";

export async function fileRoute(server: FastifyInstance) {
  await server.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024,
    },
  });

  server.post("/upload", async (request) => {
    const file = await request.file();

    if (!file) {
      throw new Error("No file uploaded");
    }

    const parser = new PDFParse({ data: await file.toBuffer() });

    try {
      const result = await parser.getText();

      await convertChunks(result.text);

      return { text: result.text };
    } finally {
      await parser.destroy();
    }
  });
}

const collection = "documents";

const embedor = new HuggingFaceTransformersEmbeddings({
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

const client = new ChromaClient({ host: "localhost", port: 8001 });

const chromaConfig = {
  collectionName: collection,
  index: client,
};

async function convertChunks(text: string) {
  const chunksSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await chunksSplitter.splitText(text);
  console.log("✅ Chunks created:", chunks.length);

  await vectorizeData(chunks);

  return chunks;
}

async function vectorizeData(chunks: string[]) {
  if (chunks.length === 0) {
    throw new Error("No text could be extracted from this PDF to vectorize.");
  }

  try {
    console.log("🔌 Checking ChromaDB connection and collection");
    await client.heartbeat();
    const collections = await client.listCollections();

    if (collections.some((c) => c.name === "documents")) {
      await client.deleteCollection({ name: "documents" });
      console.log("Previous collection deleted");
    }

    const batchSize = 50;
    const vector_store = new Chroma(embedor, chromaConfig);

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      const documents = batch.map(
        (text, idx) =>
          new Document({
            pageContent: text,
            metadata: { chunkIndex: i + idx },
          }),
      );

      await vector_store.addDocuments(documents);

      console.log(
        `Processed ${(((i + batch.length) / chunks.length) * 100).toFixed(1)}% chunks`,
      );
    }

    console.log("✅ ChromaDB collection ready");
  } catch (error) {
    console.error(`❌ Vectorization failed:`, error);
    throw error;
  }
}

export async function fetchContext(question: string) {
  const vector_store = new Chroma(embedor, chromaConfig);

  const retriever = vector_store.asRetriever({ k: 3 });

  const docs = await retriever.invoke(question);

  const docsContent = docs.map((doc) => doc.pageContent).join("\n\n");

  return docsContent;
}
