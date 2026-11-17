import type { OgInput } from './og';

type ProjectLike = { title: string; summary: string; proof: { value: string; label: string } };

// What a project's preview image shows; liveProof replaces the static number when known.
export function ogProps(data: ProjectLike, liveProof?: string): OgInput {
  return {
    title: data.title,
    subtitle: data.summary,
    proof: `${liveProof ?? data.proof.value} ${data.proof.label}`,
  };
}
