import type { Tool } from '../../types';
import { InspectorWorkspace } from './InspectorWorkspace';
import { MetadataWorkspace } from './MetadataWorkspace';
import { ToolWorkspace } from './ToolWorkspace';
import { OcrWorkspace } from './OcrWorkspace';
import { SummaryWorkspace } from './SummaryWorkspace';
import { AskPdfWorkspace } from './AskPdfWorkspace';

/** Chooses the right workspace layout for a tool. */
export function Workspace({ tool }: { tool: Tool }) {
  if (tool.workspace === 'inspector') return <InspectorWorkspace tool={tool} />;
  if (tool.workspace === 'metadata') return <MetadataWorkspace tool={tool} />;
  if (tool.workspace === 'ocr') return <OcrWorkspace tool={tool} />;
  if (tool.workspace === 'summary') return <SummaryWorkspace tool={tool} />;
  if (tool.workspace === 'ask') return <AskPdfWorkspace tool={tool} />;
  return <ToolWorkspace tool={tool} />;
}
