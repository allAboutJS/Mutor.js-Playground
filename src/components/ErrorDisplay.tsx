import { AlertCircle } from "lucide-react";

export default function ErrorDisplay({ error }) {
	if (!error) return null;

	return (
		<div className="bg-red-950 border-l-4 border-red-500 p-4 rounded  overflow-auto">
			<div className="flex items-start gap-3">
				<AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
				<div>
					<h3 className="font-semibold text-red-100">Error</h3>
					<p className="text-red-200 text-sm mt-1 whitespace-pre font-mono">
						{error}
					</p>
				</div>
			</div>
		</div>
	);
}
