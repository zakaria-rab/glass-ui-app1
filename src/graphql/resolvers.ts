import {
  addPatient,
  changePatient,
  findPatient,
  listPatients,
  removePatient,
} from "./patients";

/**
 * Resolvers read only from ./patients, which reads only from ./mocks. That
 * folder is the single swap point for the real backend: when one exists, the
 * store changes and nothing above the GraphQL boundary does.
 */
export const resolvers = {
  Query: {
    patients: () => listPatients(),
    patient: (_: unknown, { id }: { id: string }) => findPatient(id),
  },
  Mutation: {
    addPatient: (_: unknown, { input }: { input: Record<string, unknown> }) => addPatient(input),
    changePatient: (
      _: unknown,
      { id, changes }: { id: string; changes: Record<string, unknown> },
    ) => changePatient(id, changes),
    removePatient: (_: unknown, { id }: { id: string }) => removePatient(id),
  },
};
