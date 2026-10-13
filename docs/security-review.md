# GitGuardian finding review — 13 October 2026

The user identified the PR #5 finding as `newPassword: newRef` in `src/components/profile/ChangePasswordModal.tsx`, line 57 of commit `f1918d6`.

## Classification: false positive

`newRef` is declared as `useRef<AppInputRef>(null)`. `AppInputRef` is a React Native `TextInput` reference. The flagged property maps a form field to its input reference so `onInvalid` can call `.current?.focus()` on the first invalid field. It contains no hardcoded password or access credential.

The actual new password comes from `form.values.newPassword`, populated by the user's input and passed to `onSave`. It is not supplied by this reference map. The modal continues using the shared `PasswordInput` and `useAccountForm` components.

The references are now named `currentPasswordInputRef`, `newPasswordInputRef`, and `confirmPasswordInputRef`, and the map is named `inputRefs`, to make their purpose explicit. This is a readability change; it does not establish whether a future scanner run will flag the renamed identifiers.

Open this specific incident in GitGuardian and choose **Ignore → False positive (not a secret)**. Suggested review comment:

> The detected value is a React TextInput reference initialized with useRef(null). It is used only to focus a form input during validation and is not a credential.

If the GitHub check exposes **Skip: false positive**, that is also available for this verified finding. See [GitGuardian's PR-check guidance](https://docs.gitguardian.com/internal-monitoring/prevent/detect-secrets-in-real-time-in-github).

GitGuardian documents false positives as an appropriate ignore reason in its [remediation guidance](https://docs.gitguardian.com/public-monitoring/remediate/remediate-incidents). The remote incident/check status has not been changed from this workspace. A source rename also leaves the original line in the earlier commit; classify the incident using the verified context.

## Separate history observation

The local audit also found a Firebase client API key in historical `android/app/google-services.json`, line 18. That configuration was introduced in `4c91376` and removed in `eb44ded`. This is separate from the input-reference finding the user identified. No key value is reproduced here.

Firebase client keys may be public with appropriate restrictions. Their allowlist must exclude Gemini/Generative Language API access; an unused old key can be retired. Provider-side restrictions were not inspected. See [Firebase's API-key guidance](https://firebase.google.com/docs/projects/api-keys).

Local dotenv files are ignored, with sanitized examples allowed. No credential values were added to these review notes or to source code.
