export interface InputContract {
    schema_version: 1;
    input_mode: 'supplied-pack' | 'legacy';
    client_slug: string;
    producer: 'chatgpt-export' | 'legacy';
    mockup: {
        path: string;
        sha256: string;
    };
    design_ir: {
        path: string;
        sha256: string;
    };
    files: Array<{
        path: string;
        sha256: string;
        source_path: string;
    }>;
    assets: Array<{
        asset_id: string;
        source_path: string;
        sha256: string | null;
        required: boolean;
        provenance: 'supplied' | 'unresolved';
    }>;
    warnings: string[];
    conflicts: string[];
    created_at: string;
}
export interface InitPackOptions {
    packDir: string;
    slug: string;
    buildDir: string;
    mockup?: string;
    designIr?: string;
    manifest?: string;
    templateDir?: string;
    dryRun?: boolean;
}
export interface InitPackResult {
    contract: InputContract;
    state: import('./state.js').BuildState | null;
    plan: {
        filesToCopy: string[];
        mockup: string;
        designIr: string;
        assetCount: number;
        unresolvedAssets: string[];
    };
}
export declare const SLUG_RE: RegExp;
export declare function initPack(opts: InitPackOptions): InitPackResult;
