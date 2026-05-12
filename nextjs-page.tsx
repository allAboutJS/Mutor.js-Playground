'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AlertCircle, Play, Copy, Download, RotateCcw, Plus, Trash2, Edit2, Check, X, Moon, Sun, ChevronDown, Zap } from 'lucide-react';

// ============================================================================
// MUTOR.JS BROWSER IMPLEMENTATION
// ============================================================================
class MutorBrowser {
  constructor(config = {}) {
    this.config = {
      autoEscape: true,
      allowFnCalls: false,
      ...config
    };
    this.components = new Map();
    this.cache = new Map();
  }

  escapeHtml(str) {
    if (!this.config.autoEscape || typeof str !== 'string') return str;
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
  }

  parseExpression(expr, context) {
    try {
      const keys = Object.keys(context);
      const values = keys.map(k => context[k]);
      const func = new Function(...keys, `return ${expr}`);
      const result = func(...values);
      return result == null ? '' : result;
    } catch (e) {
      throw new Error(`Expression error: ${e.message}`);
    }
  }

  parseTemplate(template) {
    const tokens = [];
    const regex = /\{\{([\s\S]*?)\}\}|\{%\s*if\s+([\s\S]*?)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}|\{%\s*for\s+(\w+)\s+in\s+([\s\S]*?)\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}|\{%\s*include\s+"([^"]+)"\s*%\}/g;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(template)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', value: template.substring(lastIndex, match.index) });
      }

      if (match[1]) {
        tokens.push({ type: 'interpolation', expr: match[1].trim() });
      } else if (match[2]) {
        tokens.push({ type: 'if', condition: match[2].trim(), body: match[3] });
      } else if (match[4]) {
        tokens.push({ type: 'for', variable: match[4], iterable: match[5].trim(), body: match[6] });
      } else if (match[7]) {
        tokens.push({ type: 'include', name: match[7] });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < template.length) {
      tokens.push({ type: 'text', value: template.substring(lastIndex) });
    }

    return tokens;
  }

  renderTokens(tokens, context) {
    let output = '';

    for (const token of tokens) {
      if (token.type === 'text') {
        output += token.value;
      } else if (token.type === 'interpolation') {
        const value = this.parseExpression(token.expr, context);
        output += this.escapeHtml(String(value));
      } else if (token.type === 'if') {
        const condition = this.parseExpression(token.condition, context);
        if (condition) {
          const bodyTokens = this.parseTemplate(token.body);
          output += this.renderTokens(bodyTokens, context);
        }
      } else if (token.type === 'for') {
        const iterable = this.parseExpression(token.iterable, context);
        if (Array.isArray(iterable)) {
          for (const item of iterable) {
            const loopContext = { ...context, [token.variable]: item };
            const bodyTokens = this.parseTemplate(token.body);
            output += this.renderTokens(bodyTokens, loopContext);
          }
        }
      } else if (token.type === 'include') {
        if (this.components.has(token.name)) {
          const componentTemplate = this.components.get(token.name);
          const componentTokens = this.parseTemplate(componentTemplate);
          output += this.renderTokens(componentTokens, context);
        } else {
          throw new Error(`Component not found: ${token.name}`);
        }
      }
    }

    return output;
  }

  render(template, context = {}) {
    try {
      const tokens = this.parseTemplate(template);
      return this.renderTokens(tokens, context);
    } catch (e) {
      throw new Error(`Render error: ${e.message}`);
    }
  }

  registerComponent(name, template) {
    if (!name || typeof template !== 'string') {
      throw new Error('Invalid component registration');
    }
    this.components.set(name, template);
  }

  renderComponent(name, context = {}) {
    if (!this.components.has(name)) {
      throw new Error(`Component not found: ${name}`);
    }
    const template = this.components.get(name);
    return this.render(template, context);
  }

  getComponents() {
    return Array.from(this.components.keys());
  }

  clearCache() {
    this.cache.clear();
  }
}

// ============================================================================
// DEMO TEMPLATES
// ============================================================================
const DEMO_TEMPLATES = [
  {
    name: 'Basic Interpolation',
    template: '<h1>{{ greeting }}, {{ user.name }}!</h1>\n<p>You have {{ messages }} new messages.</p>',
    context: { greeting: 'Hello', user: { name: 'Alice' }, messages: 5 }
  },
  {
    name: 'Conditionals',
    template: '{% if user.premium %}\n<div class="premium">🌟 Premium Member</div>\n{% endif %}\n<p>Status: {{ user.status }}</p>\n{% if items.length > 0 %}\n<p>Items available</p>\n{% endif %}',
    context: { user: { premium: true, status: 'Active' }, items: [1, 2, 3] }
  },
  {
    name: 'Loops & Lists',
    template: '<ul>\n{% for item in items %}\n  <li>{{ item.name }} - ${{ item.price }}</li>\n{% endfor %}\n</ul>',
    context: { items: [{ name: 'Laptop', price: 999 }, { name: 'Mouse', price: 29 }, { name: 'Keyboard', price: 79 }] }
  },
  {
    name: 'Nested Structures',
    template: '<div>\n{% for user in users %}\n  <h3>{{ user.name }}</h3>\n  <ul>\n  {% for hobby in user.hobbies %}\n    <li>{{ hobby }}</li>\n  {% endfor %}\n  </ul>\n{% endfor %}\n</div>',
    context: { users: [{ name: 'Alice', hobbies: ['Reading', 'Gaming'] }, { name: 'Bob', hobbies: ['Cooking', 'Sports'] }] }
  },
  {
    name: 'Components & Includes',
    template: 'Welcome!\n{% include "header" %}\n{% include "footer" %}',
    context: {},
    components: { header: '<header>📌 Application Header</header>', footer: '<footer>© 2024 Mutor.js</footer>' }
  },
  {
    name: 'Expressions',
    template: '<p>{{ price * quantity }} ({{ quantity }} × ${{ price }})</p>\n<p>Total: ${{ (price * quantity).toFixed(2) }}</p>\n<p>{{ name.toUpperCase() }}</p>',
    context: { price: 15.50, quantity: 3, name: 'mutor.js' }
  },
  {
    name: 'Escape & Raw Output',
    template: '<p>{{ html }}</p>\n<p>Safe: &lt;script&gt;alert("xss")&lt;/script&gt;</p>',
    context: { html: '<strong>Bold Text</strong>' }
  },
  {
    name: 'Complex Conditionals',
    template: '{% if user.age >= 18 %}\n<p>✓ Adult</p>\n{% endif %}\n{% if user.premium && user.verified %}\n<p>🔐 Premium + Verified</p>\n{% endif %}\n<p>Status: {{ user.status }}</p>',
    context: { user: { age: 25, premium: true, verified: true, status: 'Active' } }
  }
];

// ============================================================================
// CODE EDITOR COMPONENT
// ============================================================================
function CodeEditor({ value, onChange, placeholder = '' }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-full p-4 font-mono text-sm bg-zinc-900 text-zinc-100 border-0 outline-none resize-none"
      spellCheck="false"
    />
  );
}

// ============================================================================
// ERROR DISPLAY
// ============================================================================
function ErrorDisplay({ error }) {
  if (!error) return null;

  return (
    <div className="bg-red-950 border-l-4 border-red-500 p-4 rounded">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-100">Error</h3>
          <p className="text-red-200 text-sm mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT MANAGER
// ============================================================================
function ComponentManager({ components, onAdd, onUpdate, onDelete }) {
  const [newCompName, setNewCompName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingCode, setEditingCode] = useState('');

  const handleAdd = () => {
    if (newCompName.trim()) {
      onAdd({ id: Date.now(), name: newCompName, template: '' });
      setNewCompName('');
    }
  };

  const startEdit = (comp) => {
    setEditingId(comp.id);
    setEditingCode(comp.template);
  };

  const saveEdit = () => {
    onUpdate(editingId, editingCode);
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-t border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-100 mb-3">Custom Components</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCompName}
            onChange={(e) => setNewCompName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Component name..."
            className="flex-1 px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500"
          />
          <button
            onClick={handleAdd}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {components.length === 0 ? (
          <div className="p-4 text-zinc-500 text-sm">No components yet. Create one to get started.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {components.map((comp) => (
              <div key={comp.id} className="p-4 border-b border-zinc-800">
                {editingId === comp.id ? (
                  <div>
                    <textarea
                      value={editingCode}
                      onChange={(e) => setEditingCode(e.target.value)}
                      className="w-full h-24 p-2 text-sm font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-100 resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={saveEdit}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-xs font-medium flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono bg-zinc-800 px-2 py-1 rounded text-blue-400">{comp.name}</code>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(comp)}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(comp.id)}
                          className="p-1 hover:bg-zinc-800 rounded text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {comp.template && (
                      <div className="text-xs text-zinc-400 bg-zinc-800 p-2 rounded max-h-16 overflow-hidden text-ellipsis">
                        {comp.template.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PLAYGROUND
// ============================================================================
export default function MutorPlayground() {
  // State
  const [template, setTemplate] = useState(DEMO_TEMPLATES[0].template);
  const [context, setContext] = useState(JSON.stringify(DEMO_TEMPLATES[0].context, null, 2));
  const [components, setComponents] = useState([]);
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const [showComponentPanel, setShowComponentPanel] = useState(true);

  const mutorRef = useRef(new MutorBrowser());
  const renderTimeout = useRef(null);

  const performRender = useCallback(() => {
    try {
      setError(null);
      const mutor = mutorRef.current;

      // Clear and re-register components
      mutor.components.clear();
      for (const comp of components) {
        mutor.registerComponent(comp.name, comp.template);
      }

      // Parse context
      let contextObj = {};
      if (context.trim()) {
        contextObj = JSON.parse(context);
      }

      // Render
      const startTime = performance.now();
      const result = mutor.render(template, contextObj);
      const endTime = performance.now();

      setOutput(result);
      setRenderTime((endTime - startTime).toFixed(2));
    } catch (err) {
      setError(err.message);
      setOutput('');
    }
  }, [template, context, components]);

  const debouncedRender = useCallback(() => {
    clearTimeout(renderTimeout.current);
    renderTimeout.current = setTimeout(performRender, 300);
  }, [performRender]);

  // Update outputs when inputs change
  useEffect(() => {
    debouncedRender();
  }, [template, context, components, debouncedRender]);

  // Handle demo selection
  const handleDemoSelect = (index) => {
    const demo = DEMO_TEMPLATES[index];
    setSelectedDemo(index);
    setTemplate(demo.template);
    setContext(JSON.stringify(demo.context, null, 2));
    
    if (demo.components) {
      const comps = Object.entries(demo.components).map(([name, template], idx) => ({
        id: idx,
        name,
        template
      }));
      setComponents(comps);
    } else {
      setComponents([]);
    }
  };

  // Component operations
  const handleAddComponent = (comp) => {
    setComponents([...components, comp]);
  };

  const handleUpdateComponent = (id, newTemplate) => {
    setComponents(components.map(c => c.id === id ? { ...c, template: newTemplate } : c));
  };

  const handleDeleteComponent = (id) => {
    setComponents(components.filter(c => c.id !== id));
  };

  // Utility functions
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const exportSession = () => {
    const session = {
      template,
      context: JSON.parse(context),
      components: components.map(c => ({ name: c.name, template: c.template }))
    };
    const json = JSON.stringify(session, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mutor-session.json';
    a.click();
  };

  const reset = () => {
    handleDemoSelect(selectedDemo);
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-zinc-950 text-zinc-100`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 border-b border-purple-800 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center font-bold text-white">
              M
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mutor.js Playground</h1>
              <p className="text-sm text-blue-200">Secure, compiled template engine</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="h-6 border-r border-purple-700" />
            <select
              value={selectedDemo}
              onChange={(e) => handleDemoSelect(parseInt(e.target.value))}
              className="px-4 py-2 bg-blue-800/50 border border-blue-700 rounded-lg text-sm font-medium text-white hover:bg-blue-700/50 cursor-pointer"
            >
              {DEMO_TEMPLATES.map((demo, idx) => (
                <option key={idx} value={idx}>
                  📚 {demo.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Left Panel - Editors */}
        <div className="flex-1 flex flex-col gap-0 border-r border-zinc-800">
          {/* Template Editor */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-zinc-800">
            <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-semibold">Template</h2>
              </div>
              <span className="text-xs text-zinc-500">{template.length} chars</span>
            </div>
            <CodeEditor value={template} onChange={setTemplate} placeholder="Enter your Mutor.js template..." />
          </div>

          {/* Context Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Context (JSON)</h2>
              <span className="text-xs text-zinc-500">{context.length} chars</span>
            </div>
            <CodeEditor value={context} onChange={setContext} placeholder="{}" />
          </div>
        </div>

        {/* Right Panel - Output & Components */}
        <div className="w-1/3 flex flex-col gap-0 bg-zinc-900 border-l border-zinc-800">
          {/* Output */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-zinc-800">
            <div className="px-4 py-3 bg-black border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Output</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{renderTime}ms</span>
                <button
                  onClick={() => copyToClipboard(output)}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100"
                  title="Copy output"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error ? (
              <div className="flex-1 overflow-auto p-4">
                <ErrorDisplay error={error} />
              </div>
            ) : (
              <div className="flex-1 overflow-auto p-4 font-mono text-sm text-zinc-300 whitespace-pre-wrap break-words">
                {output}
              </div>
            )}
          </div>

          {/* Components Panel */}
          <div className="h-48 border-t border-zinc-800 flex flex-col">
            <div className="px-4 py-3 bg-black border-b border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-zinc-900"
              onClick={() => setShowComponentPanel(!showComponentPanel)}
            >
              <h2 className="text-sm font-semibold">Components</h2>
              <ChevronDown className={`w-4 h-4 transition-transform ${showComponentPanel ? '' : 'rotate-180'}`} />
            </div>
            {showComponentPanel && (
              <ComponentManager
                components={components}
                onAdd={handleAddComponent}
                onUpdate={handleUpdateComponent}
                onDelete={handleDeleteComponent}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-800 px-6 py-3 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <span>Cache: {mutorRef.current.cache.size} entries</span>
          <span>Components: {components.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-100 font-medium flex items-center gap-1 text-xs"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button
            onClick={exportSession}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-100 font-medium flex items-center gap-1 text-xs"
          >
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </footer>
    </div>
  );
}
