import { db } from "../../prisma/db";
import type { CreatePublicationInput, UpdatePublicationInput } from "./publication.schema";

export interface PublicationAuthorDto {
    id: number;
    name: string;
    avatarUrl: string | null;
    occupation: string | null;
}

export interface PublicationResponseDto {
    id: number;
    authorId: number;
    title: string;
    description: string | null;
    genre: string;
    language: string | null;
    publishedYear: number | null;
    pages: number | null;
    coverUrl: string | null;
    content: string | null;
    createdAt: string;
    updatedAt: string;
    author?: PublicationAuthorDto;
}

export const createPublicationInDb = async (
    authorId: number,
    data: CreatePublicationInput,
): Promise<PublicationResponseDto> => {
    const publication = await db.orm.public.Publication.create({
        authorId,
        title: data.title,
        description: data.description ?? null,
        genre: data.genre,
        language: data.language ?? "English",
        publishedYear: data.publishedYear ?? null,
        pages: data.pages ?? null,
        coverUrl: data.coverUrl ?? null,
        content: data.content ?? null,
    });

    const author = await db.orm.public.User.where({ id: authorId }).first();

    return {
        id: publication.id,
        authorId: publication.authorId,
        title: publication.title,
        description: publication.description,
        genre: publication.genre,
        language: publication.language,
        publishedYear: publication.publishedYear,
        pages: publication.pages,
        coverUrl: publication.coverUrl,
        content: publication.content,
        createdAt: publication.createdAt,
        updatedAt: publication.updatedAt,
        author: author
            ? {
                  id: author.id,
                  name: author.name ?? "Author",
                  avatarUrl: author.avatarUrl,
                  occupation: author.occupation,
              }
            : undefined,
    };
};

export const findPublicationsByAuthorInDb = async (authorId: number): Promise<PublicationResponseDto[]> => {
    const publications = await db.orm.public.Publication.where({ authorId }).all();
    const author = await db.orm.public.User.where({ id: authorId }).first();

    const authorDto = author
        ? {
              id: author.id,
              name: author.name ?? "Author",
              avatarUrl: author.avatarUrl,
              occupation: author.occupation,
          }
        : undefined;

    // Sort by createdAt descending
    const sorted = [...publications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sorted.map((pub) => ({
        id: pub.id,
        authorId: pub.authorId,
        title: pub.title,
        description: pub.description,
        genre: pub.genre,
        language: pub.language,
        publishedYear: pub.publishedYear,
        pages: pub.pages,
        coverUrl: pub.coverUrl,
        content: pub.content,
        createdAt: pub.createdAt,
        updatedAt: pub.updatedAt,
        author: authorDto,
    }));
};

export const findPublicationByIdInDb = async (id: number): Promise<PublicationResponseDto | null> => {
    const publication = await db.orm.public.Publication.where({ id }).first();
    if (!publication) return null;

    const author = await db.orm.public.User.where({ id: publication.authorId }).first();

    return {
        id: publication.id,
        authorId: publication.authorId,
        title: publication.title,
        description: publication.description,
        genre: publication.genre,
        language: publication.language,
        publishedYear: publication.publishedYear,
        pages: publication.pages,
        coverUrl: publication.coverUrl,
        content: publication.content,
        createdAt: publication.createdAt,
        updatedAt: publication.updatedAt,
        author: author
            ? {
                  id: author.id,
                  name: author.name ?? "Author",
                  avatarUrl: author.avatarUrl,
                  occupation: author.occupation,
              }
            : undefined,
    };
};

export const updatePublicationInDb = async (
    id: number,
    data: UpdatePublicationInput,
): Promise<PublicationResponseDto | null> => {
    const existing = await db.orm.public.Publication.where({ id }).first();
    if (!existing) return null;

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.genre !== undefined) updateData.genre = data.genre;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.publishedYear !== undefined) updateData.publishedYear = data.publishedYear;
    if (data.pages !== undefined) updateData.pages = data.pages;
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;
    if (data.content !== undefined) updateData.content = data.content;

    await db.orm.public.Publication.where({ id }).update(updateData);
    return findPublicationByIdInDb(id);
};

export const deletePublicationFromDb = async (id: number): Promise<boolean> => {
    const existing = await db.orm.public.Publication.where({ id }).first();
    if (!existing) return false;

    await db.orm.public.Publication.where({ id }).delete();
    return true;
};

export const findAllPublicationsInDb = async (limit: number = 20): Promise<PublicationResponseDto[]> => {
    const publications = await db.orm.public.Publication.all();
    const authors = await db.orm.public.User.all();

    const authorMap = new Map(
        authors.map((u) => [
            u.id,
            {
                id: u.id,
                name: u.name ?? "Author",
                avatarUrl: u.avatarUrl,
                occupation: u.occupation,
            },
        ]),
    );

    // Sort by createdAt descending
    const sorted = [...publications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sorted.slice(0, limit).map((pub) => ({
        id: pub.id,
        authorId: pub.authorId,
        title: pub.title,
        description: pub.description,
        genre: pub.genre,
        language: pub.language,
        publishedYear: pub.publishedYear,
        pages: pub.pages,
        coverUrl: pub.coverUrl,
        content: pub.content,
        createdAt: pub.createdAt,
        updatedAt: pub.updatedAt,
        author: authorMap.get(pub.authorId),
    }));
};
