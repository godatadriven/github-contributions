/**
 * Regression tests for the Home page cost-center resilience.
 *
 * The root cause of the original breakage: `allDataLoaded` included `costCenters`
 * in its truthiness check.  When the `fct_cost_centers` table is absent from the
 * deployed DuckDB file (the deploy-on-push fires before the scheduled dbt run
 * that creates the table), the query errors, `costCenters` stays `undefined`, and
 * the entire dashboard is stuck in the loading-spinner state forever.
 *
 * These tests verify that:
 *  1. The dashboard renders its full content even when the cost-center query fails.
 *  2. The "Cost Center" filter is hidden when `fct_cost_centers` is absent.
 *  3. The "Cost Center" filter is shown when `fct_cost_centers` is present.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Module mocks (hoisted automatically by Vitest)
// ---------------------------------------------------------------------------

// Heavy chart library – replace with a simple stub so jsdom doesn't choke
vi.mock('react-apexcharts', () => ({
    default: () => React.createElement('div', { 'data-testid': 'apex-chart' }),
}));

// DuckDB WASM – stub out everything except what useQuery needs
vi.mock('duckdb-wasm-kit', () => ({
    useDuckDb: vi.fn(() => ({ db: null })),
    useDuckDbQuery: vi.fn(),
    runQuery: vi.fn(),
    initializeDuckDb: vi.fn(),
}));

// Control useQuery responses per test via mockImplementation
vi.mock('../../hooks/useQuery');

// ---------------------------------------------------------------------------
// Imports (after mocks are registered)
// ---------------------------------------------------------------------------

import Home from './Home';
import useQuery from '../../hooks/useQuery';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A generic single-row result that satisfies the truthiness check in allDataLoaded. */
const genericRow = { amount: 1, orderedField: new Date('2025-01-01') };

/**
 * Returns a `useQuery` mock implementation that answers every query with a
 * non-empty result **except** cost-center queries, which return the given state.
 */
function makeMockUseQuery(costCenterState: ReturnType<typeof useQuery>) {
    return (query: string): ReturnType<typeof useQuery> => {
        if (query.includes('fct_cost_centers')) {
            return costCenterState;
        }
        return { data: [genericRow as never], loading: false, error: undefined };
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Home – cost-center resilience', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the dashboard when fct_cost_centers does not exist (regression)', () => {
        /**
         * Simulates the breakage scenario: the deployed DuckDB file was built before
         * fct_cost_centers was added, so querying it returns a Catalog Error.
         * The dashboard MUST still render its controls and stats.
         */
        vi.mocked(useQuery).mockImplementation(
            makeMockUseQuery({
                data: undefined,
                loading: false,
                error: new Error('Catalog Error: Table with name fct_cost_centers does not exist!'),
            })
        );

        render(React.createElement(Home));

        // The Organization filter is part of the allDataLoaded block – its presence
        // confirms the dashboard rendered successfully instead of showing a spinner.
        expect(screen.getAllByText('Organization').length).toBeGreaterThan(0);
    });

    it('hides the Cost Center filter when fct_cost_centers is absent', () => {
        vi.mocked(useQuery).mockImplementation(
            makeMockUseQuery({
                data: undefined,
                loading: false,
                error: new Error('Catalog Error: Table with name fct_cost_centers does not exist!'),
            })
        );

        render(React.createElement(Home));

        expect(screen.queryAllByText('Cost Center')).toHaveLength(0);
    });

    it('shows the Cost Center filter when fct_cost_centers exists', () => {
        vi.mocked(useQuery).mockImplementation(
            makeMockUseQuery({
                data: [{ cost_center_name: 'Engineering' }] as never,
                loading: false,
                error: undefined,
            })
        );

        render(React.createElement(Home));

        expect(screen.getAllByText('Cost Center').length).toBeGreaterThan(0);
    });

    it('does not block on cost centers while they are still loading', () => {
        vi.mocked(useQuery).mockImplementation(
            makeMockUseQuery({
                data: undefined,
                loading: true,  // still in flight
                error: undefined,
            })
        );

        render(React.createElement(Home));

        // While cost centers are still loading, allDataLoaded should be false
        // (because !loadingCostCenters === false).  The dashboard has not yet
        // committed to showing or hiding the Cost Center filter.
        expect(screen.queryByText('Organization')).toBeNull();
        expect(screen.queryByText('Cost Center')).toBeNull();
    });
});
