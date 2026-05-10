import prompts from 'prompts';
import type { PluginMetadata } from '@uepm/core';

export interface PluginPromptDefaults {
  packageName: string;
  version: string;
  description: string;
  author: string;
  license: string;
  engineVersion: string;
}

function toNpmScope(createdBy: string): string {
  const cleaned = createdBy
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned ? `@${cleaned}` : '';
}

function toKebabCase(name: string): string {
  return name
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

export function derivePluginDefaults(
  metadata: PluginMetadata,
  pluginName: string
): PluginPromptDefaults {
  const scope = metadata.author ? toNpmScope(metadata.author) : '';
  const kebabName = toKebabCase(pluginName);
  const packageName = scope ? `${scope}/${kebabName}` : kebabName;

  return {
    packageName,
    version: metadata.version || '1.0.0',
    description: metadata.description ?? metadata.friendlyName ?? '',
    author: metadata.author ?? '',
    license: 'MIT',
    engineVersion: metadata.engineVersion ?? '^5.0.0',
  };
}

export async function promptPluginOptions(
  defaults: PluginPromptDefaults
): Promise<PluginPromptDefaults> {
  const response = await prompts(
    [
      { type: 'text', name: 'packageName',  message: 'package name',               initial: defaults.packageName },
      { type: 'text', name: 'version',       message: 'version',                    initial: defaults.version },
      { type: 'text', name: 'description',   message: 'description',                initial: defaults.description },
      { type: 'text', name: 'author',        message: 'author',                     initial: defaults.author },
      { type: 'text', name: 'license',       message: 'license',                    initial: defaults.license },
      { type: 'text', name: 'engineVersion', message: 'engine version (semver range)', initial: defaults.engineVersion },
    ],
    { onCancel: () => process.exit(1) }
  );

  return response as PluginPromptDefaults;
}
