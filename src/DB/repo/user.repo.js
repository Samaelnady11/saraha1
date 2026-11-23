import { UserModel } from "../model/user.model.js";

const findById = async ({ id, projection = {} }) => {
    return await UserModel.findById(id).select(projection);
};

export default {
    findById
};