import { auth } from './auth/resource';
import { storage } from './storage/resource';
import { defineBackend } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { CfnOutput, CfnParameter, Aspects, IAspect } from 'aws-cdk-lib';
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

// --- Remove Identity Pool ---

const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
const cfnIdentityPool = backend.auth.resources.cfnResources.cfnIdentityPool;

const logicalId = backend.auth.stack.resolve((cfnIdentityPool as any).logicalId) as string;

new CfnParameter(backend.auth.stack, 'IdentityPoolIdParam', {
  type: 'String',
  default: 'NONE',
});
const param = backend.auth.stack.node.findChild('IdentityPoolIdParam') as CfnParameter;
param.overrideLogicalId(logicalId);

amplifyAuth.node.tryRemoveChild('IdentityPool');
amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');

// Override the CfnOutput values instead of removing them
const idPoolOutput = backend.stack.node.findChild('identityPoolId') as CfnOutput;
(idPoolOutput as any).value = 'NONE';
const allowUnauthOutput = backend.stack.node.findChild('allowUnauthenticatedIdentities') as CfnOutput;
(allowUnauthOutput as any).value = 'false';



// Uncomment post refactor to force a redeployment
// Tags.of(backend.stack).add('gen2-migration/post-refactor', 'true');
