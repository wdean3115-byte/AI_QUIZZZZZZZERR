"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  // States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // 1. Нийтлэлийг хураангуйлах функц
  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        throw new Error(" алдаа гарлаа");
      }

      const data = await res.json();
      setSummary(data.summary);
      setArticleId(data.id); // Дараа нь quiz үүсгэхэд хэрэгтэй
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Quiz үүсгэж, quiz хуудас руу шилжих функц
  const handleTakeQuiz = async () => {
    if (!articleId) return;

    setIsQuizLoading(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });

      if (!res.ok) {
        throw new Error("Quiz үүсгэхэд алдаа гарлаа");
      }

      const quizData = await res.json();
      // Quiz амжилттай үүссэн бол динамик route руу шилжинэ
      router.push(`/dashboard/quiz/${quizData.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setIsQuizLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Оруулах хэсэг */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="font-semibold text-lg mb-1 flex items-center gap-2 text-gray-500">
          AI Article Assistant
        </h2>
        <p className="text-sm text-gray-400 mb-6">AI will help u anything</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Гарчиг
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 
                 text-gray-500 font-medium placeholder:text-gray-400" // Текст: хар саарал, Placeholder: цайвар саарал
              placeholder="Нийтлэлийн гарчиг..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Агуулга
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 
                 text-gray-500 placeholder:text-gray-400 leading-relaxed" // Текст: дунд зэргийн саарал, Placeholder: маш цайвар
              placeholder="Place text here"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={generateSummary}
            disabled={isLoading || !title || !content}
            className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading
              </>
            ) : (
              "Хураангуй үүсгэх"
            )}
          </button>
        </div>
      </div>

      {/* Хураангуй харуулах хэсэг */}
      {summary && (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-gray-900">{title}</h3>
            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
              AI Summary
            </span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed italic">
            {summary}
          </p>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
            <p className="text-xs text-gray-400">Do u wanna take test?</p>
            <button
              onClick={handleTakeQuiz}
              disabled={isQuizLoading}
              className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {isQuizLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Initiating quiz"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
