export default function Products() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-400">Admin</div>
        <h1 className="text-2xl font-semibold text-white">Products</h1>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Catalog</div>
            <div className="text-sm text-slate-400">Manage products here.</div>
          </div>
          <button className="btn btn-primary" disabled>
            Add product
          </button>
        </div>
        <div className="card-body">
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/0 px-6 py-10 text-center">
            <div className="text-sm font-medium text-slate-200">No products yet</div>
            <div className="mt-1 text-sm text-slate-400">
              Connect your product API to list items here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
