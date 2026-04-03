import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock duckdb-wasm-kit before importing the hook
vi.mock('duckdb-wasm-kit', () => ({
    useDuckDbQuery: vi.fn(),
}));

import { useDuckDbQuery } from 'duckdb-wasm-kit';
import useQuery from '../hooks/useQuery';

function makeArrow(rows: Record<string, unknown>[]) {
    return {
        toArray: () =>
            rows.map((row) => ({
                toJSON: () => row,
            })),
    };
}

describe('useQuery', () => {
    it('returns data when the query succeeds', () => {
        vi.mocked(useDuckDbQuery).mockReturnValue({
            arrow: makeArrow([{ amount: 42 }]),
            loading: false,
            error: undefined,
        });

        const { result } = renderHook(() => useQuery<{ amount: number }>('SELECT 42'));

        expect(result.current.data).toEqual([{ amount: 42 }]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeUndefined();
    });

    it('returns undefined data while loading', () => {
        vi.mocked(useDuckDbQuery).mockReturnValue({
            arrow: undefined,
            loading: true,
            error: undefined,
        });

        const { result } = renderHook(() => useQuery<{ amount: number }>('SELECT 42'));

        expect(result.current.data).toBeUndefined();
        expect(result.current.loading).toBe(true);
    });

    it('returns undefined data when the query errors (e.g. table does not exist)', () => {
        const tableError = new Error('Catalog Error: Table with name fct_cost_centers does not exist!');
        vi.mocked(useDuckDbQuery).mockReturnValue({
            arrow: undefined,
            loading: false,
            error: tableError,
        });

        const { result } = renderHook(() =>
            useQuery<{ cost_center_name: string }>(
                'SELECT distinct cc.cost_center_name FROM main_marts.fct_cost_centers cc'
            )
        );

        expect(result.current.data).toBeUndefined();
        expect(result.current.loading).toBe(false);
        // error is surfaced so callers can react to it
        expect(result.current.error).toBe(tableError);
    });
});
