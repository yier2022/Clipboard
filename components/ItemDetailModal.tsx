import React, { useState } from 'react';
import { X, Copy, Download, FileText, Image as ImageIcon, Clock, Eye, Lock, Check, Calendar } from 'lucide-react';
import { ClipItem } from '../types';

interface ItemDetailModalProps {
  item: ClipItem | null;
  onClose: () => void;
  password: string;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, password }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!item) return null;

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = (fileId: string, fileName: string) => {
    // 使用 token 参数进行鉴权下载
    const downloadUrl = `/api/files/${fileId}?token=${encodeURIComponent(password)}`;

    // 创建隐藏的 a 标签触发下载
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="pr-4">
            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">
              {item.title}
            </h3>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 font-mono">
              <span className="flex items-center bg-gray-200/50 px-2 py-1 rounded">
                <Calendar size={12} className="mr-1" />
                {new Date(item.createdAt).toLocaleString()}
              </span>
              {item.sharePassword && (
                <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                  <Lock size={12} className="mr-1" /> 提取码: {item.sharePassword}
                </span>
              )}
              {item.expiry !== 'never' && (
                <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                  <Clock size={12} className="mr-1" /> {item.expiry}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 bg-white">

          {/* Text Blocks */}
          {item.texts.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">文本内容</h4>
              {item.texts.map((text, idx) => (
                <div key={idx} className="relative group">
                  <pre className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-mono whitespace-pre-wrap break-all text-gray-800 leading-relaxed hover:bg-gray-100/50 transition-colors">
                    {text}
                  </pre>
                  <button
                    onClick={() => handleCopy(text, `text-${idx}`)}
                    className="absolute top-2 right-2 p-2 bg-white shadow-sm border border-gray-200 rounded-lg text-gray-500 hover:text-black hover:border-black transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="复制"
                  >
                    {copiedIndex === `text-${idx}` ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Files */}
          {item.files.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">附件列表</h4>
              <div className="grid grid-cols-1 gap-3">
                {item.files.map((file) => (
                  <div key={file.id} className="flex flex-col p-3 border border-gray-200 rounded-xl hover:border-black/20 hover:shadow-md transition-all group bg-white">

                    {/* Image Preview in Modal */}
                    {file.type === 'image' && (
                      <div className="w-full h-48 bg-gray-50 rounded-lg overflow-hidden mb-3 border border-gray-100 flex items-center justify-center relative">
                        <img
                          src={`/api/files/${file.id}`}
                          alt={file.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 hidden items-center justify-center text-gray-300">
                          <ImageIcon size={32} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${file.type === 'image' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                          {file.type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate pr-2">{file.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{file.size}</span>
                            {file.remark && (
                              <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-gray-600 italic truncate max-w-[150px]">{file.remark}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownload(file.id, file.name)}
                        className="flex items-center justify-center px-4 py-2 bg-gray-50 hover:bg-black hover:text-white text-gray-700 rounded-lg text-xs font-bold transition-all active:scale-95 border border-gray-200 hover:border-black"
                      >
                        <Download size={14} className="mr-2" /> 下载
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
