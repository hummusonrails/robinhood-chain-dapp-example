import Image, { type StaticImageData } from "next/image";
import architecture from "@/generated/diagram-architecture.png";
import deploy from "@/generated/diagram-deploy.png";
import gas from "@/generated/diagram-gas.png";

const DIAGRAMS: Record<string, StaticImageData> = {
  architecture,
  deploy,
  gas,
};

type Props = {
  name: keyof typeof DIAGRAMS;
  caption: string;
};

// hand drawn diagrams rendered by scripts/generate-diagrams.sh
// mermaid handDrawn look rasterized at 2x with excalifont baked in
export function Sketch({ name, caption }: Props) {
  return (
    <figure className="overflow-hidden rounded-xl border border-rh-border bg-white">
      <div className="flex justify-center p-5">
        <Image
          src={DIAGRAMS[name]}
          alt={caption}
          className="h-auto w-full max-w-2xl"
        />
      </div>
      <figcaption className="border-t border-rh-border bg-rh-surface px-4 py-2.5 text-xs text-rh-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
