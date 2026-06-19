// src/components/TermsModal.tsx

interface TermsModalProps {
  onAgree: () => void;
  onClose: () => void;
}

export function TermsModal({ onAgree, onClose }: TermsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white text-slate-900 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Before you continue</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-8">
          By using our services you agree to our terms of service and privacy
          policy (including that you are 18 years of age or older).
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onAgree}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700 transition"
          >
            I agree
          </button>
        </div>
      </div>
    </div>
  );
}
