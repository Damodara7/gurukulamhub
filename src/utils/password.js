// utils/password.js
import bcrypt, { hash,hashSync,compareSync, compare} from 'bcryptjs';

// export const saltAndHashPassword = (password) => {
//   const saltRounds = 10;
//   return bcrypt.hashSync(password, saltRounds);
// };

export async function hashPassword(password){
  //const hashedPassword = await hash(password, 12);
  const hashedPassword = hashSync(password,12);
  return hashedPassword;
}

export async function verifyPassword (password, hashedPassword) {
  //return bcrypt.compareSync(password, hashedPassword);
  const isValid = compareSync(password, hashedPassword);
  return isValid;
}
