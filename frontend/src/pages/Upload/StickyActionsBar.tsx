interface StickyActionsBar {
  disabled?: boolean;
  onSaveDraft: () => void;
  onNext: () => void;
}

const StickyActionsBar = ({ disabled, onSaveDraft, onNext }: StickyActionsBar) => {
  return (
    <div className="sticky bottom-0 inset-x-0 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Tip: You can collapse completed sections to stay focused.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
            onClick={onSaveDraft}
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={disabled}
            className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
            onClick={onNext}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyActionsBar;
