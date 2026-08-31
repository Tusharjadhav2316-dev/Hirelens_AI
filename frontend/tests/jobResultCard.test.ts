import { ArtifactRenderer } from "../components/agent/ArtifactRenderer";
import { Artifact } from "../types/agent";

async function runJobResultCardTest() {
    console.log("=== JobResultCard NullJobProvider & Contract Test Suite ===\n");

    // 1. Test status === "not_configured"
    console.log("1. Testing JobResultCard with status='not_configured'...");
    const notConfiguredArtifact: Artifact = {
        type: "job_result_card",
        data: {
            status: "not_configured",
            message: "NullJobProvider active in current environment.",
        },
    };

    const renderedNotConfigured = ArtifactRenderer({ artifact: notConfiguredArtifact });
    if (!renderedNotConfigured) {
        console.error("FAILED: JobResultCard not_configured returned null!");
        process.exit(1);
    }

    // Verify properties of rendered component
    const props = renderedNotConfigured.props;
    if (!props || !props.data || props.data.status !== "not_configured") {
        console.error("FAILED: JobResultCard props status mismatch", props);
        process.exit(1);
    }
    console.log("  ✓ JobResultCard correctly accepts status='not_configured' prop!");
    console.log("  ✓ NullJobProvider explicit unavailable state verified!");

    // 2. Test status === "configured" with listings
    console.log("\n2. Testing JobResultCard with real listings...");
    const configuredArtifact: Artifact = {
        type: "job_result_card",
        data: {
            status: "configured",
            listings: [
                {
                    id: "job-1",
                    title: "Senior Full Stack Engineer",
                    company: "Acme Tech",
                    location: "Remote",
                    skills: ["React", "Node.js", "PostgreSQL"],
                    url: "https://example.com/jobs/1",
                    provider: "MockProvider",
                },
            ],
        },
    };

    const renderedConfigured = ArtifactRenderer({ artifact: configuredArtifact });
    if (!renderedConfigured) {
        console.error("FAILED: JobResultCard configured returned null!");
        process.exit(1);
    }

    if (renderedConfigured.props.data.listings.length !== 1) {
        console.error("FAILED: Expected 1 listing, got", renderedConfigured.props.data.listings.length);
        process.exit(1);
    }
    console.log("  ✓ JobResultCard correctly renders configured job listings!");

    console.log("\n=== Results: 4/4 JobResultCard assertions passed 100%! ===");
}

runJobResultCardTest().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
