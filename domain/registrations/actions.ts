"use server";

import { submitRegistration, type SubmitRegistrationInput } from "./service";
import type { Registration } from "./types";

/** Server Function: called directly from the registration wizard (a Client
 * Component) so the mutation happens on the server, where the in-memory
 * registrations list actually lives — see data/repositories/registrations.repository.ts. */
export async function submitRegistrationAction(input: SubmitRegistrationInput): Promise<Registration> {
  return submitRegistration(input);
}
