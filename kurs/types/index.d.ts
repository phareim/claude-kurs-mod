/** Where the participant is: `del` 0 is the overview of all parts, `avsnitt` -1 the part's own list. */
export type Sted = { del: number; avsnitt: number }

declare module 'claude-code' {
  interface PluginState {
    kurs: { ferdig: string[]; sted: Sted }
  }
}
