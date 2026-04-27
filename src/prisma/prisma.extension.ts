import { Prisma } from 'src/generated/prisma/client';

// https://github.com/prisma/prisma/issues/18628#issuecomment-3213927054
export const UserExtension = Prisma.defineExtension({
  name: 'user-email-normalization',
  query: {
    user: {
      async create({ args, query }) {
        if (args.data.email) args.data.email = args.data.email.toLowerCase();

        return query(args);
      },
      async update({ args, query }) {
        if (typeof args.data.email === 'string') {
          args.data.email = args.data.email.toLowerCase();
        } else if (args.data.email?.set) {
          args.data.email.set = args.data.email.set.toLowerCase();
        }

        return query(args);
      },
      async upsert({ args, query }) {
        if (args.create.email)
          args.create.email = args.create.email.toLowerCase();

        if (typeof args.update.email === 'string')
          args.update.email = args.update.email.toLowerCase();

        return query(args);
      },
      async updateMany({ args, query }) {
        if (typeof args.data.email === 'string')
          args.data.email = args.data.email.toLowerCase();

        return query(args);
      },
    },
  },
});
