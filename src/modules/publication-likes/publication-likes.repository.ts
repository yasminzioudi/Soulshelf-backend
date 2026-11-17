import { db } from "../../prisma/db";

export const findPublicationLike = async (userId: number, publicationId: number) => {
    const allLikes = await db.orm.public.PublicationLike.all();
    return allLikes.find((l) => l.userId === userId && l.publicationId === publicationId) || null;
};

export const createPublicationLike = async (userId: number, publicationId: number) => {
    return await db.orm.public.PublicationLike.create({
        userId,
        publicationId,
    });
};

export const deletePublicationLike = async (userId: number, publicationId: number) => {
    const match = await findPublicationLike(userId, publicationId);
    if (match) {
        await db.orm.public.PublicationLike.where({ id: match.id }).delete();
    }
};

export const getPublicationLikesCount = async (publicationId: number) => {
    const allLikes = await db.orm.public.PublicationLike.all();
    return allLikes.filter((l) => l.publicationId === publicationId).length;
};
