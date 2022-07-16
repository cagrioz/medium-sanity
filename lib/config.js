export const config = {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'production',
    apiVersion: 'v1',
    useCdn: process.env.NODE_ENV === 'production',
};
