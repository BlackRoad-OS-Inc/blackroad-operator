// bot/handlers/project-graphql-updater.js

/**
 * Updates a GitHub Project V2 item field value via GraphQL.
 * Used to change status of project cards when emoji reactions are received.
 * Updates a GitHub Project V2 field value via GraphQL.
 * Used to change the status of linked project cards when reactions are triggered.
 */
async function updateProjectField({
  issueNodeId,
  projectId,
  fieldId,
  valueId,
}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  const mutation = `
    mutation UpdateProjectField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $valueId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId,
        itemId: $itemId,
        fieldId: $fieldId,
        value: { singleSelectOptionId: $valueId }
      }) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  const mutation = `
    mutation UpdateProjectV2ItemFieldValue($input: UpdateProjectV2ItemFieldValueInput!) {
      updateProjectV2ItemFieldValue(input: $input) {
        projectV2Item {
          id
        }
      }
    }
  `;

  const variables = {
    projectId,
    itemId: issueNodeId,
    fieldId,
    valueId,
    input: {
      projectId,
      itemId: issueNodeId,
      fieldId,
      value: { singleSelectOptionId: valueId },
    },
  };

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: mutation, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub GraphQL request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  console.log("✅ Project field updated:", data.data.updateProjectV2ItemFieldValue.projectV2Item.id);
  return data.data.updateProjectV2ItemFieldValue.projectV2Item;
}

/**
 * Fetches the Node ID of an issue by its number.
 */
async function getIssueNodeId(owner, repo, issueNumber) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  const query = `
    query GetIssueNodeId($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $number) {
          id
        }
      }
    }
  `;

  const variables = { owner, repo, number: issueNumber };

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub GraphQL request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data.repository.issue.id;
}

/**
 * Fetches project fields and their options.
 * Supports both user and organization projects.
 * @param {string} owner - The user or organization login
 * @param {number} projectNumber - The project number
 * @param {boolean} isOrg - Whether the owner is an organization (default: false)
 */
async function getProjectFields(owner, projectNumber, isOrg = false) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  const ownerType = isOrg ? "organization" : "user";
  const query = `
    query GetProjectFields($owner: String!, $projectNumber: Int!) {
      ${ownerType}(login: $owner) {
    const error = await response.text();
    throw new Error(`GraphQL request failed: ${response.status} - ${error}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  console.log("✅ Project field updated:", result.data);
  return result.data;
}

/**
 * Fetches the Node ID for an issue, project details, and field options.
 * Useful for obtaining the required IDs before calling updateProjectField.
 */
async function fetchProjectMetadata({ owner, repo, issueNumber, projectNumber }) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  const query = `
    query FetchProjectMetadata($owner: String!, $repo: String!, $issueNumber: Int!, $projectNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $issueNumber) {
          id
        }
      }
      user(login: $owner) {
        projectV2(number: $projectNumber) {
          id
          fields(first: 20) {
            nodes {
              ... on ProjectV2Field {
              ... on ProjectV2FieldCommon {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = { owner, projectNumber };
  const variables = { owner, repo, issueNumber, projectNumber };

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub GraphQL request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data[ownerType].projectV2;
    const error = await response.text();
    throw new Error(`GraphQL request failed: ${response.status} - ${error}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

module.exports = {
  updateProjectField,
  getIssueNodeId,
  getProjectFields,
  fetchProjectMetadata,
};
