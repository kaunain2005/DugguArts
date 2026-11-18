declare module "firebase/app" {
  export interface FirebaseApp {
    name: string;
    options: FirebaseOptions;
  }

  export interface FirebaseOptions {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  }

  export function initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

declare module "firebase/auth" {
  export interface Auth {
    currentUser: User | null;
    signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
    createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
    signInWithPopup(provider: AuthProvider): Promise<UserCredential>;
    signOut(): Promise<void>;
    onAuthStateChanged(nextOrObserver: any, error?: any, completed?: any): () => void;
    signInWithRedirect(provider: AuthProvider): Promise<void>;
    getRedirectResult(): Promise<UserCredential>;
    signInWithCredential(credential: AuthCredential): Promise<UserCredential>;
    signInWithCustomToken(token: string): Promise<UserCredential>;
    sendPasswordResetEmail(email: string): Promise<void>;
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;
    verifyPasswordResetCode(code: string): Promise<string>;
    applyActionCode(code: string): Promise<void>;
    checkActionCode(code: string): Promise<any>;
    sendEmailVerification(actionCodeSettings?: ActionCodeSettings): Promise<void>;
    updateCurrentUser(user: User | null): Promise<void>;
    updateProfile(profile: { displayName?: string; photoURL?: string }): Promise<void>;
    updatePassword(newPassword: string): Promise<void>;
    updateEmail(newEmail: string): Promise<void>;
    verifyBeforeUpdateEmail(newEmail: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;
    sendSignInLinkToEmail(email: string, actionCodeSettings: ActionCodeSettings): Promise<void>;
    isSignInWithEmailLink(emailLink: string): boolean;
    signInWithEmailLink(email: string, emailLink: string): Promise<UserCredential>;
    linkWithCredential(credential: AuthCredential): Promise<UserCredential>;
    unlink(providerId: string): Promise<User>;
    reauthenticateWithCredential(credential: AuthCredential): Promise<UserCredential>;
    onIdTokenChanged(nextOrObserver: any, error?: any, completed?: any): () => void;
    onIdTokenChanged(observer: NextOrObserver<User>): () => void;
    languageCode: string;
    settings: { appVerificationDisabledForTesting: boolean };
    tenantId: string | null;
  }

  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    phoneNumber: string | null;
    isAnonymous: boolean;
    metadata: UserMetadata;
    providerData: UserInfo[];
    refreshToken: string;
    tenantId: string | null;
    delete(): Promise<void>;
    getIdToken(forceRefresh?: boolean): Promise<string>;
    getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
    reload(): Promise<void>;
    toJSON(): Object;
    toString(): string;
    providerId: string;
  }

  export interface UserCredential {
    user: User;
    credential: AuthCredential | null;
    operationType: string;
    additionalUserInfo: AdditionalUserInfo | null;
  }

  export interface UserInfo {
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
  }

  export interface UserMetadata {
    creationTime: string;
    lastSignInTime: string;
  }

  export interface IdTokenResult {
    token: string;
    accessToken?: string;
    expirationTime: string;
    authTime: string;
    issuedAtTime: string;
    claims: Record<string, any>;
    signInProvider: string | null;
  }

  export interface AuthCredential {
    providerId: string;
    signInMethod: string;
    toJSON(): Object;
  }

  export interface AdditionalUserInfo {
    providerId: string;
    isNewUser: boolean;
    profile: Record<string, any> | null;
    username?: string;
  }

  export interface ActionCodeSettings {
    url: string;
    handleCodeInApp?: boolean;
    iOS?: { bundleId: string };
    android?: { packageName: string; installApp?: boolean; minimumVersion?: string };
    dynamicLinkDomain?: string;
  }

  export interface NextOrObserver<T> {
    next?: (value: T) => void;
    error?: (error: Error) => void;
    complete?: () => void;
  }

  export class GoogleAuthProvider implements AuthProvider {
    constructor();
    static PROVIDER_ID: string;
    static GOOGLE_SIGN_IN_METHOD: string;
    addScope(scope: string): GoogleAuthProvider;
    setCustomParameters(customOAuthParameters: Record<string, string>): GoogleAuthProvider;
    setCustomParameters(customOAuthParameters: { [key: string]: string }): GoogleAuthProvider;
  }

  export interface AuthProvider {
    providerId: string;
  }

  export function getAuth(app?: any): Auth;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signInWithPopup(auth: Auth, provider: AuthProvider): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: any, error?: any, completed?: any): () => void;
  export function signInWithRedirect(auth: Auth, provider: AuthProvider): Promise<void>;
  export function getRedirectResult(auth: Auth): Promise<UserCredential>;
  export function signInWithCredential(auth: Auth, credential: AuthCredential): Promise<UserCredential>;
  export function signInWithCustomToken(auth: Auth, token: string): Promise<UserCredential>;
  export function sendPasswordResetEmail(auth: Auth, email: string): Promise<void>;
  export function confirmPasswordReset(auth: Auth, code: string, newPassword: string): Promise<void>;
  export function verifyPasswordResetCode(auth: Auth, code: string): Promise<string>;
  export function applyActionCode(auth: Auth, code: string): Promise<void>;
  export function checkActionCode(auth: Auth, code: string): Promise<any>;
  export function sendEmailVerification(auth: Auth, actionCodeSettings?: ActionCodeSettings): Promise<void>;
  export function updateProfile(auth: Auth, profile: { displayName?: string; photoURL?: string }): Promise<void>;
  export function updatePassword(auth: Auth, newPassword: string): Promise<void>;
  export function updateEmail(auth: Auth, newEmail: string): Promise<void>;
  export function verifyBeforeUpdateEmail(auth: Auth, newEmail: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;
  export function sendSignInLinkToEmail(auth: Auth, email: string, actionCodeSettings: ActionCodeSettings): Promise<void>;
  export function isSignInWithEmailLink(auth: Auth, emailLink: string): boolean;
  export function signInWithEmailLink(auth: Auth, email: string, emailLink: string): Promise<UserCredential>;
  export function GoogleAuthProvider(): AuthProvider;
}

declare module "firebase/firestore" {
  export interface Firestore {
    collection(name: string): CollectionReference;
    doc(path: string): DocumentReference;
    runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
    batch(): WriteBatch;
  }

  export interface CollectionReference {
    doc(path?: string): DocumentReference;
    where(fieldPath: string, opStr: WhereFilterOp, value: any): Query;
    orderBy(fieldPath: string, directionStr?: "asc" | "desc"): Query;
    limit(limit: number): Query;
    offset(offset: number): Query;
    get(): Promise<QuerySnapshot>;
    add(data: any): Promise<DocumentReference>;
  }

  export interface DocumentReference {
    id: string;
    path: string;
    parent: CollectionReference;
    set(data: any, options?: SetOptions): Promise<void>;
    update(data: any): Promise<void>;
    get(): Promise<DocumentSnapshot>;
    delete(): Promise<void>;
    collection(name: string): CollectionReference;
  }

  export interface DocumentSnapshot {
    exists: boolean;
    id: string;
    ref: DocumentReference;
    data(): any;
    get(fieldPath: string): any;
  }

  export interface QueryDocumentSnapshot extends DocumentSnapshot {
    data(): any;
  }

  export interface QuerySnapshot {
    empty: boolean;
    size: number;
    docs: QueryDocumentSnapshot[];
    forEach(callback: (doc: QueryDocumentSnapshot) => void): void;
  }

  export interface Query {
    where(fieldPath: string, opStr: WhereFilterOp, value: any): Query;
    orderBy(fieldPath: string, directionStr?: "asc" | "desc"): Query;
    limit(limit: number): Query;
    offset(offset: number): Query;
    get(): Promise<QuerySnapshot>;
  }

  export type WhereFilterOp = "<" | "<=" | "==" | "!=" | ">=" | ">" | "array-contains" | "array-contains-any" | "in" | "not-in";

  export interface SetOptions {
    merge?: boolean;
  }

  export interface Transaction {
    get(docRef: DocumentReference): Promise<DocumentSnapshot>;
    set(docRef: DocumentReference, data: any, options?: SetOptions): Transaction;
    update(docRef: DocumentReference, data: any): Transaction;
    delete(docRef: DocumentReference): Transaction;
  }

  export interface WriteBatch {
    set(docRef: DocumentReference, data: any, options?: SetOptions): WriteBatch;
    update(docRef: DocumentReference, data: any): WriteBatch;
    delete(docRef: DocumentReference): WriteBatch;
    commit(): Promise<void>;
  }

  export interface FieldValue {
    serverTimestamp(): FieldValue;
    increment(n: number): FieldValue;
    arrayUnion(...elements: any[]): FieldValue;
    arrayRemove(...elements: any[]): FieldValue;
  }

  export function getFirestore(app?: any): Firestore;
  export function getDocs(query: Query): Promise<QuerySnapshot>;
  export function getDoc(docRef: DocumentReference): Promise<DocumentSnapshot>;
  export function setDoc(docRef: DocumentReference, data: any, options?: SetOptions): Promise<void>;
  export function updateDoc(docRef: DocumentReference, data: any): Promise<void>;
  export function deleteDoc(docRef: DocumentReference): Promise<void>;
  export function addDoc(collectionRef: CollectionReference, data: any): Promise<DocumentReference>;
  export function query(collectionRef: CollectionReference, ...constraints: any[]): Query;
  export function collection(firestore: Firestore, path: string): CollectionReference;
  export function doc(firestore: Firestore, path: string): DocumentReference;
  export function where(fieldPath: string, opStr: WhereFilterOp, value: any): any;
  export function orderBy(fieldPath: string, directionStr?: "asc" | "desc"): any;
  export function limit(limit: number): any;
  export function limitToLast(limit: number): any;
  export function startAt(...values: any[]): any;
  export function startAfter(...values: any[]): any;
  export function endAt(...values: any[]): any;
  export function endBefore(...values: any[]): any;
  export function serverTimestamp(): FieldValue;
  export function increment(n: number): FieldValue;
  export function arrayUnion(...elements: any[]): FieldValue;
  export function arrayRemove(...elements: any[]): FieldValue;
  export const Timestamp: {
    now(): Timestamp;
    fromDate(date: Date): Timestamp;
    fromMillis(milliseconds: number): Timestamp;
  };
  export interface Timestamp {
    toDate(): Date;
    toMillis(): number;
    seconds: number;
    nanoseconds: number;
  }
}