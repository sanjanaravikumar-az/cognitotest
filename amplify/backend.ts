import { auth } from './auth/resource';
import { storage } from './storage/resource';
import { defineBackend } from '@aws-amplify/backend';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
// import { Tags } from 'aws-cdk-lib';

const backend = defineBackend({
  auth,
  storage,
});
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
const userPool = backend.auth.resources.userPool;
userPool.addClient('NativeAppClient', {
  refreshTokenValidity: Duration.days(30),
  enableTokenRevocation: true,
  enablePropagateAdditionalUserContextData: false,
  authSessionValidity: Duration.minutes(3),
  disableOAuth: true,
  generateSecret: false,
});
const s3Bucket = backend.storage.resources.cfnResources.cfnBucket;
// Use this bucket name post refactor
// s3Bucket.bucketName = 'cognitotest623dec8f844244168848c7121208afb6a2763-main';
s3Bucket.bucketEncryption = {
  serverSideEncryptionConfiguration: [
    {
      serverSideEncryptionByDefault: {
        sseAlgorithm: 'AES256',
      },
      bucketKeyEnabled: false,
    },
  ],
};

// Remove Identity Pool and related resources from the auth construct
const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
amplifyAuth.node.tryRemoveChild('IdentityPool');
amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');
amplifyAuth.node.tryRemoveChild('authenticatedUserRole');
amplifyAuth.node.tryRemoveChild('unauthenticatedUserRole');

// Remove ALL CfnOutput nodes that reference the Identity Pool.
// The auth construct's storeOutput creates CfnOutput nodes that
// Ref the Identity Pool resource, causing CloudFormation to fail
// with "Unresolved resource dependencies" when the resource is removed.
// We walk the entire auth stack construct tree to find and remove them.
function removeIdentityPoolOutputs(construct: IConstruct) {
  for (const child of construct.node.children) {
    if (child instanceof CfnOutput) {
      // Check if this output's value references the identity pool
      try {
        const outputValue = JSON.stringify(
          backend.auth.stack.resolve((child as CfnOutput).value)
        );
        if (outputValue.includes('IdentityPool')) {
          child.node.scope?.node.tryRemoveChild(child.node.id);
          continue;
        }
      } catch {
        // If resolve fails, check by node ID
      }
      if (child.node.id.toLowerCase().includes('identitypool')) {
        child.node.scope?.node.tryRemoveChild(child.node.id);
        continue;
      }
    }
    removeIdentityPoolOutputs(child);
  }
}
removeIdentityPoolOutputs(backend.auth.stack);

// Uncomment post refactor to force a redeployment
// Tags.of(backend.stack).add('gen2-migration/post-refactor', 'true');
