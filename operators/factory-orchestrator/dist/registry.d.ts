export interface RegisteredAsset {
    asset_id: string;
    production_path: string;
    file_path: string;
    format: string;
    variants: {
        original?: string;
    };
    width?: number;
    height?: number;
    source_sha256: string | null;
    provenance: 'supplied' | 'unresolved';
    required: boolean;
    notes?: string;
}
export interface RegisterResult {
    registryPath: string;
    assets: RegisteredAsset[];
    warnings: string[];
}
export declare function registerAssets(buildDir: string): Promise<RegisterResult>;
