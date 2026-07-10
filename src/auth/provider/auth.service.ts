import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  // public login(email: string, password: string) {
  //   const user = this.usersService.findUserByEmail(email);

  //   // Implement your login logic here, such as validating the user's credentials
  //   // and generating a JWT token if the credentials are valid.
  //   console.log(
  //     `Logging in user with email: ${email} and password: ${password} - Found user: ${JSON.stringify(user)}`,
  //   );
  //   return { message: 'Login successful', token: 'your-jwt-token' };
  // }
}
