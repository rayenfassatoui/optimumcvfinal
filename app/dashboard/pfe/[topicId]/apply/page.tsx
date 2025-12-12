import { ApplicationWizard } from "@/features/pfe/components/application-wizard";

interface ApplyPageProps {
    params: Promise<{ topicId: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
    const { topicId } = await params;
    return <ApplicationWizard topicId={topicId} />;
}
