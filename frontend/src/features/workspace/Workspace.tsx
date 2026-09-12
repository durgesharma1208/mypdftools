import type { Tool } from '../../types';
import { InspectorWorkspace } from './InspectorWorkspace';
import { MetadataWorkspace } from './MetadataWorkspace';
import { ToolWorkspace } from './ToolWorkspace';

/** Chooses the right workspace layout for a tool. */
export function Workspace({ tool }: { tool: Tool }) {
  if (tool.workspace === 'inspector') return <InspectorWorkspace tool={tool} />;
  if (tool.workspace === 'metadata') return <MetadataWorkspace tool={tool} />;
  return <ToolWorkspace tool={tool} />;
}
