// bot/project-status-service.js
// Service for interacting with GitHub Projects via GraphQL API

/**
 * GitHub GraphQL API client for Project status management
 */
class ProjectStatusService {
  /**
   * Create a new ProjectStatusService
   * @param {Object} options - Service options
   * @param {string} options.token - GitHub API token
   * @param {string} [options.apiUrl] - GitHub GraphQL API URL
   */
  constructor({ token, apiUrl = "https://api.github.com/graphql" }) {
    this.token = token;
    this.apiUrl = apiUrl;
  }

  /**
   * Execute a GraphQL query
   * @param {string} query - The GraphQL query
   * @param {Object} [variables] - Query variables
   * @returns {Promise<Object>} - Query result
   */
  async graphql(query, variables = {}) {
    if (!query || typeof query !== "string") {
      throw new Error("GraphQL query must be a non-empty string");
    }

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  /**
   * Get project by ID
   * @param {string} projectId - The project node ID
   * @returns {Promise<Object>} - Project data
   */
  async getProject(projectId) {
    const query = `
      query GetProject($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            id
            title
            number
            fields(first: 20) {
              nodes {
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

    return this.graphql(query, { projectId });
  }

  /**
   * Get the Status field and its options from a project
   * @param {string} projectId - The project node ID
   * @returns {Promise<Object|null>} - Status field data or null
   */
  async getStatusField(projectId) {
    const data = await this.getProject(projectId);
    const project = data?.node;

    if (!project?.fields?.nodes) {
      return null;
    }

    const statusField = project.fields.nodes.find(
      (field) => field.name === "Status"
    );

    return statusField || null;
  }

  /**
   * Get project item by issue/PR node ID
   * @param {string} projectId - The project node ID
   * @param {string} contentId - The issue or PR node ID
   * @returns {Promise<Object|null>} - Project item data or null
   */
  async getProjectItem(projectId, contentId) {
    const query = `
      query GetProjectItem($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: 100) {
              nodes {
                id
                content {
                  ... on Issue {
                    id
                    number
                    title
                  }
                  ... on PullRequest {
                    id
                    number
                    title
                  }
                }
                fieldValues(first: 10) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.graphql(query, { projectId });
    const items = data?.node?.items?.nodes || [];

    return items.find((item) => item.content?.id === contentId) || null;
  }

  /**
   * Update project item status
   * @param {Object} options - Update options
   * @param {string} options.projectId - The project node ID
   * @param {string} options.itemId - The project item ID
   * @param {string} options.fieldId - The status field ID
   * @param {string} options.optionId - The status option ID
   * @returns {Promise<Object>} - Update result
   */
  async updateItemStatus({ projectId, itemId, fieldId, optionId }) {
    const mutation = `
      mutation UpdateProjectItemField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
        updateProjectV2ItemFieldValue(input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: $value
        }) {
          projectV2Item {
            id
          }
        }
      }
    `;

    return this.graphql(mutation, {
      projectId,
      itemId,
      fieldId,
      value: { singleSelectOptionId: optionId }
    });
  }

  /**
   * Set status for an issue/PR by finding and updating its project card
   * @param {Object} options - Options
   * @param {string} options.projectId - The project node ID
   * @param {string} options.contentId - The issue or PR node ID
   * @param {string} options.statusName - The status name to set
   * @returns {Promise<Object>} - Result
   */
  async setStatus({ projectId, contentId, statusName }) {
    // Get status field and options
    const statusField = await this.getStatusField(projectId);
    if (!statusField) {
      return { success: false, error: "Status field not found" };
    }

    // Find the option ID for the requested status
    const option = statusField.options.find(
      (opt) => opt.name.toLowerCase() === statusName.toLowerCase()
    );
    if (!option) {
      return {
        success: false,
        error: `Status option "${statusName}" not found`
      };
    }

    // Get the project item for this content
    const item = await this.getProjectItem(projectId, contentId);
    if (!item) {
      return { success: false, error: "Project item not found" };
    }

    // Update the status
    await this.updateItemStatus({
      projectId,
      itemId: item.id,
      fieldId: statusField.id,
      optionId: option.id
    });

    return {
      success: true,
      itemId: item.id,
      newStatus: statusName
    };
  }
}

/**
 * Create a ProjectStatusService from environment variables
 * @returns {ProjectStatusService} - Service instance
 * @throws {Error} - If GITHUB_TOKEN environment variable is not set
 */
function createFromEnv() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN environment variable is required for ProjectStatusService"
    );
  }
  return new ProjectStatusService({ token });
}

module.exports = {
  ProjectStatusService,
  createFromEnv
};
