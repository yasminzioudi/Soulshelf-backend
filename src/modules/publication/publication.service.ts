import {
    createPublicationInDb,
    deletePublicationFromDb,
    findAllPublicationsInDb,
    findPublicationByIdInDb,
    findPublicationsByAuthorInDb,
    updatePublicationInDb,
    type PublicationResponseDto,
} from "./publication.repository";
import type { CreatePublicationInput, UpdatePublicationInput } from "./publication.schema";

export const getAllPublicationsService = async (
    limit: number = 20,
): Promise<PublicationResponseDto[]> => {
    return findAllPublicationsInDb(limit);
};

export const createPublicationService = async (
    userId: number,
    input: CreatePublicationInput,
): Promise<PublicationResponseDto> => {
    return createPublicationInDb(userId, input);
};

export const getMyPublicationsService = async (
    userId: number,
): Promise<PublicationResponseDto[]> => {
    return findPublicationsByAuthorInDb(userId);
};

export const getPublicationByIdService = async (
    id: number,
): Promise<PublicationResponseDto> => {
    const publication = await findPublicationByIdInDb(id);
    if (!publication) {
        throw new Error("PUBLICATION_NOT_FOUND");
    }
    return publication;
};

export const updatePublicationService = async (
    userId: number,
    id: number,
    input: UpdatePublicationInput,
): Promise<PublicationResponseDto> => {
    const existing = await findPublicationByIdInDb(id);
    if (!existing) {
        throw new Error("PUBLICATION_NOT_FOUND");
    }

    if (existing.authorId !== userId) {
        throw new Error("PUBLICATION_FORBIDDEN");
    }

    const updated = await updatePublicationInDb(id, input);
    if (!updated) {
        throw new Error("PUBLICATION_NOT_FOUND");
    }

    return updated;
};

export const deletePublicationService = async (
    userId: number,
    id: number,
): Promise<boolean> => {
    const existing = await findPublicationByIdInDb(id);
    if (!existing) {
        throw new Error("PUBLICATION_NOT_FOUND");
    }

    if (existing.authorId !== userId) {
        throw new Error("PUBLICATION_FORBIDDEN");
    }

    return deletePublicationFromDb(id);
};
