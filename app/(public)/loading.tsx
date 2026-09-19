// Same purpose as app/dashboard/loading.tsx — Header/Footer (part of the
// layout, not this fallback) stay put; only the page content area shows this
// briefly while the page's own data fetch resolves. Public pages vary too
// much in layout (dark hero banners, plain content, etc.) to mimic exactly,
// so this is a neutral centered spinner rather than a page-shaped skeleton.
export default function PublicLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  );
}
