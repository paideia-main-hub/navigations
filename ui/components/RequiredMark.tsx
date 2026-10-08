/** Visible cue for a field the user must fill. The control's required
 * attribute is what assistive tech announces; this mark is hidden from it. */
export function RequiredMark() {
  return (
    <span className="text-red-600" aria-hidden="true">
      {" *"}
    </span>
  );
}
