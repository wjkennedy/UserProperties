import React, { useEffect, useState } from "react";
import DynamicTable from "@atlaskit/dynamic-table";
import Avatar from "@atlaskit/avatar";
import styled from "styled-components";

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 10px;
`;

const createKey = (input) => (input ? input.toLowerCase().replace(/ /g, "-") : "unknown");

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState(null);

  // ✅ Get Jira project ID using Atlassian Forge's context API
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const res = await fetch("/rest/api/3/serverInfo");
        const data = await res.json();
        if (data.baseUrl) {
          setProjectId(data.baseUrl.split("/").pop()); // Extract project ID
        }
      } catch (error) {
        console.error("Error fetching project context:", error);
      }
    };

    fetchContext();
  }, []);

  // ✅ Fetch user data from API route
  const fetchData = async () => {
    if (!projectId) return;
    setLoading(true);

    try {
      const res = await fetch(`/get-audit-data?projectId=${projectId}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  // ✅ Define Table Columns
  const head = {
    cells: [
      { key: "name", content: "User Name", isSortable: true },
      { key: "email", content: "Email", isSortable: true },
      { key: "groups", content: "Groups" },
      { key: "sapId", content: "SAP ID" },
      { key: "altId", content: "Alt ID" },
    ],
  };

  // ✅ Convert User Data into Table Rows
  const rows = users.map((user, index) => ({
    key: `row-${index}-${user.userId}`,
    cells: [
      {
        key: createKey(user.userName),
        content: (
          <NameWrapper>
            <AvatarWrapper>
              <Avatar name={user.userName} size="medium" />
            </AvatarWrapper>
            {user.userName}
          </NameWrapper>
        ),
      },
      { key: createKey(user.email), content: user.email || "N/A" },
      { key: createKey(user.groups), content: user.groups || "No Groups" },
      { key: createKey(user.sapId), content: user.sapId || "Not Set" },
      { key: createKey(user.altId), content: user.altId || "Not Set" },
    ],
  }));

  return (
    <div>
      <h3>Project User Audit Data</h3>
      <button onClick={fetchData} disabled={loading || !projectId}>
        {loading ? "Refreshing..." : "Refresh User Data"}
      </button>

      {projectId ? (
        <DynamicTable
          head={head}
          rows={rows}
          rowsPerPage={10}
          defaultPage={1}
          loadingSpinnerSize="large"
          isFixedSize
          isLoading={loading}
        />
      ) : (
        <p>Loading project data...</p>
      )}
    </div>
  );
}

export default App;

