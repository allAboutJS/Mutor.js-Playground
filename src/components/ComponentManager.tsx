import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export default function ComponentManager({
	components,
	onAdd,
	onUpdate,
	onDelete,
}) {
	const [newCompName, setNewCompName] = useState("");
	const [editingId, setEditingId] = useState(null);
	const [editingCode, setEditingCode] = useState("");

	const handleAdd = () => {
		if (newCompName.trim()) {
			onAdd({ id: Date.now(), name: newCompName, template: "" });
			setNewCompName("");
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
				<h3 className="text-sm font-semibold text-zinc-100 mb-3">
					Custom Components
				</h3>
				<div className="flex gap-2">
					<input
						type="text"
						value={newCompName}
						onChange={(e) => setNewCompName(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleAdd()}
						placeholder="Component name..."
						className="flex-1 px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500"
					/>
					<button
						type="button"
						onClick={handleAdd}
						className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center gap-1"
					>
						<Plus className="w-4 h-4" /> Add
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto">
				{components.length === 0 ? (
					<div className="p-4 text-zinc-500 text-sm">
						No components yet. Create one to get started.
					</div>
				) : (
					<div className="divide-y divide-zinc-800">
						{components.map((comp) => (
							<div key={comp.id} className="p-4 border-b border-zinc-800">
								{editingId === comp.id ? (
									<div className="fixed inset-0 bg-zinc-600/70 flex justify-center items-center">
										<div className="bg-zinc-800 p-4 rounded-sm w-full max-w-xl">
											<div className="text-lg">Editing "{comp.name}"</div>
											<textarea
												value={editingCode}
												onChange={(e) => setEditingCode(e.target.value)}
												className="w-full h-48 p-2 mt-2 text-sm font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-100 resize-none"
											/>
											<div className="flex gap-2 mt-2">
												<button
													type="button"
													onClick={saveEdit}
													className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium flex items-center gap-1"
												>
													<Check className="w-3 h-3" /> Save
												</button>
												<button
													type="button"
													onClick={() => setEditingId(null)}
													className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-xs font-medium flex items-center gap-1"
												>
													<X className="w-3 h-3" /> Cancel
												</button>
											</div>
										</div>
									</div>
								) : (
									<div>
										<div className="flex items-center justify-between mb-2">
											<code className="text-sm font-mono bg-zinc-800 px-2 py-1 rounded text-blue-400">
												{comp.name}
											</code>
											<div className="flex gap-2">
												<button
													type="button"
													onClick={() => startEdit(comp)}
													className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100"
												>
													<Edit2 className="w-4 h-4" />
												</button>
												<button
													type="button"
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
