type Reference = {
    id: number,
    refImage: string,
    mainTag: string,
    secondaryTags?: string[],
    description?: string
}

type Category = {
    name: string,
    references: Reference[],
    subCategories?: Category[]
}

type AnimateItem = {
    id: number,
    axis: { x: number, y: number },
    imagePath: string,
    transitionDelay?: number
}

export { Reference, Category, AnimateItem }