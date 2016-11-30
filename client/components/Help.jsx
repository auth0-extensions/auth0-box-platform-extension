import React from 'react';

export default ({ config }) => {
  const audience = config.audience || 'unknown identifier';
  if (config.isClient) {
    return (
      <div>
        <h4>Usage</h4>
        <p>
          This extension hosts a token exchange endpoint which can translate issued to your Client (<strong>{ audience }</strong>).
          After you Client has received an <strong>id_token</strong> for the end user, you can call the following endpoint to get a token for your Box App User:
        </p>

        <h5>Request</h5>
        <pre style={{ padding: '10px' }}>
          <code>
            POST <strong>{config.tokenEndpoint}</strong><br />
            Accept: application/json<br />
            Content-Type: application/json<br />
            <br />
            {'{'}<br />
            &nbsp;&nbsp;"token": "ey..."<br />
            {'}'}<br />
          </code>
        </pre>

        <h5>Response</h5>
        <pre style={{ padding: '10px' }}>
          <code>
            Content-Type: application/json<br />
            <br />
            {'{'}<br />
            &nbsp;&nbsp;"access_token": "iOGmxfpapeo9z0UINn04dpeOFpamddf3sF",<br />
            &nbsp;&nbsp;"expires_in": 3650,<br />
            &nbsp;&nbsp;"restricted_to": [ ],<br />
            &nbsp;&nbsp;"token_type": "Bearer",<br />
            &nbsp;&nbsp;"expires_at": 1480523945774<br />
            {'}'}<br />
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div>
      <h4>Usage</h4>
      <p>
        This extension hosts a token exchange endpoint which can translate issued to your Resource Server (<strong>{ audience }</strong>).
        After you Client has received an <strong>access_token</strong> for the end user, you can call the following endpoint to get a token for your Box App User:
      </p>

      <h5>Request</h5>
      <pre style={{ padding: '10px' }}>
        <code>
          POST <strong>{config.tokenEndpoint}</strong><br />
          Accept: application/json<br />
          Content-Type: application/json<br />
          <br />
          {'{'}<br />
          &nbsp;&nbsp;"token": "ey..."<br />
          {'}'}<br />
        </code>
      </pre>

      <h5>Response</h5>
      <pre style={{ padding: '10px' }}>
        <code>
          Content-Type: application/json<br />
          <br />
          {'{'}<br />
          &nbsp;&nbsp;"access_token": "iOGmxfpapeo9z0UINn04dpeOFpamddf3sF",<br />
          &nbsp;&nbsp;"expires_in": 3650,<br />
          &nbsp;&nbsp;"restricted_to": [ ],<br />
          &nbsp;&nbsp;"token_type": "Bearer",<br />
          &nbsp;&nbsp;"expires_at": 1480523945774<br />
          {'}'}<br />
        </code>
      </pre>
    </div>
  );
};
