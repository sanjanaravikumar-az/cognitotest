import { auth } from './auth/resource';
import { storage } from './storage/resource';
import { defineBackend } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
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
// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// amplifyAuth.node.tryRemoveChild('IdentityPool');
// amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');
// amplifyAuth.node.tryRemoveChild('authenticatedUserRole');
// amplifyAuth.node.tryRemoveChild('unauthenticatedUserRole');

// const stack = backend.auth.stack;
// const cfnStack = stack.node.defaultChild;
// console.log('Default child type:', cfnStack?.constructor.name);
// console.log('Metadata keys:', cfnStack && (cfnStack as any).cfnOptions?.metadata ? Object.keys((cfnStack as any).cfnOptions.metadata) : 'none');

// import { Aspects, IAspect, CfnResource } from 'aws-cdk-lib';
// import { IConstruct } from 'constructs';

// // Aspect that runs at synth time and dumps all metadata
// class MetadataDumper implements IAspect {
//   visit(node: IConstruct): void {
//     if (node instanceof CfnResource) {
//       const meta = (node as any).cfnOptions?.metadata;
//       if (meta && JSON.stringify(meta).includes('IdentityPool')) {
//         console.log(`\n=== Found identity pool ref in: ${node.node.path} ===`);
//         console.log(JSON.stringify(meta, null, 2).substring(0, 2000));
//       }
//     }
//   }
// }

// Aspects.of(backend.auth.stack).add(new MetadataDumper());

// import { CfnOutput } from 'aws-cdk-lib';

// for (const child of backend.auth.stack.node.findAll()) {
//   if (child instanceof CfnOutput) {
//     console.log(`CfnOutput: ${child.node.id} = ${(child as any).value}`);
//   }
// }

// for (const child of backend.auth.stack.node.findAll()) {
//   console.log(`${child.node.path} [${child.constructor.name}]`);
// }
// for (const child of backend.auth.stack.node.children) {
//   console.log(`Stack child: ${child.node.id} [${child.constructor.name}]`);
// }

// List ALL children of the nested stack (the actual inner stack, not the wrapper)
// const innerStack = (backend.auth.stack as any).nestedStackResource?.stack ?? backend.auth.stack;
// for (const child of backend.auth.stack.node.findAll()) {
//   if (child.constructor.name === 'CfnOutput') {
//     console.log(`CfnOutput found: ${child.node.id} at ${child.node.path}`);
//   }
// }

// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// amplifyAuth.node.tryRemoveChild('IdentityPool');
// amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');
// amplifyAuth.node.tryRemoveChild('authenticatedUserRole');
// amplifyAuth.node.tryRemoveChild('unauthenticatedUserRole');

// // Override the template to remove identity pool outputs and resources
// const authStack = backend.auth.stack as any;
// authStack.addOverride('Outputs.identityPoolId', { Value: '' });
// authStack.addOverride('Outputs.allowUnauthenticatedIdentities', { Value: 'false' });


// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// amplifyAuth.node.tryRemoveChild('IdentityPool');
// amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');
// amplifyAuth.node.tryRemoveChild('authenticatedUserRole');
// amplifyAuth.node.tryRemoveChild('unauthenticatedUserRole');

// // The nested stack's template is controlled by the NestedStack construct
// // We need to override the template options to remove the identity pool outputs
// const nestedStack = backend.auth.stack;
// (nestedStack as any).templateOptions = (nestedStack as any).templateOptions || {};

// // Use Aspects to modify the template at synth time
// import { Aspects, IAspect } from 'aws-cdk-lib';
// import { IConstruct } from 'constructs';

// class PatchIdentityPoolRefs implements IAspect {
//   visit(node: IConstruct): void {
//     // Find CfnStack resources (nested stack references in parent)
//     if (node.constructor.name === 'CfnStack') {
//       const cfnNode = node as any;
//       const path = node.node.path;
//       if (path.includes('auth')) {
//         console.log(`Found CfnStack: ${path}, has addOverride: ${typeof cfnNode.addOverride}`);
//       }
//     }
//   }
// }

// Aspects.of(backend.stack).add(new PatchIdentityPoolRefs());


// import { Aspects, IAspect } from 'aws-cdk-lib';
// import { IConstruct } from 'constructs';

// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// amplifyAuth.node.tryRemoveChild('IdentityPool');
// amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');
// amplifyAuth.node.tryRemoveChild('authenticatedUserRole');
// amplifyAuth.node.tryRemoveChild('unauthenticatedUserRole');

// // Directly manipulate the nested stack's _toCloudFormation to remove identity pool outputs
// const origSynth = (backend.auth.stack as any)._toCloudFormation;
// (backend.auth.stack as any)._toCloudFormation = function() {
//   const template = origSynth.call(this);
//   if (template.Outputs) {
//     for (const key of Object.keys(template.Outputs)) {
//       const val = JSON.stringify(template.Outputs[key]);
//       if (val.includes('IdentityPool') || val.includes('authenticatedUserRole') || val.includes('unauthenticatedUserRole')) {
//         console.log(`Removing output: ${key}`);
//         delete template.Outputs[key];
//       }
//     }
//   }
//   return template;
// };

// import { Aspects, IAspect } from 'aws-cdk-lib';
// import { IConstruct } from 'constructs';

// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// amplifyAuth.node.tryRemoveChild('IdentityPool');
// amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');
// amplifyAuth.node.tryRemoveChild('authenticatedUserRole');
// amplifyAuth.node.tryRemoveChild('unauthenticatedUserRole');

// // Patch nested stack template to remove identity pool outputs
// const origSynth = (backend.auth.stack as any)._toCloudFormation;
// (backend.auth.stack as any)._toCloudFormation = function() {
//   const template = origSynth.call(this);
//   if (template.Outputs) {
//     for (const key of Object.keys(template.Outputs)) {
//       const val = JSON.stringify(template.Outputs[key]);
//       if (val.includes('IdentityPool') || val.includes('authenticatedUserRole') || val.includes('unauthenticatedUserRole')) {
//         delete template.Outputs[key];
//       }
//     }
//   }
//   return template;
// };

// // Also patch the parent stack to remove references to those nested stack outputs
// const origParentSynth = (backend.stack as any)._toCloudFormation;
// (backend.stack as any)._toCloudFormation = function() {
//   const template = origParentSynth.call(this);
//   // Remove Outputs in parent that reference identity pool nested stack outputs
//   if (template.Outputs) {
//     for (const key of Object.keys(template.Outputs)) {
//       const val = JSON.stringify(template.Outputs[key]);
//       if (val.includes('IdentityPool') || val.includes('authenticatedUserRole') || val.includes('unauthenticatedUserRole')) {
//         console.log(`Removing parent output: ${key}`);
//         delete template.Outputs[key];
//       }
//     }
//   }
//   // Also clean up any Resources that reference those outputs
//   if (template.Resources) {
//     for (const [resKey, resVal] of Object.entries(template.Resources)) {
//       const resStr = JSON.stringify(resVal);
//       if (resStr.includes('IdentityPool') || resStr.includes('authenticatedUserRole') || resStr.includes('unauthenticatedUserRole')) {
//         console.log(`Parent resource with identity pool ref: ${resKey}`);
//       }
//     }
//   }
//   return template;
// };

// function listAllChildren(node: any, depth = 0) {
//   for (const child of node.node.children) {
//     const prefix = '  '.repeat(depth);
//     console.log(`${prefix}${child.node.id} [${child.constructor.name}]`);
//     if (child.node.children.length > 0) {
//       listAllChildren(child, depth + 1);
//     }
//   }
// }
// listAllChildren(backend.auth.stack);

// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// amplifyAuth.node.tryRemoveChild('IdentityPool');
// amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');
// amplifyAuth.node.tryRemoveChild('authenticatedUserRole');
// amplifyAuth.node.tryRemoveChild('unauthenticatedUserRole');

// // Patch nested (auth) stack template
// const origNestedSynth = (backend.auth.stack as any)._toCloudFormation;
// (backend.auth.stack as any)._toCloudFormation = function() {
//   const template = origNestedSynth.call(this);
//   if (template.Outputs) {
//     for (const key of Object.keys(template.Outputs)) {
//       const val = JSON.stringify(template.Outputs[key]);
//       if (val.includes('IdentityPool') || val.includes('authenticatedUserRole') || val.includes('unauthenticatedUserRole')) {
//         delete template.Outputs[key];
//       }
//     }
//   }
//   return template;
// };

// // Patch parent stack template
// const origParentSynth = (backend.stack as any)._toCloudFormation;
// (backend.stack as any)._toCloudFormation = function() {
//   const template = origParentSynth.call(this);
//   // Replace identity pool output with empty string
//   if (template.Outputs?.identityPoolId) {
//     template.Outputs.identityPoolId = { Value: '' };
//   }
//   if (template.Outputs?.allowUnauthenticatedIdentities) {
//     template.Outputs.allowUnauthenticatedIdentities = { Value: 'false' };
//   }
//   // Remove auth/unauth role references from storage nested stack parameters
//   if (template.Resources) {
//     for (const [key, res] of Object.entries(template.Resources as Record<string, any>)) {
//       if (res.Type === 'AWS::CloudFormation::Stack' && res.Properties?.Parameters) {
//         const params = res.Properties.Parameters;
//         for (const pKey of Object.keys(params)) {
//           const pVal = JSON.stringify(params[pKey]);
//           if (pVal.includes('IdentityPool') || pVal.includes('authenticatedUserRole') || pVal.includes('unauthenticatedUserRole')) {
//             console.log(`Removing param ${pKey} from ${key}`);
//             delete params[pKey];
//           }
//         }
//       }
//     }
//   }
//   return template;
// };


// The storeOutput creates CfnOutputs with the payload key names
// Try to find them by ID on the auth stack
// const identityPoolOutput = backend.auth.stack.node.tryFindChild('identityPoolId');
// const allowUnauth = backend.auth.stack.node.tryFindChild('allowUnauthenticatedIdentities');
// console.log('identityPoolId output:', identityPoolOutput?.constructor.name ?? 'NOT FOUND');
// console.log('allowUnauth output:', allowUnauth?.constructor.name ?? 'NOT FOUND');

// // Also check if they're on the amplifyAuth construct
// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// const idpOnAuth = amplifyAuth.node.tryFindChild('identityPoolId');
// console.log('identityPoolId on amplifyAuth:', idpOnAuth?.constructor.name ?? 'NOT FOUND');

// Check parent (root) stack
// for (const child of backend.stack.node.children) {
//   if (child.node.id.includes('identityPool') || child.node.id.includes('allowUnauth') || child.node.id === 'identityPoolId') {
//     console.log(`Root stack child: ${child.node.id} [${child.constructor.name}]`);
//   }
// }

// // Brute force - find ALL CfnOutput-like things everywhere
// for (const node of backend.stack.node.findAll()) {
//   if (node.node.id === 'identityPoolId' || node.node.id === 'allowUnauthenticatedIdentities') {
//     console.log(`FOUND: ${node.node.path} [${node.constructor.name}]`);
//   }
// }

// import { CfnOutput } from 'aws-cdk-lib';

// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// amplifyAuth.node.tryRemoveChild('IdentityPool');
// amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');
// amplifyAuth.node.tryRemoveChild('authenticatedUserRole');
// amplifyAuth.node.tryRemoveChild('unauthenticatedUserRole');

// // Override the CfnOutput values on the root stack to remove identity pool references
// const idPoolOutput = backend.stack.node.findChild('identityPoolId') as CfnOutput;
// idPoolOutput.overrideLogicalId('identityPoolId');
// (idPoolOutput as any).value = '';

// const allowUnauthOutput = backend.stack.node.findChild('allowUnauthenticatedIdentities') as CfnOutput;
// allowUnauthOutput.overrideLogicalId('allowUnauthenticatedIdentities');
// (allowUnauthOutput as any).value = 'false';

// import { CfnOutput } from 'aws-cdk-lib';

// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// amplifyAuth.node.tryRemoveChild('IdentityPool');
// amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');
// amplifyAuth.node.tryRemoveChild('authenticatedUserRole');
// amplifyAuth.node.tryRemoveChild('unauthenticatedUserRole');

// // Fix root stack CfnOutputs
// const idPoolOutput = backend.stack.node.findChild('identityPoolId') as CfnOutput;
// (idPoolOutput as any).value = '';

// const allowUnauthOutput = backend.stack.node.findChild('allowUnauthenticatedIdentities') as CfnOutput;
// (allowUnauthOutput as any).value = 'false';

// // Fix nested auth stack - remove dangling outputs for roles and identity pool
// const origNestedSynth = (backend.auth.stack as any)._toCloudFormation;
// (backend.auth.stack as any)._toCloudFormation = function() {
//   const template = origNestedSynth.call(this);
//   if (template.Outputs) {
//     for (const key of Object.keys(template.Outputs)) {
//       const val = JSON.stringify(template.Outputs[key]);
//       if (val.includes('IdentityPool') || val.includes('authenticatedUserRole') || val.includes('unauthenticatedUserRole')) {
//         delete template.Outputs[key];
//       }
//     }
//   }
//   return template;
// };

// // Fix parent stack - remove cross-stack ref parameters passed to storage
// const origParentSynth = (backend.stack as any)._toCloudFormation;
// (backend.stack as any)._toCloudFormation = function() {
//   const template = origParentSynth.call(this);
//   if (template.Resources) {
//     for (const [key, res] of Object.entries(template.Resources as Record<string, any>)) {
//       if (res.Type === 'AWS::CloudFormation::Stack' && res.Properties?.Parameters) {
//         const params = res.Properties.Parameters;
//         for (const pKey of Object.keys(params)) {
//           const pVal = JSON.stringify(params[pKey]);
//           if (pVal.includes('authenticatedUserRole') || pVal.includes('unauthenticatedUserRole') || pVal.includes('IdentityPool')) {
//             delete params[pKey];
//           }
//         }
//       }
//     }
//   }
//   return template;
// };

// // Also fix storage nested stack - remove parameters for auth/unauth roles
// const origStorageSynth = (backend.storage.stack as any)._toCloudFormation;
// (backend.storage.stack as any)._toCloudFormation = function() {
//   const template = origStorageSynth.call(this);
//   if (template.Parameters) {
//     for (const key of Object.keys(template.Parameters)) {
//       if (key.includes('authenticatedUserRole') || key.includes('unauthenticatedUserRole') || key.includes('IdentityPool')) {
//         delete template.Parameters[key];
//       }
//     }
//   }
//   // Also clean up any IAM policy references to these parameters
//   if (template.Resources) {
//     for (const [resKey, resVal] of Object.entries(template.Resources as Record<string, any>)) {
//       const resStr = JSON.stringify(resVal);
//       if (resStr.includes('authenticatedUserRole') || resStr.includes('unauthenticatedUserRole')) {
//         // Remove IAM policy statements that reference the removed roles
//         const res = resVal as any;
//         if (res.Type === 'AWS::IAM::Policy' || res.Type === 'AWS::IAM::RolePolicy') {
//           console.log(`Storage resource referencing removed roles: ${resKey} [${res.Type}]`);
//         }
//       }
//     }
//   }
//   return template;
// };


// import { CfnParameter } from 'aws-cdk-lib';

// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// const cfnIdentityPool = backend.auth.resources.cfnResources.cfnIdentityPool;

// // Get the current logical ID before we do anything
// const logicalId = backend.auth.stack.resolve((cfnIdentityPool as any).logicalId) as string;
// console.log('Identity pool logical ID:', logicalId);

// // Add a parameter with the same logical ID - Ref will resolve to this instead
// new CfnParameter(backend.auth.stack, 'IdentityPoolIdParam', {
//   type: 'String',
//   default: 'NONE',
// });
// // Override the parameter's logical ID to match the identity pool's
// const param = backend.auth.stack.node.findChild('IdentityPoolIdParam') as CfnParameter;
// param.overrideLogicalId(logicalId);

// // Now remove the identity pool and related resources
// amplifyAuth.node.tryRemoveChild('IdentityPool');
// amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');

// // Fix root stack outputs
// const idPoolOutput = backend.stack.node.findChild('identityPoolId');
// (idPoolOutput as any).value = '';
// const allowUnauthOutput = backend.stack.node.findChild('allowUnauthenticatedIdentities');
// (allowUnauthOutput as any).value = 'false';


// import { CfnParameter } from 'aws-cdk-lib';

// // --- Remove Identity Pool ---

// const amplifyAuth = backend.auth.stack.node.findChild('amplifyAuth');
// const cfnIdentityPool = backend.auth.resources.cfnResources.cfnIdentityPool;

// // Get the identity pool's logical ID
// const logicalId = backend.auth.stack.resolve((cfnIdentityPool as any).logicalId) as string;

// // Replace the identity pool resource with a parameter so all Refs still resolve
// new CfnParameter(backend.auth.stack, 'IdentityPoolIdParam', {
//   type: 'String',
//   default: 'NONE',
// });
// const param = backend.auth.stack.node.findChild('IdentityPoolIdParam') as CfnParameter;
// param.overrideLogicalId(logicalId);

// // Remove identity pool and role attachment from construct tree
// amplifyAuth.node.tryRemoveChild('IdentityPool');
// amplifyAuth.node.tryRemoveChild('IdentityPoolRoleAttachment');

// // Remove identityPoolId and allowUnauthenticatedIdentities CfnOutputs from root stack
// backend.stack.node.tryRemoveChild('identityPoolId');
// backend.stack.node.tryRemoveChild('allowUnauthenticatedIdentities');

// // Remove them from the stack metadata so amplify_outputs doesn't expect them
// const metadata = (backend.stack as any).templateOptions.metadata;
// if (metadata?.['AWS::Amplify::Auth']) {
//   const authMeta = metadata['AWS::Amplify::Auth'];
//   authMeta.stackOutputs = authMeta.stackOutputs.filter(
//     (key: string) => key !== 'identityPoolId' && key !== 'allowUnauthenticatedIdentities'
//   );
// }

import { CfnOutput, CfnParameter, Aspects, IAspect } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

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
