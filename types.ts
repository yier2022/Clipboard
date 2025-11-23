
export interface ClipFile {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'file';
  remark: string;
  // D1 模式下不需要 r2Key，直接用 id 查库
}

export interface ClipItem {
  id: string;
  title: string;
  texts: string[]; 
  files: ClipFile[]; 
  createdAt: number;
  expiry: string;
  visitLimit: string;
  sharePassword?: string;
}

export interface AppSettings {
  appTitle: string;
  subTitle: string;
}
