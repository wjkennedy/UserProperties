import { route } from "@forge/api";
import api from "@forge/api";

// ✅ Define API Route for Getting Project Audit Data
export const getProjectAuditData = route.get("/get-audit-data", async (req) => {
  const projectId = req.query.projectId;

  if (!projectId) {
    return new Response(JSON.stringify({ error: "Project ID is missing" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await api.asApp().requestJira(
    `/rest/api/3/project/${projectId}/properties/internal-audit`,
    { method: "GET" }
  );

  if (!response.ok) {
    console.error("Failed to fetch project audit data", response.status);
    return new Response(JSON.stringify({ error: "Failed to fetch project audit data" }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data.value || { users: [] }), {
    headers: { "Content-Type": "application/json" },
  });
});

// ✅ Export API Route
export const run = getProjectAuditData;

