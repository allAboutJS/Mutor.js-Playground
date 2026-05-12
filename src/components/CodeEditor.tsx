/** biome-ignore-all lint/a11y/noStaticElementInteractions: allow static elements to be interactive */

import { useEffect, useMemo, useRef } from "react";

export default function CodeEditor({
	value,
	onChange,
	placeholder = "",
	className = "",
}) {
	const editorRef = useRef(null);

	const lines = useMemo(() => {
		return value.split("\n");
	}, [value]) as string[];

	function handleInput(e: React.InputEvent<HTMLDivElement>) {
		onChange?.(e.currentTarget.textContent ?? "");
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		// Tab support
		if (e.key === "Tab") {
			e.preventDefault();

			const selection = window.getSelection();

			if (!selection?.rangeCount) {
				return;
			}

			const range = selection.getRangeAt(0);
			const tabNode = document.createTextNode("\t");

			range.insertNode(tabNode);

			range.setStartAfter(tabNode);
			range.setEndAfter(tabNode);

			selection.removeAllRanges();
			selection.addRange(range);

			onChange?.(editorRef.current?.textContent ?? "");
		}
	}

	useEffect(() => {
		if (!editorRef.current) {
			return;
		}

		// Prevent cursor jumping during controlled updates
		if (editorRef.current.textContent !== value) {
			editorRef.current.textContent = value;
		}
	}, [value]);

	return (
		<div
			className={`
				flex h-full overflow-auto
				border border-zinc-800 bg-zinc-950
				${className}
			`}
		>
			{/* Line Numbers */}
			<div
				className="
					select-none border-r border-zinc-800
					bg-zinc-900/70 px-3 py-2
					text-right text-sm text-zinc-500 h-fit
				"
			>
				{lines.map((_, i) => (
					<div key={i.toString()} className="leading-6">
						{i + 1}
					</div>
				))}
			</div>

			{/* Editor */}
			<div className="relative flex-1">
				{/* Placeholder */}
				{!value && (
					<div
						className="
							pointer-events-none absolute left-0 top-0
							p-2 text-sm text-zinc-500
						"
					>
						{placeholder}
					</div>
				)}

				<div
					ref={editorRef}
					contentEditable
					suppressContentEditableWarning
					spellCheck={false}
					onInput={handleInput}
					onKeyDown={handleKeyDown}
					className="
						min-h-full w-full whitespace-pre
						p-2 font-mono text-sm leading-6
						text-zinc-100 outline-none
					"
				/>
			</div>
		</div>
	);
}
