export type SingularisEventName =
  | "singularis_arrival_viewed"
  | "pilot_preparation_viewed"
  | "training_simulation_entered"
  | "training_simulation_interrupted"
  | "training_simulation_resumed"
  | "training_simulation_ended"
  | "training_simulation_completed"
  | "pilot_preparation_returned"
  | "persistent_world_synchronized"
  | "transit_escort_selected";

export interface SingularisInstrumentationEvent {
  name: SingularisEventName;
  occurredAt: string;
}

/** Local boundary only. A production provider may subscribe after separate approval. */
export function recordSingularisEvent(name: SingularisEventName): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<SingularisInstrumentationEvent>("cryptic:singularis", { detail: { name, occurredAt: new Date().toISOString() } }));
}
