import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Upload, FileText, Image as ImageIcon, MinusCircle, Heading } from 'lucide-react';
import { ClipItem, ClipFile } from '../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (formData: FormData) => void;
}

// Helper for auto-resizing textarea
const AutoResizeTextarea = ({ value, onChange, placeholder, className, autoFocus, style }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      autoFocus={autoFocus}
      className={`resize-none overflow-hidden ${className}`}
      style={style}
    />
  );
};

interface FileItemState {
  file: File;
  remark: string;
  tempId: string;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  // Fields
  const [title, setTitle] = useState('');
  
  // Dynamic Content Fields (Text Blocks)
  const [texts, setTexts] = useState<string[]>(['']);
  
  // Dynamic File Fields with Remarks
  const [fileItems, setFileItems] = useState<FileItemState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings
  const [expiry, setExpiry] = useState('never');
  const [limit, setLimit] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // --- Handlers ---

  // Text Blocks
  const handleTextChange = (index: number, val: string) => {
    const newTexts = [...texts];
    newTexts[index] = val;
    setTexts(newTexts);
  };

  const addTextField = () => setTexts([...texts, '']);
  const removeTextField = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  // File Blocks
  const addFiles = (filesToAdd: File[]) => {
    const newItems = filesToAdd.map(f => ({ 
        file: f, 
        remark: '', 
        tempId: Math.random().toString(36).substr(2, 5) 
    }));
    setFileItems([...fileItems, ...newItems]);
    
    // Auto-fill title if empty and it's the first file
    if (!title && filesToAdd.length > 0) {
        // Optional: setTitle(filesToAdd[0].name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      addFiles(Array.from(e.clipboardData.files));
    } else {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText && !texts[0]) {
           // If first text block is empty, fill it
           e.preventDefault();
           setTexts([pastedText]);
           // Auto title if short
           if (!title) {
               const firstLine = pastedText.split('\n')[0].substring(0, 20);
               setTitle(firstLine + (pastedText.length > 20 ? '...' : ''));
           }
        }
    }
  };

  const handleFileRemarkChange = (index: number, val: string) => {
    const newItems = [...fileItems];
    newItems[index].remark = val;
    setFileItems(newItems);
  };

  const removeFileItem = (index: number) => {
    setFileItems(fileItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const validTexts = texts.filter(c => c.trim() !== '');
    if (validTexts.length === 0 && fileItems.length === 0) return;

    setIsSubmitting(true);
    
    // Default title logic
    let finalTitle = title;
    if (!finalTitle) {
        if (fileItems.length > 0) finalTitle = fileItems[0].file.name;
        else if (validTexts.length > 0) finalTitle = validTexts[0].substring(0, 30);
        else finalTitle = '无标题条目';
    }

    const formData = new FormData();
    formData.append('title', finalTitle);
    formData.append('texts', JSON.stringify(validTexts));
    formData.append('expiry', expiry);
    formData.append('visitLimit', limit);
    formData.append('sharePassword', sharePassword);

    const fileMetadata = fileItems.map(f => ({
        tempId: f.tempId,
        remark: f.remark
    }));
    formData.append('fileMetadata', JSON.stringify(fileMetadata));

    fileItems.forEach(f => {
        formData.append(`file_${f.tempId}`, f.file);
    });

    await onAdd(formData);

    setIsSubmitting(false);
    // Reset
    setTitle('');
    setTexts(['']);
    setFileItems([]);
    setExpiry('never');
    setLimit('');
    setSharePassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <h3 className="text-lg font-bold text-gray-900">发布分享</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 space-y-8 bg-[#f8f9fa]">
          
          {/* Section 1: Title (Enhanced) */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-gray-900">
                <Heading size={16} className="mr-2 text-blue-600"/> 
                标题 / 关键词 (必填)
            </label>
            <p className="text-xs text-gray-400 mb-2">建议输入代码用途、文件描述等，方便后续检索。</p>
            <div className="relative">
                <AutoResizeTextarea
                value={title}
                onChange={(e: any) => setTitle(e.target.value)}
                placeholder="例如：Redis 配置代码、周五会议纪要..."
                autoFocus
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-lg font-medium focus:border-black focus:ring-1 focus:ring-black focus:outline-none placeholder:text-gray-300 transition-all shadow-sm"
                />
            </div>
          </div>

          {/* Section 2: Text Blocks */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-900">文本内容</label>
            
            {texts.map((text, idx) => (
              <div key={`text-${idx}`} className="relative group">
                <AutoResizeTextarea
                  value={text}
                  onChange={(e: any) => handleTextChange(idx, e.target.value)}
                  placeholder="在这里粘贴文本、代码或链接..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all shadow-sm font-mono"
                />
                {texts.length > 1 && (
                  <button 
                    onClick={() => removeTextField(idx)}
                    className="absolute -right-2 -top-2 bg-red-50 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-100 hover:bg-red-100"
                    title="删除此行"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}

            <button 
              onClick={addTextField}
              className="flex items-center text-xs font-medium text-gray-500 hover:text-black px-2 py-1 rounded transition-colors"
            >
              <Plus size={14} className="mr-1" /> 添加新的文本块
            </button>
          </div>

          {/* Section 3: File + Remark Blocks */}
          <div className="space-y-3">
             <label className="block text-sm font-bold text-gray-900">附件</label>
             
             {/* List of selected files with their remark inputs */}
             {fileItems.length > 0 && (
               <div className="space-y-3 mb-3">
                 {fileItems.map((item, idx) => (
                    <div key={`file-${idx}`} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm group relative">
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3 overflow-hidden">
                             <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                               {item.file.type.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                             </div>
                             <div className="min-w-0">
                               <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                               <p className="text-xs text-gray-500">{(item.file.size / 1024).toFixed(1)} KB</p>
                             </div>
                          </div>
                          <button onClick={() => removeFileItem(idx)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                            <X size={18} />
                          </button>
                       </div>
                       
                       {/* Remark Input for this file */}
                       <div className="border-t border-gray-50 pt-2">
                          <AutoResizeTextarea
                            value={item.remark}
                            onChange={(e: any) => handleFileRemarkChange(idx, e.target.value)}
                            placeholder="附件备注 (例如：最新版设计图)..."
                            className="w-full bg-transparent text-xs py-1 text-gray-600 placeholder:text-gray-300 focus:outline-none"
                          />
                       </div>
                    </div>
                 ))}
               </div>
             )}

             {/* Drop Zone / Add Button */}
             <div 
               onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
               onDrop={handleDrop}
               onPaste={handlePaste}
               onClick={() => fileInputRef.current?.click()}
               tabIndex={0}
               className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 group"
             >
               <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-50 transition-colors">
                 <Upload size={18} className="text-gray-400 group-hover:text-blue-600" />
               </div>
               <p className="text-sm font-medium text-gray-700">点击选择，或拖拽文件到此处</p>
               <p className="text-xs text-gray-400 mt-1">支持 Ctrl+V 直接粘贴内容</p>
             </div>
             
             <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect}
                multiple 
              />
          </div>

          {/* Section 4: Settings */}
          <div className="pt-4 border-t border-gray-200 space-y-4">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">高级选项</h4>
             
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">有效期</label>
                  <select 
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-black"
                  >
                    <option value="never">永不过期</option>
                    <option value="10m">10 分钟</option>
                    <option value="1h">1 小时</option>
                    <option value="1d">1 天</option>
                  </select>
                </div>
                
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1.5">访问次数限制</label>
                   <input 
                     type="number" 
                     placeholder="留空则不限"
                     value={limit}
                     onChange={(e) => setLimit(e.target.value)}
                     className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-black placeholder:text-xs"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1.5">独立提取码</label>
                   <input 
                     type="text" 
                     placeholder="可选"
                     value={sharePassword}
                     onChange={(e) => setSharePassword(e.target.value)}
                     className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-black placeholder:text-xs"
                   />
                </div>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end space-x-3 bg-white">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-black text-white font-bold text-sm shadow-lg hover:bg-gray-800 transition-all active:scale-95 flex items-center disabled:opacity-70"
          >
            {isSubmitting ? (
               <>
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                 发布中...
               </>
            ) : "确认发布"}
          </button>
        </div>
      </div>
    </div>
  );
};