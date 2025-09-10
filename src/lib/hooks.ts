import { useCallback, useState, useTransition } from "react";

export function useAsyncAction<TArg, TResult>(
	fn: (arg: TArg) => Promise<TResult>,
	initialState: TResult | null = null
) {
	const [state, setState] = useState<TResult | null>(initialState);
	const [error, setError] = useState<Error | null>(null);
	const [isPending, startTransition] = useTransition();

	const run = useCallback(
		(arg: TArg) => {
			startTransition(async () => {
				try {
					setError(null);
					const result = await fn(arg);
					setState(result);
				} catch (err) {
					setError(err instanceof Error ? err : new Error("Unknown error"));
				}
			});
		},
		[fn]
	);

	return [state, run, isPending, error] as const;
}
