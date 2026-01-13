type Reference = {
    id: number,
    refImage: string,
    mainTag: string,
    secondaryTags?: string[],
    description?: string
}

type Category = {
    name: string,
    references: number[],
    subCategories?: Category[]
}

export { Reference, Category }