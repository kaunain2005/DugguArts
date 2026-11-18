declare module "firebase-admin/app" {
  export interface AppOptions {
    credential?: any;
    projectId?: string;
    storageBucket?: string;
  }

  export interface App {
    name: string;
    options: AppOptions;
  }

  export function initializeApp(options?: AppOptions, name?: string): App;
  export function getApps(): App[];
  export function getApp(name?: string): App;
  export function cert(serviceAccount: any): any;
}

declare module "firebase-admin/auth" {
  export interface Auth {
    createSessionCookie(idToken: string, options: { expiresIn: number }): Promise<string>;
    verifySessionCookie(sessionCookie: string, checkRevoked?: boolean): Promise<DecodedIdToken>;
    verifyIdToken(idToken: string): Promise<DecodedIdToken>;
    getUser(uid: string): Promise<UserRecord>;
    getUserByEmail(email: string): Promise<UserRecord>;
    createUser(properties: CreateUserProperties): Promise<UserRecord>;
    updateUser(uid: string, properties: UpdateUserProperties): Promise<UserRecord>;
    revokeRefreshTokens(uid: string): Promise<void>;
    setCustomUserClaims(uid: string, customClaims: Record<string, any>): Promise<void>;
    generatePasswordResetLink(email: string, actionCodeSettings: ActionCodeSettings): Promise<string>;
    verifyPasswordResetCode(code: string): Promise<string>;
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;
    createCustomToken(uid: string, claims?: Record<string, any>): Promise<string>;
  }

  export interface DecodedIdToken {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
    firebase?: {
      sign_in_provider?: string;
    };
  }

  export interface UserRecord {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
    providerData: ProviderData[];
    customClaims?: Record<string, any>;
  }

  export interface ProviderData {
    providerId: string;
    uid: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
  }

  export interface CreateUserProperties {
    email: string;
    password?: string;
    displayName?: string;
    emailVerified?: boolean;
    phoneNumber?: string;
    photoURL?: string;
    disabled?: boolean;
  }

  export interface UpdateUserProperties {
    displayName?: string | null;
    email?: string;
    emailVerified?: boolean;
    password?: string;
    phoneNumber?: string | null;
    photoURL?: string | null;
    disabled?: boolean;
  }

  export interface ActionCodeSettings {
    url: string;
    handleCodeInApp?: boolean;
    iOS?: { bundleId: string };
    android?: { packageName: string; installApp?: boolean; minimumVersion?: string };
    dynamicLinkDomain?: string;
  }

  export function getAuth(app?: any): Auth;
}

declare module "firebase-admin/firestore" {
  export interface Firestore {
    collection(name: string): CollectionReference;
    doc(path: string): DocumentReference;
    runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
    batch(): WriteBatch;
  }

  export interface CollectionReference {
    doc(path?: string): DocumentReference;
    where(fieldPath: string, opStr: WhereFilterOp, value: any): Query;
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
    data(): FirestoreDocumentData | undefined;
    get(fieldPath: string): any;
  }

  export interface QueryDocumentSnapshot extends DocumentSnapshot {
    data(): FirestoreDocumentData;
  }

  export interface FirestoreDocumentData extends Record<string, unknown> {
    createdAt?: TimestampValue | undefined;
    updatedAt?: TimestampValue | undefined;
    reviewDate?: TimestampValue | undefined;
    orderDate?: TimestampValue | undefined;
    requiredDate?: TimestampValue | undefined;
    lastLoginAt?: TimestampValue | undefined;
    passwordUpdatedAt?: TimestampValue | undefined;
    passwordSetAt?: TimestampValue | undefined;
    reviewDate?: TimestampValue | undefined;
    orderDate?: TimestampValue | undefined;
    requiredDate?: TimestampValue | undefined;
    lastLoginAt?: TimestampValue | undefined;
    passwordUpdatedAt?: TimestampValue | undefined;
    passwordSetAt?: TimestampValue | undefined;
    [key: string]: unknown;
  }

  export type TimestampValue = { toDate(): Date } | Date | string | number | undefined;

  export interface QuerySnapshot {
    empty: boolean;
    size: number;
    docs: QueryDocumentSnapshot[];
    forEach(callback: (doc: QueryDocumentSnapshot) => void): void;
  }

  export interface QueryDocumentSnapshot extends DocumentSnapshot {
    data(): FirestoreDocumentData;
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
  export const FieldValue: FieldValue;
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

  export type FirestoreDocumentData = Record<string, unknown> & {
    createdAt?: TimestampValue | undefined;
    updatedAt?: TimestampValue | undefined;
    reviewDate?: TimestampValue | undefined;
    orderDate?: TimestampValue | undefined;
    requiredDate?: TimestampValue | undefined;
    lastLoginAt?: TimestampValue | undefined;
    passwordUpdatedAt?: TimestampValue | undefined;
    passwordSetAt?: TimestampValue | undefined;
    reviewDate?: TimestampValue | undefined;
    orderDate?: TimestampValue | undefined;
    requiredDate?: TimestampValue | undefined;
    lastLoginAt?: TimestampValue | undefined;
    passwordUpdatedAt?: TimestampValue | undefined;
    passwordSetAt?: TimestampValue | undefined;
    [key: string]: unknown;
  };
}