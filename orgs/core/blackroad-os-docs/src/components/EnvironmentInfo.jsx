import React from 'react';
import docsConfig from '../config/docsConfig';

/**
 * EnvironmentInfo component displays the current environment configuration
 * including the docs URL and optional service URLs.
 */
export default function EnvironmentInfo() {
  return (
    <div className="margin-top--lg">
      <p className="text--center">
        Docs served from <strong>{docsConfig.publicDocsUrl}</strong>{' '}
        {docsConfig.coreApiUrl && <>| Core API: {docsConfig.coreApiUrl} </>}
        {docsConfig.webAppUrl && <>| Web App: {docsConfig.webAppUrl} </>}
        {docsConfig.consoleUrl && <>| Console: {docsConfig.consoleUrl} </>}
        {docsConfig.agentsApiUrl && <>| Agents API: {docsConfig.agentsApiUrl} </>}
      </p>
    </div>
  );
}
