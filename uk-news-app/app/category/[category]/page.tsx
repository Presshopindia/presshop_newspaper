import { redirect } from "next/navigation";

interface LegacyCategoryPageProps {
  params: { category: string };
}

export default function LegacyCategoryPage({ params }: LegacyCategoryPageProps) {
  redirect(`/news/category/${params.category}`);
}
