import bcrypt from 'bcrypt';
import userHelper from './userHelper';

const authHelper = {
  auth(oldUser, request, jsonWebTokenHelper, response) {
    if (oldUser) {
      const passkey = bcrypt.compareSync(
        request.body.password, oldUser.password);
      if (!passkey) {
        return userHelper.inCorrectPasswordMessage(response);
      }
      const token = jsonWebTokenHelper(oldUser);
      const user = userHelper.oldUser(oldUser);
      response.status(200).send({ user, token });
    } else {
      return userHelper.showUserNotFoundMessage(response);
    }
  }
};
export default authHelper;
