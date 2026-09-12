import { useCallback, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Tool } from '../../types';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Dropzone } from '../../components/ui/Dropzone';
import { FileList } from '../../components/ui/FileList';
import { ResultCard } from '../../components/ui/ResultCard';
import { PageGrid } from '../../components/pdf/PageGrid';
import { useServerStatus } from '../../hooks/useServerStatus';
import { acceptedSummary } from '../../lib/validation';
import { ActionPanel } from './ActionPanel';
import { OptionsPanel } from './OptionsPanel';
import { ProcessingPanel } from './ProcessingPanel';
import { ToolFacts } from './ToolFacts';
import { useWorkspace } from './useWorkspace';

export function ToolWorkspace({ tool }: { tool: Tool }) {
  const { capabilities } = useServerStatus();
  const limits = capabilities.limits;
  const [showPreview, setShowPreview] = useState(true);
  const workspace = useWorkspace({ tool, limits });

  const blocked = tool.requires === 'office' && capabilities.office === false;
  const blockedReason = blocked
    ? 'This server does not have LibreOffice installed, so Office conversions are unavailable.'
    : undefined;

  const primary = workspace.files[0]?.file;
  const usesPreview = tool.preview !== 'none' && primary !== undefined;

  const handlePageCount = useCallback(
    (count: number) => {
      workspace.setPageCount(count);
    },
    [workspace],
  );

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-5">
          {workspace.files.length === 0 ? (
            <>
              <Dropzone
                accept={tool.accept}
                multiple={tool.multiple}
                label={`Choose ${tool.inputLabel.toLowerCase()}`}
                hint={acceptedSummary(tool, limits)}
                disabled={workspace.busy || blocked}
                onFiles={workspace.addFiles}
              />
              {tool.preview !== 'none' && (
                <p className="text-xs text-ink-subtle">
                  {tool.preview === 'order'
                    ? 'Page thumbnails load after you add a file, so you can reorder them.'
                    : tool.preview === 'select'
                      ? 'Page thumbnails load after you add a file, so you can pick pages visually.'
                      : 'Page thumbnails load after you add a file for a quick check.'}
                </p>
              )}
            </>
          ) : (
            <>
              <FileList
                items={workspace.files}
                title={workspace.files.length === 1 ? 'Selected file' : 'Files in order'}
                description={workspace.maxFiles > 1 ? 'Processed from top to bottom.' : undefined}
                onRemove={workspace.removeFile}
                onClearAll={workspace.clearFiles}
                onReorder={tool.multiple ? workspace.reorderFile : undefined}
              />

              {tool.multiple && (
                <Dropzone
                  accept={tool.accept}
                  multiple
                  compact
                  label="Add more files"
                  hint={acceptedSummary(tool, limits)}
                  disabled={workspace.busy || blocked}
                  onFiles={workspace.addFiles}
                />
              )}

              {usesPreview && (
                <>
                  {tool.preview === 'view' && showPreview && (
                    <PageGrid
                      file={primary}
                      mode="view"
                      selection={[]}
                      onChange={() => undefined}
                      onPageCount={handlePageCount}
                      hint={visualHintFor(tool)}
                    />
                  )}
                  {(tool.preview === 'select' || tool.preview === 'order') && (
                    <PageGrid
                      file={primary}
                      mode={tool.preview === 'order' ? 'order' : 'select'}
                      selection={workspace.selection}
                      onChange={workspace.setSelection}
                      onPageCount={handlePageCount}
                      accent={tool.slug === 'delete-pages' ? 'delete' : 'keep'}
                      rotatePreview={tool.slug === 'rotate' ? Number(workspace.params.angle ?? 0) : 0}
                      hint={visualHintFor(tool)}
                    />
                  )}
                  {tool.preview === 'view' && (
                    <div className="flex justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setShowPreview((current) => !current)}>
                        {showPreview ? 'Hide page preview' : 'Show page preview'}
                      </Button>
                    </div>
                  )}
                </>
              )}

              <OptionsPanel tool={tool} workspace={workspace} />
            </>
          )}

          {/* Errors are shown whether or not a file made it into the list, so a
              rejected upload is never silent. */}
          {workspace.phase === 'error' && workspace.error && (
            <Alert
              tone="error"
              title="That did not work"
              action={
                workspace.files.length > 0 ? (
                  <Button size="sm" variant="secondary" onClick={() => void workspace.submit()}>
                    Try again
                  </Button>
                ) : undefined
              }
            >
              {workspace.error}
            </Alert>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          {workspace.phase === 'done' && workspace.result ? (
            <ResultCard
              result={workspace.result}
              originalSize={tool.slug === 'compress' ? workspace.originalSize : undefined}
              onDownload={workspace.download}
              onReset={workspace.reset}
            />
          ) : workspace.busy ? (
            <ProcessingPanel phase={workspace.phase} progress={workspace.progress} onCancel={workspace.cancel} />
          ) : (
            <ActionPanel tool={tool} workspace={workspace} blocked={blocked} blockedReason={blockedReason} />
          )}

          <ToolFacts tool={tool} limits={limits} dependencyAvailable={capabilities.office} />
        </aside>
      </div>

      {/* Mobile keeps the primary action within thumb reach. */}
      {workspace.files.length > 0 && !workspace.busy && workspace.phase !== 'done' && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-ink-subtle">
                {workspace.files.length === 1 ? workspace.files[0]?.file.name : `${workspace.files.length} files ready`}
              </p>
              <p className="text-xs font-medium text-ink">{tool.action}</p>
            </div>
            <Button
              variant="primary"
              disabled={!workspace.canSubmit || blocked}
              onClick={() => void workspace.submit()}
              icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              Run
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function visualHintFor(tool: Tool): string | undefined {
  switch (tool.slug) {
    case 'extract':
      return 'Tap pages to keep them. Selected pages are highlighted.';
    case 'delete-pages':
      return 'Tap pages to mark them for removal.';
    case 'rotate':
      return 'Selected pages preview the rotation. Leave empty to rotate everything.';
    case 'organise':
      return 'Drag pages to reorder, or use the arrows under each page.';
    case 'split':
      return 'Check the page numbers you need before choosing a mode.';
    default:
      return undefined;
  }
}
