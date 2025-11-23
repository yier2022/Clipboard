import React, { useState, useEffect } from 'react';
import { ArrowRight, Command } from 'lucide-react';

interface LoginProps {
  onLogin: (password: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [appTitle, setAppTitle] = useState('Clipboard');
  const [subTitle, setSubTitle] = useState('');

  useEffect(() => {
    // 尝试获取全局标题配置，无需认证
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.appTitle) {
          setAppTitle(data.appTitle);
          document.title = data.appTitle;
        }
        if (data.subTitle) setSubTitle(data.subTitle);
      })
      .catch(() => {}); // 忽略错误，使用默认值
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        onLogin(password);
      } else {
        setError('访问密码错误');
      }
    } catch (e) {
      setError('连接服务器失败，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc] text-[#111]">
      <div className="w-full max-w-xs px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 text-center">
           <div className="w-14 h-14 bg-black text-white rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-gray-200 mb-6">
              <Command size={24} />
           </div>
           <h1 className="text-2xl font-bold tracking-tight">{appTitle}</h1>
           {subTitle && <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">{subTitle}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 text-center text-lg py-3.5 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-300 shadow-sm"
              placeholder="输入密码"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-center text-red-500 text-xs font-medium animate-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-base hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                进入 <ArrowRight size={16} className="ml-2 opacity-80" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-12 text-center space-y-1">
           <p className="text-[10px] text-gray-300 font-mono uppercase tracking-widest">Private Secure Storage</p>
        </div>
      </div>
    </div>
  );
};