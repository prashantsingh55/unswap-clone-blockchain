import sanityClient from '@sanity/client'

export const client = sanityClient({
    projectId: 'plovo2ci',
    dataset: 'production',
    apiVersion: 'v1',
    token: 'skxWt7H2r0GJfDtfpscyXOGClQKgPip7OoLPFikqJtzWIvISrTNQ4Hnpy2ItvL9hduRLcLQgvB2kpkpDklLnNEPSkq1pQvwvYuoz9L1x0cAcQQlKR7C7fwOFpRO7UJN0SZPtuMfJco1d1VSnryYEi8R7QhlL3kx4WtoWmqC8ZWos2nD8JJjT',
    useCdn: false,
})