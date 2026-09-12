import { ArrowRight } from 'lucide-react';
import type { Tool } from '../../types';
import { Button } from '../../components/ui/Button';
import { pluralize } from '../../lib/utils';
import type { WorkspaceController } from './useWorkspace';

interface ActionPanelProps {
  tool: Tool;
  workspace: WorkspaceController;
  blocked: boolean;
  blockedReason?: string;
}

function statusLine(tool: Tool, workspace: WorkspaceController): string {
  if (workspace.files.length === 0) return `Add ${tool.inputLabel.toLowerCase()} to continue.`;
  if (tool.preview === 'select' && workspace.pageCount !== null && workspace.selection.length === 0) {
    return tool.slug === 'rotate'
      ? 'No pages selected — the whole document will be rotated.'
      : 'Select pages in the preview to continue.';
  }
  if (tool.preview === 'order' && workspace.selection.length > 0) {
    return `Order set for ${pluralize(workspace.selection.length, 'page')}.`;
  }
  if (tool.multiple) return `${pluralize(workspace.files.length, 'file')} ready.`;
  return 'Ready when you are.';
}

/** Primary action and contextual status, pinned to the top of the side rail. */
export function ActionPanel({ tool, workspace, blocked, blockedReason }: ActionPanelProps) {
  return (
    <div className="panel p-4">
      <Button
        variant="primary"
        size="lg"
        full
        disabled={!workspace.canSubmit || blocked}
        loading={workspace.busy}
        onClick={() => void workspace.submit()}
        icon={workspace.busy ? undefined : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      >
        {blocked ? 'Unavailable' : tool.action}
      </Button>

      <p className="mt-2.5 text-center text-xs leading-relaxed text-ink-subtle" aria-live="polite">
        {blocked ? blockedReason : statusLine(tool, workspace)}
      </p>

      {workspace.files.length > 0 && !workspace.busy && workspace.phase !== 'done' && (
        <div className="mt-3 border-t border-line pt-3">
          <Button variant="ghost" size="sm" full onClick={workspace.reset}>
            Clear and start over
          </Button>
        </div>
      )}
    </div>
  );
}
