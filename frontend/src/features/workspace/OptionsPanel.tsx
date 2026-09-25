import type { Tool } from '../../types';
import { Field } from '../../components/ui/Field';
import { LogoPicker } from '../../components/ui/LogoPicker';
import type { ParamValue } from '../../lib/validation';
import type { WorkspaceController } from './useWorkspace';

interface OptionsPanelProps {
  tool: Tool;
  workspace: WorkspaceController;
}

/** Tool-specific controls, rendered from the catalog's parameter definitions. */
export function OptionsPanel({ tool, workspace }: OptionsPanelProps) {
  const logoParam = tool.params?.find((param) => param.type === 'logo');
  const hasOptions = workspace.visibleParams.length > 0 || Boolean(logoParam);
  if (!hasOptions) return null;

  return (
    <section className="panel" aria-labelledby="tool-options">
      <header className="border-b border-line px-4 py-3">
        <h2 id="tool-options" className="text-sm font-semibold text-ink">
          Options
        </h2>
        <p className="mt-0.5 text-xs text-ink-subtle">Sensible defaults are already selected.</p>
      </header>
      <div className="space-y-5 p-4">
        {workspace.visibleParams.map((param) => (
          <Field
            key={param.name}
            param={param}
            value={workspace.params[param.name] ?? ''}
            disabled={workspace.busy}
            onChange={(value: ParamValue) => workspace.setParam(param.name, value)}
          />
        ))}
        {logoParam && (
          <LogoPicker
            param={logoParam}
            value={workspace.logo}
            disabled={workspace.busy}
            onChange={workspace.setLogo}
          />
        )}
      </div>
    </section>
  );
}
