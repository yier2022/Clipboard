import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Clock, Globe, Shield } from 'lucide-react';

interface ShareLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string;
        sharePassword?: string;
        expiry?: string;
    } | null;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ isOpen, onClose, item }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !item) return null;

    // 构建分享链接
    // 假设分享页面路由为 /share/:id
    const shareUrl = `${window.location.origin}/share/${item.id}${item.sharePassword ? `?pwd=${item.sharePassword}` : ''}`;

    // 使用 QR Server API 生成二维码
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                <div className="p-6 text-center border-b border-gray-100 bg-gray-50/50">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">创建成功！</h3>
                    <p className="text-sm text-gray-500 mt-1">您的内容已准备好分享</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center">
                        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <img
                                src={qrCodeUrl}
                                alt="Share QR Code"
                                className="w-40 h-40 object-contain"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* Link Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                            <Globe size={12} className="mr-1" /> 分享链接
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                readOnly
                                value={shareUrl}
                                className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                            <button
                                onClick={handleCopy}
                                className={`p-2.5 rounded-lg border transition-all ${copied
                                    ? 'bg-green-50 border-green-200 text-green-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-black hover:text-black'
                                    }`}
                                title="复制链接"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Info Badges */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {item.sharePassword && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100">
                                <Shield size={12} className="mr-1.5" />
                                密码: {item.sharePassword}
                            </span>
                        )}
                        {item.expiry && item.expiry !== 'never' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                <Clock size={12} className="mr-1.5" />
                                有效期: {item.expiry}
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                    >
                        完成
                    </button>
                </div>
            </div>
        </div>
    );
};
