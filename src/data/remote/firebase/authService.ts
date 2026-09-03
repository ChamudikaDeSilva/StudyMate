import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@react-native-firebase/auth';

const auth = getAuth();

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  await updateProfile(credential.user, {
    displayName: name.trim(),
  });

  return credential.user;
};

export const loginUser = async (
  email: string,
  password: string,
) => {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  return credential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const getFirebaseAuth = () => auth;