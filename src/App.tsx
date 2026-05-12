/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: allow dynamically generated HTML */

import { Code, Copy, Eye, Zap } from "lucide-react";
import Mutor from "mutorjs";
import { useCallback, useEffect, useRef, useState } from "react";
import CodeEditor from "./components/CodeEditor";
import ComponentManager from "./components/ComponentManager";
import ErrorDisplay from "./components/ErrorDisplay";
import { DEMO_TEMPLATES } from "./utils/constants";

export default function MutorPlayground() {
	const [template, setTemplate] = useState(DEMO_TEMPLATES[0].template);
	const [context, setContext] = useState(
		JSON.stringify(DEMO_TEMPLATES[0].context, null, 2),
	);
	const [components, setComponents] = useState([]);
	const [output, setOutput] = useState("");
	const [error, setError] = useState(null);
	const [selectedDemo, setSelectedDemo] = useState(0);
	const [renderTime, setRenderTime] = useState(0);
	const [showPreview, setShowPreview] = useState(false);

	const mutorRef = useRef(new Mutor());

	const renderTimeout = useRef(null);

	const performRender = useCallback(() => {
		try {
			setError(null);
			const mutor = mutorRef.current;

			// Clear and re-register components
			mutor.reset();
			mutor.addConfig({ allowFnCalls: true });
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
			setRenderTime(Number((endTime - startTime).toFixed(2)));
		} catch (err) {
			console.log(err);
			setError(err.message);
			setOutput("");
		}
	}, [template, context, components]);

	const debouncedRender = useCallback(() => {
		clearTimeout(renderTimeout.current);
		renderTimeout.current = setTimeout(performRender, 300);
	}, [performRender]);

	// Update outputs when inputs change
	useEffect(() => {
		if (template || context || components) {
			debouncedRender();
		}
	}, [template, context, components, debouncedRender]);

	// Handle demo selection
	const handleDemoSelect = (index: number) => {
		const demo = DEMO_TEMPLATES[index];
		setSelectedDemo(index);
		setTemplate(demo.template);
		setContext(JSON.stringify(demo.context, null, 2));

		if (demo.components) {
			const comps = Object.entries(demo.components).map(
				([name, template], idx) => ({
					id: idx,
					name,
					template,
				}),
			);
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
		setComponents(
			components.map((c) =>
				c.id === id ? { ...c, template: newTemplate } : c,
			),
		);
	};

	const handleDeleteComponent = (id) => {
		setComponents(components.filter((c) => c.id !== id));
	};

	// Utility functions
	const copyToClipboard = async (text) => {
		try {
			await navigator.clipboard.writeText(text);
			alert("Copied to clipboard!");
		} catch (err) {
			console.error("Copy failed:", err);
		}
	};

	return (
		<div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
			{/* Header */}
			<header className="bg-linear-to-r from-blue-900 via-purple-900 to-indigo-900 border-b border-purple-800 px-6 py-4 shadow-lg">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className="text-sm flex flex-col">
							<img src="/images/logo-light.png" alt="" className="h-12" />
							<span className="-translate-y-2 pl-2.5 text-zinc-300">
								Playground
							</span>
						</div>
					</div>
					<div>
						<select
							value={selectedDemo}
							onChange={(e) => handleDemoSelect(parseInt(e.target.value, 10))}
							className="px-4 py-2 bg-blue-800/50 border border-blue-700 rounded-lg text-sm font-medium text-white hover:bg-blue-700/50 cursor-pointer"
						>
							{DEMO_TEMPLATES.map((demo, idx) => (
								<option key={demo.name} value={idx}>
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
							<span className="text-xs text-zinc-500">
								{template.length} chars
							</span>
						</div>
						<CodeEditor
							value={template}
							onChange={setTemplate}
							placeholder="Enter your Mutor.js template..."
						/>
					</div>

					{/* Context Editor */}
					<div className="flex-1 flex flex-col min-h-0">
						<div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
							<h2 className="text-sm font-semibold">Context (JSON)</h2>
							<span className="text-xs text-zinc-500">
								{context.length} chars
							</span>
						</div>
						<CodeEditor
							value={context}
							onChange={setContext}
							placeholder="{}"
						/>
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
									type="button"
									onClick={() => setShowPreview(!showPreview)}
									className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100"
									title="Copy output"
								>
									{showPreview ? (
										<Code className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
								<button
									type="button"
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
						) : showPreview ? (
							<div
								dangerouslySetInnerHTML={{ __html: output }}
								className="preview-content flex-1 overflow-auto p-4 text-sm text-zinc-300"
							/>
						) : (
							<div className="flex-1 overflow-auto p-4 font-mono text-sm text-zinc-300 whitespace-pre-wrap wrap-break-word">
								{output}
							</div>
						)}
					</div>

					{/* Components Panel */}
					<div className="flex-1 h-fit max-h-1/2 border-t border-zinc-800 flex flex-col">
						<div className="px-4 py-3 bg-black border-b border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-zinc-900">
							<h2 className="text-sm font-semibold">Components</h2>
						</div>
						<ComponentManager
							components={components}
							onAdd={handleAddComponent}
							onUpdate={handleUpdateComponent}
							onDelete={handleDeleteComponent}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
