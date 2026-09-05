import { GraphQLError } from "graphql";

import type { Patient, VisitStatus } from "@/lib/types";

import patientSeed from "./mocks/patients.json" with { type: "json" };

/**
 * Patient state and the operations on it.
 *
 * Held in memory, seeded from mock JSON. The seed file is never written back:
 * Vercel function filesystems are read-only outside `/tmp`, so a store that
 * wrote to `./mocks` would work on a laptop and 500 on every mutation in
 * production — with GET still succeeding, so the app would look healthy. This
 * is the same trade the shell makes for build requests.
 *
 * ponytail: in-memory means the list resets when the server process restarts,
 * and on Vercel each instance holds its own copy. Fine while this is demo data;
 * the first real store replaces this file and nothing above the GraphQL
 * boundary changes.
 */

/**
 * A message meant for the person who caused it.
 *
 * graphql-yoga masks thrown errors as "Unexpected error." by default, which is
 * correct for bugs and wrong for validation: an error must say what failed and
 * how to fix it. A `GraphQLError` is treated as safe to surface, so anything a
 * user can trigger must be thrown this way.
 */
function userError(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}

/**
 * The list, pinned to the global object rather than to module scope.
 *
 * Sharing one `executable-schema.ts` is necessary but not sufficient: Next
 * builds the route handler and the page as separate server module graphs, so a
 * module-scope `const` is evaluated once per graph and the app ends up with two
 * independent stores. Measured, not assumed — a patient added over
 * /api/graphql left the HTTP store at 5 rows while a fresh server render still
 * saw 4, so a browser mutation followed by a reload showed the old list with no
 * error anywhere.
 *
 * A global key is evaluated once per process, which both graphs share. It also
 * survives dev-server hot reloads, which module scope does not.
 *
 * ponytail: one process, one store. Each Vercel instance still holds its own
 * copy, which is the in-memory ceiling above and unchanged by this.
 */
const GLOBAL_KEY = "__glassUiApp1Patients";

type WithStore = typeof globalThis & { [GLOBAL_KEY]?: Patient[] };

const store = globalThis as WithStore;

store[GLOBAL_KEY] ??= (patientSeed as Patient[]).map((seed) => ({ ...seed }));

const patients: Patient[] = store[GLOBAL_KEY];

export function listPatients(): Patient[] {
  return patients;
}

export function findPatient(id: string): Patient | null {
  return patients.find((patient) => patient.id === id) ?? null;
}

/**
 * The schema already guarantees types, required fields and enum membership, so
 * this only checks what SDL cannot express: that strings carry something once
 * trimmed, and that a balance is not negative.
 */
function clean(input: Record<string, unknown>): Partial<Patient> {
  const out: Partial<Patient> = {};

  for (const key of ["name", "phone", "provider", "nextVisit"] as const) {
    const value = input[key];
    if (value === undefined || value === null) continue;
    const trimmed = String(value).trim();
    if (!trimmed) throw userError(`${key} is blank. Type a value for it.`);
    out[key] = trimmed;
  }

  if (input.nextVisit !== undefined && input.nextVisit !== null) {
    const date = String(input.nextVisit).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw userError(`nextVisit is "${date}". Use a date in YYYY-MM-DD form.`);
    /**
     * Round-trip rather than trust the parse: `Date.parse("2026-02-31")` does
     * not fail, it rolls over to 2026-03-03. Comparing the parsed date back
     * against the input is what rejects a day the month does not have.
     */
    const parsed = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date)
      throw userError(`nextVisit is "${date}", which is not a real date. Check the month and day.`);
  }

  if (input.status !== undefined && input.status !== null) out.status = input.status as VisitStatus;

  if (input.balance !== undefined && input.balance !== null) {
    const balance = Number(input.balance);
    if (!Number.isFinite(balance) || balance < 0)
      throw userError(`balance is ${input.balance}. Use 0 or a positive amount.`);
    out.balance = balance;
  }

  return out;
}

export function addPatient(input: Record<string, unknown>): Patient {
  const fields = clean(input);
  const patient: Patient = {
    id: crypto.randomUUID(),
    name: fields.name!,
    phone: fields.phone!,
    provider: fields.provider!,
    nextVisit: fields.nextVisit!,
    status: fields.status ?? "SCHEDULED",
    balance: fields.balance ?? 0,
  };
  patients.push(patient);
  return patient;
}

export function changePatient(id: string, changes: Record<string, unknown>): Patient {
  const fields = clean(changes);
  if (Object.keys(fields).length === 0)
    throw userError("No changes were sent. Include at least one field to change.");

  const patient = findPatient(id);
  if (!patient) throw userError(`No patient has id ${id}. Reload the list and try again.`);

  Object.assign(patient, fields);
  return patient;
}

export function removePatient(id: string): string {
  const at = patients.findIndex((patient) => patient.id === id);
  if (at === -1) throw userError(`No patient has id ${id}. It may already have been removed.`);
  patients.splice(at, 1);
  return id;
}
