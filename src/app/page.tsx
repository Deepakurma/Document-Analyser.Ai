"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { Loader } from "lucide-react";
import { useAppContext } from "./utils/AppContext";

export default function Page() {
  const { setFileName } = useAppContext();
  const [document, setDocument] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setDocument(file);
    readDocument(file);
  }

  async function readDocument(file: File) {
    if (file.type !== "application/pdf") {
      throw new Error("File not supported!");
    }

    setFileName(file.name);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(response.status, error);
        throw new Error(error);
      }

      router.push("/chat");
    } catch (err) {
      console.log("Error occured", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center flex-col mt-[20%] gap-8 m-auto w-full">
      {loading ? (
        <div className="flex flex-col gap-2 items-center">
          <Loader className="animate-spin size-9" />{" "}
          <span className="animate-pulse text-xl [animation-duration:2s]">
            Just a moment..
          </span>
        </div>
      ) : (
        <>
          <div className="border w-md rounded-4xl border-gray-500 flex items-center p-4 flex-col gap-2 justify-center border-dotted">
            <h2 className="font-semibold text-2xl">
              Start by uploading a document.
            </h2>
            <div className="flex flex-col gap-2 items-center">
              <span>{document?.name}</span>
              <label
                htmlFor="document-input"
                className="rounded-full cursor-pointer bg-white text-black py-2 px-4"
              >
                Upload
              </label>
              <input
                id="document-input"
                onChange={handleFileChange}
                type="file"
                className="hidden"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
