// Type definitions for Lexical editor state
export interface LexicalTextNode {
  detail: number;
  format: number;
  mode: string;
  style: string;
  text: string;
  type: "text";
  version: number;
}

export interface LexicalParagraphNode {
  children: (LexicalTextNode | any)[];
  direction: "ltr" | "rtl";
  format: string;
  indent: number;
  type: "paragraph";
  version: number;
  textFormat: number;
  textStyle: string;
}

export interface LexicalRootNode {
  children: (LexicalParagraphNode | any)[];
  direction: "ltr" | "rtl";
  format: string;
  indent: number;
  type: "root";
  version: number;
}

export interface LexicalEditorState {
  root: LexicalRootNode;
}

// Basic file download utility
function downloadFile(data: string | Blob, filename: string, mimeType?: string): void {
  const blob = typeof data === 'string' 
    ? new Blob([data], { type: mimeType || 'application/json' })
    : data;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download Lexical editor state as JSON
export function downloadLexicalJson(
  editorState: LexicalEditorState, 
  filename: string = 'document.json'
): void {
  try {
    const jsonString = JSON.stringify(editorState, null, 2);
    downloadFile(jsonString, filename, 'application/json');
    console.log('Lexical document downloaded successfully:', filename);
  } catch (error) {
    console.error('Failed to download Lexical document:', error);
    throw new Error('Failed to serialize and download Lexical document');
  }
}

// Download with custom formatting (pretty-printed)
export function downloadLexicalJsonFormatted(
  editorState: LexicalEditorState, 
  filename: string = 'document-formatted.json',
  indentSize: number = 2
): void {
  try {
    const jsonString = JSON.stringify(editorState, null, indentSize);
    downloadFile(jsonString, filename, 'application/json');
    console.log('Formatted Lexical document downloaded:', filename);
  } catch (error) {
    console.error('Failed to download formatted Lexical document:', error);
    throw new Error('Failed to format and download Lexical document');
  }
}

// Download with metadata (adds timestamp and other info)
export function downloadLexicalJsonWithMetadata(
  editorState: LexicalEditorState,
  filename: string = 'document-with-metadata.json',
  metadata?: Record<string, any>
): void {
  try {
    const documentWithMetadata = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportFormat: 'lexical-json',
        version: '1.0',
        ...metadata
      },
      document: editorState
    };
    
    const jsonString = JSON.stringify(documentWithMetadata, null, 2);
    downloadFile(jsonString, filename, 'application/json');
    console.log('Lexical document with metadata downloaded:', filename);
  } catch (error) {
    console.error('Failed to download Lexical document with metadata:', error);
    throw new Error('Failed to add metadata and download Lexical document');
  }
}

// Extract plain text from Lexical state and download as .txt
export function downloadLexicalAsText(
  editorState: LexicalEditorState,
  filename: string = 'document.txt'
): void {
  try {
    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || '';
      }
      
      if (node.children && Array.isArray(node.children)) {
        return node.children.map(extractText).join('');
      }
      
      return '';
    };

    const plainText = extractText(editorState.root);
    downloadFile(plainText, filename, 'text/plain');
    console.log('Plain text extracted and downloaded:', filename);
  } catch (error) {
    console.error('Failed to extract text from Lexical document:', error);
    throw new Error('Failed to extract and download plain text');
  }
}

// Validate Lexical JSON structure before download
export function validateAndDownloadLexical(
  editorState: any,
  filename: string = 'document.json'
): boolean {
  try {
    // Basic validation
    if (!editorState || typeof editorState !== 'object') {
      throw new Error('Invalid editor state: not an object');
    }

    if (!editorState.root) {
      throw new Error('Invalid editor state: missing root node');
    }

    if (editorState.root.type !== 'root') {
      throw new Error('Invalid editor state: root node type is not "root"');
    }

    if (!Array.isArray(editorState.root.children)) {
      throw new Error('Invalid editor state: root children is not an array');
    }

    // If validation passes, download the file
    downloadLexicalJson(editorState, filename);
    return true;
  } catch (error: any) {
    console.error('Validation failed:', error);
    alert(`Cannot download: ${error.message}`);
    return false;
  }
}

// Usage examples for Svelte component:

// Example 1: Basic download
// const editorState = {
//   "root": {
//     "children": [
//       {
//         "children": [
//           {
//             "detail": 0,
//             "format": 0,
//             "mode": "normal",
//             "style": "",
//             "text": "This is our God",
//             "type": "text",
//             "version": 1
//           }
//         ],
//         "direction": "ltr",
//         "format": "",
//         "indent": 0,
//         "type": "paragraph",
//         "version": 1,
//         "textFormat": 0,
//         "textStyle": ""
//       }
//     ],
//     "direction": "ltr",
//     "format": "",
//     "indent": 0,
//     "type": "root",
//     "version": 1
//   }
// };

// downloadLexicalJson(editorState, 'my-document.json');

// Example 2: Download with validation
// validateAndDownloadLexical(editorState, 'validated-document.json');

// Example 3: Download with metadata
// downloadLexicalJsonWithMetadata(editorState, 'document-with-info.json', {
//   author: 'John Doe',
//   title: 'My Document',
//   tags: ['important', 'draft']
// });

// Example 4: Download as plain text
// downloadLexicalAsText(editorState, 'document-content.txt');

// Svelte component integration
export interface DownloadLexicalButtonProps {
  editorState: LexicalEditorState;
  filename?: string;
  format?: 'json' | 'text' | 'metadata';
  metadata?: Record<string, any>;
}

// For use in your Svelte component:
export function createDownloadHandler(
  editorState: LexicalEditorState,
  options: {
    filename?: string;
    format?: 'json' | 'text' | 'metadata';
    metadata?: Record<string, any>;
    validate?: boolean;
  } = {}
) {
  const {
    filename = 'document.json',
    format = 'json',
    metadata,
    validate = true
  } = options;

  return () => {
    try {
      if (validate && !validateAndDownloadLexical(editorState, filename)) {
        return; // Validation failed, don't proceed
      }

      switch (format) {
        case 'text':
          downloadLexicalAsText(editorState, filename.replace('.json', '.txt'));
          break;
        case 'metadata':
          downloadLexicalJsonWithMetadata(editorState, filename, metadata);
          break;
        default:
          downloadLexicalJson(editorState, filename);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please check the console for details.');
    }
  };
}