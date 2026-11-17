import { hashPassword } from "../../utils/hash";
import {
    createUser,
    findUserByEmail,
} from "./user.repository";
import type { SignupInput } from "./user.schema";

export const signup = async (input: SignupInput) => {
    const existingUser = await findUserByEmail(input.email);

    if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await createUser({
        email: input.email,
        passwordHash,
        name: input.name,
    });

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
    };
};