"use client";

import { TextAlignJustifyEnd } from "lucide-react";
import { useAppContext } from "./utils/AppContext";
import { FileText } from "lucide-react";

export function Header() {
  const { fileName } = useAppContext();

  return (
    <div className="w-full sticky top-0 p-4 bg-[#1c1c1c]/50 backdrop-blur-2xl gap-2 flex items-center justify-between">
      {fileName ? (
        <div className="flex bg-black items-center gap-2 p-3 rounded-full w-xs">
          <div className="rounded-xl bg-white p-1">
            <FileText className="size-6 text-purple-600" strokeWidth={2} />
          </div>
          <h2 className="text-2xl truncate text-gray-300  font-medium">
            {fileName}
          </h2>
        </div>
      ) : (
        <div className="w-xs" />
      )}

      <div className="flex items-center">
        <TextAlignJustifyEnd className="size-10 text-purple-600" />
        <h1 className="text-[40px] font-bold text-purple-600">DocuAi</h1>
      </div>

      <div className="w-xs" />
    </div>
  );
}
