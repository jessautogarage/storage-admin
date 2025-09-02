import React, { useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

// Custom Rich Text Editor Component without React Quill to avoid findDOMNode warning
const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Enter your text here...",
  error,
  showError,
  maxLength = 2000,
  disabled = false,
  className = ""
}) => {
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  
  // Helper function to get text length without HTML
  const getTextLength = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return (temp.textContent || temp.innerText || '').length;
  };

  // Format selection with command
  const formatText = (command, value = null) => {
    if (disabled) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Handle paste to clean HTML
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    const cleanHtml = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'strike', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'a', 'strong', 'em', 'h1', 'h2', 'h3'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
    document.execCommand('insertHTML', false, cleanHtml);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Handle input changes
  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      // Check if content exceeds max length
      if (getTextLength(content) > maxLength) {
        // Prevent further input
        return;
      }
      onChange(content);
    }
  };

  // Set initial content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const textLength = getTextLength(value);

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div 
        ref={toolbarRef}
        className={`editor-toolbar flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 rounded-t-xl ${
          error && showError ? 'bg-red-50 border-red-300' : 'border-gray-200'
        }`}
      >
        {/* Text formatting buttons */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <button
            type="button"
            onClick={() => formatText('bold')}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Bold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => formatText('italic')}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Italic"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M14 4l-4 16M8 20h4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => formatText('underline')}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v8a5 5 0 0010 0V4M5 20h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => formatText('strikeThrough')}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Strikethrough"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12H3m18 0h-9m-3-7c0-1.657 1.343-3 3-3s3 1.343 3 3c0 .739-.267 1.416-.709 1.938M9 12h6c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3" />
            </svg>
          </button>
        </div>

        {/* Headers */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <select
            onChange={(e) => formatText('formatBlock', e.target.value)}
            disabled={disabled}
            className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            defaultValue="p"
          >
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <button
            type="button"
            onClick={() => formatText('insertUnorderedList')}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => formatText('insertOrderedList')}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6v2m0-1h2M3 11v4m0-2h2m-2 5v2m0-1h2" />
            </svg>
          </button>
        </div>

        {/* Additional formatting */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => formatText('formatBlock', 'blockquote')}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Quote"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) formatText('createLink', url);
            }}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Add Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => formatText('removeFormat')}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Clear Formatting"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={`editor-content min-h-[200px] max-h-[400px] overflow-y-auto p-4 rounded-b-xl border-l border-r border-b ${
          error && showError 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        style={{
          outline: 'none',
        }}
      />

      {/* Footer with character count and error */}
      <div className="flex justify-between items-center mt-2">
        <div>
          {error && showError && (
            <div className="flex items-center text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>
        <div className={`text-sm ${
          textLength > maxLength * 0.9 ? 'text-red-500' : 'text-gray-400'
        }`}>
          {textLength}/{maxLength} characters
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;