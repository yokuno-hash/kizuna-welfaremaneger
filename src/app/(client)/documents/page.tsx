"use client";

import { useState, useRef } from "react";
import { documents } from "@/data/mock";
import { Upload, FileText, Download, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DocumentsPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; size: string }[]>([]);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `documents/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("welfare-docs")
        .upload(path, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("welfare-docs")
        .getPublicUrl(path);

      setUploadedFiles((prev) => [
        {
          name: file.name,
          url: urlData.publicUrl,
          size: `${Math.round(file.size / 1024)} KB`,
        },
        ...prev,
      ]);
      showToast("アップロード完了しました");
    } catch {
      showToast("アップロードに失敗しました。Supabase Storageのバケットを確認してください。");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8 space-y-8 relative">
      {/* トースト */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-800 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">書類保管庫</h2>
          <p className="text-sm text-slate-500 mt-1">登録書類の一覧・アップロード</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.doc,.xls"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer ${
              uploading ? "opacity-50 cursor-wait" : ""
            }`}
          >
            {uploading ? (
              <><Loader2 size={15} className="animate-spin" />アップロード中...</>
            ) : (
              <><Upload size={15} />書類をアップロード</>
            )}
          </label>
        </div>
      </div>

      {/* アップロード済みファイル（Supabase Storage） */}
      {uploadedFiles.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-600 mb-3">アップロード済み</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-emerald-200">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-emerald-700 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">ファイル名</th>
                  <th className="px-6 py-3 text-left">サイズ</th>
                  <th className="px-6 py-3 text-left">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {uploadedFiles.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <FileText size={16} className="text-emerald-500" />
                      {f.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{f.size}</td>
                    <td className="px-6 py-4">
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                      >
                        <Download size={13} /> ダウンロード
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* モックデータ（既存書類） */}
      <div>
        <h3 className="text-sm font-bold text-slate-600 mb-3">既存書類</h3>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">ファイル名</th>
                <th className="px-6 py-3 text-left">カテゴリ</th>
                <th className="px-6 py-3 text-left">更新日</th>
                <th className="px-6 py-3 text-left">サイズ</th>
                <th className="px-6 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{doc.icon}</span>
                      <span className="font-medium text-slate-800">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{doc.updatedAt}</td>
                  <td className="px-6 py-4 text-slate-500">{doc.size}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        <Download size={13} /> DL
                      </button>
                      <button className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
