import faker from 'faker';
import bcrypt from 'bcrypt';

const hashPassword = plainPassword =>
  bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(10));

const defaultPassword = 'password';

const testHelper = {
  adminRole: {
    title: 'admin'
  },

  editorRole: {
    title: 'editor'
  },

  subscriberRole: {
    title: 'subscriber'
  },

  specUser1: {
    username: 'admin',
    email: 'admin@admin.com',
    password: hashPassword(defaultPassword),
    roleId: 1
  },

  specUser2: {
    username: 'blessing',
    email: 'blessing@blessing.com',
    password: hashPassword(defaultPassword),
    roleId: 2
  },

  specWrongUser: {
    username: 'wrongusername',
    password: 'wrongpassword'
  },
  specWrongPassword: {
    username: 'admin',
    password: 'nothepassword'
  },
  specWrongEmail: {
    email: 'kingley@',
    password: 'kingley'
  },
  specUser3: {
    id: 3,
    username: 'daniel',
    email: 'daniel@daniel.com',
    password: hashPassword(defaultPassword),
    roleId: 3
  },
  specUpdateUser: {
    email: 'paulson@paul.com',
    username: 'paulson',
    password: 'paulson'
  },
  invalidUser: {
    email: '',
    password: 'anyPassword',
    username: 'carelessUser'
  },
  specNoPassword: {
    email: 'admin@admin.com',
    password: '',
    username: 'admin'
  },

  specUser4: {
    id: 4,
    username: 'afrocode',
    password: hashPassword(defaultPassword),
    email: 'afrocode@afrocode.com',
    roleId: 3
  },
  specNoUser: {
    email: 'wrong@email.com',
    password: 'wrongpassword'
  },
  specUser5: {
    id: 5,
    email: faker.internet.email(),
    password: hashPassword(defaultPassword),
    username: faker.internet.userName(),
    roleId: 2
  },

  specDocument1: {
    title: 'My first document',
    content: 'The best content',
    access: 'public',
    owner: 'admin',
    roleId: 1,
    userId: 1
  },

  specDocument2: {
    title: 'Computer Science',
    content: 'Computer science is the study of the theory,' +
      ' experimentation,and engineering that form the basis' +
      ' for the design and use of computers.',
    access: 'public',
    owner: 'daniel',
    roleId: 3,
    userId: 3
  },
  specUpdateDocument: {
    title: 'updated title',
    content: 'another content',
    access: 'role'
  },
  specBadAccessDocument: {
    title: 'new title',
    content: 'new content',
    access: 'badaccess'
  },
  noTitleDocument: {
    title: '',
    content: 'new content',
    access: 'role'
  },
  noContentDocument: {
    title: 'new title',
    content: '',
    access: 'role'
  }
};

export { testHelper, defaultPassword };
