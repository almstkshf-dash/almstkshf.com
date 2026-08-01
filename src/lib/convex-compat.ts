/*
 * Compatibility layer for UI components that no longer depend on Convex directly.
 * This keeps the frontend build-safe while allowing backend features to degrade
 * gracefully when Convex is not configured.
 */

export type Id<T extends string = string> = string & { readonly __brand: T };
export type Doc<T extends string = string> = Record<string, unknown> & {
    _id: Id<T>;
};

const createRef = (path: string) => ({ __convexRef: path } as const);

export const api = new Proxy(
    {},
    {
        get: (_target, namespace) =>
            new Proxy(
                {},
                {
                    get: (_innerTarget, method) => createRef(`${String(namespace)}.${String(method)}`),
                }
            ),
    }
) as Record<string, Record<string, unknown>>;

export class ConvexError extends Error {
    constructor(message: string, public data?: unknown) {
        super(message);
        this.name = "ConvexError";
    }
}

export function useMutation(_ref: unknown) {
    return async (_args?: unknown) => ({
        success: true,
    });
}

export function useAction(_ref: unknown) {
    return async (_args?: unknown) => ({
        success: false,
        error: "Convex-backed actions are unavailable in this deployment.",
    });
}

export function useQuery(_ref: unknown, _args?: unknown) {
    return undefined;
}

export function useConvexAuth() {
    return {
        isAuthenticated: false,
        isLoading: false,
    };
}
