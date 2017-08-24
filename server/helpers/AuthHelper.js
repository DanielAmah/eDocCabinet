import bcrypt from 'bcrypt';
import UserHelper from './UserHelper';

const AuthHelper = {
  Auth(user, request, JsonWebTokenHelper, response) {
    if (user) {
      const passkey = bcrypt.compareSync(request.body.password, user.password);
      if (!passkey) {
        return UserHelper.InCorrectPassword(response);
      }
      const token = JsonWebTokenHelper(user);
      const oldUser = UserHelper.OldUser(user);
      response.status(200).send({ oldUser, token });
    } else {
      return UserHelper.UserNotFound(response);
    }
  }
};
export default AuthHelper;
