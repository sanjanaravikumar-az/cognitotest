import { auth } from './auth/resource';
import { defineBackend } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
// import { Tags } from 'aws-cdk-lib';

const backend = defineBackend({
  auth,
});

// ============================================================
// WORKAROUND: Remove Identity Pool created by defineAuth.
//
// Gen1 was configured as "userPoolOnly" (no Identity Pool).
// Gen2's defineAuth always creates an Identity Pool, which
// changes the auth architecture. This override removes it
// to match the original Gen1 configuration.
// ============================================================

// Get the underlying CloudFormation resources
const { cfnIdentityPool, cfnIdentityPoolRoleAttachment } =
  backend.auth.resources.cfnResources;

// Remove the Identity Pool and its role attachment from the stack
const identityPoolLogicalId = cfnIdentityPool.node.id;
const roleAttachmentLogicalId = cfnIdentityPoolRoleAttachment.node.id;
cfnIdentityPool.node.scope?.node.tryRemoveChild(identityPoolLogicalId);
cfnIdentityPoolRoleAttachment.node.scope?.node.tryRemoveChild(
  roleAttachmentLogicalId
);

// Remove the auth/unauth IAM roles (they only exist for the Identity Pool)
const authRole = backend.auth.resources.authenticatedUserIamRole;
const unauthRole = backend.auth.resources.unauthenticatedUserIamRole;
const authRoleNode = authRole.node;
const unauthRoleNode = unauthRole.node;
authRoleNode.scope?.node.tryRemoveChild(authRoleNode.id);
unauthRoleNode.scope?.node.tryRemoveChild(unauthRoleNode.id);

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
