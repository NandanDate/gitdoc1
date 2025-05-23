export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  url?: string;
  download_url?: string;
}

export interface TreeItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  url: string;
  size?: number;
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
} 