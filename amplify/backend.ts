import { auth } from './auth/resource';
import { defineBackend } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
// import { Tags } from 'aws-cdk-lib';

const backend = defineBackend({
  auth,
});

// ============================================================
// WORKAROUND: Neuter the Identity Pool that defineAuth creates.
//
// Gen1 was configured as "userPoolOnly" (no Identity Pool).
// Gen2's defineAuth always creates an Identity Pool and there
// is no way to opt out or remove it — the construct's internal
// output references prevent deletion.
//
// This is the bug: the migration tool should not create an
// Identity Pool for userPoolOnly configurations.
//
// Best we can do is disable unauthenticated access.
// The identity_pool_id will still appear in amplify_outputs.json
// but the SDK handles it gracefully when no credentials are needed.
// ============================================================
const cfnIdentityPool =
  backend.auth.resources.cfnResources.cfnIdentityPool;
cfnIdentityPool.allowUnauthenticatedIdentities = false;

// Override the User Pool settings to match Gen1 config
const cfnUserPool = backend.auth.resources.cfnResources.cfnUserPool;
cfnUserPool.usernameAttributes = ['email'];
cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 8,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSymbols: false,
    temporaryPasswordValidityDays: 7,
  },
};

// Add the native app client to match Gen1's second client
const userPool = backend.auth.resources.userPool;
userPool.addClient('NativeAppClient', {
  refreshTokenValidity: Duration.days(30),
  enableTokenRevocation: true,
  enablePropagateAdditionalUserContextData: false,
  authSessionValidity: Duration.minutes(3),
  disableOAuth: true,
  generateSecret: false,
});

// Uncomment post refactor to force a redeployment
// Tags.of(backend.stack).add('gen2-migration/post-refactor', 'true');
