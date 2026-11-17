import { db } from "../../prisma/db";
import {
    createPublicationLike,
    deletePublicationLike,
    findPublicationLike,
    getPublicationLikesCount,
} from "./publication-likes.repository";

export const likePublication = async (userId: number, publicationId: number) => {
    const publication = await db.orm.public.Publication.where({ id: publicationId }).first();
    if (!publication) {
        throw new Error("PUBLICATION_NOT_FOUND");
    }

    const existing = await findPublicationLike(userId, publicationId);
    if (!existing) {
        await createPublicationLike(userId, publicationId);
    }

    const likesCount = await getPublicationLikesCount(publicationId);
    return { isLiked: true, likesCount };
};

export const unlikePublication = async (userId: number, publicationId: number) => {
    const publication = await db.orm.public.Publication.where({ id: publicationId }).first();
    if (!publication) {
        throw new Error("PUBLICATION_NOT_FOUND");
    }

    await deletePublicationLike(userId, publicationId);

    const likesCount = await getPublicationLikesCount(publicationId);
    return { isLiked: false, likesCount };
};

export const getPublicationLikeStatus = async (userId: number, publicationId: number) => {
    const publication = await db.orm.public.Publication.where({ id: publicationId }).first();
    if (!publication) {
        throw new Error("PUBLICATION_NOT_FOUND");
    }

    const like = await findPublicationLike(userId, publicationId);
    const likesCount = await getPublicationLikesCount(publicationId);
    return { isLiked: !!like, likesCount };
};
