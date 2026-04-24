import { auth } from './auth/resource';
import { storage } from './storage/resource';
import { defineBackend } from '@aws-amplify/backend';
import { Aspects, CfnOutput, Duration, IAspect } from 'aws-cdk-lib';
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

const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
amplifyAuth.node.tryRemoveChild('IdentityPool');
amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');
amplifyAuth.node.tryRemoveChild('authenticatedUserRole');
amplifyAuth.node.tryRemoveChild('unauthenticatedUserRole');

// Also remove the CloudFormation Output that references the Identity Pool.
// The auth construct's storeOutput writes an Output with the Identity Pool ID,
// and CloudFormation fails if the referenced resource doesn't exist.
class RemoveIdentityPoolOutputs implements IAspect {
  visit(node: IConstruct): void {
    if (
      node instanceof CfnOutput &&
      node.node.id.toLowerCase().includes('identitypool')
    ) {
      node.node.scope?.node.tryRemoveChild(node.node.id);
    }
  }
}

Aspects.of(backend.auth.stack).add(new RemoveIdentityPoolOutputs());

// Uncomment post refactor to force a redeployment
// Tags.of(backend.stack).add('gen2-migration/post-refactor', 'true');
