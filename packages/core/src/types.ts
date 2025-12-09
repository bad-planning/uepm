// Type definitions for UEPM

export interface UProjectFile {
  EngineAssociation: string;
  Category?: string;
  Description?: string;
  Modules?: Module[];
  Plugins?: PluginReference[];
  AdditionalPluginDirectories?: string[];
  TargetPlatforms?: string[];
  [key: string]: unknown; // Allow additional fields
}

export interface Module {
  Name: string;
  Type: string;
  LoadingPhase: string;
  AdditionalDependencies?: string[];
}

export interface PluginReference {
  Name: string;
  Enabled: boolean;
  MarketplaceURL?: string;
  SupportedTargetPlatforms?: string[];
}

export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  private?: boolean;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  unreal?: {
    engineVersion?: string;
    pluginName?: string;
  };
  [key: string]: unknown; // Allow additional fields
}
