"use client";

import { ArrowUp, LoaderPinwheel } from "lucide-react";
import { SubmitEvent, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { trpc } from "../utils/trpc";

export default function Page() {
  type messagesType = {
    role: "user" | "assistant";
    content: string;
  };

  const [messages, setMessages] = useState<messagesType[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function askAi(question: string) {
    setLoading(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    trpc.ai.askAi.subscribe(question, {
      onData(chunk) {
        if (chunk) setLoading(false);

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated.length - 1;

          updated[last] = {
            ...updated[last],
            content: updated[last].content + chunk,
          };

          return updated;
        });
      },
      onError(err) {
        setLoading(false);
        console.log("An error occured", err);
      },
      onComplete() {
        setLoading(false);
      },
    });
  }

  function handleFormSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (question.trim() === "") {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    askAi(question);
    setQuestion("");
  }

  const chatRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;

    // chat.scrollTop = chat.scrollHeight;
    chat.scrollTo({
      top: chat.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <>
      {messages.length === 0 && (
        <div className="w-full fixed -z-10 inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-medium ">Hey, Ready when you are.</h1>
        </div>
      )}
      <div
        ref={chatRef}
        className="h-dvh pb-60 p-6  scrollbar-none overflow-y-auto"
      >
        <div className={`w-full mx-auto max-w-7xl flex flex-col gap-6`}>
          {messages?.map((message, id) =>
            message.content ? (
              <div
                key={id}
                className={`${message?.role === "user" ? "self-end max-w-xl bg-purple-950 rounded-tl-2xl" : "bg-gray-900 max-w-6xl rounded-tr-2xl"} w-fit font-medium text-xl p-4 max-w-3xl rounded-bl-2xl rounded-br-2xl px-5`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : null,
          )}

          {loading && (
            <span className="flex w-fit items-center gap-2 rounded-tr-2xl rounded-bl-2xl rounded-br-2xl bg-gray-900 p-4 px-5 font-medium text-xl text-gray-400">
              <LoaderPinwheel
                className="animate-spin text-gray-400 [animation-duration:2s]"
                size={20}
              />
              <span className="animate-pulse [animation-duration:2s]">
                Thinking
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 p-6 pb-8 left-0 flex items-center justify-center w-full bg-[#1c1c1c]">
        <form
          onSubmit={handleFormSubmit}
          className="flex rounded-full pl-8 p-3 gap-2 items-center w-7xl bg-black"
        >
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="field-sizing-content resize-none focus:outline-none flex-1 font-medium text-2xl"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask me.."
          />
          <button
            type="submit"
            className="flex cursor-pointer transition-transform duration-150 active:scale-90 items-center bg-white text-black rounded-full p-4"
          >
            <ArrowUp size={28} className="text-purple-600" strokeWidth={2.5} />
          </button>
        </form>{" "}
      </div>
    </>
  );
}
