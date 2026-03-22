// bot/graphql-mutation-handler.js
// 🔧 GitHub GraphQL Mutation Handler for updating project cards

/**
 * GraphQL mutation to update project item field value
 */
const UPDATE_PROJECT_ITEM_FIELD = `
  mutation UpdateProjectV2ItemFieldValue(
    $projectId: ID!
    $itemId: ID!
    $fieldId: ID!
    $value: ProjectV2FieldValue!
  ) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: $value
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
`;

/**
 * GraphQL mutation to add item to project
 */
const ADD_ITEM_TO_PROJECT = `
  mutation AddProjectV2ItemById($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
      item {
        id
      }
    }
  }
`;

/**
 * GraphQL query to get project by number
 */
const GET_PROJECT_BY_NUMBER = `
  query GetProjectByNumber($owner: String!, $number: Int!) {
    organization(login: $owner) {
      projectV2(number: $number) {
        id
        title
        fields(first: 50) {
          nodes {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
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

/**
 * GraphQL query to get project by number (user-owned)
 */
const GET_USER_PROJECT_BY_NUMBER = `
  query GetUserProjectByNumber($owner: String!, $number: Int!) {
    user(login: $owner) {
      projectV2(number: $number) {
        id
        title
        fields(first: 50) {
          nodes {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
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

/**
 * GraphQL query to get issue details including project items
 */
const GET_ISSUE_WITH_PROJECT_ITEMS = `
  query GetIssueWithProjectItems($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        id
        title
        state
        projectItems(first: 20) {
          nodes {
            id
            project {
              id
              number
              title
            }
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  field {
                    ... on ProjectV2SingleSelectField {
                      id
                      name
                    }
                  }
                  optionId
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL query to list reactions on an issue
 */
const GET_ISSUE_REACTIONS = `
  query GetIssueReactions($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        id
        reactions(first: 100) {
          nodes {
            content
            user {
              login
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL mutation to add a comment to an issue
 */
const ADD_ISSUE_COMMENT = `
  mutation AddIssueComment($subjectId: ID!, $body: String!) {
    addComment(input: { subjectId: $subjectId, body: $body }) {
      commentEdge {
        node {
          id
          body
          createdAt
        }
      }
    }
  }
`;

/**
 * Create a GraphQL mutation handler
 * @param {Object} octokit - GitHub Octokit instance with graphql
 * @returns {Object} - Handler methods
 */
function createGraphQLMutationHandler(octokit) {
  /**
   * Get project details by number
   * @param {string} owner - Organization or user login
   * @param {number} projectNumber - Project number
   * @param {boolean} isOrg - Whether owner is an organization
   * @returns {Promise<Object>} - Project details
   */
  async function getProject(owner, projectNumber, isOrg = true) {
    const query = isOrg ? GET_PROJECT_BY_NUMBER : GET_USER_PROJECT_BY_NUMBER;
    const result = await octokit.graphql(query, {
      owner,
      number: projectNumber,
    });

    const project = isOrg
      ? result.organization?.projectV2
      : result.user?.projectV2;

    if (!project) {
      throw new Error(`Project #${projectNumber} not found for ${owner}`);
    }

    return project;
  }

  /**
   * Find a status field option by name
   * @param {Object} project - Project object
   * @param {string} statusName - Status option name
   * @returns {Object|null} - Field and option details
   */
  function findStatusOption(project, statusName) {
    const statusField = project.fields.nodes.find(
      (f) => f.name === "Status" && f.options
    );

    if (!statusField) {
      return null;
    }

    const option = statusField.options.find(
      (o) => o.name.toLowerCase() === statusName.toLowerCase()
    );

    if (!option) {
      return null;
    }

    return {
      fieldId: statusField.id,
      fieldName: statusField.name,
      optionId: option.id,
      optionName: option.name,
    };
  }

  /**
   * Get issue details with project items
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @returns {Promise<Object>} - Issue details
   */
  async function getIssueWithProjects(owner, repo, issueNumber) {
    const result = await octokit.graphql(GET_ISSUE_WITH_PROJECT_ITEMS, {
      owner,
      repo,
      number: issueNumber,
    });

    return result.repository?.issue;
  }

  /**
   * Get reactions on an issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @returns {Promise<Array>} - Array of reactions
   */
  async function getIssueReactions(owner, repo, issueNumber) {
    const result = await octokit.graphql(GET_ISSUE_REACTIONS, {
      owner,
      repo,
      number: issueNumber,
    });

    return result.repository?.issue?.reactions?.nodes || [];
  }

  /**
   * Update a project item's status field
   * @param {Object} options - Update options
   * @returns {Promise<Object>} - Update result
   */
  async function updateProjectItemStatus({
    projectId,
    itemId,
    fieldId,
    optionId,
  }) {
    const result = await octokit.graphql(UPDATE_PROJECT_ITEM_FIELD, {
      projectId,
      itemId,
      fieldId,
      value: { singleSelectOptionId: optionId },
    });

    return {
      success: true,
      itemId: result.updateProjectV2ItemFieldValue.projectV2Item.id,
    };
  }

  /**
   * Add an issue to a project
   * @param {string} projectId - Project node ID
   * @param {string} contentId - Issue node ID
   * @returns {Promise<Object>} - Added item details
   */
  async function addIssueToProject(projectId, contentId) {
    const result = await octokit.graphql(ADD_ITEM_TO_PROJECT, {
      projectId,
      contentId,
    });

    return {
      success: true,
      itemId: result.addProjectV2ItemById.item.id,
    };
  }

  /**
   * Add a comment to an issue
   * @param {string} issueId - Issue node ID
   * @param {string} body - Comment body
   * @returns {Promise<Object>} - Comment details
   */
  async function addIssueComment(issueId, body) {
    const result = await octokit.graphql(ADD_ISSUE_COMMENT, {
      subjectId: issueId,
      body,
    });

    return {
      success: true,
      comment: result.addComment.commentEdge.node,
    };
  }

  /**
   * Update issue status in project based on emoji
   * @param {Object} options - Options
   * @returns {Promise<Object>} - Update result
   */
  async function updateIssueStatusByEmoji({
    owner,
    repo,
    issueNumber,
    statusName,
    projectNumber,
    isOrg = true,
  }) {
    // Get project details
    const project = await getProject(owner, projectNumber, isOrg);

    // Find status option
    const statusOption = findStatusOption(project, statusName);
    if (!statusOption) {
      throw new Error(`Status "${statusName}" not found in project`);
    }

    // Get issue with project items
    const issue = await getIssueWithProjects(owner, repo, issueNumber);
    if (!issue) {
      throw new Error(`Issue #${issueNumber} not found`);
    }

    // Find the project item for this project
    let projectItem = issue.projectItems.nodes.find(
      (item) => item.project.id === project.id
    );

    // If issue is not in project, add it
    if (!projectItem) {
      const addResult = await addIssueToProject(project.id, issue.id);
      // Re-fetch to get the item details
      const updatedIssue = await getIssueWithProjects(owner, repo, issueNumber);
      projectItem = updatedIssue.projectItems.nodes.find(
        (item) => item.project.id === project.id
      );
    }

    if (!projectItem) {
      throw new Error("Failed to add issue to project");
    }

    // Update the status
    const updateResult = await updateProjectItemStatus({
      projectId: project.id,
      itemId: projectItem.id,
      fieldId: statusOption.fieldId,
      optionId: statusOption.optionId,
    });

    return {
      success: true,
      issueNumber,
      projectNumber,
      status: statusOption.optionName,
      itemId: updateResult.itemId,
    };
  }

  return {
    getProject,
    findStatusOption,
    getIssueWithProjects,
    getIssueReactions,
    updateProjectItemStatus,
    addIssueToProject,
    addIssueComment,
    updateIssueStatusByEmoji,
  };
}

module.exports = {
  UPDATE_PROJECT_ITEM_FIELD,
  ADD_ITEM_TO_PROJECT,
  GET_PROJECT_BY_NUMBER,
  GET_USER_PROJECT_BY_NUMBER,
  GET_ISSUE_WITH_PROJECT_ITEMS,
  GET_ISSUE_REACTIONS,
  ADD_ISSUE_COMMENT,
  createGraphQLMutationHandler,
};
