const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id });
                return userData;
            }
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { user, token };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Cannot use this data, please try again!');
            }

            const correctPass = await user.isCorrectPassword(password);

            if (!correctPass) {
                throw new AuthenticationError('Cannot use this data, please try again!');
            }

            const token = signToken(user);
            return { user, token };
        },
        saveBook: async (parent, { input }, context) => {

            if (context.user) {

                const userUpdate = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: { ...input } }},
                    { new: true, runValidators: true }
                );

                return userUpdate;
            }

            throw new AuthenticationError('You must be logged in!');
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const userUpdate = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true, runValidators: true }
                );

                return userUpdate;
            }
        }
    }
};

module.exports = resolvers;