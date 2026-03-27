import { notFound } from "next/navigation";
import DesignPreviewClient from "@/features/design/DesignPreviewClient";
import { designPages, designVariants } from "@/features/design/designData";

export default async function Page({
  params,
}: {
  params: Promise<{ variant: string; page: string }>;
}) {
  const { variant, page } = await params;
  const isVariant = designVariants.includes(variant as (typeof designVariants)[number]);
  const isPage = designPages.some((item) => item.slug === page);

  if (!isVariant || !isPage) {
    notFound();
  }

  return (
    <DesignPreviewClient
      variant={variant as (typeof designVariants)[number]}
      page={page as (typeof designPages)[number]["slug"]}
    />
  );
}
