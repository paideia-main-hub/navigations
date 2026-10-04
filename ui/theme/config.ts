/** Light/dark theme switch for the whole site.
 *
 * Off (false) while the dark theme still has display problems: every theme
 * toggle (public header, dashboard and admin sidebars) is hidden, and every
 * visitor gets the light theme — even if their device is set to dark mode or
 * they picked dark earlier, since without a toggle they'd have no way back.
 *
 * Set to true to bring the toggles back and restore the previous behaviour
 * (the visitor's saved choice, otherwise their device setting). */
export const THEME_TOGGLE_ENABLED = false;
