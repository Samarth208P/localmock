export interface ChaosConfig {
  /** Global corruption rate (0-30, percentage of rows affected) */
  rate: number;
  /** Which corruption types are enabled */
  types: {
    nullInjection: boolean;
    whitespace: boolean;
    encoding: boolean;
    casing: boolean;
    formatStrip: boolean;
  };
}

export const DEFAULT_CHAOS_CONFIG: ChaosConfig = {
  rate: 0,
  types: {
    nullInjection: true,
    whitespace: true,
    encoding: true,
    casing: true,
    formatStrip: true,
  },
};
